import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { useState } from "react";

import Header from "@/components/common/Header";
import StatCard from "@/components/common/StatCard";
import StreakCard from "@/components/common/StreakCard";
import WeeklyVolumeChart from "@/components/dashboard/WeeklyVolumeChart";
import Button from "@/components/ui/Button";
import NavDrawer from "@/components/ui/NavDrawer";

export default function Dashboard() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const router = useRouter();

	// Mock data for chart
	const weeklyData = [
		{ value: 80, label: "M" },
		{ value: 72, label: "T" },
		{ value: 98, label: "W" },
		{ value: 110, label: "T" },
		{ value: 54, label: "F" },
		{ value: 69, label: "S" },
		{ value: 30, label: "S" },
	];

	// Mock data for demonstration
	const currentStreak = 12;
	const daysTrainedThisMonth = 19;
	const daysInMonth = 31;
	const monthlyVolume = "142,780 kg";
	const totalMinutes = weeklyData.reduce((sum, item) => sum + item.value, 0);

	const chartData = weeklyData.map((item) => ({
		...item,
		topLabelComponent: () => (
			<Text
				style={{
					color: "#22c55e",
					fontSize: 13,
					fontWeight: "600",
					textAlign: "center",
				}}
			>
				{item.value}
			</Text>
		),
	}));

	return (
		<View className="flex-1 bg-zinc-950">
			<StatusBar style="light" />

			<ScrollView
				className="flex-1 px-5"
				contentContainerStyle={{ paddingTop: 40, paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<Header
					subtitle="Welcome back, Alex"
					onProfilePress={() => router.push("/(tabs)/profile")}
				/>

				{/* Current Streak Card */}
				<StreakCard streak={currentStreak} />

				{/* This Month Section */}
				<View className="mb-10 mt-10">
					<View className="flex-row justify-between items-baseline mb-5">
						<Text className="text-zinc-400 text-lg font-semibold">
							This Month
						</Text>
					</View>

					<View className="flex-row-2 gap-4 ">
						<StatCard
							title="DAYS TRAINED"
							value={daysTrainedThisMonth}
							subtitle={`/ ${daysInMonth}`}
							progress={Math.round((daysTrainedThisMonth / daysInMonth) * 100)}
						/>
						<StatCard title="TOTAL MINUTES" value={totalMinutes} />
						<StatCard title="TOTAL VOLUME" value={monthlyVolume} />
					</View>
				</View>

				{/* Weekly Volume Section */}
				<View className="mb-10">
					<Text className="text-zinc-400 text-lg font-semibold mb-5">
						Weekly Volume
					</Text>

					{/* Card - force flex centering + limit width */}
					<View className="bg-zinc-900 rounded-3xl pt-5  border border-zinc-800 flex items-center justify-center">
						<WeeklyVolumeChart chartData={chartData} />
					</View>
				</View>

				{/* Quick Log Button - Prominent CTA */}
				<Button
					title="QUICK LOG WORKOUT"
					icon="add-circle"
					variant="primary"
					size="large"
					onPress={() => console.log("Navigate to Log Workout")}
				/>
			</ScrollView>

			{/* NavDrawer controlled by 3-dot "More" tab */}
			<NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
		</View>
	);
}
