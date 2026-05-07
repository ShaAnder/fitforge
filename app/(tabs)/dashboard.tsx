// app/(tabs)/dashboard.tsx
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

import StatCard from "@/components/common/StatCard";
import StreakCard from "@/components/common/StreakCard";
import WeeklyVolumeChart from "@/components/dashboard/WeeklyVolumeChart";
import TabScreen from "@/components/layout/TabScreen";
import Button from "@/components/ui/Button";
import NavDrawer from "@/components/ui/NavDrawer";
import { useAuth } from "@/context/AuthContext";
import {
	calculateStreak,
	getThisMonthStats,
	getWeeklyVolumeData,
} from "@/helpers/dashboardUtils";
import { useAccent } from "@/hooks/useAccent";

/**
 * Dashboard Screen - Uses global data from AuthContext (no local loading/fetch)
 */
export default function Dashboard() {
	const { user, profile, workouts, loading } = useAuth();
	const router = useRouter();
	const accent = useAccent();

	const currentStreak = calculateStreak(workouts);
	const {
		daysTrained,
		daysInMonth,
		totalVolume,
		totalSets,
		workoutsThisMonth,
		estCalories,
		progress,
	} = getThisMonthStats(workouts);
	const weeklyData = getWeeklyVolumeData(workouts);

	const chartData = weeklyData.map((item) => ({
		...item,
		topLabelComponent: () => (
			<Text
				style={{
					color: accent.hex500,
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

			<TabScreen
				title="FitForge"
				subtitle={
					profile?.username
						? `Welcome back, ${profile.username}`
						: user?.email
							? `Welcome back, ${user.email.split("@")[0]}`
							: "Welcome back"
				}
			>
				{loading ? (
					<Text className="text-zinc-400 text-center py-12">
						Loading your progress...
					</Text>
				) : (
					<>
						<StreakCard streak={currentStreak} />

						<View className="my-8">
							<Text className="text-zinc-400 text-lg font-semibold mb-6">
								This Month Overview
							</Text>

							{/* Row 1: Days Trained + Workouts Logged */}
							<View className="flex-row gap-2 mb-2">
								<StatCard
									title="DAYS TRAINED"
									value={daysTrained}
									subtitle={`/ ${daysInMonth}`}
									progress={progress}
									className="flex-1"
								/>
								<StatCard
									title="WORKOUTS"
									value={workoutsThisMonth}
									subtitle="logged"
									className="flex-1"
								/>
							</View>

							{/* Row 2: Calories + Total Sets (side by side) */}
							<View className="flex-row gap-2 mb-2 ">
								<StatCard
									title="EST. CALORIES"
									value={estCalories.toLocaleString()}
									subtitle="burned"
									className="flex-1"
								/>
								<StatCard
									title="TOTAL SETS"
									value={totalSets}
									subtitle="completed"
									className="flex-1"
								/>
							</View>
							{/* Row 3: Total Volume (full width, most important) */}
							<View className=" gap-4">
								<StatCard
									title="TOTAL VOLUME"
									value={`${totalVolume.toLocaleString()} kg`}
									subtitle="lifted"
									className="w-full"
								/>
							</View>
						</View>

						<View className="mb-10">
							<Text className="text-zinc-400 text-lg font-semibold mb-5">
								Weekly Volume
							</Text>
							<View className="bg-zinc-900 rounded-3xl pt-5 border border-zinc-800 flex items-center justify-center">
								<WeeklyVolumeChart chartData={chartData} />
							</View>
						</View>

						<Button
							title="QUICK LOG WORKOUT"
							icon="add-circle"
							variant="primary"
							size="large"
							onPress={() => router.push("/(tabs)/log-workout")}
						/>
					</>
				)}
			</TabScreen>

			<NavDrawer isOpen={false} onClose={() => {}} />
		</View>
	);
}
