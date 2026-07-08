import { normalizeAccentKey, type AccentKey } from "@/constants/accents";
import { useAccentContext } from "@/context/AccentContext";
import { getSupabase } from "@/lib/supabase";
import { uploadAvatar as uploadAvatarFromQueries } from "@/lib/supabaseQueries";
import type { Profile, Workout } from "@/types";
import { getErrorMessage } from "@/utils/getError";
import { Session, User } from "@supabase/supabase-js";
import { ImagePickerAsset } from "expo-image-picker";
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { useAlert } from "./AlertContext";

/**
 * AuthContext - Central authentication and user data management.
 *
 * Handles:
 * - Session & user state
 * - Profile & workouts loading
 * - Accent synchronization
 * - All auth actions (sign up, sign in, sign out, profile updates)
 */
type AuthContextType = {
	user: User | null;
	session: Session | null;
	profile: Profile | null;
	workouts: Workout[];
	loading: boolean;

	signup: (
		email: string,
		password: string,
		onSuccess?: () => void,
	) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	updateProfile: (updates: Partial<Profile>) => Promise<void>;
	uploadAvatar: (asset: ImagePickerAsset) => Promise<string>;
	refreshWorkouts: () => Promise<void>;
};

// we create the context object here so we can provide auth state to the whole app
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component.
 *
 * Wraps the entire app and provides auth state + actions via context.
 * Handles session bootstrap, real-time auth changes, and initial data loading.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	// we store the current logged in user object here (or null if not logged in)
	const [user, setUser] = useState<User | null>(null);
	// we store the full Supabase session object here
	const [session, setSession] = useState<Session | null>(null);
	// we store the user's profile row from our profiles table
	const [profile, setProfile] = useState<Profile | null>(null);
	// we store the list of the user's workouts here
	const [workouts, setWorkouts] = useState<Workout[]>([]);

	// Global loading state - blocks UI until auth + initial data is ready
	// this starts as true so nothing renders until we're done loading
	const [loading, setLoading] = useState(true);
	// this flag tells us when the initial auth check is finished
	const [authResolved, setAuthResolved] = useState(false);

	// we pull the showAlert function from our AlertContext
	const { showAlert } = useAlert();
	// we pull the setAccentId function from our AccentContext
	const { setAccentId } = useAccentContext();

	// Keep a stable ref to showAlert so long-running effects don't re-run
	// we do this because we don't want the effect to depend on the showAlert function changing
	const showAlertRef = useRef<typeof showAlert | null>(null);
	useEffect(() => {
		// every time showAlert changes, we update the ref so effects can use the latest version
		showAlertRef.current = showAlert;
	}, [showAlert]);

	// Prevent repeated bootstraps for the same user id
	// we keep track of the last user id we already loaded data for
	const lastUserIdRef = useRef<string | null>(null);

	// ─────────────────────────────────────────────────────────────
	// EFFECT 1: Auth Session + Real-time Listener
	// ─────────────────────────────────────────────────────────────
	useEffect(() => {
		// this flag lets us cancel any async work if the component unmounts
		let cancelled = false;
		// we will store the unsubscribe function here so we can clean it up later
		let unsubscribe: (() => void) | null = null;

		const initializeAuth = async () => {
			// we declare supabase here so we can use it in the listener later
			let supabase: ReturnType<typeof getSupabase>;

			try {
				// we try to get our singleton Supabase client instance
				supabase = getSupabase();
			} catch (err: unknown) {
				// if getting the client fails, we log it and put the app in a safe state
				console.error("[AuthProvider] Supabase init failed:", err);

				const message = getErrorMessage(err);

				if (!cancelled) {
					// clear everything and stop loading
					setSession(null);
					setUser(null);
					setAuthResolved(true);
					setLoading(false);

					// show an error alert using the stable ref
					showAlertRef.current?.("Configuration Error", message, "error");
				}
				return;
			}

			try {
				// we ask Supabase for the current session (this checks if the user is already logged in)
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					// if there was an error getting the session, we just log a warning
					console.warn("[AuthProvider] getSession error:", error.message);
				}

				if (!cancelled) {
					// we store the session and user we got back (they can be null)
					setSession(session);
					setUser(session?.user ?? null);
				}
			} catch (err: unknown) {
				// if getSession itself throws, we log the error
				console.error("[AuthProvider] getSession threw:", err);
			} finally {
				if (!cancelled) {
					// no matter what, we mark that we have finished the initial auth check
					setAuthResolved(true);
				}
			}

			if (cancelled) return;

			// we set up a real-time listener for any auth changes (login, logout, token refresh, etc.)
			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange((_event, currentSession) => {
				// if the component already unmounted, we ignore the change
				if (cancelled) return;
				// we update our state whenever auth state changes
				setSession(currentSession);
				setUser(currentSession?.user ?? null);
			});

			// we save the unsubscribe function so we can call it on cleanup
			unsubscribe = () => subscription.unsubscribe();
		};

		// we kick off the whole auth initialization process
		initializeAuth();

		return () => {
			// when the component unmounts or the effect re-runs, we clean up
			cancelled = true;
			if (unsubscribe) unsubscribe();
		};
	}, []); // empty dependency array means this effect runs only once on mount

	// ─────────────────────────────────────────────────────────────
	// EFFECT 2: Bootstrap initial dashboard data
	// ─────────────────────────────────────────────────────────────
	useEffect(() => {
		// we only want to run this after we know the auth state is settled
		if (!authResolved) return;

		// another cancelled flag for this effect
		let cancelled = false;

		const bootstrap = async () => {
			// we get the current user id and email from state
			const currentUserId = user?.id ?? null;
			const currentUserEmail = user?.email ?? "";

			if (!currentUserId) {
				// if there's no user, we clear all data and stop loading
				lastUserIdRef.current = null;
				setProfile(null);
				setWorkouts([]);
				setAccentId("green");
				setLoading(false);
				return;
			}

			// avoid re-running bootstrap for the same user id
			// this prevents us from reloading everything every time the effect runs
			if (lastUserIdRef.current === currentUserId) return;
			lastUserIdRef.current = currentUserId;

			// we set loading to true while we fetch the initial data
			setLoading(true);

			try {
				// we get our Supabase client
				const supabase = getSupabase();

				// Load or create user profile
				// we try to find an existing profile row for this user
				const { data: existingProfile, error: profileErr } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", currentUserId)
					.maybeSingle();

				if (profileErr) throw profileErr;

				// we will store the final profile we decide to use here
				let resolvedProfile = existingProfile;

				if (!resolvedProfile) {
					// if no profile exists yet, we create a basic one using the email as username
					const defaultUsername =
						currentUserEmail.split("@")[0]?.trim() || "User";

					// we upsert a minimal profile row
					const { error: upsertErr } = await supabase.from("profiles").upsert({
						id: currentUserId,
						username: defaultUsername,
						updated_at: new Date().toISOString(),
					});

					if (upsertErr) throw upsertErr;

					// after creating, we fetch the newly created profile row
					const { data: createdProfile } = await supabase
						.from("profiles")
						.select("*")
						.eq("id", currentUserId)
						.single();

					resolvedProfile = createdProfile;
				}

				// Load user's workouts (newest first)
				// we fetch all workouts belonging to this user, sorted by date descending
				const { data: workoutsData, error: workoutsErr } = await supabase
					.from("workouts")
					.select("*")
					.eq("user_id", currentUserId)
					.order("date", { ascending: false });

				if (workoutsErr) throw workoutsErr;

				// if the component unmounted while we were fetching, we stop here
				if (cancelled) return;

				// we finally put the loaded data into our state
				setProfile(resolvedProfile);
				setAccentId(normalizeAccentKey(resolvedProfile?.accent) as AccentKey);
				setWorkouts(workoutsData || []);
			} catch (err: unknown) {
				// if anything goes wrong during bootstrap, we show an error and set a default accent
				const message = getErrorMessage(err);
				showAlertRef.current?.("Loading Error", message, "error");
				setAccentId("green");
			} finally {
				// we always turn loading off when we're done (unless cancelled)
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		// we run the bootstrap function
		bootstrap();

		return () => {
			// cleanup flag for this effect
			cancelled = true;
		};
	}, [authResolved, user?.id, user?.email, setAccentId]);

	// ─────────────────────────────────────────────────────────────
	// AUTH ACTION METHODS
	// ─────────────────────────────────────────────────────────────

	const signup = async (
		email: string,
		password: string,
		onSuccess?: () => void,
	) => {
		// we call Supabase's signUp method with the email and password
		const { error } = await getSupabase().auth.signUp({
			email,
			password,
			options: {
				// we set a custom redirect URL for email verification
				emailRedirectTo:
					"https://shaander.github.io/fitforge/web-redirect-verify.html",
			},
		});

		if (error) {
			// if signUp fails, we show an error alert and re-throw
			showAlert("Signup Failed", error.message, "error");
			throw error;
		}

		// on success we show a helpful message telling the user to check their email
		showAlert(
			"Account Created",
			"Please check your email to confirm your account.\n\nYou can close this and log in after confirming.",
			"success",
		);

		// if the caller passed an onSuccess callback, we call it
		if (onSuccess) onSuccess();
	};

	const signIn = async (email: string, password: string) => {
		// we call Supabase's signInWithPassword with the credentials
		const { error } = await getSupabase().auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			// on failure we show an error and re-throw
			showAlert("Login Failed", error.message, "error");
			throw error;
		}
		// on success the onAuthStateChange listener will update our state automatically
	};

	const signOut = async () => {
		try {
			// we get our Supabase client and call signOut with local scope
			const supabase = getSupabase();
			const { error } = await supabase.auth.signOut({ scope: "local" });
			if (error) throw error;

			// show a success message after signing out
			showAlert(
				"Signed Out",
				"You have been successfully signed out.",
				"success",
			);
		} catch (err: unknown) {
			const message = getErrorMessage(err);
			showAlert("Sign Out Failed", message, "error");
			throw err;
		}
	};

	const updateProfile = async (updates: Partial<Profile>) => {
		// we can't update a profile if there's no logged in user
		if (!user?.id) throw new Error("No user logged in");

		try {
			// we upsert the profile changes (this creates or updates the row)
			const { data, error } = await getSupabase()
				.from("profiles")
				.upsert({
					id: user.id,
					...updates,
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (error) throw error;

			// we merge the returned data + the updates into our local profile state
			setProfile(
				(prev: Profile | null) =>
					({
						...(prev ?? {}),
						...(data ?? {}),
						...updates,
					}) as Profile,
			);

			// if the accent was changed, we also update the accent context immediately
			if (updates?.accent) {
				setAccentId(normalizeAccentKey(updates.accent) as AccentKey);
			}
		} catch (err: unknown) {
			const message = getErrorMessage(err);
			console.error("[AuthProvider] updateProfile failed:", err);
			throw new Error(message);
		}
	};

	const uploadAvatar = async (asset: ImagePickerAsset): Promise<string> => {
		// we need a logged in user to upload an avatar
		if (!user?.id) throw new Error("No user logged in");

		try {
			// we get the current access token from the session (if available)
			const accessToken = session?.access_token;
			// we call our helper function that actually does the upload to Supabase Storage
			const publicUrl = await uploadAvatarFromQueries(
				user.id,
				asset,
				accessToken,
			);

			// we extract just the filename from the returned public URL
			const fileName = publicUrl.split("/").pop() || publicUrl;
			// we update the profile with the new avatar filename
			await updateProfile({ avatar_url: fileName });

			// we return the filename so the caller can use it if needed
			return fileName;
		} catch (err: unknown) {
			const message = getErrorMessage(err);
			console.error("[AuthProvider] uploadAvatar failed:", err);
			throw new Error(message);
		}
	};

	const refreshWorkouts = useCallback(async () => {
		// we can't refresh if there's no logged in user
		if (!user?.id) return;

		try {
			// we fetch the latest workouts for the current user
			const { data, error } = await getSupabase()
				.from("workouts")
				.select("*")
				.eq("user_id", user.id)
				.order("date", { ascending: false });

			if (error) throw error;

			// we replace the workouts state with the fresh data
			setWorkouts(data || []);
		} catch (err: unknown) {
			const message = getErrorMessage(err);
			showAlertRef.current?.("Error", message, "error");
		}
	}, [user?.id]); // we only recreate this function when the user id changes

	return (
		<AuthContext.Provider
			value={{
				// we pass down all the state values
				user,
				session,
				profile,
				workouts,
				loading,
				// we pass down all the action functions
				signup,
				signIn,
				signOut,
				updateProfile,
				uploadAvatar,
				refreshWorkouts,
			}}
		>
			{/* we render whatever children were passed into the provider */}
			{children}
		</AuthContext.Provider>
	);
}

/**
 * useAuth hook.
 *
 * Returns the current auth context. Throws if used outside of AuthProvider.
 */
export const useAuth = () => {
	// we try to get the context value
	const context = useContext(AuthContext);
	if (context === undefined) {
		// if it's undefined, it means someone used the hook outside the provider
		throw new Error("useAuth must be used within an AuthProvider");
	}
	// we return the context value so components can use user, profile, actions, etc.
	return context;
};
