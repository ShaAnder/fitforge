// helpers/dashboardUtils.ts

/**
 * Get unique training days for the current month
 * (Multiple workouts on same day = still counts as 1 day)
 */
export const getThisMonthStats = (workouts: any[]) => {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();

	// Get unique dates this month
	const uniqueDays = new Set<string>();

	workouts.forEach((workout) => {
		const d = new Date(workout.date);
		if (d.getFullYear() === year && d.getMonth() === month) {
			// Store as YYYY-MM-DD string to deduplicate
			const dateKey = d.toISOString().split("T")[0];
			uniqueDays.add(dateKey);
		}
	});

	const daysTrained = uniqueDays.size;
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const totalVolume = workouts
		.filter((w) => {
			const d = new Date(w.date);
			return d.getFullYear() === year && d.getMonth() === month;
		})
		.reduce((sum, w) => sum + (w.total_volume || 0), 0);

	return {
		daysTrained,
		daysInMonth,
		totalVolume,
		progress:
			daysInMonth > 0 ? Math.round((daysTrained / daysInMonth) * 100) : 0,
	};
};

/**
 * Calculate current streak - same day only counts once
 * If you trained today → streak at least 1
 */
export const calculateStreak = (workouts: any[]): number => {
	if (!workouts?.length) return 0;

	// Get unique dates (YYYY-MM-DD) sorted newest first
	const uniqueDates = [
		...new Set(
			workouts.map((w) => {
				const d = new Date(w.date);
				d.setHours(0, 0, 0, 0);
				return d.toISOString().split("T")[0];
			}),
		),
	]
		.sort()
		.reverse(); // newest first

	if (uniqueDates.length === 0) return 0;

	let streak = 0;
	let currentDate = new Date(uniqueDates[0]);

	for (let i = 1; i < uniqueDates.length; i++) {
		const prevDate = new Date(uniqueDates[i]);
		const diffDays = Math.floor(
			(currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24),
		);

		if (diffDays === 1) {
			streak++;
			currentDate = prevDate;
		} else {
			break; // Gap found, stop counting
		}
	}

	return streak;
};
/**
 * Weekly volume - Fixed Mon to Sun
 */
export const getWeeklyVolumeData = (workouts: any[]) => {
	const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	const data = dayOrder.map((label) => ({ value: 0, label }));

	workouts.forEach((workout) => {
		const date = new Date(workout.date);
		const dayIndex = (date.getDay() + 6) % 7; // Sun=0 → index 6
		data[dayIndex].value += workout.total_volume || 0;
	});

	return data;
};
