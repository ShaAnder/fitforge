// app/_layout.tsx
import LoadingScreen from "@/components/ui/LoadingScreen";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import "@/global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

const RootLayoutNav = React.memo(() => {
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
	}, [user, loading, segments, router]);

	if (loading) {
		return <LoadingScreen />;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			{!user ? (
				<>
					<Stack.Screen name="login" />
					<Stack.Screen name="signup" />
					<Stack.Screen name="forgot-password" />
					<Stack.Screen name="reset-password" />
				</>
			) : (
				<Stack.Screen name="(tabs)" />
			)}
		</Stack>
	);
});

export default function RootLayout() {
	return (
		<AuthProvider>
			<View className="flex-1 bg-zinc-950">
				<RootLayoutNav />
			</View>
		</AuthProvider>
	);
}
