import AsyncStorage from "@react-native-async-storage/async-storage";

function tryGetNotificationsModule():
	| typeof import("expo-notifications")
	| null {
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		return require("expo-notifications") as typeof import("expo-notifications");
	} catch (error) {
		if (__DEV__) {
			console.warn(
				"expo-notifications unavailable in this runtime; notifications disabled.",
				error,
			);
		}
		return null;
	}
}

export async function ensureNotificationsPermission() {
	const Notifications = tryGetNotificationsModule();
	if (!Notifications) return false;

	const { status } = await Notifications.getPermissionsAsync();
	if (status === "granted") return true;

	const req = await Notifications.requestPermissionsAsync();
	return req.status === "granted";
}

export async function scheduleDailyReminder(
	storageKey: string,
	hour: number,
	minute: number,
	title: string,
	body: string,
	channelId?: string, // optional: android channel
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

	await AsyncStorage.setItem(storageKey, id);
	return id;
}

export async function cancelDailyReminder(storageKey: string) {
	const Notifications = tryGetNotificationsModule();
	if (!Notifications) return;

	const existing = await AsyncStorage.getItem(storageKey);
	if (existing) {
		await Notifications.cancelScheduledNotificationAsync(existing);
		await AsyncStorage.removeItem(storageKey);
	}
}

export async function getScheduledReminderId(storageKey: string) {
	return AsyncStorage.getItem(storageKey);
}
