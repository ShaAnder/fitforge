import { Profile, ReminderKey } from "@/types";

// we define the config for both reminder types in one place
// this makes it easy to add new reminders later and keeps the keys consistent
export const REMINDER_CONFIG = {
	workout: {
		storageKey: "notif_workout_daily_id",
		enabledField: "workout_reminder_enabled",
		timeField: "workout_reminder_time",
		title: "Workout reminder",
		body: "Time to train — log your workout in FitForge.",
		label: "Workout reminder",
		description: "Daily nudge to log your training.",
		defaultTime: "18:00",
	},
	streak: {
		storageKey: "notif_streak_daily_id",
		enabledField: "streak_reminder_enabled",
		timeField: "streak_reminder_time",
		title: "Streak reminder",
		body: "Keep the streak alive — log something today.",
		label: "Streak reminder",
		description: "Keep your weekly momentum going.",
		defaultTime: "20:00",
	},
} as const;

/**
 * Parses a "HH:mm" time string into hour and minute numbers.
 * Falls back to 0 if the values are invalid.
 */
export function parseReminderTime(timeString: string) {
	// split the string on ":" and default to "0" if parts are missing
	const [hourPart = "0", minutePart = "0"] = timeString.split(":");
	const hour = Number(hourPart);
	const minute = Number(minutePart);

	return {
		// only return the number if it's actually finite, otherwise default to 0
		hour: Number.isFinite(hour) ? hour : 0,
		minute: Number.isFinite(minute) ? minute : 0,
	};
}

/**
 * Converts a 24h time string into a friendly 12h format with AM/PM.
 */
export function formatReminderTime(timeString: string) {
	const { hour, minute } = parseReminderTime(timeString);
	const ampm = hour >= 12 ? "PM" : "AM";
	const hour12 = hour % 12 || 12;

	// pad the minute with a leading zero if needed and add AM/PM
	return `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

/**
 * Returns the reminder time stored in the profile, or the default if missing/invalid.
 */
export function getReminderTime(profile: Profile, reminderKey: ReminderKey) {
	const config = REMINDER_CONFIG[reminderKey];
	const rawTime = profile?.[config.timeField];

	// check if we have a valid "HH:mm" or "HH:mm:ss" string
	if (typeof rawTime === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(rawTime)) {
		// return just the HH:mm part
		return rawTime.slice(0, 5);
	}

	// fall back to the default time defined in the config
	return config.defaultTime;
}
