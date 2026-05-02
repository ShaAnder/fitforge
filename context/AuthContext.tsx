import { loadUserData } from "@/helpers/loadUserData";
import { getSupabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

/**
 * Type definition for the Auth Context value.
 * Contains user session, profile, workouts, loading state,
 * and auth action methods.
 */
type AuthContextType = {
	user: User | null;
	session: Session | null;
	profile: any | null;
	workouts: any[];
	loading: boolean;
	signup: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	updateProfile: (updates: any) => Promise<void>;
	refreshWorkouts: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component.
 *
 * Manages global authentication state, session persistence,
 * and user data loading for the entire FitForge app.
 *
 * Uses Supabase Auth + custom data queries.
 * Designed to work safely with Expo Router's protected routes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [profile, setProfile] = useState<any>(null);
	const [workouts, setWorkouts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Ref to track component mount status (for potential cleanup in future)
	const mounted = useRef(true);

	/**
	 * Effect 1: Initialize Supabase auth session and set up real-time listener.
	 *
	 * - Runs getSession() on mount.
	 * - Listens for auth state changes (SIGNED_IN, SIGNED_OUT, etc.).
	 * - IMPORTANT: onAuthStateChange callback is NOT async to avoid the
	 * 	 known 	Supabase JS deadlock bug.
	 * - Only updates user/session state here. Data loading is handled in a
	 * 	 separate effect.
	 */
	useEffect(() => {
		const supabase = getSupabase();

		// Initial session fetch
		(async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();
				console.log("✅ Initial session:", session ? "exists" : "null");
				setSession(session);
				setUser(session?.user ?? null);
			} catch (err) {
				console.error("❌ getSession failed:", err);
			}
		})();

		// Real-time auth state listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			(event: string, currentSession: Session | null) => {
				console.log(`🔄 Auth state changed: ${event}`);

				setSession(currentSession);
				setUser(currentSession?.user ?? null);

				if (currentSession?.user) {
					console.log(`👤 User logged in: ${currentSession.user.id}`);
				} else {
					console.log("👤 User logged out");
				}
			},
		);

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	/**
	 * Effect 2: Load user-specific data when authenticated user changes.
	 *
	 * - Only runs when a valid user.id (skips null state to avoid re-renders).
	 * - Uses loadUserData helper (which queries in parallel via Promise.all).
	 * - Manages the global loading state for the app.
	 * - This separation prevents the Supabase deadlock bug that occurs if
	 * 	 queries are called inside onAuthStateChange.
	 */
	useEffect(() => {
		if (!user?.id) return; // Skip on initial render and logout

		const loadData = async () => {
			console.log("📥 AuthContext → loading user data...");
			setLoading(true);

			try {
				const { profile: profileData, workouts: workoutsData } =
					await loadUserData(user.id, user.email || "");

				setProfile(profileData);
				setWorkouts(workoutsData);

				console.log("✅ AuthContext → user data loaded successfully");
			} catch (err: any) {
				console.error(
					"❌ AuthContext → loadUserData failed:",
					err?.message || err,
				);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [user?.id, user?.email]);

	// ─────────────────────────────────────────────────────────────
	// AUTH ACTION METHODS
	// ─────────────────────────────────────────────────────────────

	const signup = async (email: string, password: string) => {
		const { error } = await getSupabase().auth.signUp({ email, password });
		if (error) throw error;
	};

	const signIn = async (email: string, password: string) => {
		const { error } = await getSupabase().auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;
	};

	const signOut = async () => {
		const { error } = await getSupabase().auth.signOut();
		if (error) throw error;
	};

	const updateProfile = async (updates: any) => {
		// TODO: Implement once getProfile/updateProfile queries are tested
		console.log("[updateProfile] TODO: Not implemented yet");
	};

	const refreshWorkouts = async () => {
		// TODO: Implement once fetchWorkouts query is tested
		console.log("[refreshWorkouts] TODO: Not implemented yet");
	};

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
				refreshWorkouts,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

/**
 * Custom hook to consume the AuthContext.
 * Throws a helpful error if used outside of AuthProvider.
 */
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
