import { loadUserData } from "@/helpers/loadUserData";
import { getSupabase } from "@/lib/supabase";
import {
	updateProfile as updateProfileQuery,
	uploadAvatar as uploadAvatarQuery,
} from "@/lib/supabaseQueries";
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
 *
 * Contains user session, profile, workouts, loading state,
 * and all auth + profile action methods.
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
	uploadAvatar: (file: any) => Promise<string>; // ← Added
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

	const mounted = useRef(true);

	/**
	 * Effect 1: Initialize Supabase auth session and set up real-time listener.
	 *
	 * - Runs getSession() on mount.
	 * - Listens for auth state changes (SIGNED_IN, SIGNED_OUT, etc.).
	 * - IMPORTANT: onAuthStateChange callback is NOT async to avoid the known
	 *     Supabase JS deadlock bug.
	 * - Only updates user/session state here. Data loading is handled in a
	 *     separate effect.
	 */
	useEffect(() => {
		const supabase = getSupabase();

		(async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();
				setSession(session);
				setUser(session?.user ?? null);
			} catch (err) {
				// getSession error is non-critical
			}
		})();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			(event: string, currentSession: Session | null) => {
				setSession(currentSession);
				setUser(currentSession?.user ?? null);
			},
		);

		return () => subscription.unsubscribe();
	}, []);

	/**
	 * Effect 2: Load user-specific data (profile + workouts) when
	 *           authenticated user changes.
	 *
	 * - Only runs when a valid user.id exists (skips null state to avoid
	 *     unnecessary re-renders).
	 * - Uses loadUserData helper (which runs queries in parallel via
	 *     Promise.all).
	 * - Manages the global loading state for the app.
	 * - This separation prevents the Supabase deadlock bug that occurs if
	 *     queries are called inside onAuthStateChange.
	 */
	useEffect(() => {
		if (!user?.id) return;

		const loadData = async () => {
			setLoading(true);

			try {
				const { profile: profileData, workouts: workoutsData } =
					await loadUserData(user.id, user.email || "");

				setProfile(profileData);
				setWorkouts(workoutsData);
			} catch (err: any) {
				// Data load error is non-critical for initial render
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

	/**
	 * Update user profile and refresh local state.
	 *
	 * - Calls the query layer.
	 * - Re-fetches full user data to keep context in sync.
	 * - Throws on error so UI can show alerts.
	 */
	const updateProfile = async (updates: any) => {
		if (!user?.id) throw new Error("No user logged in");

		try {
			await updateProfileQuery(user.id, updates);
			const { profile: updatedProfile } = await loadUserData(
				user.id,
				user.email || "",
			);
			setProfile(updatedProfile);
		} catch (err: any) {
			throw err;
		}
	};

	/**
	 * Upload avatar and update profile in one flow.
	 *
	 * - Uploads file to Supabase Storage.
	 * - Updates profile record with new public URL.
	 * - Returns the public URL for immediate use.
	 */
	const uploadAvatar = async (file: any) => {
		if (!user?.id) throw new Error("No user logged in");

		try {
			const publicUrl = await uploadAvatarQuery(user.id, file);
			await updateProfile({ avatar_url: publicUrl });
			return publicUrl;
		} catch (err: any) {
			throw err;
		}
	};

	/**
	 * Refresh workouts list from the server.
	 *
	 * - Useful after creating/editing workouts.
	 * - Replaces local workouts array with fresh data.
	 */
	const refreshWorkouts = async () => {
		if (!user?.id) return;

		try {
			const { workouts: newWorkouts } = await loadUserData(
				user.id,
				user.email || "",
			);
			setWorkouts(newWorkouts);
		} catch (err) {
			// Refresh failure is non-critical
		}
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
				uploadAvatar,
				refreshWorkouts,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

/**
 * Custom hook to consume the AuthContext.
 *
 * Throws a helpful error if used outside of AuthProvider.
 */
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
