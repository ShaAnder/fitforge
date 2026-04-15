// app/(tabs)/dashboard.tsx
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Dashboard() {
	const currentStreak = 12;
	const daysTrainedThisMonth = 19;
	const daysInMonth = 31;
	const monthlyVolume = "142,780 kg";

	return (
		<View className="flex-1 bg-zinc-950">
			<StatusBar style="light" />

			<ScrollView
				className="flex-1 px-5"
				contentContainerStyle={{
					paddingTop: 48,
					paddingBottom: 50,
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View className="flex-row justify-between items-center mb-12">
					<View>
						<Text className="text-zinc-400 text-base">Welcome back</Text>
						<Text className="text-4xl font-bold text-white tracking-tighter">
							FitForge
						</Text>
					</View>
					<Ionicons name="flame" size={36} color="#eab308" />
				</View>

				{/* Streak Card */}
				<View className="bg-zinc-900 rounded-3xl p-10 mb-8 items-center border border-zinc-800">
					<Text className="text-emerald-400 uppercase tracking-widest text-sm font-medium">
						Current Streak
					</Text>

					<View className="flex-row items-center mt-6">
						<Text className="text-8xl font-bold text-white">
							{currentStreak}
						</Text>
						<Text className="text-6xl ml-4">🔥</Text>
					</View>

					<Text className="text-zinc-400 text-xl mt-2">days in a row</Text>
				</View>

				{/* Monthly Stats */}
				<View className="mb-10">
					<Text className="text-zinc-400 text-lg font-semibold mb-5">
						This Month
					</Text>

					<View className="flex-row gap-4">
						<View className="flex-1 bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
							<Text className="text-emerald-400 text-xs font-medium">
								DAYS TRAINED
							</Text>
							<Text className="text-5xl font-bold text-white mt-4">
								{daysTrainedThisMonth}
								<Text className="text-2xl text-zinc-500"> / {daysInMonth}</Text>
							</Text>
							<View className="h-2 bg-zinc-800 rounded-full mt-6 overflow-hidden">
								<View
									className="h-2 bg-emerald-500 rounded-full"
									style={{
										width: `${Math.round((daysTrainedThisMonth / daysInMonth) * 100)}%`,
									}}
								/>
							</View>
						</View>

						<View className="flex-1 bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
							<Text className="text-emerald-400 text-xs font-medium">
								TOTAL VOLUME
							</Text>
							<Text className="text-white text-3xl font-bold mt-8 tracking-tighter">
								{monthlyVolume}
							</Text>
						</View>
					</View>
				</View>

				{/* Weekly Volume Chart Placeholder */}
				<View className="mb-10">
					<Text className="text-zinc-400 text-lg font-semibold mb-4">
						Weekly Volume
					</Text>
					<View className="bg-zinc-900 rounded-3xl h-80 border border-zinc-800 items-center justify-center">
						<Text className="text-zinc-500 text-center">
							Weekly Volume Chart{"\n"}
							<Text className="text-xs"></Text>
						</Text>
					</View>
				</View>

				{/* Quick Log Workout Button */}
				<TouchableOpacity
					className="bg-emerald-500 py-6 rounded-3xl flex-row items-center justify-center active:bg-emerald-600"
					onPress={() => console.log("Navigate to Log Workout")}
				>
					<Ionicons name="add-circle" size={26} color="#000" />
					<Text className="text-black font-semibold text-xl ml-3 tracking-widest">
						QUICK LOG WORKOUT
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}
