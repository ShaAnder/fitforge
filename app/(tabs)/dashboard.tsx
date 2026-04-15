import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";

import Header from "@/components/common/Header";
import StatCard from "@/components/common/StatCard";
import StreakCard from "@/components/common/StreakCard";
import Button from "@/components/ui/Button";

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
				contentContainerStyle={{ paddingTop: 48, paddingBottom: 90 }}
				showsVerticalScrollIndicator={false}
			>
				<Header subtitle="Welcome back, Alex" />

				<StreakCard streak={currentStreak} />

				<View className="mb-10 mt-8">
					<Text className="text-zinc-400 text-lg font-semibold mb-5">
						This Month
					</Text>

					<View className="flex-row gap-4">
						<StatCard
							title="DAYS TRAINED"
							value={daysTrainedThisMonth}
							subtitle={`/ ${daysInMonth}`}
							progress={Math.round((daysTrainedThisMonth / daysInMonth) * 100)}
						/>
						<StatCard title="TOTAL VOLUME" value={monthlyVolume} />
					</View>
				</View>

				<View className="mb-10">
					<Text className="text-zinc-400 text-lg font-semibold mb-4">
						Weekly Volume
					</Text>
					<View className="bg-zinc-900 rounded-3xl h-80 border border-zinc-800 items-center justify-center">
						<Text className="text-zinc-500 text-center">
							Weekly Volume Chart{"\n"}
							<Text className="text-xs">
								(react-native-gifted-charts coming soon)
							</Text>
						</Text>
					</View>
				</View>

				<Button
					title="QUICK LOG WORKOUT"
					icon="add-circle"
					onPress={() => console.log("Navigate to Log Workout")}
				/>
			</ScrollView>
		</View>
	);
}
