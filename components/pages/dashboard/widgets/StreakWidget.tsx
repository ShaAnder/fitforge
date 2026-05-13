import StreakCard from "@/components/common/StreakCard";
import { useAuth } from "@/context/AuthContext";
import { calculateStreak } from "@/helpers/dashboardUtils";

import type { StreakData } from "@/types";

/**
 * StreakWidget - Displays current workout streak.
 */
export default function StreakWidget() {
	const { workouts } = useAuth();
	const streakData: StreakData = { streak: calculateStreak(workouts) };

	return <StreakCard streak={streakData.streak} />;
}
