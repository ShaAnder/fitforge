import { getAccentPreset } from "@/constants/accents";
import { useAuth } from "@/context/AuthContext";

export function useAccent() {
	const { profile } = useAuth();
	return getAccentPreset(profile?.accent);
}
