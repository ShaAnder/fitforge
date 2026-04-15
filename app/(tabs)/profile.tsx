import { ScrollView, Text, View } from "react-native";

export default function Profile() {
	return (
		<View className="flex-1 bg-zinc-950">
			<ScrollView className="flex-1 px-5 pt-12">
				<Text className="text-4xl font-bold text-white tracking-tighter mb-8">
					Profile
				</Text>

				{/* Goals Section */}
				<View className="bg-zinc-900 rounded-3xl p-8 mb-8">
					<Text className="text-emerald-400 text-sm font-medium mb-4">
						Your Goals
					</Text>
					<Text className="text-white text-xl">Train 4 times per week</Text>
					<View className="h-2 bg-zinc-800 rounded-full mt-6">
						<View className="h-2 bg-emerald-500 rounded-full w-3/4" />
					</View>
				</View>

				{/* Achievements */}
				<View className="bg-zinc-900 rounded-3xl p-8 mb-8">
					<Text className="text-emerald-400 text-sm font-medium mb-4">
						Achievements
					</Text>
					<Text className="text-zinc-400">
						Badges and milestones will appear here
					</Text>
				</View>

				<Text className="text-zinc-500 text-center">
					Settings and account options coming soon
				</Text>
			</ScrollView>
		</View>
	);
}
