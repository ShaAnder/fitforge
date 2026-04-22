import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * LoadingScreen - A clean, branded loading screen shown during auth checks,
 * route transitions, and any waiting periods.
 *
 * This prevents the user from seeing raw screen swaps or the dashboard
 * while the app is still determining auth state.
 */
export default function LoadingScreen() {
	return (
		<View className="flex-1 bg-zinc-950 items-center justify-center">
			<View className="items-center">
				{/* App Logo / Brand */}
				<View className="mb-8">
					<Ionicons name="barbell" size={80} color="#22c55e" />
				</View>

				<Text className="text-white text-4xl font-bold tracking-tighter mb-2">
					FitForge
				</Text>

				<Text className="text-zinc-400 text-lg mb-12">
					Getting ready for you...
				</Text>

				{/* Large spinning indicator */}
				<ActivityIndicator size="large" color="#22c55e" />

				<Text className="text-zinc-500 text-sm mt-8">Please wait</Text>
			</View>
		</View>
	);
}
