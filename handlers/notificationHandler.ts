import { useEffect } from "react";
import { Platform } from "react-native";

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
		// Silently fail in production; only log in dev
		return null;
	}
}

/**
 * useInitNotifications Hook.
 *
 * Initializes Expo Notifications configuration once when the app starts.
 * Sets up notification handling behavior and Android notification channel.
 * Safe to call even if the notifications module is not installed.
 */
export function useInitNotifications() {
	useEffect(() => {
		const Notifications = tryGetNotificationsModule();
		if (!Notifications) return;

		// Configure how notifications should appear when the app is in foreground
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true,
				shouldShowBanner: true,
				shouldShowList: true,
				shouldPlaySound: false,
				shouldSetBadge: false,
			}),
		});

		// Create Android notification channel (required for Android 8+)
		(async () => {
			if (Platform.OS === "android") {
				await Notifications.setNotificationChannelAsync("reminders", {
					name: "Reminders",
					importance: Notifications.AndroidImportance.DEFAULT,
				});
			}
		})();
	}, []);
}
