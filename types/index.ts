// types/index.ts

/**
 * Core user profile data stored in the app.
 * Controls settings like units, reminders, and personalization.
 */
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

/**
 * Represents a single exercise in the database.
 * Includes metadata that helps with display and workout planning.
 */
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

/**
 * A single set within a workout log entry.
 * Captures reps, weight, and optional RIR (reps in reserve).
 */
export interface LogWorkoutSet {
	id: number;
	reps: string;
	weight: string;
	rir?: number;
}

/**
 * An exercise as it appears in an active workout log.
 * Bundles the exercise details with its sets for local tracking.
 */
export interface LogWorkoutExercise {
	localId: number;
	id: number;
	name: string;
	muscle: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	sets: LogWorkoutSet[];
}

/**
 * A set in a completed workout.
 * Uses numbers for reps/weight since it's post-log.
 */
export interface WorkoutSet {
	id?: string;
	reps: number;
	weight: number;
	rir?: number;
	notes?: string;
}

/**
 * One exercise entry inside a full workout.
 * Groups the name with all its sets.
 */
export interface WorkoutExercise {
	name: string;
	sets: WorkoutSet[];
}

/**
 * Main workout record saved to the backend.
 * Flexible to support both simple and detailed logging formats.
 */
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

/**
 * Data structure for uploading photos or videos from the device.
 * Includes common metadata fields plus extras for media handling.
 */
export interface UploadAsset {
	uri: string;
	type?: string | null;
	mimeType?: string | null;
	fileName?: string | null;
	width?: number;
	height?: number;
	fileSize?: number;
	// adding these for later
	exif?: Record<string, undefined> | null;
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

// ─────────────────────────────────────────────────────────────
// DASHBOARD WIDGET TYPES
// ─────────────────────────────────────────────────────────────

/**
 * Simple streak counter for the dashboard widget.
 */
export interface StreakData {
	streak: number;
}

/**
 * Progress data showing training consistency in the current month.
 */
export interface DaysTrainedData {
	daysTrained: number;
	daysInMonth: number;
	progress: number;
}

/**
 * Count of workouts completed this month for the dashboard.
 */
export interface WorkoutsLoggedData {
	workoutsThisMonth: number;
}

/**
 * Estimated calories burned (aggregated for display).
 */
export interface CaloriesBurnedData {
	estCalories: number;
}

/**
 * Total number of sets logged (for dashboard summary).
 */
export interface TotalSetsData {
	totalSets: number;
}

/**
 * Total volume lifted (great for progress tracking).
 */
export interface TotalVolumeData {
	totalVolume: number;
}

/**
 * Data point for the weekly volume chart on the dashboard.
 * Supports optional labels and custom React components.
 */
export interface WeeklyVolumeItem {
	day?: string;
	value: number;
	label?: string;
	topLabelComponent?: () => React.ReactNode;
}
