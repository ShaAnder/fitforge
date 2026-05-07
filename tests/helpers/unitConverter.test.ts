import {
	convertVolumeData,
	convertWeight,
	getUnitLabel,
} from "@/helpers/unitConverter";

describe("unitConverter", () => {
	describe("convertWeight", () => {
		it("rounds kilograms when the target unit is kg", () => {
			expect(convertWeight(99.6, "kg")).toBe(100);
			expect(convertWeight(100.4, "kg")).toBe(100);
		});

		it("converts kilograms to pounds when the target unit is lb", () => {
			expect(convertWeight(100, "lb")).toBe(220);
			expect(convertWeight(50, "lb")).toBe(110);
		});
	});

	describe("getUnitLabel", () => {
		it("returns kg for kg", () => {
			expect(getUnitLabel("kg")).toBe("kg");
		});

		it("returns lb for lb", () => {
			expect(getUnitLabel("lb")).toBe("lb");
		});
	});

	describe("convertVolumeData", () => {
		it("converts every value in the array to the requested unit", () => {
			const input = [
				{ value: 100, label: "Mon" },
				{ value: 200, label: "Tue" },
			];

			const result = convertVolumeData(input, "lb");

			expect(result).toEqual([
				{ value: 220, label: "Mon" },
				{ value: 441, label: "Tue" },
			]);
		});

		it("keeps labels unchanged while converting values", () => {
			const input = [
				{ value: 15, label: "Fri" },
				{ value: 20, label: "Sat" },
			];

			const result = convertVolumeData(input, "kg");

			expect(result).toEqual([
				{ value: 15, label: "Fri" },
				{ value: 20, label: "Sat" },
			]);
		});
	});
});
