/**
 * Unit Converter - Handles kg ↔ lb based on user preference
 */

export const convertWeight = (
	kg: number,
	toUnit: "kg" | "lb" = "kg",
): number => {
	if (toUnit === "kg") return Math.round(kg);
	return Math.round(kg * 2.20462);
};

export const getUnitLabel = (unit: "kg" | "lb" = "kg"): string => {
	return unit === "kg" ? "kg" : "lb";
};

/**
 * Convert volume array for charts
 */
export const convertVolumeData = (
	data: { value: number; label: string }[],
	toUnit: "kg" | "lb" = "kg",
) => {
	return data.map((item) => ({
		...item,
		value: convertWeight(item.value, toUnit),
	}));
};
