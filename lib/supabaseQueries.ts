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

	console.log(`[fetchWorkouts] 🚀 Starting query for user: ${userId}`);

	try {
		const { data, error } = await supabase
			.from("workouts")
			.select("*")
			.eq("user_id", userId)
			.order("date", { ascending: false });

		if (error) throw error;

		console.log(
			`[fetchWorkouts] ✅ Success: ${data?.length || 0} workouts returned`,
		);
		return data || [];
	} catch (err: any) {
		console.error(
			`[fetchWorkouts] ❌ Error: ${err?.message || JSON.stringify(err)}`,
		);
		throw err;
	}
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
	instructions: string;
	estimatedCalories: string;
	img_url?: string | null;
};

/**
 * Get all approved exercises from DB
 */
export const getAllExercises = async (): Promise<Exercise[]> => {
	const supabase = getSupabase();
	console.log("[getAllExercises] 🚀 Fetching from DB");

	const { data, error } = await supabase
		.from("exercises")
		.select("*")
		.eq("status", "approved")
		.order("name");

	if (error) throw error;
	return data || [];
};

/**
 * Search exercises (client-side for now - fast enough with 50-200 items)
 */
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
			console.log(`[getProfile] ✅ Profile found`);
			return data;
		}

		// No row yet; return sensible default
		console.log(`[getProfile] ℹ️  No profile row yet; using default`);
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

	console.log("[updateProfile] ✅ Profile updated successfully");
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

	if (!asset?.uri) throw new Error("No image URI");

	const fileExt = asset.uri.split(".").pop()?.toLowerCase() || "jpeg";
	const fileName = `${userId}.${fileExt}`;

	try {
		console.log(`[uploadAvatar] Checking for existing file: ${fileName}`);

		// Check if file already exists
		const { data: files } = await supabase.storage
			.from("avatars")
			.list("", { search: fileName, limit: 1 });

		const fileExists = files && files.length > 0 && files[0].name === fileName;

		if (fileExists) {
			console.log("[uploadAvatar] ✅ File exists, skipping upload");
			const {
				data: { publicUrl },
			} = supabase.storage.from("avatars").getPublicUrl(fileName);
			return publicUrl;
		}

		// Only upload if it doesn't exist
		console.log(`[uploadAvatar] Uploading new file: ${fileName}`);
		const response = await fetch(asset.uri);
		const arrayBuffer = await response.arrayBuffer();

		const { error } = await supabase.storage
			.from("avatars")
			.upload(fileName, arrayBuffer, {
				upsert: true,
				contentType: asset.mimeType || `image/${fileExt}`,
			});

		if (error) throw error;

		const {
			data: { publicUrl },
		} = supabase.storage.from("avatars").getPublicUrl(fileName);

		console.log(`[uploadAvatar] ✅ Uploaded new: ${publicUrl}`);
		return publicUrl;
	} catch (err: any) {
		console.error("[uploadAvatar] ❌", err.message || err);
		throw err;
	}
};
