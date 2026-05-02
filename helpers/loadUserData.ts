import { fetchWorkouts, getProfile } from "@/lib/supabaseQueries";

/**
 * Loads profile + workouts in parallel.
 * Returns the data — does NOT touch React state.
 * Perfect for use in context, server components, or tests.
 */
export const loadUserData = async (userId: string, email: string = "") => {
	console.log("🚀 loadUserData starting for user:", userId);

	try {
		const [profileData, workoutsData] = await Promise.all([
			getProfile(userId, email),
			fetchWorkouts(userId),
		]);

		console.log("✅ loadUserData complete");
		return { profile: profileData, workouts: workoutsData };
	} catch (err: any) {
		console.error("❌ loadUserData failed:", err?.message || err);
		// let the caller handle UI error state if needed
		throw err;
	}
};
