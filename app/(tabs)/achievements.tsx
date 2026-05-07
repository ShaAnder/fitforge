import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import TabScreen from "@/components/layout/TabScreen";

/**
 * Achievements Screen - Placeholder page.
 *
 * Currently shows a "Coming Soon" state.
 * Will eventually display user achievements, badges, and milestones.
 */
export default function Achievements() {
	const router = useRouter();

	return (
		<TabScreen title="Achievements" subtitle="Coming soon">
			<View className="items-center justify-center py-24">
				<Ionicons name="construct-outline" size={72} color="#3f3f46" />

				<Text className="text-white text-2xl font-bold mt-8">
					Under Construction
				</Text>

				<Text className="text-zinc-500 text-center mt-3 px-10 text-base">
					This feature is planned for a future release.
				</Text>

				{/* Navigation back to main dashboard */}
				<TouchableOpacity
					onPress={() => router.replace("/(tabs)/dashboard")}
					className="mt-10 bg-zinc-800 px-6 py-4 rounded-2xl"
				>
					<Text className="text-white font-semibold">Back to Dashboard</Text>
				</TouchableOpacity>
			</View>
		</TabScreen>
	);
}
