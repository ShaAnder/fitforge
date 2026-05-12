import TabScreen from "@/components/layout/TabScreen";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ACCENT_LIST, AccentKey, getAccentPreset } from "@/constants/accents";
import {
	cancelDailyReminder,
	ensureNotificationsPermission,
	scheduleDailyReminder,
} from "@/helpers/notifications";

import ModalView from "@/components/ui/ModalView";
import { getSupabase } from "@/lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

type ReminderKey = "workout" | "streak";

const REMINDER_CONFIG = {
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

function parseReminderTime(timeString: string) {
	const [hourPart = "0", minutePart = "0"] = timeString.split(":");
	const hour = Number(hourPart);
	const minute = Number(minutePart);
	return {
		hour: Number.isFinite(hour) ? hour : 0,
		minute: Number.isFinite(minute) ? minute : 0,
	};
}

function formatReminderTime(timeString: string) {
	const { hour, minute } = parseReminderTime(timeString);
	const ampm = hour >= 12 ? "PM" : "AM";
	const hour12 = hour % 12 || 12;
	return `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

function getReminderTime(profile: any, reminderKey: ReminderKey) {
	const config = REMINDER_CONFIG[reminderKey];
	const rawTime = profile?.[config.timeField];
	if (typeof rawTime === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(rawTime)) {
		return rawTime.slice(0, 5);
	}
	return config.defaultTime;
}

export default function SettingsScreen() {
	const router = useRouter();
	const { user, profile, updateProfile, signOut } = useAuth();
	const { showAlert } = useAlert();

	const [workoutReminderEnabled, setWorkoutReminderEnabled] = useState(false);
	const [streakReminderEnabled, setStreakReminderEnabled] = useState(false);
	const [notificationsLoading, setNotificationsLoading] = useState(true);

	// Custom Time Modal States - TWO FIELDS
	const [customTimeModalVisible, setCustomTimeModalVisible] = useState(false);
	const [activeReminderKey, setActiveReminderKey] =
		useState<ReminderKey | null>(null);
	const [tempHour, setTempHour] = useState("18");
	const [tempMinute, setTempMinute] = useState("00");

	const [workoutTime, setWorkoutTime] = useState("18:00");
	const [streakTime, setStreakTime] = useState("20:00");

	const [changePasswordVisible, setChangePasswordVisible] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [changingPassword, setChangingPassword] = useState(false);

	const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
	const [deletePassword, setDeletePassword] = useState("");
	const [deletingAccount, setDeletingAccount] = useState(false);
	const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
	const [confirmEmail, setConfirmEmail] = useState("");

	const accentPreset = getAccentPreset(profile?.accent);
	const currentAccent = accentPreset.key;

	const setAccent = async (key: AccentKey) => {
		await updateProfile({ accent: key });
	};

	const displayName = profile?.username || user?.email?.split("@")[0] || "User";

	// Load saved data
	useEffect(() => {
		if (!profile) return;

		setWorkoutReminderEnabled(!!profile.workout_reminder_enabled);
		setStreakReminderEnabled(!!profile.streak_reminder_enabled);
		setWorkoutTime(getReminderTime(profile, "workout"));
		setStreakTime(getReminderTime(profile, "streak"));
		setNotificationsLoading(false);
	}, [profile]);

	const openCustomTimeModal = (reminderKey: ReminderKey) => {
		setActiveReminderKey(reminderKey);

		const currentTime = reminderKey === "workout" ? workoutTime : streakTime;
		const { hour, minute } = parseReminderTime(currentTime);

		setTempHour(String(hour).padStart(2, "0"));
		setTempMinute(String(minute).padStart(2, "0"));

		setCustomTimeModalVisible(true);
	};

	const closeCustomTimeModal = () => {
		setCustomTimeModalVisible(false);
		setActiveReminderKey(null);
	};

	const saveCustomTime = async () => {
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
		} catch (error) {
			showAlert("Notification error", "Failed to save reminder time.", "error");
			if (__DEV__) console.warn(error);
		} finally {
			closeCustomTimeModal();
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
		} catch (error) {
			setEnabled(!enabled);
			showAlert(
				"Notification error",
				"Something went wrong while updating reminders.",
				"error",
			);
			if (__DEV__) console.warn(error);
		}
	};

	const submitChangePassword = async () => {
		const trimmed = newPassword.trim();
		if (trimmed.length < 8) {
			showAlert("Password too short", "Use at least 8 characters.", "info");
			return;
		}
		if (trimmed !== confirmPassword.trim()) {
			showAlert("Passwords don't match", "Please try again.", "info");
			return;
		}

		setChangingPassword(true);
		try {
			const supabase = getSupabase();
			const { error } = await supabase.auth.updateUser({ password: trimmed });
			if (error) throw error;

			setChangePasswordVisible(false);
			setNewPassword("");
			setConfirmPassword("");
			showAlert(
				"Password updated",
				"Your password has been changed.",
				"success",
			);
		} catch (err: any) {
			showAlert(
				"Change password failed",
				err?.message || "Please try again.",
				"error",
			);
		} finally {
			setChangingPassword(false);
		}
	};

	const resetDeleteModal = () => {
		setDeleteAccountVisible(false);
		setDeleteStep(1);
		setDeletePassword("");
		setConfirmEmail("");
		setDeletingAccount(false);
	};

	const submitDeleteAccount = async () => {
		if (deleteStep === 1) {
			if (confirmEmail.trim() !== user?.email) {
				showAlert(
					"Email doesn't match",
					"Please type the exact email shown.",
					"info",
				);
				return;
			}
			setDeleteStep(2);
			return;
		}

		// === FINAL STEP: Password → Delete + Logout ===
		if (!deletePassword.trim()) {
			showAlert("Password required", "Please enter your password.", "info");
			return;
		}

		setDeletingAccount(true);

		try {
			const supabase = getSupabase();

			// Re-authenticate
			const { error: reauthError } = await supabase.auth.signInWithPassword({
				email: user!.email!,
				password: deletePassword,
			});
			if (reauthError) throw reauthError;

			// Call Edge Function (deletes everything)
			const { error: fnError } =
				await supabase.functions.invoke("delete-account");
			if (fnError) throw fnError;

			// Success - immediate logout
			showAlert(
				"Account Deleted",
				"Your account has been permanently deleted.",
				"success",
			);

			await signOut();
			router.replace("/login");
			resetDeleteModal();
		} catch (err: any) {
			showAlert(
				"Delete failed",
				err?.message || "Please check your password and try again.",
				"error",
			);
		} finally {
			setDeletingAccount(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			<TabScreen title="Settings" subtitle="Preferences">
				<View className="gap-6">
					<Card className="p-6">
						<Text className="text-zinc-400 text-sm mb-4">Appearance</Text>

						<View className="flex-row items-center justify-between">
							{ACCENT_LIST.map((a) => {
								const selected = currentAccent === a.key;

								return (
									<TouchableOpacity
										key={a.key}
										onPress={() => setAccent(a.key)}
										activeOpacity={0.85}
										style={{
											width: 34,
											height: 34,
											borderRadius: 999,
											backgroundColor: a.hex500,
											borderWidth: selected ? 3 : 0,
											borderColor: selected ? "#fff" : "transparent",
										}}
									/>
								);
							})}
						</View>
					</Card>

					<Card className="p-6">
						<Text className="text-zinc-400 text-sm mb-4">Notifications</Text>

						{/* Workout Reminder */}
						<View className="py-3">
							<View className="flex-row items-start justify-between gap-4">
								<View className="flex-1 pr-4">
									<Text className="text-white text-base font-semibold">
										{REMINDER_CONFIG.workout.label}
									</Text>
									<Text className="text-zinc-400 text-sm mt-1">
										{REMINDER_CONFIG.workout.description}
									</Text>
									<Text className="text-zinc-500 text-xs mt-3">
										Time: {formatReminderTime(workoutTime)}
									</Text>
								</View>
								<View className="items-end gap-3">
									<TouchableOpacity
										onPress={() => openCustomTimeModal("workout")}
										className="px-4 py-2 rounded-2xl border border-zinc-700 bg-zinc-900"
									>
										<Text className="text-white font-semibold">Set time</Text>
									</TouchableOpacity>
									<Switch
										value={workoutReminderEnabled}
										disabled={notificationsLoading}
										onValueChange={(value) =>
											setDailyReminder(
												"workout",
												value,
												setWorkoutReminderEnabled,
											)
										}
										trackColor={{ false: "#3f3f46", true: accentPreset.hex500 }}
										thumbColor="#ffffff"
									/>
								</View>
							</View>
						</View>

						<View className="h-px bg-zinc-800 my-3" />

						{/* Streak Reminder */}
						<View className="py-3">
							<View className="flex-row items-start justify-between gap-4">
								<View className="flex-1 pr-4">
									<Text className="text-white text-base font-semibold">
										{REMINDER_CONFIG.streak.label}
									</Text>
									<Text className="text-zinc-400 text-sm mt-1">
										{REMINDER_CONFIG.streak.description}
									</Text>
									<Text className="text-zinc-500 text-xs mt-3">
										Time: {formatReminderTime(streakTime)}
									</Text>
								</View>
								<View className="items-end gap-3">
									<TouchableOpacity
										onPress={() => openCustomTimeModal("streak")}
										className="px-4 py-2 rounded-2xl border border-zinc-700 bg-zinc-900"
									>
										<Text className="text-white font-semibold">Set time</Text>
									</TouchableOpacity>
									<Switch
										value={streakReminderEnabled}
										disabled={notificationsLoading}
										onValueChange={(value) =>
											setDailyReminder(
												"streak",
												value,
												setStreakReminderEnabled,
											)
										}
										trackColor={{ false: "#3f3f46", true: accentPreset.hex500 }}
										thumbColor="#ffffff"
									/>
								</View>
							</View>
						</View>
					</Card>

					<Card className="p-6">
						<Text className="text-zinc-400 text-sm mb-4">Preferences</Text>

						<Text className="text-white text-base font-semibold mb-3">
							Units
						</Text>
						<View className="flex-row gap-3">
							{(["kg", "lb"] as const).map((u) => {
								const active = (profile?.units ?? "kg") === u;
								return (
									<TouchableOpacity
										key={u}
										onPress={() => updateProfile({ units: u })}
										className={`px-4 py-3 rounded-2xl border ${
											active
												? "bg-zinc-800 border-zinc-700"
												: "bg-zinc-900 border-zinc-800"
										}`}
									>
										<Text className="text-white font-semibold">
											{u.toUpperCase()}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>

						<View className="h-px bg-zinc-800 my-5" />

						<Text className="text-white text-base font-semibold mb-3">
							Week starts on
						</Text>
						<View className="flex-row gap-3">
							{(
								[
									{ key: "mon", label: "Monday" },
									{ key: "sun", label: "Sunday" },
								] as const
							).map((opt) => {
								const active = (profile?.week_start ?? "mon") === opt.key;
								return (
									<TouchableOpacity
										key={opt.key}
										onPress={() => updateProfile({ week_start: opt.key })}
										className={`px-4 py-3 rounded-2xl border ${
											active
												? "bg-zinc-800 border-zinc-700"
												: "bg-zinc-900 border-zinc-800"
										}`}
									>
										<Text className="text-white font-semibold">
											{opt.label}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					</Card>
					<Card className="p-6">
						<Text className="text-zinc-400 text-sm mb-4">Account</Text>
						<Text className="text-white text-xl font-bold">{displayName}</Text>
						{user?.email ? (
							<Text className="text-zinc-400 text-sm mt-2">{user.email}</Text>
						) : null}

						<View className="h-px bg-zinc-800 my-5" />

						<TouchableOpacity
							onPress={() => router.push("/(tabs)/profile?edit=1")}
							className="flex-row items-center justify-between py-4"
							activeOpacity={0.85}
						>
							<Text className="text-white text-lg font-semibold">
								Edit profile
							</Text>
							<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
						</TouchableOpacity>

						<View className="h-px bg-zinc-800" />

						<TouchableOpacity
							onPress={() => setChangePasswordVisible(true)}
							className="flex-row items-center justify-between py-4"
							activeOpacity={0.85}
						>
							<Text className="text-white text-lg font-semibold">
								Change password
							</Text>
							<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
						</TouchableOpacity>

						<View className="h-px bg-zinc-800" />

						<TouchableOpacity
							onPress={() => setDeleteAccountVisible(true)}
							className="flex-row items-center justify-between py-4"
							activeOpacity={0.85}
						>
							<Text className="text-red-400 text-lg font-semibold">
								Delete account
							</Text>
							<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
						</TouchableOpacity>
					</Card>

					<Card className="p-6">
						<Text className="text-zinc-400 text-sm mb-4">Contact</Text>

						<TouchableOpacity
							onPress={() => router.push("/(tabs)/report-bug" as any)}
							className="flex-row items-center justify-between py-4"
							activeOpacity={0.85}
						>
							<Text className="text-white text-lg font-semibold">
								Report a bug
							</Text>
							<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
						</TouchableOpacity>
					</Card>

					<Card className="p-6">
						<Text className="text-zinc-400 text-sm mb-4">Legal</Text>

						<TouchableOpacity
							onPress={() => router.push("/privacy")}
							className="flex-row items-center justify-between py-4"
							activeOpacity={0.85}
						>
							<Text className="text-white text-lg font-semibold">
								Privacy Policy
							</Text>
							<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
						</TouchableOpacity>

						<View className="h-px bg-zinc-800" />

						<TouchableOpacity
							onPress={() => router.push("/terms")}
							className="flex-row items-center justify-between py-4"
							activeOpacity={0.85}
						>
							<Text className="text-white text-lg font-semibold">
								Terms of Service
							</Text>
							<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
						</TouchableOpacity>
					</Card>

					{/* Sign Out Button - at the bottom, scrolls naturally */}
					<View className="pb-6">
						<Button
							title="Sign Out"
							variant="outline"
							size="large"
							onPress={signOut}
						/>
					</View>

					{/* Custom Time Modal */}

					<ModalView
						visible={customTimeModalVisible}
						onRequestClose={closeCustomTimeModal}
						height="42%"
					>
						<View className="flex-1 px-6 pt-8">
							<Text className="text-white text-3xl font-bold mb-2">
								Set Reminder Time
							</Text>
							<Text className="text-zinc-400 text-lg mb-10">
								When should we send the daily reminder?
							</Text>

							<View className="flex-row items-center justify-center gap-6">
								<TextInput
									className="bg-zinc-900 text-white text-6xl font-semibold text-center rounded-3xl w-36 border-2 border-zinc-700 focus:border-accent-500"
									value={tempHour}
									onChangeText={(text) =>
										setTempHour(text.replace(/[^0-9]/g, "").slice(0, 2))
									}
									keyboardType="number-pad"
									maxLength={2}
									placeholder="18"
									placeholderTextColor="#52525b"
								/>

								<Text className="text-6xl text-zinc-400 font-light">:</Text>

								<TextInput
									className="bg-zinc-900 text-white text-6xl font-semibold text-center rounded-3xl w-36 border-2 border-zinc-700 focus:border-accent-500"
									value={tempMinute}
									onChangeText={(text) =>
										setTempMinute(text.replace(/[^0-9]/g, "").slice(0, 2))
									}
									keyboardType="number-pad"
									maxLength={2}
									placeholder="00"
									placeholderTextColor="#52525b"
								/>
							</View>

							<Text className="text-zinc-500 text-center mt-8 text-sm">
								24-hour format (00:00 - 23:59)
							</Text>

							<View className="flex-1" />

							<View className="flex-row gap-4 pb-8">
								<View className="flex-1">
									<Button
										title="Cancel"
										size="large"
										variant="outline"
										onPress={closeCustomTimeModal}
									/>
								</View>
								<View className="flex-1">
									<Button
										title="Save"
										size="large"
										variant="primary"
										onPress={saveCustomTime}
									/>
								</View>
							</View>
						</View>
					</ModalView>

					{/* Change Password Modal */}
					<ModalView
						visible={changePasswordVisible}
						onRequestClose={() => {
							if (!changingPassword) setChangePasswordVisible(false);
						}}
						height="45%"
					>
						<View className="flex-1">
							<Text className="text-white text-3xl font-bold mb-3">
								Change password
							</Text>
							<Text className="text-zinc-400 text-lg mb-8">
								Enter your new password.
							</Text>

							<Text className="text-zinc-400 text-base mb-2 ml-1">
								New password
							</Text>
							<TextInput
								className="bg-zinc-900 text-white p-5 rounded-2xl text-lg border border-zinc-700 focus:border-zinc-500"
								placeholder="••••••••"
								placeholderTextColor="#71717a"
								secureTextEntry
								autoCapitalize="none"
								value={newPassword}
								onChangeText={setNewPassword}
							/>

							<View className="h-6" />

							<Text className="text-zinc-400 text-base mb-2 ml-1">
								Confirm password
							</Text>
							<TextInput
								className="bg-zinc-900 text-white p-5 rounded-2xl text-lg border border-zinc-700 focus:border-zinc-500"
								placeholder="••••••••"
								placeholderTextColor="#71717a"
								secureTextEntry
								autoCapitalize="none"
								value={confirmPassword}
								onChangeText={setConfirmPassword}
							/>

							<View className="flex-1" />

							{/* Side-by-side buttons */}
							<View className="flex-row gap-3">
								<View className="flex-1">
									<Button
										title={changingPassword ? "Confirming..." : "Confirm"}
										size="large"
										variant="primary"
										onPress={submitChangePassword}
										disabled={changingPassword}
									/>
								</View>
								<View className="flex-1">
									<Button
										title="Cancel"
										size="large"
										variant="outline"
										onPress={() => setChangePasswordVisible(false)}
										disabled={changingPassword}
									/>
								</View>
							</View>
						</View>
					</ModalView>

					{/* Delete Account Modal - 2 Steps with Safe Cancel */}
					<ModalView
						visible={deleteAccountVisible}
						onRequestClose={resetDeleteModal}
						height="40%"
					>
						<View className="flex-1">
							{deleteStep === 1 && (
								<>
									<Text className="text-white text-3xl font-bold mb-3">
										Delete Account
									</Text>
									<Text className="text-red-400 text-lg mb-8">
										This action is irreversible and will permanently delete your
										account and all your data.
									</Text>

									<Text className="text-zinc-400 text-lg mb-2 ml-1">
										Type your email to confirm
									</Text>
									<Text className="text-zinc-500 text-base mb-3 ml-1">
										{user?.email}
									</Text>

									<TextInput
										className="bg-zinc-900 text-white p-5 rounded-2xl text-lg border border-zinc-700 focus:border-zinc-500"
										placeholder="your@email.com"
										placeholderTextColor="#71717a"
										value={confirmEmail}
										onChangeText={setConfirmEmail}
										autoCapitalize="none"
										keyboardType="email-address"
									/>

									<View className="flex-1" />

									{/* Side-by-side buttons */}
									<View className="flex-row gap-3">
										<View className="flex-1">
											<Button
												title="Continue"
												size="large"
												variant="primary"
												onPress={submitDeleteAccount}
											/>
										</View>
										<View className="flex-1">
											<Button
												title="Cancel"
												size="large"
												variant="outline"
												onPress={resetDeleteModal}
											/>
										</View>
									</View>
								</>
							)}

							{deleteStep === 2 && (
								<>
									<Text className="text-white text-3xl font-bold mb-3">
										Confirm Deletion
									</Text>
									<Text className="text-red-400 text-lg mb-8">
										Are you sure? This action cannot be undone.
									</Text>

									<Text className="text-zinc-400 text-lg mb-8">
										Enter your password to permanently delete your account.
									</Text>

									<TextInput
										className="bg-zinc-900 text-white p-5 rounded-2xl text-lg border border-zinc-700 focus:border-zinc-500"
										placeholder="••••••••"
										placeholderTextColor="#71717a"
										secureTextEntry
										value={deletePassword}
										onChangeText={setDeletePassword}
									/>

									<View className="flex-1" />

									{/* Side-by-side buttons */}
									<View className="flex-row gap-3">
										<View className="flex-1">
											<Button
												title={
													deletingAccount ? "Deleting Account..." : "Confirm"
												}
												size="large"
												variant="primary"
												onPress={submitDeleteAccount}
												disabled={deletingAccount}
											/>
										</View>
										<View className="flex-1">
											<Button
												title="Cancel"
												size="large"
												variant="outline"
												onPress={resetDeleteModal}
												disabled={deletingAccount}
											/>
										</View>
									</View>
								</>
							)}
						</View>
					</ModalView>
				</View>
			</TabScreen>
		</SafeAreaView>
	);
}
