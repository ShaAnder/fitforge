import { getAccentPreset } from "@/constants/accent";
import { useAuth } from "@/context/AuthContext";

export function useAccent() {
	const { profile } = useAuth();
	return getAccentPreset(profile?.accent);
}
