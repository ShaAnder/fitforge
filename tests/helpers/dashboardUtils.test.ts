import {
	calculateStreak,
	getThisMonthStats,
	getWeeklyVolumeData,
} from "@/helpers/dashboardUtils";

describe("dashboardUtils", () => {
	// Freeze time so month and week calculations stay deterministic.
	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date("2026-05-07T12:00:00.000Z"));
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	describe("calculateStreak", () => {
		it("returns 0 when there are no workouts", () => {
			expect(calculateStreak([])).toBe(0);
		});

		it("counts consecutive workout days as a streak", () => {
			const workouts = [
				{ date: "2026-05-07T08:00:00.000Z" },
				{ date: "2026-05-06T08:00:00.000Z" },
				{ date: "2026-05-05T08:00:00.000Z" },
			];

			expect(calculateStreak(workouts)).toBe(3);
		});

		it("deduplicates multiple workouts on the same day", () => {
			const workouts = [
				{ date: "2026-05-07T08:00:00.000Z" },
				{ date: "2026-05-07T16:00:00.000Z" },
				{ date: "2026-05-06T08:00:00.000Z" },
			];

			expect(calculateStreak(workouts)).toBe(2);
		});

		it("stops the streak when there is a gap", () => {
			const workouts = [
				{ date: "2026-05-07T08:00:00.000Z" },
				{ date: "2026-05-05T08:00:00.000Z" },
				{ date: "2026-05-04T08:00:00.000Z" },
			];

			expect(calculateStreak(workouts)).toBe(1);
		});
	});

	describe("getThisMonthStats", () => {
		it("calculates stats for workouts in the current month only", () => {
			const workouts = [
				{
					date: "2026-05-01T08:00:00.000Z",
					total_volume: 100,
					exercises: [{ sets: [{}, {}] }],
				},
				{
					date: "2026-05-01T18:00:00.000Z",
					total_volume: "200",
					exercises: [{ sets: [{}, {}, {}] }],
				},
				{
					date: "2026-05-03T08:00:00.000Z",
					total_volume: 300,
					exercises: [{ sets: [{}, {}] }, { sets: [{}] }],
				},
				{
					// Previous month should be ignored.
					date: "2026-04-28T08:00:00.000Z",
					total_volume: 999,
					exercises: [{ sets: [{}] }],
				},
			];

			const stats = getThisMonthStats(workouts);

			expect(stats.daysTrained).toBe(2);
			expect(stats.workoutsThisMonth).toBe(3);
			expect(stats.totalVolume).toBe(600);
			expect(stats.totalSets).toBe(8);
			expect(stats.estCalories).toBe(520);
		});

		it("returns sane values when given bad workout data", () => {
			const workouts = [
				{ date: "bad-date", total_volume: "not-a-number", exercises: [] },
				{ created_at: "2026-05-04T08:00:00.000Z", total_volume: 50 },
			];

			const stats = getThisMonthStats(workouts);

			expect(stats.daysTrained).toBe(1);
			expect(stats.workoutsThisMonth).toBe(1);
			expect(stats.totalVolume).toBe(50);
			expect(stats.totalSets).toBe(0);
		});
	});

	describe("getWeeklyVolumeData", () => {
		it("returns seven labels starting Monday when weekStart is mon", () => {
			const data = getWeeklyVolumeData([], "mon");

			expect(data).toHaveLength(7);
			expect(data.map((d) => d.label)).toEqual([
				"Mon",
				"Tue",
				"Wed",
				"Thu",
				"Fri",
				"Sat",
				"Sun",
			]);
		});

		it("returns seven labels starting Sunday when weekStart is sun", () => {
			const data = getWeeklyVolumeData([], "sun");

			expect(data).toHaveLength(7);
			expect(data.map((d) => d.label)).toEqual([
				"Sun",
				"Mon",
				"Tue",
				"Wed",
				"Thu",
				"Fri",
				"Sat",
			]);
		});

		it("aggregates workout volume by day", () => {
			const workouts = [
				{
					date: "2026-05-04T09:00:00.000Z",
					total_volume: 100,
				},
				{
					date: "2026-05-04T18:00:00.000Z",
					total_volume: 50,
				},
				{
					date: "2026-05-06T12:00:00.000Z",
					total_volume: 200,
				},
			];

			const data = getWeeklyVolumeData(workouts, "mon");

			// Only assert the key behavior here: daily totals are summed correctly.
			expect(data).toHaveLength(7);
			expect(data.some((d) => d.value === 150)).toBe(true);
			expect(data.some((d) => d.value === 200)).toBe(true);
		});
	});
});
