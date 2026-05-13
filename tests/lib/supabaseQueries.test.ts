/// <reference types="jest" />

import { File as ExpoFile } from "expo-file-system";
import { getSupabase } from "../../lib/supabase";
import {
	fetchWorkouts,
	getAllExercises,
	getByMuscle,
	getProfile,
	getUniqueMuscles,
	searchExercises,
	updateProfile,
	uploadAvatar,
} from "../../lib/supabaseQueries";

jest.mock("../../lib/supabase", () => ({
	getSupabase: jest.fn(),
}));

jest.mock("expo-file-system", () => ({
	File: jest.fn(),
}));

const mockedGetSupabase = getSupabase as jest.Mock;
const MockedExpoFile = ExpoFile as unknown as jest.Mock;

describe("supabaseQueries", () => {
	const supabaseMock: any = {
		from: jest.fn(),
		storage: {
			from: jest.fn(),
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockedGetSupabase.mockReturnValue(supabaseMock);
	});

	describe("fetchWorkouts", () => {
		it("returns workouts ordered by date", async () => {
			const query = {
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockResolvedValue({
					data: [{ id: 1 }, { id: 2 }],
					error: null,
				}),
			};

			supabaseMock.from.mockReturnValue(query);

			await expect(fetchWorkouts("user-123")).resolves.toEqual([
				{ id: 1 },
				{ id: 2 },
			]);
			expect(supabaseMock.from).toHaveBeenCalledWith("workouts");
		});

		it("throws when the query fails", async () => {
			const query = {
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockResolvedValue({
					data: null,
					error: new Error("boom"),
				}),
			};

			supabaseMock.from.mockReturnValue(query);

			await expect(fetchWorkouts("user-123")).rejects.toThrow("boom");
		});
	});

	describe("getAllExercises", () => {
		it("returns approved exercises", async () => {
			const query = {
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockResolvedValue({
					data: [{ id: 1, name: "Bench Press" }],
					error: null,
				}),
			};

			supabaseMock.from.mockReturnValue(query);

			await expect(getAllExercises()).resolves.toEqual([
				{ id: 1, name: "Bench Press" },
			]);
		});
	});

	describe("searchExercises / getByMuscle / getUniqueMuscles", () => {
		const exercises = [
			{ id: 1, name: "Bench Press", muscle: "Chest" },
			{ id: 2, name: "Incline Bench", muscle: "Chest" },
			{ id: 3, name: "Lat Pulldown", muscle: "Back" },
		];

		it("filters exercises by search term", () => {
			expect(searchExercises(exercises as any, "bench")).toEqual([
				{ id: 1, name: "Bench Press", muscle: "Chest" },
				{ id: 2, name: "Incline Bench", muscle: "Chest" },
			]);
		});

		it("returns all exercises when no query is supplied", () => {
			expect(searchExercises(exercises as any, "")).toEqual(exercises);
		});

		it("filters by muscle", () => {
			expect(getByMuscle(exercises as any, "Chest")).toEqual([
				{ id: 1, name: "Bench Press", muscle: "Chest" },
				{ id: 2, name: "Incline Bench", muscle: "Chest" },
			]);
		});

		it('returns all exercises when muscle is "All"', () => {
			expect(getByMuscle(exercises as any, "All")).toEqual(exercises);
		});

		it("returns unique muscle groups", () => {
			expect(getUniqueMuscles(exercises as any)).toEqual(["Chest", "Back"]);
		});
	});

	describe("getProfile", () => {
		it("returns the profile when it exists", async () => {
			const query = {
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				maybeSingle: jest.fn().mockResolvedValue({
					data: { id: "user-123", username: "sam", avatar_url: null },
					error: null,
				}),
			};

			supabaseMock.from.mockReturnValue(query);

			await expect(getProfile("user-123", "sam@example.com")).resolves.toEqual({
				id: "user-123",
				username: "sam",
				avatar_url: null,
			});
		});

		it("returns a default profile when no row exists", async () => {
			const query = {
				select: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				maybeSingle: jest.fn().mockResolvedValue({
					data: null,
					error: null,
				}),
			};

			supabaseMock.from.mockReturnValue(query);

			await expect(
				getProfile("user-123", "Sam+fit@example.com"),
			).resolves.toEqual({
				id: "user-123",
				username: "Samfit",
				avatar_url: null,
			});
		});
	});

	describe("updateProfile", () => {
		it("upserts the profile with an updated timestamp", async () => {
			const upsert = jest.fn().mockResolvedValue({ error: null });
			const select = jest.fn().mockReturnThis();
			const from = jest
				.fn()
				.mockReturnValue({ upsert, select, single: jest.fn() });

			supabaseMock.from = from;

			await expect(
				updateProfile("user-123", { username: "new-name" }),
			).resolves.toBeUndefined();
			expect(from).toHaveBeenCalledWith("profiles");
			expect(upsert).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "user-123",
					username: "new-name",
				}),
			);
		});
	});

	describe("uploadAvatar", () => {
		it("throws when no image uri is provided", async () => {
			await expect(uploadAvatar("user-123", {} as any)).rejects.toThrow(
				"No image selected",
			);
		});

		it("uploads an avatar and returns the public url", async () => {
			const upload = jest.fn().mockResolvedValue({ error: null });
			const getPublicUrl = jest.fn().mockReturnValue({
				data: { publicUrl: "https://cdn.example.com/avatar.png" },
			});
			const storageFrom = jest.fn().mockReturnValue({ upload, getPublicUrl });
			supabaseMock.storage.from = storageFrom;

			const arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
			MockedExpoFile.mockImplementation(() => ({ arrayBuffer }));

			await expect(
				uploadAvatar("user-123", {
					uri: "file:///avatar.png",
					mimeType: "image/png",
					fileName: "avatar.png",
				}),
			).resolves.toBe("https://cdn.example.com/avatar.png");
		});
	});
});
