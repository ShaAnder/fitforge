import { getAccentPreset } from "@/constants/accents";
import { useAccentContext } from "@/context/AccentContext";

/**
 * useAccent Hook.
 *
 * Convenience hook that returns the full accent preset (colors, Tailwind classes, etc.)
 * for the currently selected accent.
 *
 * Most components should use this hook instead of accessing the raw context.
 */
export function useAccent() {
	const { accentId } = useAccentContext();
	return getAccentPreset(accentId);
}
