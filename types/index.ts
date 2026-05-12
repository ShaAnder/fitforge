// types/index.ts

export interface Profile {
	id: string;
	username: string;
	avatar_url?: string | null;
	accent?: string;
	units: "kg" | "lb";
	week_start: "mon" | "sun";
	workout_reminder_enabled?: boolean;
	workout_reminder_time?: string;
	streak_reminder_enabled?: boolean;
	streak_reminder_time?: string;
	created_at?: string;
	updated_at?: string;
}

export interface Exercise {
	id: string | number;
	name: string;
	muscle: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	description?: string;
	instructions?: string | null;
	estimated_calories_per_set?: number;
	equipment?: string;
	img_url?: string | null;
}

export interface LogWorkoutSet {
	id: number;
	reps: string;
	weight: string;
	rir?: number;
}

export interface LogWorkoutExercise {
	localId: number;
	id: number;
	name: string;
	muscle: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	sets: LogWorkoutSet[];
}

export interface WorkoutSet {
	id?: string;
	reps: number;
	weight: number;
	rir?: number;
	notes?: string;
}

export interface WorkoutExercise {
	name: string;
	sets: WorkoutSet[];
}

export interface Workout {
	id: string;
	user_id: string;
	date: string;
	exercise_name?: string;
	total_volume?: number;
	exercises?: WorkoutExercise[];
	sets?: WorkoutSet[];
	notes?: string;
	created_at?: string;
	updated_at?: string;
}

export type ReminderKey = "workout" | "streak";

export interface UploadAsset {
	uri: string;
	type?: string | null;
	mimeType?: string | null;
	fileName?: string | null;
	width?: number;
	height?: number;
	fileSize?: number;
	// adding these for later
	exif?: Record<string, any>;
	duration?: number | null;
}

/**
 * Valid Ionicons names used throughout the app.
 * Will add more as I use them
 */
export type IoniconsName =
	| "home-outline"
	| "people-outline"
	| "trophy-outline"
	| "settings-outline"
	| "shield-outline"
	| "document-text-outline"
	| "log-out-outline"
	| "barbell-outline"
	| "calendar-outline"
	| "search"
	| "add-circle-outline";
