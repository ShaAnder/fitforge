import { getAccentPreset, type AccentKey } from "@/constants/accents";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type AccentContextValue = {
	accentId: AccentKey;
	setAccentId: (accentId: AccentKey) => void;
};

const AccentContext = createContext<AccentContextValue | undefined>(undefined);

/**
 * AccentProvider - Global accent color context.
 *
 * Manages the currently selected theme accent across the entire app.
 * Persisted via user profile (updated through updateProfile).
 */
export function AccentProvider({ children }: { children: ReactNode }) {
	const [accentId, setAccentId] = useState<AccentKey>("green");

	// Memoized value to prevent unnecessary re-renders of consumers
	const value = useMemo(
		() => ({
			accentId,
			setAccentId,
		}),
		[accentId],
	);

	return (
		<AccentContext.Provider value={value}>{children}</AccentContext.Provider>
	);
}

/**
 * Custom hook to access the raw accent context.
 *
 * Throws if used outside of AccentProvider (standard context safety pattern).
 */
export function useAccentContext() {
	const context = useContext(AccentContext);
	if (context === undefined) {
		throw new Error("useAccentContext must be used within an AccentProvider");
	}
	return context;
}

/**
 * Custom hook to get the full accent preset (colors, classes, etc.).
 *
 * Most components should use this hook instead of useAccentContext().
 */
export function useAccentPreset() {
	const { accentId } = useAccentContext();

	return useMemo(() => getAccentPreset(accentId), [accentId]);
}
