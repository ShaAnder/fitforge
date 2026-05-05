export const getThisMonthStats = (workouts: any[]) => {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();

	// Filter workouts for this month
	const thisMonthWorkouts = workouts.filter((w) => {
		const d = new Date(w.date || w.created_at);
		return d.getFullYear() === year && d.getMonth() === month;
	});

	// Unique training days (multiple workouts same day = 1)
	const uniqueDays = new Set(
		thisMonthWorkouts.map((w) => {
			const d = new Date(w.date || w.created_at);
			return d.toISOString().split("T")[0];
		}),
	);

	const daysTrained = uniqueDays.size;
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const totalVolume = thisMonthWorkouts.reduce(
		(sum, w) => sum + (w.total_volume || 0),
		0,
	);

	const totalSets = thisMonthWorkouts.reduce((sum, w) => {
		return sum + (Array.isArray(w.sets) ? w.sets.length : 0);
	}, 0);

	const workoutsThisMonth = thisMonthWorkouts.length;

	// Rough but realistic calorie estimate for lifting
	const estCalories = Math.round(totalSets * 65); // ~65 cal per set avg

	const progress =
		daysInMonth > 0 ? Math.round((daysTrained / daysInMonth) * 100) : 0;

	return {
		daysTrained,
		daysInMonth,
		totalVolume,
		totalSets,
		workoutsThisMonth,
		estCalories,
		progress,
	};
};

/**
 * Calculate current training streak
 * (Multiple workouts same day still count as 1)
 */
export const calculateStreak = (workouts: any[]): number => {
	if (!workouts?.length) return 0;

	// Get unique dates sorted newest → oldest
	const uniqueDates = [
		...new Set(
			workouts.map((w) => {
				const d = new Date(w.date || w.created_at);
				d.setHours(0, 0, 0, 0);
				return d.toISOString().split("T")[0];
			}),
		),
	]
		.sort()
		.reverse();

	if (uniqueDates.length === 0) return 0;

	let streak = 1; // Today (or most recent day) counts as 1
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
			break; // Gap found → stop
		}
	}

	return streak;
};

/**
 * Weekly Volume (This week only - Mon to Sun)
 */
export const getWeeklyVolumeData = (workouts: any[]) => {
	const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	const data = dayOrder.map((label) => ({ value: 0, label }));

	const now = new Date();
	const startOfWeek = new Date(now);
	startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday start

	workouts.forEach((workout) => {
		const workoutDate = new Date(workout.date || workout.created_at);
		const diffTime = workoutDate.getTime() - startOfWeek.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

		if (diffDays >= 0 && diffDays < 7) {
			const dayIndex = (workoutDate.getDay() + 6) % 7; // Mon=0
			data[dayIndex].value += workout.total_volume || 0;
		}
	});

	return data;
};
