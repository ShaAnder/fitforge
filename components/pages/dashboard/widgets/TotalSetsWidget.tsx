import StatCard from "@/components/common/StatCard";
import { useAuth } from "@/context/AuthContext";
import { getThisMonthStats } from "@/helpers/dashboardUtils";

import type { TotalSetsData } from "@/types";

/**
 * TotalSetsWidget - Shows total sets completed this month.
 */
export default function TotalSetsWidget() {
	const { workouts } = useAuth();
	const stats: TotalSetsData = getThisMonthStats(workouts);

	return (
		<StatCard
			title="TOTAL SETS"
			value={stats.totalSets}
			subtitle="completed"
			className="flex-1"
		/>
	);
}
