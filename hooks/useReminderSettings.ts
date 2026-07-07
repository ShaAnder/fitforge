import {
	REMINDER_CONFIG,
	formatReminderTime,
	getReminderTime,
	parseReminderTime,
} from "@/constants/reminders";
import { useAlert } from "@/context/AlertContext";
import {
	cancelDailyReminder,
	ensureNotificationsPermission,
	scheduleDailyReminder,
} from "@/helpers/notifications";
import { Profile, ReminderKey } from "@/types";
import { getErrorMessage } from "@/utils/getError";
import { useEffect, useState } from "react";

interface UseReminderSettingsProps {
	profile: Profile | null;
	updateProfile: (data: Partial<Profile>) => Promise<void>;
}

/**
 * Custom hook that manages all reminder settings (workout + streak).
 *
 * Handles loading from profile, toggling reminders on/off,
 * scheduling/cancelling notifications, and the time picker modal.
 */
export function useReminderSettings({
	profile,
	updateProfile,
}: UseReminderSettingsProps) {
	// our alert context for showing success/error messages
	const { showAlert } = useAlert();

	// local state for the two reminder toggles
	const [workoutReminderEnabled, setWorkoutReminderEnabled] = useState(false);
	const [streakReminderEnabled, setStreakReminderEnabled] = useState(false);
	// current times shown in the UI
	const [workoutTime, setWorkoutTime] = useState("18:00");
	const [streakTime, setStreakTime] = useState("20:00");

	// modal state for picking a new reminder time
	const [modalVisible, setModalVisible] = useState(false);
	const [activeReminderKey, setActiveReminderKey] =
		useState<ReminderKey | null>(null);
	const [tempHour, setTempHour] = useState("18");
	const [tempMinute, setTempMinute] = useState("00");

	// show loading state until we have profile data
	const notificationsLoading = !profile;

	useEffect(() => {
		if (!profile) return;
		// sync local state from the profile when it loads or changes
		setWorkoutReminderEnabled(!!profile.workout_reminder_enabled);
		setStreakReminderEnabled(!!profile.streak_reminder_enabled);
		setWorkoutTime(getReminderTime(profile, "workout"));
		setStreakTime(getReminderTime(profile, "streak"));
	}, [profile]);

	const openModal = (reminderKey: ReminderKey) => {
		// set which reminder we're editing and prefill the picker
		setActiveReminderKey(reminderKey);
		const currentTime = reminderKey === "workout" ? workoutTime : streakTime;
		const { hour, minute } = parseReminderTime(currentTime);
		setTempHour(String(hour).padStart(2, "0"));
		setTempMinute(String(minute).padStart(2, "0"));
		setModalVisible(true);
	};

	const closeModal = () => {
		// reset modal state
		setModalVisible(false);
		setActiveReminderKey(null);
	};

	const saveTime = async () => {
		if (!activeReminderKey) return;

		const hour = parseInt(tempHour) || 0;
		const minute = parseInt(tempMinute) || 0;

		// basic validation for the picked time
		if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
			showAlert("Invalid time", "Hour must be 0-23 and minute 0-59", "info");
			return;
		}

		const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

		// update local state immediately for snappy UI
		if (activeReminderKey === "workout") setWorkoutTime(timeString);
		else setStreakTime(timeString);

		try {
			const config = REMINDER_CONFIG[activeReminderKey];
			const isEnabled =
				activeReminderKey === "workout"
					? workoutReminderEnabled
					: streakReminderEnabled;

			if (isEnabled) {
				// if the reminder is already on, we need to reschedule it with the new time
				const hasPermission = await ensureNotificationsPermission();
				if (!hasPermission) {
					showAlert(
						"Notifications disabled",
						"Enable in system settings.",
						"info",
					);
					return;
				}
				await cancelDailyReminder(config.storageKey);
				await scheduleDailyReminder(
					config.storageKey,
					hour,
					minute,
					config.title,
					config.body,
					"reminders",
				);
			}

			// save the new time to the profile
			await updateProfile({ [config.timeField]: timeString });
			showAlert(
				"Reminder time saved",
				`Daily reminder set for ${formatReminderTime(timeString)}.`,
				"success",
			);
		} catch (err: unknown) {
			showAlert("Failed to save reminder time", getErrorMessage(err), "error");
			if (__DEV__) console.warn(err);
		} finally {
			closeModal();
		}
	};

	const setDailyReminder = async (
		reminderKey: ReminderKey,
		enabled: boolean,
		setEnabled: (v: boolean) => void,
	) => {
		// optimistically update the toggle
		setEnabled(enabled);
		const config = REMINDER_CONFIG[reminderKey];
		const timeString = reminderKey === "workout" ? workoutTime : streakTime;

		try {
			if (enabled) {
				// user turned it on → ask for permission and schedule
				const hasPermission = await ensureNotificationsPermission();
				if (!hasPermission) {
					setEnabled(false);
					showAlert(
						"Notifications disabled",
						"Permission not granted. Enable notifications in system settings to use reminders.",
						"info",
					);
					return;
				}

				const { hour, minute } = parseReminderTime(timeString);
				const id = await scheduleDailyReminder(
					config.storageKey,
					hour,
					minute,
					config.title,
					config.body,
					"reminders",
				);

				if (!id) {
					setEnabled(false);
					showAlert(
						"Notifications unavailable",
						"This runtime doesn't include expo-notifications native modules. If you're using a custom dev client, rebuild the app.",
						"error",
					);
					return;
				}

				// persist both the enabled flag and the time
				await updateProfile({
					[config.enabledField]: true,
					[config.timeField]: timeString,
				});

				showAlert(
					"Reminder enabled",
					`Scheduled at ${formatReminderTime(timeString)}.`,
					"success",
				);
			} else {
				// user turned it off → cancel the scheduled notification
				await cancelDailyReminder(config.storageKey);
				await updateProfile({ [config.enabledField]: false });
				showAlert(
					"Reminder disabled",
					"Scheduled reminder removed.",
					"success",
				);
			}
		} catch (err: unknown) {
			// revert the toggle on error
			setEnabled(!enabled);
			showAlert("Failed to update reminder", getErrorMessage(err), "error");
			if (__DEV__) console.warn(err);
		}
	};

	return {
		// State
		workoutReminderEnabled,
		streakReminderEnabled,
		workoutTime,
		streakTime,
		notificationsLoading,
		setWorkoutReminderEnabled,
		setStreakReminderEnabled,
		// Actions
		setDailyReminder,
		// Modal
		modalVisible,
		activeReminderKey,
		tempHour,
		tempMinute,
		setTempHour,
		setTempMinute,
		openModal,
		closeModal,
		saveTime,
	};
}
