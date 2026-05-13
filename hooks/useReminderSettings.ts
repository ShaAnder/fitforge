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

export function useReminderSettings({
	profile,
	updateProfile,
}: UseReminderSettingsProps) {
	const { showAlert } = useAlert();

	const [workoutReminderEnabled, setWorkoutReminderEnabled] = useState(false);
	const [streakReminderEnabled, setStreakReminderEnabled] = useState(false);
	const [workoutTime, setWorkoutTime] = useState("18:00");
	const [streakTime, setStreakTime] = useState("20:00");

	// Modal state
	const [modalVisible, setModalVisible] = useState(false);
	const [activeReminderKey, setActiveReminderKey] =
		useState<ReminderKey | null>(null);
	const [tempHour, setTempHour] = useState("18");
	const [tempMinute, setTempMinute] = useState("00");

	const notificationsLoading = !profile;

	useEffect(() => {
		if (!profile) return;
		setWorkoutReminderEnabled(!!profile.workout_reminder_enabled);
		setStreakReminderEnabled(!!profile.streak_reminder_enabled);
		setWorkoutTime(getReminderTime(profile, "workout"));
		setStreakTime(getReminderTime(profile, "streak"));
	}, [profile]);

	const openModal = (reminderKey: ReminderKey) => {
		setActiveReminderKey(reminderKey);
		const currentTime = reminderKey === "workout" ? workoutTime : streakTime;
		const { hour, minute } = parseReminderTime(currentTime);
		setTempHour(String(hour).padStart(2, "0"));
		setTempMinute(String(minute).padStart(2, "0"));
		setModalVisible(true);
	};

	const closeModal = () => {
		setModalVisible(false);
		setActiveReminderKey(null);
	};

	const saveTime = async () => {
		if (!activeReminderKey) return;

		const hour = parseInt(tempHour) || 0;
		const minute = parseInt(tempMinute) || 0;

		if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
			showAlert("Invalid time", "Hour must be 0-23 and minute 0-59", "info");
			return;
		}

		const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

		if (activeReminderKey === "workout") setWorkoutTime(timeString);
		else setStreakTime(timeString);

		try {
			const config = REMINDER_CONFIG[activeReminderKey];
			const isEnabled =
				activeReminderKey === "workout"
					? workoutReminderEnabled
					: streakReminderEnabled;

			if (isEnabled) {
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
		setEnabled(enabled);
		const config = REMINDER_CONFIG[reminderKey];
		const timeString = reminderKey === "workout" ? workoutTime : streakTime;

		try {
			if (enabled) {
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
				await cancelDailyReminder(config.storageKey);
				await updateProfile({ [config.enabledField]: false });
				showAlert(
					"Reminder disabled",
					"Scheduled reminder removed.",
					"success",
				);
			}
		} catch (err: unknown) {
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
