import { getAccentPreset, type AccentKey } from "@/constants/accents";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type AccentContextValue = {
	accentId: AccentKey;
	setAccentId: (accentId: AccentKey) => void;
};

const AccentContext = createContext<AccentContextValue | undefined>(undefined);

export function AccentProvider({ children }: { children: ReactNode }) {
	const [accentId, setAccentId] = useState<AccentKey>("emerald");

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

export function useAccentContext() {
	const context = useContext(AccentContext);
	if (context === undefined) {
		throw new Error("useAccentContext must be used within an AccentProvider");
	}
	return context;
}

export function useAccentPreset() {
	const { accentId } = useAccentContext();
	return useMemo(() => getAccentPreset(accentId), [accentId]);
}
