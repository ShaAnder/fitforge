import TabScreen from "@/components/layout/TabScreen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import CaloriesBurnedWidget from "@/components/dashboard/widgets/CaloriesBurnedWidget";
import DaysTrainedWidget from "@/components/dashboard/widgets/DaysTrainedWidget";
import QuickLogWidget from "@/components/dashboard/widgets/QuickLogWidget";
import StreakWidget from "@/components/dashboard/widgets/StreakWidget";
import TotalSetsWidget from "@/components/dashboard/widgets/TotalSetsWidget";
import TotalVolumeWidget from "@/components/dashboard/widgets/TotalVolumeWidget";
import WeeklyVolumeWidget from "@/components/dashboard/widgets/WeeklyVolumeWidget";
import WorkoutsLoggedWidget from "@/components/dashboard/widgets/WorkoutsLoggedWidget";

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
			<StatusBar style="light" />

			<TabScreen
				title="FitForge"
				subtitle="Welcome back" // We can make this dynamic later
			>
				<StreakWidget />

				{/* Monthly Stats Section */}
				<View className="my-8">
					<Text className="text-zinc-400 text-lg font-semibold mb-6">
						This Month Overview
					</Text>

					<View className="flex-row gap-2 mb-2">
						<DaysTrainedWidget />
						<WorkoutsLoggedWidget />
					</View>

					<View className="flex-row gap-2 mb-2">
						<CaloriesBurnedWidget />
						<TotalSetsWidget />
					</View>

					<TotalVolumeWidget />
				</View>

				<WeeklyVolumeWidget />

				<QuickLogWidget />
			</TabScreen>

			{/* Hidden drawer */}
			<NavDrawer isOpen={false} onClose={() => {}} />
		</SafeAreaView>
	);
}
