import StatCard from "@/components/common/StatCard";
import { useAuth } from "@/context/AuthContext";
import { getThisMonthStats } from "@/helpers/dashboardUtils";

import type { WorkoutsLoggedData } from "@/types";

/**
 * WorkoutsLoggedWidget - Shows number of workouts logged this month.
 */
export default function WorkoutsLoggedWidget() {
	const { workouts } = useAuth();
	const stats: WorkoutsLoggedData = getThisMonthStats(workouts);

	return (
		<StatCard
			title="WORKOUTS"
			value={stats.workoutsThisMonth}
			subtitle="logged"
			className="flex-1"
		/>
	);
}
