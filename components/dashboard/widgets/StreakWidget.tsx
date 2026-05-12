import StreakCard from "@/components/common/StreakCard";
import { useAuth } from "@/context/AuthContext";
import { calculateStreak } from "@/helpers/dashboardUtils";

/**
 * StreakWidget - Displays current workout streak.
 */
export default function StreakWidget() {
	const { workouts } = useAuth();
	const currentStreak = calculateStreak(workouts);

	return <StreakCard streak={currentStreak} />;
}
