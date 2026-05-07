import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Safely attempts to import expo-notifications.
 *
 * Returns null if the module is not available (e.g. in a custom dev client
 * that wasn't rebuilt after installing the package). This prevents crashes
 * during development.
 */
function tryGetNotificationsModule():
	| typeof import("expo-notifications")
	| null {
	try {
		// Lazy require to avoid crashing app startup if native modules are missing
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		return require("expo-notifications") as typeof import("expo-notifications");
	} catch (error) {
		return null;
	}
}

/**
 * Ensures the app has notification permissions.
 *
 * Requests permission if not already granted.
 * Returns true if permission is granted, false otherwise.
 */
export async function ensureNotificationsPermission() {
	const Notifications = tryGetNotificationsModule();
	if (!Notifications) return false;

	const { status } = await Notifications.getPermissionsAsync();
	if (status === "granted") return true;

	const req = await Notifications.requestPermissionsAsync();
	return req.status === "granted";
}

/**
 * Schedules a daily recurring notification.
 *
 * Stores the notification ID in AsyncStorage so it can be cancelled later.
 */
export async function scheduleDailyReminder(
	storageKey: string,
	hour: number,
	minute: number,
	title: string,
	body: string,
	channelId?: string, // optional: Android notification channel
) {
	const Notifications = tryGetNotificationsModule();
	if (!Notifications) return null;

	type DailyTriggerInput = import("expo-notifications").DailyTriggerInput;

	const trigger: DailyTriggerInput = {
		type: Notifications.SchedulableTriggerInputTypes.DAILY,
		hour,
		minute,
		...(channelId ? { channelId } : {}),
	};

	const id = await Notifications.scheduleNotificationAsync({
		content: { title, body },
		trigger,
	});

	// Persist ID so we can cancel it later
	await AsyncStorage.setItem(storageKey, id);
	return id;
}

/**
 * Cancels a previously scheduled daily reminder.
 *
 * Removes both the scheduled notification and its stored ID.
 */
export async function cancelDailyReminder(storageKey: string) {
	const Notifications = tryGetNotificationsModule();
	if (!Notifications) return;

	const existing = await AsyncStorage.getItem(storageKey);
	if (existing) {
		await Notifications.cancelScheduledNotificationAsync(existing);
		await AsyncStorage.removeItem(storageKey);
	}
}

/**
 * Retrieves the stored notification ID for a given reminder.
 */
export async function getScheduledReminderId(storageKey: string) {
	return AsyncStorage.getItem(storageKey);
}
