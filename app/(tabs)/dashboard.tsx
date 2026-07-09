import TabScreen from "@/components/layout/TabScreen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import CaloriesBurnedWidget from "@/components/pages/dashboard/widgets/CaloriesBurnedWidget";
import DaysTrainedWidget from "@/components/pages/dashboard/widgets/DaysTrainedWidget";
import QuickLogWidget from "@/components/pages/dashboard/widgets/QuickLogWidget";
import StreakWidget from "@/components/pages/dashboard/widgets/StreakWidget";
import TotalSetsWidget from "@/components/pages/dashboard/widgets/TotalSetsWidget";
import TotalVolumeWidget from "@/components/pages/dashboard/widgets/TotalVolumeWidget";
import WeeklyVolumeWidget from "@/components/pages/dashboard/widgets/WeeklyVolumeWidget";
import WorkoutsLoggedWidget from "@/components/pages/dashboard/widgets/WorkoutsLoggedWidget";

import NavDrawer from "@/components/ui/NavDrawer";

import { Text, View } from "react-native";

/**
 * Dashboard Screen - Now built as a composition of independent widgets.
 *
 * This structure makes it much easier to:
 * - Add new widgets in the future
 * - Let users customize their dashboard
 * - Maintain and test individual sections
 */
export default function Dashboard() {
	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			{/* Keep the status bar light on this dark screen */}
			<StatusBar style="light" />

			<TabScreen
				title="FitForge"
				subtitle="Welcome back" // We can make this dynamic later
			>
				{/* Top streak widget - always visible at the top */}
				<StreakWidget />

				{/* Monthly Stats Section - grouped overview cards */}
				<View className="my-8">
					<Text className="text-zinc-400 text-lg font-semibold mb-6">
						This Month Overview
					</Text>

					{/* First row of two widgets side by side */}
					<View className="flex-row gap-2 mb-2">
						<DaysTrainedWidget />
						<WorkoutsLoggedWidget />
					</View>

					{/* Second row of two widgets side by side */}
					<View className="flex-row gap-2 mb-2">
						<CaloriesBurnedWidget />
						<TotalSetsWidget />
					</View>

					{/* Full-width total volume widget */}
					<TotalVolumeWidget />
				</View>

				{/* Weekly volume chart widget */}
				<WeeklyVolumeWidget />

				{/* Quick log floating action widget */}
				<QuickLogWidget />
			</TabScreen>

			{/* Hidden drawer (currently not interactive - placeholder) */}
			<NavDrawer isOpen={false} onClose={() => {}} />
		</SafeAreaView>
	);
}
