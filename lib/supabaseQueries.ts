import { Exercise, UploadAsset } from "@/types";
import { getErrorMessage } from "@/utils/getError";
import { getSupabase } from "./supabase";

/**
 * Fetches all workouts for the current user, sorted by date (newest first).
 *
 * - Uses RLS-protected query (user can only see their own workouts).
 * - Client-side fetch timeout (10s) is handled at the Supabase client level.
 * - Logs start and success for easy debugging.
 */
export const fetchWorkouts = async (userId: string) => {
	// Always get the shared Supabase client instance
	const supabase = getSupabase();

	try {
		// Query workouts table with user filter and newest-first sort
		// This relies on Row Level Security so users only see their data
		const { data, error } = await supabase
			.from("workouts")
			.select("*")
			.eq("user_id", userId)
			.order("date", { ascending: false });

		if (error) throw error;

		// Return empty array instead of null for safer handling in components
		return data || [];
	} catch (err: unknown) {
		console.error(`[fetchWorkouts] ❌ Error: ${getErrorMessage(err)}`);
		throw err;
	}
};

// ─────────────────────────────────────────────────────────────
// EXERCISES (Dynamic from Supabase)
// ─────────────────────────────────────────────────────────────

/**
 * Get all approved exercises from the database.
 * These are the ones visible to users in the app.
 */
export const getAllExercises = async (): Promise<Exercise[]> => {
	const supabase = getSupabase();
	console.log("[getAllExercises] 🚀 Fetching dynamic exercises");

	// Pull only approved exercises and sort alphabetically by name
	// This keeps the list clean and user-friendly
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

/**
 * Simple client-side search across all loaded exercises.
 * Case-insensitive match on exercise name only.
 * Used for real-time search as the user types.
 */
export const searchExercises = (all: Exercise[], query: string = "") => {
	if (!query) return all;
	return all.filter((ex) =>
		ex.name.toLowerCase().includes(query.toLowerCase()),
	);
};

/**
 * Filter exercises by a specific muscle group.
 * "All" acts as a no-op to show the full list.
 * Helps power the muscle group filter UI.
 */
export const getByMuscle = (all: Exercise[], muscle: string) => {
	if (muscle === "All") return all;
	return all.filter((ex) => ex.muscle === muscle);
};

/**
 * Extract unique muscle groups from the full exercise list.
 * Useful for building filter chips or dropdowns without duplicates.
 */
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
		// Fetch minimal profile fields with maybeSingle for graceful missing-row handling
		const { data, error } = await supabase
			.from("profiles")
			.select("id, username, avatar_url")
			.eq("id", userId)
			.maybeSingle();

		if (error) throw error;

		if (data) {
			return data;
		}

		// Fallback profile when row doesn't exist yet (first time user)
		return {
			id: userId,
			username: email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user",
			avatar_url: null,
		};
	} catch (err: unknown) {
		console.error(`[getProfile] ❌ Error: ${getErrorMessage(err)}`);
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

	// Upsert ensures create or update works cleanly in one call
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
 * - Uses direct HTTP PUT to bypass SDK overhead.
 * - Generates filename based on userId + file extension.
 * - Returns public URL for immediate use in UI.
 * - Optional accessToken to avoid extra getSession() call.
 */

export const uploadAvatar = async (
	userId: string,
	asset: UploadAsset,
	accessToken?: string,
) => {
	const supabase = getSupabase();

	if (!asset?.uri) {
		throw new Error("No image selected");
	}

	// Normalize mime type (jpg -> jpeg for consistency)
	const rawMimeType = asset?.mimeType ?? undefined;
	const mimeType =
		rawMimeType === "image/jpg" ? "image/jpeg" : rawMimeType || "image/jpeg";

	// Determine file extension from filename or mime type as fallback
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
		// Get session only if no token was passed in (for performance)
		const session = accessToken ? null : await supabase.auth.getSession();
		const response = await fetch(asset.uri);

		if (!response.ok) {
			throw new Error(`Failed to fetch file: ${response.statusText}`);
		}

		const blob = await response.blob();
		const finalMimeType = blob.type || mimeType;

		// Use provided token or get from session
		const token = accessToken || session?.data?.session?.access_token;
		if (!token) {
			throw new Error("No access token for upload");
		}

		const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
		if (!supabaseUrl) {
			throw new Error("Supabase URL not configured");
		}

		const uploadUrl = `${supabaseUrl}/storage/v1/object/avatars/${fileName}`;

		// Direct PUT upload for better performance on mobile
		const uploadResponse = await fetch(uploadUrl, {
			method: "PUT",
			headers: {
				"Content-Type": finalMimeType,
				"Authorization": `Bearer ${token}`,
			},
			body: blob,
		});

		if (!uploadResponse.ok) {
			const errorText = await uploadResponse.text();
			throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
		}

		// Return the public URL for immediate display in the UI
		const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`;
		return publicUrl;
	} catch (err: unknown) {
		console.error("[uploadAvatar]", getErrorMessage(err));
		throw err;
	}
};
