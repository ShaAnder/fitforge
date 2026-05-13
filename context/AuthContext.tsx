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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [workouts, setWorkouts] = useState<Workout[]>([]);

	// Global loading state - blocks UI until auth + initial data is ready
	const [loading, setLoading] = useState(true);
	const [authResolved, setAuthResolved] = useState(false);

	const { showAlert } = useAlert();
	const { setAccentId } = useAccentContext();

	// Keep a stable ref to showAlert so long-running effects don't re-run
	const showAlertRef = useRef<typeof showAlert | null>(null);
	useEffect(() => {
		showAlertRef.current = showAlert;
	}, [showAlert]);

	// Prevent repeated bootstraps for the same user id
	const lastUserIdRef = useRef<string | null>(null);

	// ─────────────────────────────────────────────────────────────
	// EFFECT 1: Auth Session + Real-time Listener
	// ─────────────────────────────────────────────────────────────
	useEffect(() => {
		let cancelled = false;
		let unsubscribe: (() => void) | null = null;

		const initializeAuth = async () => {
			let supabase: ReturnType<typeof getSupabase>;

			try {
				supabase = getSupabase();
			} catch (err: unknown) {
				console.error("[AuthProvider] Supabase init failed:", err);

				const message = getErrorMessage(err);

				if (!cancelled) {
					setSession(null);
					setUser(null);
					setAuthResolved(true);
					setLoading(false);

					showAlertRef.current?.("Configuration Error", message, "error");
				}
				return;
			}

			try {
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.warn("[AuthProvider] getSession error:", error.message);
				}

				if (!cancelled) {
					setSession(session);
					setUser(session?.user ?? null);
				}
			} catch (err: unknown) {
				console.error("[AuthProvider] getSession threw:", err);
			} finally {
				if (!cancelled) {
					setAuthResolved(true);
				}
			}

			if (cancelled) return;

			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange((_event, currentSession) => {
				if (cancelled) return;
				setSession(currentSession);
				setUser(currentSession?.user ?? null);
			});

			unsubscribe = () => subscription.unsubscribe();
		};

		initializeAuth();

		return () => {
			cancelled = true;
			if (unsubscribe) unsubscribe();
		};
	}, []);

	// ─────────────────────────────────────────────────────────────
	// EFFECT 2: Bootstrap initial dashboard data
	// ─────────────────────────────────────────────────────────────
	useEffect(() => {
		if (!authResolved) return;

		let cancelled = false;

		const bootstrap = async () => {
			const currentUserId = user?.id ?? null;
			const currentUserEmail = user?.email ?? "";

			if (!currentUserId) {
				lastUserIdRef.current = null;
				setProfile(null);
				setWorkouts([]);
				setAccentId("green");
				setLoading(false);
				return;
			}

			// avoid re-running bootstrap for the same user id
			if (lastUserIdRef.current === currentUserId) return;
			lastUserIdRef.current = currentUserId;

			setLoading(true);

			try {
				const supabase = getSupabase();

				// Load or create user profile
				const { data: existingProfile, error: profileErr } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", currentUserId)
					.maybeSingle();

				if (profileErr) throw profileErr;

				let resolvedProfile = existingProfile;

				if (!resolvedProfile) {
					const defaultUsername =
						currentUserEmail.split("@")[0]?.trim() || "User";

					const { error: upsertErr } = await supabase.from("profiles").upsert({
						id: currentUserId,
						username: defaultUsername,
						updated_at: new Date().toISOString(),
					});

					if (upsertErr) throw upsertErr;

					const { data: createdProfile } = await supabase
						.from("profiles")
						.select("*")
						.eq("id", currentUserId)
						.single();

					resolvedProfile = createdProfile;
				}

				// Load user's workouts (newest first)
				const { data: workoutsData, error: workoutsErr } = await supabase
					.from("workouts")
					.select("*")
					.eq("user_id", currentUserId)
					.order("date", { ascending: false });

				if (workoutsErr) throw workoutsErr;

				if (cancelled) return;

				setProfile(resolvedProfile);
				setAccentId(normalizeAccentKey(resolvedProfile?.accent) as AccentKey);
				setWorkouts(workoutsData || []);
			} catch (err: unknown) {
				const message = getErrorMessage(err);
				showAlertRef.current?.("Loading Error", message, "error");
				setAccentId("green");
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		bootstrap();

		return () => {
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
		const { error } = await getSupabase().auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo:
					"https://shaander.github.io/fitforge/web-redirect-verify.html",
			},
		});

		if (error) {
			showAlert("Signup Failed", error.message, "error");
			throw error;
		}

		showAlert(
			"Account Created",
			"Please check your email to confirm your account.\n\nYou can close this and log in after confirming.",
			"success",
		);

		if (onSuccess) onSuccess();
	};

	const signIn = async (email: string, password: string) => {
		const { error } = await getSupabase().auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			showAlert("Login Failed", error.message, "error");
			throw error;
		}
	};

	const signOut = async () => {
		try {
			const supabase = getSupabase();
			const { error } = await supabase.auth.signOut({ scope: "local" });
			if (error) throw error;

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
		if (!user?.id) throw new Error("No user logged in");

		try {
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

			setProfile(
				(prev: Profile | null) =>
					({
						...(prev ?? {}),
						...(data ?? {}),
						...updates,
					}) as Profile,
			);

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
		if (!user?.id) throw new Error("No user logged in");

		try {
			const accessToken = session?.access_token;
			const publicUrl = await uploadAvatarFromQueries(
				user.id,
				asset,
				accessToken,
			);

			// Store just the filename in the profile (Supabase public URL is derived)
			const fileName = publicUrl.split("/").pop() || publicUrl;
			await updateProfile({ avatar_url: fileName });

			return fileName;
		} catch (err: unknown) {
			const message = getErrorMessage(err);
			console.error("[AuthProvider] uploadAvatar failed:", err);
			throw new Error(message);
		}
	};

	const refreshWorkouts = useCallback(async () => {
		if (!user?.id) return;

		try {
			const { data, error } = await getSupabase()
				.from("workouts")
				.select("*")
				.eq("user_id", user.id)
				.order("date", { ascending: false });

			if (error) throw error;

			setWorkouts(data || []);
		} catch (err: unknown) {
			const message = getErrorMessage(err);
			showAlertRef.current?.("Error", message, "error");
		}
	}, [user?.id]);

	return (
		<AuthContext.Provider
			value={{
				user,
				session,
				profile,
				workouts,
				loading,
				signup,
				signIn,
				signOut,
				updateProfile,
				uploadAvatar,
				refreshWorkouts,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
