import { getSupabase } from "./supabase";

/**
 * Fetches all workouts for the current user, sorted by date (newest first).
 */
export const fetchWorkouts = async (userId: string) => {
	const supabase = getSupabase();

	const { data, error } = await supabase
		.from("workouts")
		.select("*")
		.eq("user_id", userId)
		.order("date", { ascending: false });

	if (error) {
		console.error("Supabase fetch error:", error);
		throw error;
	}

	return data || [];
};
