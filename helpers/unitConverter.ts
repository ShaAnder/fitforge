/**
 * Unit Converter Utilities.
 *
 * Handles weight conversion (kg ↔ lb) and volume data transformation
 * based on the user's preferred unit setting.
 */

/**
 * Converts weight from kilograms to the user's preferred unit.
 *
 * @param kg - Weight in kilograms
 * @param toUnit - Target unit ("kg" or "lb")
 * @returns Rounded weight in the requested unit
 */
export const convertWeight = (
	kg: number,
	toUnit: "kg" | "lb" = "kg",
): number => {
	if (toUnit === "kg") return Math.round(kg);
	return Math.round(kg * 2.20462); // Standard kg to lb conversion factor
};

/**
 * Returns the correct unit label for display.
 */
export const getUnitLabel = (unit: "kg" | "lb" = "kg"): string => {
	return unit === "kg" ? "kg" : "lb";
};

/**
 * Converts an entire weekly volume dataset to the user's preferred unit.
 *
 * Used by WeeklyVolumeChart to ensure all values match user settings.
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

/**
 * Small additional helper to convert labels based on users preference.
 */
export const convertInputWeightToKg = (
	weight: number,
	fromUnit: "kg" | "lb" = "kg",
): number => {
	if (!Number.isFinite(weight) || weight <= 0) return 0;
	if (fromUnit === "kg") return Number(weight.toFixed(2));
	return Number((weight / 2.20462).toFixed(2));
};
