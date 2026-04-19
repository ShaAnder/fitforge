import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import "../global.css";

/**
 * RootLayoutNav - Inner navigation component that handles route protection.
 *
 * This component:
 *   - Checks the current auth state using the useAuth hook
 *   - Uses useSegments() to know which route the user is trying to visit
 *   - Automatically redirects users based on whether they are logged in or not
 *   - Prevents unauthenticated users from accessing the main app
 *   - Prevents logged-in users from staying on login/signup pages
 */
function RootLayoutNav() {
	const { user, loading } = useAuth();
	const segments = useSegments();
	const router = useRouter();

	// perform another auth state check here
	useEffect(() => {
		if (loading) return;

		// Check if the user is currently on an auth-related screen
		const inAuthGroup = segments[0] === "login" || segments[0] === "signup";

		if (!user && !inAuthGroup) {
			// Not logged in → force to login
			router.replace("/login");
		} else if (user && inAuthGroup) {
			// Logged in but on login/signup page → send to dashboard
			router.replace("/(tabs)/dashboard");
		}
		// Re-run whenever user, loading, or route changes
	}, [user, loading, segments]);

	return (
		<Stack screenOptions={{ headerShown: false }}>
			{/* Public auth screens */}
			<Stack.Screen name="login" />
			<Stack.Screen name="signup" />

			{/* Protected main app (tabs) */}
			<Stack.Screen name="(tabs)" />
		</Stack>
	);
}

/**
 * RootLayout - The top-most layout of the entire application.
 *
 * This is where we:
 *   - Wrap the whole app with AuthProvider so auth state is everywhere
 *   - Apply the global dark background
 *   - Render the protected navigation (RootLayoutNav)
 */
export default function RootLayout() {
	return (
		<AuthProvider>
			<View className="flex-1 bg-zinc-950">
				<RootLayoutNav />
			</View>
		</AuthProvider>
	);
}
