import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import TabScreen from "@/components/layout/TabScreen";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Achievements Screen - Placeholder page.
 *
 * Currently shows a "Coming Soon" state.
 * Will eventually display user achievements, badges, and milestones.
 */
export default function Achievements() {
	const router = useRouter();

	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			<TabScreen title="Achievements" subtitle="Coming soon">
				{/* Centered content area for the placeholder state */}
				<View className="items-center justify-center py-24">
					{/* Large construction icon to clearly signal this is not yet built */}
					<Ionicons name="construct-outline" size={72} color="#3f3f46" />

					<Text className="text-white text-2xl font-bold mt-8">
						Under Construction
					</Text>

					{/* Friendly explanatory message */}
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
		</SafeAreaView>
	);
}
