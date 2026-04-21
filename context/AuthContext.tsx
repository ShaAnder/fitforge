import { getSupabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

// create our ts type for the Auth context
type AuthContextType = {
	// value can be user or nothing
	user: User | null;
	// session is needed for current authentication session no session == no auth
	session: Session | null;
	// flag to check if user logged or not true = checking false = check complete
	loading: boolean;
	// signup / in / out function types, accepts an email / pass that returns a promise that results to nothing. Used to cross check auth
	signup: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

// create the context based on our above type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider - Wraps the entire app and manages authentication state.
 *
 * This provider:
 *   1. Checks if user is already logged in when app starts
 *   2. Listens for auth changes (login, logout, session refresh)
 *   3. Provides signup, signin, and signout functions to all components
 *   4. Makes user/session/loading available via useAuth() hook
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	const supabase = getSupabase();

	// Run when app starts get the current session if it exists (user logged in)
	useEffect(() => {
		// 1. Get initial session
		supabase.auth
			.getSession()
			.then((result: { data: { session: Session | null } }) => {
				const { session } = result.data;
				setSession(session);
				setUser(session?.user ?? null);
				setLoading(false);
			});

		// 2. Listen for auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			(event: any, session: Session | null) => {
				setSession(session);
				setUser(session?.user ?? null);
				setLoading(false);
			},
		);

		// Cleanup: unsubscribe when component unmounts
		return () => subscription.unsubscribe();
	}, []);

	// NEXT: Define auth methods

	// Create a new user account
	const signup = async (email: string, password: string) => {
		const { error } = await supabase.auth.signUp({ email, password });
		if (error) throw error;
	};

	// Log in an existing user
	const signIn = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) throw error;
	};

	// Log the user out
	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	};

	// Finally return and wrap the auth context in all children
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
 * Custom hook to use the AuthContext
 *
 * Usage example:
 *   const { user, signIn, signOut } = useAuth();
 */
export const useAuth = () => {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};
