import StatCard from "@/components/common/StatCard";
import { useAuth } from "@/context/AuthContext";
import { getThisMonthStats } from "@/helpers/dashboardUtils";

export default function TotalSetsWidget() {
	const { workouts } = useAuth();
	const stats = getThisMonthStats(workouts);

	return (
		<StatCard
			title="TOTAL SETS"
			value={stats.totalSets}
			subtitle="completed"
			className="flex-1"
		/>
	);
}
