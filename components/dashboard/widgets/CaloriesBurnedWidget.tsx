import StatCard from "@/components/common/StatCard";
import { useAuth } from "@/context/AuthContext";
import { getThisMonthStats } from "@/helpers/dashboardUtils";

export default function CaloriesBurnedWidget() {
	const { workouts } = useAuth();
	const stats = getThisMonthStats(workouts);

	return (
		<StatCard
			title="EST. CALORIES"
			value={stats.estCalories.toLocaleString()}
			subtitle="burned"
			className="flex-1"
		/>
	);
}
