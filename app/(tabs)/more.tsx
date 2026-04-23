// app/(tabs)/more.tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function MoreScreen() {
	const router = useRouter();

	useEffect(() => {
		// Immediately go back so we never see this screen
		router.replace("/(tabs)/dashboard");
	}, [router]);

	return <View />;
}
