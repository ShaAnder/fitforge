import StatCard from "@/components/common/StatCard";
import { useAuth } from "@/context/AuthContext";
import { getThisMonthStats } from "@/helpers/dashboardUtils";

export default function WorkoutsLoggedWidget() {
	const { workouts } = useAuth();
	const stats = getThisMonthStats(workouts);

	return (
		<StatCard
			title="WORKOUTS"
			value={stats.workoutsThisMonth}
			subtitle="logged"
			className="flex-1"
		/>
	);
}
