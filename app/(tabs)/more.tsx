import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

/**
 * More Screen - Redirect Handler.
 *
 * This is a dummy screen used only as a tab entry point.
 * It immediately redirects to the dashboard so the "More" tab
 * never actually renders content (drawer is handled in TabLayout).
 */
export default function MoreScreen() {
	const router = useRouter();

	/**
	 * Auto-redirect on mount.
	 *
	 * Prevents this screen from ever being visible to the user.
	 */
	useEffect(() => {
		router.replace("/(tabs)/dashboard");
	}, [router]);

	// Empty view required for Expo Router
	// Expo Router needs at least one element returned from a screen
	return <View />;
}
