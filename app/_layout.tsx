import { AuthProvider, useAuth } from "@/context/AuthContext";
import "@/global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

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

	useEffect(() => {
		if (loading) return;

		const inAuthGroup =
			segments[0] === "login" ||
			segments[0] === "signup" ||
			segments[0] === "forgot-password" ||
			segments[0] === "reset-password";

		if (!user && !inAuthGroup) {
			router.replace("/login");
		} else if (user && inAuthGroup) {
			router.replace("/(tabs)/dashboard");
		}
	}, [user, loading, segments]);

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="login" />
			<Stack.Screen name="signup" />
			<Stack.Screen name="forgot-password" />
			<Stack.Screen name="reset-password" />
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
				{/* DrawerLayout wraps the entire app content */}

				<RootLayoutNav />
			</View>
		</AuthProvider>
	);
}
