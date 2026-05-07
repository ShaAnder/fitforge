import { normalizeAccentKey, type AccentKey } from "@/constants/accents";
import { useAccentContext } from "@/context/AccentContext";
import { getSupabase } from "@/lib/supabase";
import { uploadAvatar as uploadAvatarFromQueries } from "@/lib/supabaseQueries";
import { Session, User } from "@supabase/supabase-js";
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
	profile: any | null;
	workouts: any[];
	loading: boolean;

	signup: (
		email: string,
		password: string,
		onSuccess?: () => void,
	) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	updateProfile: (updates: any) => Promise<void>;
	uploadAvatar: (file: any) => Promise<string>;
	refreshWorkouts: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [profile, setProfile] = useState<any>(null);
	const [workouts, setWorkouts] = useState<any[]>([]);

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

	const MIN_SPLASH_MS = 3500;

	// ─────────────────────────────────────────────────────────────
	// EFFECT 1: Auth Session + Real-time Listener
	// ─────────────────────────────────────────────────────────────
	useEffect(() => {
		const supabase = getSupabase();

		const initializeAuth = async () => {
			try {
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					// Non-critical - we can still proceed
				}

				setSession(session);
				setUser(session?.user ?? null);
			} catch (err) {
				// getSession error is non-critical
			} finally {
				setAuthResolved(true);
			}
		};

		initializeAuth();

		// Real-time auth state listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, currentSession) => {
			setSession(currentSession);
			setUser(currentSession?.user ?? null);
		});

		return () => {
			subscription.unsubscribe();
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

			// avoid re-running bootstrap for the same user id
			if (lastUserIdRef.current === currentUserId) return;
			lastUserIdRef.current = currentUserId;

			if (!currentUserId) {
				setProfile(null);
				setWorkouts([]);
				setAccentId("green");
				setLoading(false);
				return;
			}

			setLoading(true);

			try {
				const supabase = getSupabase();

				// Load or create user profile
				const { data: existingProfile, error: profileErr } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", user.id)
					.maybeSingle();

				if (profileErr) throw profileErr;

				let resolvedProfile = existingProfile;

				if (!resolvedProfile) {
					const defaultUsername = user.email?.split("@")[0]?.trim() || "User";

					const { error: upsertErr } = await supabase.from("profiles").upsert({
						id: user.id,
						username: defaultUsername,
						updated_at: new Date().toISOString(),
					});

					if (upsertErr) throw upsertErr;

					const { data: createdProfile } = await supabase
						.from("profiles")
						.select("*")
						.eq("id", user.id)
						.single();

					resolvedProfile = createdProfile;
				}

				// Load user's workouts (newest first)
				const { data: workoutsData, error: workoutsErr } = await supabase
					.from("workouts")
					.select("*")
					.eq("user_id", user.id)
					.order("date", { ascending: false });

				if (workoutsErr) throw workoutsErr;

				if (cancelled) return;

				setProfile(resolvedProfile);
				setAccentId(normalizeAccentKey(resolvedProfile?.accent) as AccentKey);
				setWorkouts(workoutsData || []);
			} catch (err: any) {
				// use the ref to call showAlert to avoid making it a dependency
				showAlertRef.current?.(
					"Loading Error",
					"Failed to load your dashboard data. Please try again.",
					"error",
				);
				setAccentId("green");
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		bootstrap();

		return () => {
			cancelled = true;
		};
	}, [authResolved, user?.id, setAccentId]);

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
		} catch (err: any) {
			showAlert("Sign Out Failed", err.message, "error");
			throw err;
		}
	};

	const updateProfile = async (updates: any) => {
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

			setProfile((prev: any) => ({
				...(prev ?? {}),
				...(data ?? {}),
				...updates,
			}));

			if (updates?.accent) {
				setAccentId(normalizeAccentKey(updates.accent) as AccentKey);
			}
		} catch (err: any) {
			throw err;
		}
	};

	const uploadAvatar = async (asset: any): Promise<string> => {
		if (!user?.id) throw new Error("No user logged in");

		try {
			const publicUrl = await uploadAvatarFromQueries(user.id, asset);

			// Store just the filename in the profile (Supabase public URL is derived)
			const fileName = publicUrl.split("/").pop() || publicUrl;
			await updateProfile({ avatar_url: fileName });

			return fileName;
		} catch (err: any) {
			throw err;
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
		} catch (err) {
			showAlertRef.current?.("Error", "Failed to refresh workouts", "error");
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
