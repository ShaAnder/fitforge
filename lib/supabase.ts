import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

const FETCH_TIMEOUT_MS = 60_000; // 60 seconds for file uploads

/**
 * Custom fetch wrapper with timeout support.
 *
 * Uses AbortController to enforce a maximum request duration.
 * Safely combines caller-provided signals if they exist.
 */
const fetchWithTimeout = async (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> => {
	// Create a fresh AbortController for this request
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	// Forward any existing signal from the caller
	if (init?.signal) {
		(init.signal as AbortSignal).addEventListener(
			"abort",
			() => controller.abort(),
			{ once: true },
		);
	}

	try {
		// Execute the actual fetch with our controlled signal
		const response = await fetch(input, {
			...init,
			signal: controller.signal,
		});

		return response;
	} finally {
		// Always clean up the timeout to avoid memory leaks
		clearTimeout(timeoutId);
	}
};

/**
 * Singleton Supabase client for the entire app.
 *
 * - Prevents creating multiple clients (important for React Native).
 * - Uses AsyncStorage for session persistence.
 * - Applies custom timeout fetch wrapper.
 */
export const getSupabase = (): SupabaseClient => {
	// Return existing instance if we already have one (singleton pattern)
	if (supabaseInstance) return supabaseInstance;

	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

	// Basic validation so we fail fast with a clear message
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			"Missing Supabase environment variables. " +
				"Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.",
		);
	}

	// Create the client with our custom fetch and proper RN storage settings
	supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
		global: {
			fetch: fetchWithTimeout,
		},
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		},
	});

	return supabaseInstance;
};
