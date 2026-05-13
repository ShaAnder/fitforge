import WeeklyVolumeChart from "../WeeklyVolumeChart";
import { useAuth } from "@/context/AuthContext";
import { getWeeklyVolumeData } from "@/helpers/dashboardUtils";
import { convertVolumeData, getUnitLabel } from "@/helpers/unitConverter";
import { useAccent } from "@/hooks/useAccent";
import { Text, View } from "react-native";

import type { WeeklyVolumeItem } from "@/types";

/**
 * WeeklyVolumeWidget - Shows weekly volume bar chart.
 */
export default function WeeklyVolumeWidget() {
	const { workouts, profile } = useAuth();
	const accent = useAccent();

	const userUnit = profile?.units ?? "kg";
	const userWeekStart = profile?.week_start ?? "mon";

	const weeklyData = getWeeklyVolumeData(workouts, userWeekStart);
	const convertedWeeklyData = convertVolumeData(weeklyData, userUnit);

	const chartData: WeeklyVolumeItem[] = convertedWeeklyData.map((item) => ({
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
		<View className="mb-10">
			<Text className="text-zinc-400 text-lg font-semibold mb-5">
				Weekly Volume ({getUnitLabel(userUnit)})
			</Text>
			<View className="bg-zinc-900 rounded-3xl pt-5 border border-zinc-800 flex items-center justify-center">
				<WeeklyVolumeChart chartData={chartData} />
			</View>
		</View>
	);
}
