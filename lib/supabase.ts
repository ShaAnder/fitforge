import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

const FETCH_TIMEOUT_MS = 10_000;

const SUPABASE_DEBUG = typeof __DEV__ !== "undefined" ? __DEV__ : false;

/**
 * Formats a request URL for clean logging.
 *
 * - Removes query strings and noise while keeping origin + pathname.
 * - Handles string, URL, and Request-like inputs gracefully.
 */
function formatUrlForLogs(input: RequestInfo | URL): string {
	try {
		const raw =
			typeof input === "string"
				? input
				: input instanceof URL
					? input.toString()
					: // Request-like
						((input as any)?.url ?? String(input));

		const u = new URL(raw);
		// Avoid logging querystring noise; keep enough to verify routing
		return `${u.origin}${u.pathname}`;
	} catch {
		return typeof input === "string" ? input : String(input);
	}
}

/**
 * Custom fetch wrapper with timeout.
 *
 * - Adds AbortController with configurable timeout.
 * - Forwards any existing signal from the caller.
 */
const fetchWithTimeout = async (
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => {
		controller.abort();
	}, FETCH_TIMEOUT_MS);

	// If caller already provided a signal, forward its abort to ours
	if (init?.signal) {
		const signal = init.signal as AbortSignal;
		if (signal.aborted) controller.abort();
		else
			signal.addEventListener("abort", () => controller.abort(), {
				once: true,
			});
	}

	try {
		const res = await fetch(input as any, {
			...(init as any),
			signal: controller.signal,
		});

		return res;
	} catch (err: any) {
		throw err;
	} finally {
		clearTimeout(timeoutId);
	}
};

/**
 * Singleton Supabase client factory for React Native / Expo.
 *
 * - Returns cached instance on subsequent calls (prevents multiple clients).
 * - Uses AsyncStorage for auth persistence (required for React Native).
 * - Attaches custom fetchWithTimeout for timeout safety.
 */
export const getSupabase = (): SupabaseClient => {
	if (supabaseInstance) return supabaseInstance;

	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			"Missing env vars: EXPO_PUBLIC_SUPABASE_URL and/or EXPO_PUBLIC_SUPABASE_ANON_KEY",
		);
	}

	supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
		global: { fetch: fetchWithTimeout as typeof fetch },
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		},
	});

	return supabaseInstance;
};
