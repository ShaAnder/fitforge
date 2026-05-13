import { Profile, ReminderKey } from "@/types";

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

export function parseReminderTime(timeString: string) {
	const [hourPart = "0", minutePart = "0"] = timeString.split(":");
	const hour = Number(hourPart);
	const minute = Number(minutePart);
	return {
		hour: Number.isFinite(hour) ? hour : 0,
		minute: Number.isFinite(minute) ? minute : 0,
	};
}

export function formatReminderTime(timeString: string) {
	const { hour, minute } = parseReminderTime(timeString);
	const ampm = hour >= 12 ? "PM" : "AM";
	const hour12 = hour % 12 || 12;
	return `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

export function getReminderTime(profile: Profile, reminderKey: ReminderKey) {
	const config = REMINDER_CONFIG[reminderKey];
	const rawTime = profile?.[config.timeField];
	if (typeof rawTime === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(rawTime)) {
		return rawTime.slice(0, 5);
	}
	return config.defaultTime;
}
