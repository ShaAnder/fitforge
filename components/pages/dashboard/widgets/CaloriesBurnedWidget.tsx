import StatCard from "@/components/common/StatCard";
import { useAuth } from "@/context/AuthContext";
import { getThisMonthStats } from "@/helpers/dashboardUtils";

import type { CaloriesBurnedData } from "@/types";

/**
 * CaloriesBurnedWidget - Shows estimated calories burned.
 */
export default function CaloriesBurnedWidget() {
	const { workouts } = useAuth();
	const stats: CaloriesBurnedData = getThisMonthStats(workouts);

	return (
		<StatCard
			title="EST. CALORIES"
			value={stats.estCalories.toLocaleString()}
			subtitle="burned"
			className="flex-1"
		/>
	);
}
