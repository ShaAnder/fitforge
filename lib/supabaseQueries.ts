import { File as ExpoFile } from "expo-file-system";
import { getSupabase } from "./supabase";

/**
 * Fetches all workouts for the current user, sorted by date (newest first).
 *
 * - Uses RLS-protected query (user can only see their own workouts).
 * - Client-side fetch timeout (10s) is handled at the Supabase client level.
 * - Logs start and success for easy debugging.
 */
export const fetchWorkouts = async (userId: string) => {
	const supabase = getSupabase();

	try {
		const { data, error } = await supabase
			.from("workouts")
			.select("*")
			.eq("user_id", userId)
			.order("date", { ascending: false });

		if (error) throw error;

		return data || [];
	} catch (err: any) {
		console.error(
			`[fetchWorkouts] ❌ Error: ${err?.message || JSON.stringify(err)}`,
		);
		throw err;
	}
};

// ─────────────────────────────────────────────────────────────
// EXERCISES (Dynamic from Supabase)
// ─────────────────────────────────────────────────────────────

export type Exercise = {
	id: number;
	name: string;
	muscle: string;
	difficulty: "Beginner" | "Intermediate" | "Advanced";
	description: string;
	instructions: string | null;
	// kept same name for compatibility
	estimated_calories_per_set?: string;
	img_url?: string | null;
};

/**
 * Get all approved exercises
 */
export const getAllExercises = async (): Promise<Exercise[]> => {
	const supabase = getSupabase();
	console.log("[getAllExercises] 🚀 Fetching dynamic exercises");

	const { data, error } = await supabase
		.from("exercises")
		.select("*")
		.eq("status", "approved")
		.order("name", { ascending: true });

	if (error) {
		console.error("[getAllExercises] ❌", error);
		throw error;
	}

	return data || [];
};

export const searchExercises = (all: Exercise[], query: string = "") => {
	if (!query) return all;
	return all.filter((ex) =>
		ex.name.toLowerCase().includes(query.toLowerCase()),
	);
};

export const getByMuscle = (all: Exercise[], muscle: string) => {
	if (muscle === "All") return all;
	return all.filter((ex) => ex.muscle === muscle);
};

export const getUniqueMuscles = (all: Exercise[]) => {
	const muscles = all.map((ex) => ex.muscle);
	return Array.from(new Set(muscles));
};

// ─────────────────────────────────────────────────────────────
// PROFILE QUERIES
// ─────────────────────────────────────────────────────────────

/**
 * Get user profile.
 *
 * - Throws on real query/network/auth errors.
 * - Returns a default profile only when the profile row doesn't exist yet.
 * - Uses .maybeSingle() so missing row doesn't throw.
 */
export const getProfile = async (userId: string, email: string = "") => {
	const supabase = getSupabase();

	console.log(`[getProfile] 🚀 Starting query for user: ${userId}`);

	try {
		const { data, error } = await supabase
			.from("profiles")
			.select("id, username, avatar_url")
			.eq("id", userId)
			.maybeSingle();

		if (error) throw error;

		if (data) {
			return data;
		}

		return {
			id: userId,
			username: email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user",
			avatar_url: null,
		};
	} catch (err: any) {
		console.error(
			`[getProfile] ❌ Error: ${err?.message || JSON.stringify(err)}`,
		);
		throw err;
	}
};

/**
 * Update user profile (including avatar_url).
 *
 * - Uses upsert so it works for both create and update.
 * - Automatically sets updated_at timestamp.
 */
export const updateProfile = async (
	userId: string,
	updates: { username?: string; avatar_url?: string },
) => {
	const supabase = getSupabase();

	const { error } = await supabase.from("profiles").upsert({
		id: userId,
		...updates,
		updated_at: new Date().toISOString(),
	});

	if (error) throw error;
};

/**
 * Upload avatar to Supabase Storage and return public URL.
 *
 * - Uses upsert to allow overwriting existing avatar.
 * - Generates filename based on userId + file extension.
 * - Returns public URL for immediate use in UI.
 */

export const uploadAvatar = async (userId: string, asset: any) => {
	const supabase = getSupabase();

	if (!asset?.uri) throw new Error("No image selected");

	const rawMimeType: string | undefined = asset?.mimeType;
	const mimeType =
		rawMimeType === "image/jpg" ? "image/jpeg" : rawMimeType || "image/jpeg";

	const extFromFileName =
		typeof asset?.fileName === "string" && asset.fileName.includes(".")
			? asset.fileName.split(".").pop()?.toLowerCase()
			: undefined;

	const extFromMime = mimeType.startsWith("image/")
		? mimeType.split("/")[1]?.toLowerCase()
		: undefined;

	const fileExt = (extFromFileName || extFromMime || "jpeg")
		.replace("jpg", "jpeg")
		.replace(/[^a-z0-9]/g, "");

	const fileName = userId + "-" + Date.now() + "." + (fileExt || "jpeg");

	try {
		const pickedFile = new ExpoFile(asset.uri);
		const arrayBuffer = await pickedFile.arrayBuffer();

		const { error } = await supabase.storage
			.from("avatars")
			.upload(fileName, arrayBuffer, {
				upsert: true,
				contentType: mimeType,
			});

		if (error) throw error;

		const { data: urlData } = supabase.storage
			.from("avatars")
			.getPublicUrl(fileName);

		if (!urlData?.publicUrl) throw new Error("Failed to create public URL");

		return urlData.publicUrl;
	} catch (err: any) {
		console.error("[uploadAvatar] ❌", err);
		throw err;
	}
};
