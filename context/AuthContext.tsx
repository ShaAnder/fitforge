// context/AuthContext.tsx
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

	// "loading" blocks ALL UI at startup until auth + initial data is ready
	const [loading, setLoading] = useState(true);
	const [authResolved, setAuthResolved] = useState(false);

	const { showAlert } = useAlert();
	const { setAccentId } = useAccentContext();

	const MIN_SPLASH_MS = 3500;

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
				setAuthResolved(true);
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
	// EFFECT 2: Bootstrap initial dashboard data
	// - Blocks UI until: auth resolved AND (if logged in) profile+workouts loaded
	// ─────────────────────────────────────────────────────────────
	useEffect(() => {
		if (!authResolved) return;

		let cancelled = false;

		const bootstrap = async () => {
			if (!user?.id) {
				setProfile(null);
				setWorkouts([]);
				setAccentId("green");
				setLoading(false);
				return;
			}

			setLoading(true);

			try {
				const supabase = getSupabase();

				// Load or create profile
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

					const { data: createdProfile, error: createdErr } = await supabase
						.from("profiles")
						.select("*")
						.eq("id", user.id)
						.single();

					if (createdErr) throw createdErr;

					resolvedProfile = createdProfile;
				}

				// Load workouts
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
				console.error("[AuthProvider] ❌ Bootstrap failed:", err);

				if (!cancelled) {
					showAlert(
						"Loading Error",
						"Failed to load your dashboard data. Please try again.",
						"error",
					);
					setAccentId("green");
				}
				await new Promise((r) => setTimeout(r, MIN_SPLASH_MS));
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		bootstrap();

		return () => {
			cancelled = true;
		};
	}, [authResolved, user?.id, setAccentId, showAlert]);

	// ─────────────────────────────────────────────────────────────
	// AUTH METHODS
	// ─────────────────────────────────────────────────────────────

	const signup = async (
		email: string,
		password: string,
		onSuccess?: () => void, // ← Callback for redirect after alert
	) => {
		console.log(`[AuthProvider] 📝 signup() called for ${email}`);

		const { error } = await getSupabase().auth.signUp({
			email,
			password,
			options: {
				// Use static web redirect for reliability
				emailRedirectTo:
					"https://shaander.github.io/fitforge/web-redirect-verify.html",
			},
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

		if (onSuccess) onSuccess();
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
			console.error("Update profile error:", err);
			throw err;
		}
	};

	const uploadAvatar = async (asset: any): Promise<string> => {
		if (!user?.id) throw new Error("No user logged in");

		try {
			const publicUrl = await uploadAvatarFromQueries(user.id, asset);

			const fileName = publicUrl.split("/").pop() || publicUrl;
			await updateProfile({ avatar_url: fileName });

			return fileName;
		} catch (err: any) {
			console.error("Upload avatar error:", err);
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
			console.error("Refresh workouts error:", err);
			showAlert("Error", "Failed to refresh workouts", "error");
		}
	}, [user?.id, showAlert]);

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
