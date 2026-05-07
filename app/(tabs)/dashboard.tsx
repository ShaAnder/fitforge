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
import {
	convertVolumeData,
	convertWeight,
	getUnitLabel,
} from "@/helpers/unitConverter";
import { useAccent } from "@/hooks/useAccent";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

/**
 * Dashboard Screen - Main home screen of FitForge.
 *
 * Displays user progress overview including:
 * - Current streak
 * - Monthly statistics
 * - Weekly volume chart
 * - Quick actions
 */
export default function Dashboard() {
	const { user, profile, workouts, loading } = useAuth();
	const router = useRouter();
	const accent = useAccent();

	// User preferences from profile
	const userUnit = (profile?.units as "kg" | "lb") ?? "kg";
	const userWeekStart = (profile?.week_start as "mon" | "sun") ?? "mon";

	// Calculate derived stats
	const currentStreak = calculateStreak(workouts);
	const monthStats = getThisMonthStats(workouts);
	const weeklyData = getWeeklyVolumeData(workouts, userWeekStart);

	// Convert volume data based on user's preferred unit (kg/lb)
	const convertedWeeklyData = convertVolumeData(weeklyData, userUnit);

	const chartData = convertedWeeklyData.map((item) => ({
		...item,
		// Custom label component for chart bars
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

	const totalVolumeConverted = convertWeight(monthStats.totalVolume, userUnit);
	const unitLabel = getUnitLabel(userUnit);

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

							{/* Monthly Stats Row 1 */}
							<View className="flex-row gap-2 mb-2">
								<StatCard
									title="DAYS TRAINED"
									value={monthStats.daysTrained}
									subtitle={`/ ${monthStats.daysInMonth}`}
									progress={monthStats.progress}
									className="flex-1"
								/>
								<StatCard
									title="WORKOUTS"
									value={monthStats.workoutsThisMonth}
									subtitle="logged"
									className="flex-1"
								/>
							</View>

							{/* Monthly Stats Row 2 */}
							<View className="flex-row gap-2 mb-2">
								<StatCard
									title="EST. CALORIES"
									value={monthStats.estCalories.toLocaleString()}
									subtitle="burned"
									className="flex-1"
								/>
								<StatCard
									title="TOTAL SETS"
									value={monthStats.totalSets}
									subtitle="completed"
									className="flex-1"
								/>
							</View>

							{/* Total Volume with dynamic unit */}
							<StatCard
								title="TOTAL VOLUME"
								value={`${totalVolumeConverted.toLocaleString()} ${unitLabel}`}
								subtitle="lifted"
								className="w-full"
							/>
						</View>

						<View className="mb-10">
							<Text className="text-zinc-400 text-lg font-semibold mb-5">
								Weekly Volume ({unitLabel})
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

			{/* Placeholder drawer (hidden by default) */}
			<NavDrawer isOpen={false} onClose={() => {}} />
		</View>
	);
}
