export type AccentKey =
	| "green"
	| "blue"
	| "purple"
	| "orange"
	| "red"
	| "pink"
	| "teal";

export type AccentPreset = {
	key: AccentKey;
	label: string;

	hex500: string;
	hex600: string;

	text400: string;
	bg500: string;
	bg600Active: string;
	border500: string;
};

export const ACCENTS: Record<AccentKey, AccentPreset> = {
	green: {
		key: "green",
		label: "Green",
		hex500: "#22c55e",
		hex600: "#16a34a",
		text400: "text-emerald-400",
		bg500: "bg-emerald-500",
		bg600Active: "active:bg-emerald-600",
		border500: "border-emerald-500",
	},
	blue: {
		key: "blue",
		label: "Blue",
		hex500: "#3b82f6",
		hex600: "#2563eb",
		text400: "text-blue-400",
		bg500: "bg-blue-500",
		bg600Active: "active:bg-blue-600",
		border500: "border-blue-500",
	},
	purple: {
		key: "purple",
		label: "Purple",
		hex500: "#a855f7",
		hex600: "#9333ea",
		text400: "text-purple-400",
		bg500: "bg-purple-500",
		bg600Active: "active:bg-purple-600",
		border500: "border-purple-500",
	},
	orange: {
		key: "orange",
		label: "Orange",
		hex500: "#f97316",
		hex600: "#ea580c",
		text400: "text-orange-400",
		bg500: "bg-orange-500",
		bg600Active: "active:bg-orange-600",
		border500: "border-orange-500",
	},
	red: {
		key: "red",
		label: "Red",
		hex500: "#ef4444",
		hex600: "#dc2626",
		text400: "text-red-400",
		bg500: "bg-red-500",
		bg600Active: "active:bg-red-600",
		border500: "border-red-500",
	},
	pink: {
		key: "pink",
		label: "Pink",
		hex500: "#ec4899",
		hex600: "#db2777",
		text400: "text-pink-400",
		bg500: "bg-pink-500",
		bg600Active: "active:bg-pink-600",
		border500: "border-pink-500",
	},
	teal: {
		key: "teal",
		label: "Teal",
		hex500: "#14b8a6",
		hex600: "#0d9488",
		text400: "text-teal-400",
		bg500: "bg-teal-500",
		bg600Active: "active:bg-teal-600",
		border500: "border-teal-500",
	},
};

// Stable list so screens can map without Object.values typing weirdness
export const ACCENT_LIST: readonly AccentPreset[] = [
	ACCENTS.green,
	ACCENTS.blue,
	ACCENTS.purple,
	ACCENTS.orange,
	ACCENTS.red,
	ACCENTS.pink,
	ACCENTS.teal,
] as const;

export function isAccentKey(value: unknown): value is AccentKey {
	return (
		value === "green" ||
		value === "blue" ||
		value === "purple" ||
		value === "orange" ||
		value === "red" ||
		value === "pink" ||
		value === "teal"
	);
}

export function getAccentPreset(value: unknown): AccentPreset {
	if (isAccentKey(value)) return ACCENTS[value];
	return ACCENTS.green;
}
