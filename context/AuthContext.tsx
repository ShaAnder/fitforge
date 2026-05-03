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
	uploadAvatar: (file: any) => Promise<string>;
	refreshWorkouts: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [profile, setProfile] = useState<any>(null);
	const [workouts, setWorkouts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const mounted = useRef(true);

	useEffect(() => {
		if (!user?.id) {
			setLoading(false);
		}
	}, []);

	// ─────────────────────────────────────────────────────────────
	// EFFECT 1: Auth Session + Listener
	// ─────────────────────────────────────────────────────────────
	useEffect(() => {
		const supabase = getSupabase();
		console.log("[AuthProvider] 🔄 Mounting auth listener");

		// Initial session
		(async () => {
			try {
				console.log("[AuthProvider] 📡 getSession() called");
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) console.error("[AuthProvider] getSession error:", error);

				console.log(
					"[AuthProvider] ✅ Initial session:",
					session ? `user: ${session.user.id}` : "null",
				);
				setSession(session);
				setUser(session?.user ?? null);
			} catch (err) {
				console.error("[AuthProvider] ❌ getSession failed:", err);
			}
		})();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			(event: string, currentSession: Session | null) => {
				console.log(
					`[AuthProvider] 🔥 AUTH EVENT: ${event}`,
					currentSession ? `user: ${currentSession.user.id}` : "no session",
				);

				setSession(currentSession);
				setUser(currentSession?.user ?? null);

				if (event === "SIGNED_OUT") {
					console.log("[AuthProvider] 👋 SIGNED_OUT - clearing all state");
					setProfile(null);
					setWorkouts([]);
					setLoading(false);
				}
			},
		);

		return () => {
			console.log("[AuthProvider] 🧹 Unsubscribing auth listener");
			subscription.unsubscribe();
		};
	}, []);

	// ─────────────────────────────────────────────────────────────
	// EFFECT 2: Load Profile + Workouts
	// ─────────────────────────────────────────────────────────────
	useEffect(() => {
		console.log("[AuthProvider] 🔄 Data effect - user.id:", user?.id);

		if (!user?.id) {
			console.log("[AuthProvider] ⏭️ No user → reset loading");
			setLoading(false);
			setProfile(null);
			setWorkouts([]);
			return;
		}

		const loadData = async () => {
			console.log(`[AuthProvider] 🚀 loadUserData for ${user.id}`);
			setLoading(true);

			try {
				const { profile: profileData, workouts: workoutsData } =
					await loadUserData(user.id, user.email || "");

				console.log(
					`[AuthProvider] ✅ Data loaded | Profile: ${!!profileData} | Workouts: ${workoutsData?.length || 0}`,
				);

				setProfile(profileData);
				setWorkouts(workoutsData);
			} catch (err: any) {
				console.error(
					"[AuthProvider] ❌ loadUserData error:",
					err?.message || err,
				);
			} finally {
				console.log("[AuthProvider] 🛑 loading = false");
				setLoading(false);
			}
		};

		loadData();
	}, [user?.id]);

	// ─────────────────────────────────────────────────────────────
	// AUTH METHODS
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
		console.log("[AuthProvider] 🔴 signOut() started");
		try {
			const supabase = getSupabase();
			const { error } = await supabase.auth.signOut({ scope: "local" });

			if (error) throw error;

			console.log("[AuthProvider] ✅ Supabase signOut succeeded");

			// Force cleanup
			setUser(null);
			setSession(null);
			setProfile(null);
			setWorkouts([]);
			setLoading(false);
		} catch (err: any) {
			console.error("[AuthProvider] ❌ signOut failed:", err);
			throw err;
		}
	};

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

	const refreshWorkouts = async () => {
		if (!user?.id) return;
		try {
			const { workouts: newWorkouts } = await loadUserData(
				user.id,
				user.email || "",
			);
			setWorkouts(newWorkouts);
		} catch (err) {
			console.error("[refreshWorkouts] error:", err);
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

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
