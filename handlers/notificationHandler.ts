import { useEffect } from "react";
import { Platform } from "react-native";

function tryGetNotificationsModule():
	| typeof import("expo-notifications")
	| null {
	try {
		// Lazy require so missing native modules don't crash app startup
		// (common when running in a client that wasn't rebuilt after installing expo-notifications).
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		return require("expo-notifications") as typeof import("expo-notifications");
	} catch (error) {
		if (__DEV__) {
			console.warn(
				"expo-notifications unavailable in this runtime; skipping notification init.",
				error,
			);
		}
		return null;
	}
}

export function useInitNotifications() {
	useEffect(() => {
		const Notifications = tryGetNotificationsModule();
		if (!Notifications) return;

		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true,
				shouldShowBanner: true,
				shouldShowList: true,
				shouldPlaySound: false,
				shouldSetBadge: false,
			}),
		});

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
