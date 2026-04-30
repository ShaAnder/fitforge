// lib/exerciseAPI.ts
import axios from "axios";

const BASE_URL = "https://oss.exercisedb.dev/api/v1/exercises";

const headers = {
	"X-RapidAPI-Host": "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com",
	"X-RapidAPI-Key": process.env.EXPO_PUBLIC_RAPID_API_KEY || "",
};

export type ApiExercise = {
	exerciseId: string;
	name: string;
	gifUrl: string;
	bodyParts: string[];
	targetMuscles: string[];
	secondaryMuscles: string[];
	equipments: string[];
	instructions: string[];
};

let exerciseCache: ApiExercise[] | null = null;

console.log(
	"🔑 API Key loaded:",
	process.env.EXPO_PUBLIC_RAPID_API_KEY ? "YES" : "NO",
);

/**
 * Fetch ALL exercises with proper pagination (no infinite loop)
 */
export const fetchAllExercises = async (): Promise<ApiExercise[]> => {
	if (exerciseCache) {
		console.log("[fetchAllExercises] Returning cached data");
		return exerciseCache;
	}

	let allExercises: ApiExercise[] = [];
	let nextCursor: string | null = null;
	let pageCount = 0;
	const MAX_PAGES = 25; // safety limit

	try {
		do {
			const url: string = nextCursor
				? `${BASE_URL}?cursor=${nextCursor}`
				: BASE_URL;

			console.log(`[fetchAllExercises] Fetching page ${pageCount + 1}: ${url}`);

			const res = await axios.get(url, { headers });

			const data = Array.isArray(res.data.data) ? res.data.data : [];
			allExercises = allExercises.concat(data);

			nextCursor = res.data.meta?.nextCursor || null;
			pageCount++;

			// Safety break
			if (pageCount >= MAX_PAGES) {
				console.warn("[fetchAllExercises] Max pages reached");
				break;
			}
		} while (nextCursor);

		// Deduplicate by exerciseId
		const uniqueExercises = Array.from(
			new Map(allExercises.map((ex) => [ex.exerciseId, ex])).values(),
		);

		console.log(
			`[fetchAllExercises] Total unique exercises loaded: ${uniqueExercises.length}`,
		);
		exerciseCache = uniqueExercises;
		return uniqueExercises;
	} catch (err: any) {
		console.error(
			"[fetchAllExercises] Error:",
			err.response?.status,
			err.message,
		);
		return allExercises; // return what we have
	}
};

/** Local search by name */
export const searchExercises = (all: ApiExercise[], query: string = "") => {
	if (!query) return all;
	return all.filter((ex) =>
		ex.name.toLowerCase().includes(query.toLowerCase()),
	);
};

/** Local filter by body part */
export const getByBodyPart = (all: ApiExercise[], bodyPart: string) => {
	return all.filter((ex) =>
		ex.bodyParts.some((bp) => bp.toLowerCase() === bodyPart.toLowerCase()),
	);
};
