import StatCard from "@/components/common/StatCard";
import { useAuth } from "@/context/AuthContext";
import { getThisMonthStats } from "@/helpers/dashboardUtils";

export default function DaysTrainedWidget() {
	const { workouts } = useAuth();
	const stats = getThisMonthStats(workouts);

	return (
		<StatCard
			title="DAYS TRAINED"
			value={stats.daysTrained}
			subtitle={`/ ${stats.daysInMonth}`}
			progress={stats.progress}
			className="flex-1"
		/>
	);
}
