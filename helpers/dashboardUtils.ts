// helpers/dashboardUtils.ts

const isString = (v: unknown): v is string => typeof v === "string";

const getWorkoutDate = (workout: any): Date | null => {
	const raw: unknown = workout?.date ?? workout?.created_at;
	if (
		!raw ||
		(typeof raw !== "string" &&
			typeof raw !== "number" &&
			!(raw instanceof Date))
	) {
		return null;
	}

	const d = new Date(raw as string | number | Date);
	return Number.isNaN(d.getTime()) ? null : d;
};

const getWorkoutVolume = (workout: any): number => {
	const v = workout?.total_volume;

	if (typeof v === "number") return Number.isFinite(v) ? v : 0;
	if (typeof v === "string") {
		const parsed = parseFloat(v);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	return 0;
};

const countWorkoutSets = (workout: any): number => {
	const exercises = Array.isArray(workout?.exercises) ? workout.exercises : [];

	return exercises.reduce((setSum: number, ex: any) => {
		return setSum + (Array.isArray(ex?.sets) ? ex.sets.length : 0);
	}, 0);
};

export const getThisMonthStats = (workouts: any[]) => {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();

	// Filter workouts for this month
	const thisMonthWorkouts = (workouts || []).filter((w) => {
		const d = getWorkoutDate(w);
		if (!d) return false;
		return d.getFullYear() === year && d.getMonth() === month;
	});

	// Unique training days (multiple workouts same day = 1)
	const uniqueDays = new Set(
		thisMonthWorkouts
			.map((w) => {
				const d = getWorkoutDate(w);
				return d ? d.toISOString().split("T")[0] : null;
			})
			.filter((v): v is string => isString(v)),
	);

	const daysTrained = uniqueDays.size;
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const totalVolume = thisMonthWorkouts.reduce(
		(sum, w) => sum + getWorkoutVolume(w),
		0,
	);

	// sets are nested under exercises[].sets (not workout.sets)
	const totalSets = thisMonthWorkouts.reduce(
		(sum, w) => sum + countWorkoutSets(w),
		0,
	);

	const workoutsThisMonth = thisMonthWorkouts.length;

	// Rough but realistic calorie estimate for lifting
	const estCalories = Math.round(totalSets * 65);

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
			(workouts || [])
				.map((w) => {
					const d = getWorkoutDate(w);
					if (!d) return null;
					d.setHours(0, 0, 0, 0);
					return d.toISOString().split("T")[0];
				})
				.filter((v): v is string => isString(v)),
		),
	]
		.sort()
		.reverse();

	if (uniqueDates.length === 0) return 0;

	let streak = 1; // Most recent day counts as 1
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
			break;
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
	startOfWeek.setHours(0, 0, 0, 0);

	(workouts || []).forEach((workout) => {
		const workoutDate = getWorkoutDate(workout);
		if (!workoutDate) return;

		const diffTime = workoutDate.getTime() - startOfWeek.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

		if (diffDays >= 0 && diffDays < 7) {
			const dayIndex = (workoutDate.getDay() + 6) % 7; // Mon=0
			data[dayIndex].value += getWorkoutVolume(workout);
		}
	});

	return data;
};
