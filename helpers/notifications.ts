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
		// lazy require so we don't crash app startup if the native module is missing
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		return require("expo-notifications") as typeof import("expo-notifications");
	} catch (err: unknown) {
		if (__DEV__) {
			// eslint-disable-next-line no-console
			console.warn("expo-notifications require failed:", String(err));
		}
		// return null so the rest of our code can handle missing notifications gracefully
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
	// try to get the notifications module safely
	const Notifications = tryGetNotificationsModule();
	if (!Notifications) return false;

	// check current permission status
	const { status } = await Notifications.getPermissionsAsync();
	if (status === "granted") return true;

	// otherwise ask the user for permission
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
	// safely get our notifications module
	const Notifications = tryGetNotificationsModule();
	if (!Notifications) return null;

	type DailyTriggerInput = import("expo-notifications").DailyTriggerInput;

	// build the daily trigger object
	const trigger: DailyTriggerInput = {
		type: Notifications.SchedulableTriggerInputTypes.DAILY,
		hour,
		minute,
		...(channelId ? { channelId } : {}),
	};

	// schedule the actual notification
	const id = await Notifications.scheduleNotificationAsync({
		content: { title, body },
		trigger,
	});

	// persist the ID in AsyncStorage so we can cancel it later if needed
	await AsyncStorage.setItem(storageKey, id);
	return id;
}

/**
 * Cancels a previously scheduled daily reminder.
 *
 * Removes both the scheduled notification and its stored ID.
 */
export async function cancelDailyReminder(storageKey: string) {
	// get the module safely
	const Notifications = tryGetNotificationsModule();
	if (!Notifications) return;

	// check if we have a stored ID for this reminder
	const existing = await AsyncStorage.getItem(storageKey);
	if (existing) {
		// cancel the notification using the stored ID
		await Notifications.cancelScheduledNotificationAsync(existing);
		// clean up the stored ID
		await AsyncStorage.removeItem(storageKey);
	}
}

/**
 * Retrieves the stored notification ID for a given reminder.
 */
export async function getScheduledReminderId(storageKey: string) {
	// just pull the ID from storage if it exists
	return AsyncStorage.getItem(storageKey);
}
