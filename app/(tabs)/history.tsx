import { ScrollView, Text, View } from "react-native";

export default function History() {
	return (
		<View className="flex-1 bg-zinc-950">
			<ScrollView className="flex-1 px-5 pt-12">
				<Text className="text-4xl font-bold text-white tracking-tighter mb-8">
					History
				</Text>

				{/* Streak Heatmap Placeholder */}
				<View className="bg-zinc-900 rounded-3xl p-6 mb-8">
					<Text className="text-emerald-400 text-sm font-medium mb-4">
						Training Heatmap
					</Text>
					<View className="h-52 bg-zinc-800 rounded-2xl items-center justify-center">
						<Text className="text-zinc-500"></Text>
					</View>
				</View>

				{/* Recent Workouts */}
				<View>
					<Text className="text-zinc-400 text-lg font-semibold mb-4">
						Recent Workouts
					</Text>
					{[1, 2, 3].map((i) => (
						<View
							key={i}
							className="bg-zinc-900 rounded-3xl p-6 mb-4 border border-zinc-800"
						>
							<Text className="text-white font-medium">
								Upper Body • {new Date().toLocaleDateString()}
							</Text>
							<Text className="text-zinc-500 text-sm mt-1">
								Total Volume: 28,450 kg
							</Text>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	);
}
