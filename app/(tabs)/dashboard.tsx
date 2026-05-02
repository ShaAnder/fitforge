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

/**
 * Dashboard Screen - Uses global data from AuthContext (no local loading/fetch)
 */
export default function Dashboard() {
	const { user, profile, workouts, loading } = useAuth();
	const router = useRouter();

	const currentStreak = calculateStreak(workouts);
	const { daysTrained, daysInMonth, totalVolume, progress } =
		getThisMonthStats(workouts);
	const weeklyData = getWeeklyVolumeData(workouts);

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

						<View className="mb-10 mt-10">
							<View className="flex-row justify-between items-baseline mb-5">
								<Text className="text-zinc-400 text-lg font-semibold">
									This Month
								</Text>
							</View>

							<View className="flex-row gap-4">
								<StatCard
									title="DAYS TRAINED"
									value={daysTrained}
									subtitle={`/ ${daysInMonth}`}
									progress={progress}
								/>
								<StatCard
									title="TOTAL VOLUME"
									value={`${totalVolume.toLocaleString()} kg`}
								/>
								<StatCard title="TOTAL MINUTES" value="1,240" />
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
