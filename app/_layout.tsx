import LoadingScreen from "@/components/ui/LoadingScreen";
import { AccentProvider } from "@/context/AccentContext";
import { AlertProvider } from "@/context/AlertContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import "@/global.css";
import { useInitNotifications } from "@/handlers/notificationHandler";
import {
	Redirect,
	Stack,
	useRootNavigationState,
	useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Prevent the native splash screen from auto-hiding so we control when it disappears
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Root Layout Navigation Component.
 *
 * Handles authentication gating, protected routes, splash screen timing,
 * and the main navigation stack for the entire app.
 */
function RootLayoutNav() {
	const { user, loading } = useAuth();
	const segments = useSegments();
	const rootNavState = useRootNavigationState();

	// Initialize push notifications (expo-notifications setup)
	useInitNotifications();

	// Check if user is currently in any authentication-related route
	const inAuthGroup =
		segments[0] === "login" ||
		segments[0] === "signup" ||
		segments[0] === "forgot-password" ||
		segments[0] === "reset-password" ||
		segments[0] === "resend-verification" ||
		segments[0] === "verify-email";

	useEffect(() => {}, [
		loading,
		user,
		rootNavState?.key,
		inAuthGroup,
		segments,
	]);

	/**
	 * Control native splash screen visibility.
	 *
	 * We keep the splash visible until:
	 * 1. Expo Router has fully mounted the navigation tree (rootNavState.key exists)
	 * 2. AuthProvider has finished loading user/session data (loading = false)
	 */
	useEffect(() => {
		if (rootNavState?.key && !loading) {
			SplashScreen.hideAsync().catch(() => {});
		}
	}, [rootNavState?.key, loading]);

	// HARD GATE: Show loading screen until navigation + auth are both ready.
	// This prevents flashing the tab bar or login screen before data is loaded.
	if (!rootNavState?.key || loading) {
		return (
			<LoadingScreen
				message="Loading your dashboard..."
				subMessage="Please wait"
			/>
		);
	}

	// Protected Route Redirects (Render-time)
	// These ensure the wrong navigation tree never mounts even briefly.
	if (!user && !inAuthGroup) {
		return <Redirect href="/login" />;
	}
	if (user && inAuthGroup) {
		return <Redirect href="/(tabs)/dashboard" />;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			{/* Auth Routes */}
			<Stack.Screen name="login" options={{ headerShown: false }} />
			<Stack.Screen
				name="resend-verification"
				options={{ headerShown: false }}
			/>
			<Stack.Screen name="signup" options={{ headerShown: false }} />
			<Stack.Screen name="forgot-password" options={{ headerShown: false }} />
			<Stack.Screen name="reset-password" options={{ headerShown: false }} />

			{/* Main App Routes */}
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
	);
}

/**
 * Root Layout - Wraps the entire app with global providers.
 *
 * Order is important:
 * AccentProvider → AlertProvider → AuthProvider → Navigation
 */
export default function RootLayout() {
	return (
		<AccentProvider>
			<AlertProvider>
				<AuthProvider>
					<RootLayoutNav />
				</AuthProvider>
			</AlertProvider>
		</AccentProvider>
	);
}
