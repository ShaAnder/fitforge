import { getSupabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import * as AuthSession from "expo-auth-session";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { useAlert } from "./AlertContext";

/**
 * AuthContext - Handles all authentication logic.
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
	console.log("[AuthProvider] 🔄 Mounted");

	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [profile, setProfile] = useState<any>(null);
	const [workouts, setWorkouts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const { showAlert } = useAlert();

	const mounted = useRef(true);

	// ─────────────────────────────────────────────────────────────
	// EFFECT 1: Auth Session + Listener
	// ─────────────────────────────────────────────────────────────
	useEffect(() => {
		const supabase = getSupabase();
		console.log("[AuthProvider] 🔄 Mounting auth listener");

		const initializeAuth = async () => {
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
			} finally {
				setLoading(false);
			}
		};

		initializeAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, currentSession) => {
			console.log(`[AuthProvider] 🔥 AUTH EVENT: ${event}`);
			setSession(currentSession);
			setUser(currentSession?.user ?? null);
		});

		return () => {
			console.log("[AuthProvider] 🧹 Unsubscribing auth listener");
			subscription.unsubscribe();
		};
	}, []);

	// ─────────────────────────────────────────────────────────────
	// AUTH METHODS
	// ─────────────────────────────────────────────────────────────

	const signup = async (
		email: string,
		password: string,
		onSuccess?: () => void, // ← Callback for redirect after alert
	) => {
		console.log(`[AuthProvider] 📝 signup() called for ${email}`);

		const redirectTo = AuthSession.makeRedirectUri({ path: "/verify-email" });

		const { error } = await getSupabase().auth.signUp({
			email,
			password,
			options: { emailRedirectTo: redirectTo },
		});

		if (error) {
			console.log("[AuthProvider] ❌ Signup error:", error.message);
			showAlert("Signup Failed", error.message, "error");
			throw error;
		}

		console.log("[AuthProvider] ✅ Signup successful");

		showAlert(
			"Account Created",
			"Please check your email to confirm your account.\n\nYou can close this and log in after confirming.",
			"success",
		);

		// Run the callback (redirect) after showing alert
		if (onSuccess) {
			onSuccess();
		}
	};

	const signIn = async (email: string, password: string) => {
		console.log(`[AuthProvider] 🔑 signIn() called for ${email}`);
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
		console.log("[AuthProvider] 🔴 signOut() started");
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
		throw new Error("Not implemented yet");
	};

	const uploadAvatar = async (file: any) => {
		if (!user?.id) throw new Error("No user logged in");
		throw new Error("Not implemented yet");
	};

	const refreshWorkouts = async () => {
		throw new Error("Not implemented yet");
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
		console.error("[useAuth] ❌ Used outside AuthProvider!");
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
