import LoadingScreen from "@/components/ui/LoadingScreen";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import "@/global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

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
	}, [user, loading, segments, router]);

	if (loading) {
		return <LoadingScreen />;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="login" options={{ headerShown: false }} />
			<Stack.Screen name="signup" options={{ headerShown: false }} />
			<Stack.Screen name="forgot-password" options={{ headerShown: false }} />
			<Stack.Screen name="reset-password" options={{ headerShown: false }} />
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
	);
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<View className="flex-1 bg-zinc-950">
				<RootLayoutNav />
			</View>
		</AuthProvider>
	);
}
