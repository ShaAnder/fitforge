import { createClient } from "@supabase/supabase-js";

let supabaseInstance: any = null;

export const getSupabase = () => {
	if (!supabaseInstance) {
		const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
		const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

		supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
	}
	return supabaseInstance;
};
