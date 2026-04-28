import { createClient } from "@supabase/supabase-js";

let supabaseInstance: any = null;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const getSupabase = () => {
	if (!supabaseInstance) {
		try {
			// Try to import AsyncStorage safely
			const AsyncStorage =
				require("@react-native-async-storage/async-storage").default;

			supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
				auth: {
					storage: AsyncStorage,
					autoRefreshToken: true,
					persistSession: true,
					detectSessionInUrl: false,
				},
			});
		} catch (error) {
			supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
				auth: {
					storage: undefined,
					persistSession: false,
					autoRefreshToken: true,
				},
			});
		}
	}
	return supabaseInstance;
};
