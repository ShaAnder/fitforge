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
	// grab our shared Supabase client instance
	const supabase = getSupabase();

	try {
		// run the query against our workouts table
		// filter to just this user's data and sort newest first
		const { data, error } = await supabase
			.from("workouts")
			.select("*")
			.eq("user_id", userId)
			.order("date", { ascending: false });

		// bail out with the error if Supabase gave us one
		if (error) throw error;

		// return the data or an empty array so components don't blow up
		return data || [];
	} catch (err: unknown) {
		// log it nicely and re-throw so the caller knows something went wrong
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
	// get our shared client
	const supabase = getSupabase();
	// quick log so we can see this firing in dev
	console.log("[getAllExercises] 🚀 Fetching dynamic exercises");

	// fetch only approved exercises sorted by name
	const { data, error } = await supabase
		.from("exercises")
		.select("*")
		.eq("status", "approved")
		.order("name", { ascending: true });

	if (error) {
		console.error("[getAllExercises] ❌", error);
		throw error;
	}

	// default to empty array if nothing comes back
	return data || [];
};

/**
 * Simple client-side search across all loaded exercises.
 * Case-insensitive match on exercise name only.
 * Used for real-time search as the user types.
 */
export const searchExercises = (all: Exercise[], query: string = "") => {
	// no query? just return everything
	if (!query) return all;
	// otherwise filter by name, ignoring case
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
	// "All" means show the whole list
	if (muscle === "All") return all;
	// otherwise keep only matching muscle
	return all.filter((ex) => ex.muscle === muscle);
};

/**
 * Extract unique muscle groups from the full exercise list.
 * Useful for building filter chips or dropdowns without duplicates.
 */
export const getUniqueMuscles = (all: Exercise[]) => {
	// pull out every muscle string
	const muscles = all.map((ex) => ex.muscle);
	// remove duplicates with Set and turn back into array
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
	// grab our Supabase client
	const supabase = getSupabase();

	// log for debugging
	console.log(`[getProfile] 🚀 Starting query for user: ${userId}`);

	try {
		// fetch the profile row (maybeSingle so missing row is just null)
		const { data, error } = await supabase
			.from("profiles")
			.select("id, username, avatar_url")
			.eq("id", userId)
			.maybeSingle();

		if (error) throw error;

		if (data) {
			// we have a real profile, hand it back
			return data;
		}

		// no profile row yet, so build a sensible default
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
	// get our client
	const supabase = getSupabase();

	// upsert the profile and always update the timestamp
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
	// our shared client instance
	const supabase = getSupabase();

	if (!asset?.uri) {
		throw new Error("No image selected");
	}

	// normalize jpg to jpeg for consistency
	const rawMimeType = asset?.mimeType ?? undefined;
	const mimeType =
		rawMimeType === "image/jpg" ? "image/jpeg" : rawMimeType || "image/jpeg";

	// figure out file extension from filename first
	const extFromFileName =
		typeof asset?.fileName === "string" && asset.fileName.includes(".")
			? asset.fileName.split(".").pop()?.toLowerCase()
			: undefined;

	// fallback to mime type if no filename extension
	const extFromMime = mimeType.startsWith("image/")
		? mimeType.split("/")[1]?.toLowerCase()
		: undefined;

	// clean up and standardize the extension
	const fileExt = (extFromFileName || extFromMime || "jpeg")
		.replace("jpg", "jpeg")
		.replace(/[^a-z0-9]/g, "");

	// build a unique filename
	const fileName = userId + "-" + Date.now() + "." + (fileExt || "jpeg");

	try {
		// get session only if we weren't given a token already
		const session = accessToken ? null : await supabase.auth.getSession();
		// fetch the local asset so we can upload it
		const response = await fetch(asset.uri);

		if (!response.ok) {
			throw new Error(`Failed to fetch file: ${response.statusText}`);
		}

		const blob = await response.blob();
		const finalMimeType = blob.type || mimeType;

		// pick the right token
		const token = accessToken || session?.data?.session?.access_token;
		if (!token) {
			throw new Error("No access token for upload");
		}

		const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
		if (!supabaseUrl) {
			throw new Error("Supabase URL not configured");
		}

		// build the upload endpoint
		const uploadUrl = `${supabaseUrl}/storage/v1/object/avatars/${fileName}`;

		// do the direct PUT upload
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

		// return the public URL so we can show the avatar right away
		const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`;
		return publicUrl;
	} catch (err: unknown) {
		console.error("[uploadAvatar]", getErrorMessage(err));
		throw err;
	}
};
