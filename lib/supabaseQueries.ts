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

// ─────────────────────────────────────────────────────────────
// EXERCISE LIBRARY (new - static for now, ready for Supabase)
// ─────────────────────────────────────────────────────────────

export type Exercise = {
	id: number;
	name: string;
	muscle: string;
	difficulty: "Beginner" | "Intermediate" | "Advanced";
	description: string;
	estimatedCalories: string;
};

// Current static source (we'll switch this to Supabase later)
import { EXERCISE_LIBRARY as staticExercises } from "@/constants/exercises";

/** Get all exercises - currently static, ready for Supabase */
export const getAllExercises = async (): Promise<Exercise[]> => {
	// TODO: Later replace with Supabase call
	// const supabase = getSupabase();
	// const { data } = await supabase.from("exercises").select("*");
	// return data || [];

	return staticExercises; // current static fallback
};

/** Search exercises by name */
export const searchExercises = (all: Exercise[], query: string = "") => {
	if (!query) return all;
	return all.filter((ex) =>
		ex.name.toLowerCase().includes(query.toLowerCase()),
	);
};

/** Filter exercises by muscle group */
export const getByMuscle = (all: Exercise[], muscle: string) => {
	if (muscle === "All") return all;
	return all.filter((ex) => ex.muscle === muscle);
};

/** Get all unique muscle groups */
export const getUniqueMuscles = (all: Exercise[]) => {
	const muscles = all.map((ex) => ex.muscle);
	return Array.from(new Set(muscles));
};
