// app/_layout.tsx
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

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
	const { user, loading } = useAuth();
	const segments = useSegments();
	const rootNavState = useRootNavigationState();

	useInitNotifications();

	const inAuthGroup =
		segments[0] === "login" ||
		segments[0] === "signup" ||
		segments[0] === "forgot-password" ||
		segments[0] === "reset-password" ||
		segments[0] === "resend-verification" ||
		segments[0] === "verify-email";

	// Keep native splash visible until:
	// 1) Expo Router nav tree is mounted (rootNavState.key exists)
	// 2) AuthContext finished bootstrapping (loading=false)
	useEffect(() => {
		if (rootNavState?.key && !loading) {
			SplashScreen.hideAsync().catch(() => {});
		}
	}, [rootNavState?.key, loading]);

	// HARD GATE: do not render Stack/Tabs/Login at all until ready.
	// This prevents seeing the tab bar/layout before your dashboard data is ready.
	if (!rootNavState?.key || loading) {
		return (
			<LoadingScreen
				message="Loading your dashboard..."
				subMessage="Please wait"
			/>
		);
	}

	// Render-time redirects so the wrong tree never mounts briefly.
	if (!user && !inAuthGroup) return <Redirect href="/login" />;
	if (user && inAuthGroup) return <Redirect href="/(tabs)/dashboard" />;

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="login" options={{ headerShown: false }} />
			<Stack.Screen
				name="resend-verification"
				options={{ headerShown: false }}
			/>
			<Stack.Screen name="signup" options={{ headerShown: false }} />
			<Stack.Screen name="forgot-password" options={{ headerShown: false }} />
			<Stack.Screen name="reset-password" options={{ headerShown: false }} />
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
	);
}

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
