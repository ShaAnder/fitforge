import StatCard from "@/components/common/StatCard";
import { useAuth } from "@/context/AuthContext";
import { getThisMonthStats } from "@/helpers/dashboardUtils";
import { convertWeight, getUnitLabel } from "@/helpers/unitConverter";

export default function TotalVolumeWidget() {
	const { workouts, profile } = useAuth();

	const userUnit = profile?.units ?? "kg";
	const unitLabel = getUnitLabel(userUnit);
	const stats = getThisMonthStats(workouts);
	const totalVolumeConverted = convertWeight(stats.totalVolume, userUnit);

	return (
		<StatCard
			title="TOTAL VOLUME"
			value={`${totalVolumeConverted.toLocaleString()} ${unitLabel}`}
			subtitle="lifted"
			className="w-full"
		/>
	);
}
