import { getAccentPreset } from "@/constants/accents";
import { useAccentContext } from "@/context/AccentContext";

export function useAccent() {
	const { accentId } = useAccentContext();
	return getAccentPreset(accentId);
}
