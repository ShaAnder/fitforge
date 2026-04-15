import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TextInput, View } from "react-native";

export default function Library() {
	return (
		<View className="flex-1 bg-zinc-950">
			<ScrollView className="flex-1 px-5 pt-12">
				<Text className="text-4xl font-bold text-white tracking-tighter mb-8">
					Exercise Library
				</Text>

				{/* Search Bar */}
				<View className="bg-zinc-900 rounded-3xl p-4 flex-row items-center mb-8 border border-zinc-800">
					<Ionicons name="search" size={20} color="#a1a1aa" />
					<TextInput
						className="flex-1 ml-3 text-white text-base"
						placeholder="Search exercises..."
						placeholderTextColor="#a1a1aa"
					/>
				</View>

				{/* Muscle Group Filters */}
				<View className="flex-row flex-wrap gap-2 mb-8">
					{["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"].map(
						(group) => (
							<View
								key={group}
								className="bg-zinc-900 px-5 py-2 rounded-full border border-zinc-800"
							>
								<Text className="text-white text-sm">{group}</Text>
							</View>
						),
					)}
				</View>

				<Text className="text-zinc-500 text-center">
					Exercise list with details will load here
				</Text>
			</ScrollView>
		</View>
	);
}
