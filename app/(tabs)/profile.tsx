import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import TabScreen from "@/components/layout/TabScreen";

export default function Profile() {
	const router = useRouter();
	return (
		<TabScreen title="Profile" subtitle="You Are Who You Make Yourself">
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
		</TabScreen>
	);
}
