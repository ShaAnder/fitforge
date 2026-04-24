// context/AuthContext.tsx
import { getSupabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

// Type definition for everything this context provides
type AuthContextType = {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signup: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider - Manages authentication state for the entire app.
 *
 * Key behaviors:
 * - Restores session automatically when app starts or emulator refreshes
 * - Listens for auth changes (login, logout, token refresh)
 * - Keeps user logged in until they explicitly sign out
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	const supabase = getSupabase();

	useEffect(() => {
		let mounted = true;

		// 1. Restore any existing session when the app starts or refreshes
		const restoreSession = async () => {
			try {
				const {
					data: { session: currentSession },
				} = await supabase.auth.getSession();

				if (mounted) {
					setSession(currentSession);
					setUser(currentSession?.user ?? null);
					setLoading(false);
				}
			} catch (error) {
				console.error("Failed to restore session:", error);
				if (mounted) setLoading(false);
			}
		};

		restoreSession();

		// 2. Listen for all auth changes (login, logout, token refresh, etc.)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			(event: string, currentSession: Session | null) => {
				// ← Fixed types here
				console.log(`🔐 Auth event: ${event}`);

				if (mounted) {
					setSession(currentSession);
					setUser(currentSession?.user ?? null);
					setLoading(false);
				}
			},
		);

		// Cleanup function
		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, [supabase]);

	// Auth methods
	const signup = async (email: string, password: string) => {
		const { error } = await supabase.auth.signUp({ email, password });
		if (error) throw error;
	};

	const signIn = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;

		// Immediately clear local state
		setUser(null);
		setSession(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				session,
				loading,
				signup,
				signIn,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

/**
 * Custom hook to safely use the AuthContext
 */
export const useAuth = () => {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};
