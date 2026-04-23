import Header from "@/components/common/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function LogWorkout() {
	const router = useRouter();
	return (
		<View className="flex-1 bg-zinc-950">
			<ScrollView className="flex-1 px-5 pt-12">
				<Header
					title="Log Workout"
					subtitle="Show Me Your Progress!"
					onProfilePress={() => router.push("/(tabs)/profile")}
					flameIcon={true}
				/>

				{/* Exercise Search / Quick Add */}
				<View className="bg-zinc-900 rounded-3xl p-6 mb-6">
					<Text className="text-emerald-400 text-sm font-medium mb-3">
						QUICK ADD EXERCISE
					</Text>
					<View className="bg-zinc-800 rounded-2xl p-4 flex-row items-center">
						<Ionicons name="search" size={20} color="#a1a1aa" />
						<Text className="text-zinc-400 ml-3">Search exercises...</Text>
					</View>
				</View>

				{/* Current Workout Session */}
				<View className="mb-8">
					<Text className="text-zinc-400 text-lg font-semibold mb-4">
						Current Session
					</Text>
					<View className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
						<Text className="text-white text-xl">No exercises added yet</Text>
						<Text className="text-zinc-500 text-sm mt-2">
							Add your first exercise to begin logging
						</Text>
					</View>
				</View>

				{/* Recent Templates */}
				<View>
					<Text className="text-zinc-400 text-lg font-semibold mb-4">
						Quick Templates
					</Text>
					<View className="flex-row gap-3">
						{["Push Day", "Pull Day", "Leg Day"].map((template) => (
							<TouchableOpacity
								key={template}
								className="bg-zinc-900 flex-1 rounded-2xl p-5 border border-zinc-800"
							>
								<Text className="text-white font-medium">{template}</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
