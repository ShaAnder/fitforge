import TabScreen from "@/components/layout/TabScreen";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ACCENT_LIST, AccentKey, getAccentPreset } from "@/constants/accents";
import {
	cancelDailyReminder,
	ensureNotificationsPermission,
	getScheduledReminderId,
	scheduleDailyReminder,
} from "@/helpers/notifications";

import ModalView from "@/components/ui/ModalView";
import { getSupabase } from "@/lib/supabase";

function AccentRow({
	label,
	hex,
	selected,
	onPress,
}: {
	label: string;
	hex: string;
	selected: boolean;
	onPress: () => void;
}) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className="flex-row items-center justify-between py-4"
			activeOpacity={0.85}
		>
			<View className="flex-row items-center gap-3">
				<View
					style={{
						width: 14,
						height: 14,
						borderRadius: 999,
						backgroundColor: hex,
					}}
				/>
				<Text className="text-white text-lg font-semibold">{label}</Text>
			</View>

			{selected ? (
				<Ionicons name="checkmark-circle" size={24} color={hex} />
			) : (
				<Ionicons name="ellipse-outline" size={22} color="#52525b" />
			)}
		</TouchableOpacity>
	);
}

export default function SettingsScreen() {
	const router = useRouter();
	const { user, profile, updateProfile, signOut } = useAuth();
	const { showAlert } = useAlert();

	const WORKOUT_REMINDER_KEY = "notif_workout_daily_id";
	const STREAK_REMINDER_KEY = "notif_streak_daily_id";

	const [workoutReminderEnabled, setWorkoutReminderEnabled] = useState(false);
	const [streakReminderEnabled, setStreakReminderEnabled] = useState(false);
	const [notificationsLoading, setNotificationsLoading] = useState(true);

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

	const displayName =
		(profile?.username as string | undefined) ||
		user?.email?.split("@")[0] ||
		"User";

	const devNextMinute = useMemo(() => {
		const now = new Date();
		let hour = now.getHours();
		let minute = now.getMinutes() + 1;
		if (minute >= 60) {
			minute = 0;
			hour = (hour + 1) % 24;
		}
		return { hour, minute };
	}, []);

	const formatTime = (hour24: number, minute: number) => {
		const ampm = hour24 >= 12 ? "PM" : "AM";
		const hour12 = hour24 % 12 || 12;
		const mm = String(minute).padStart(2, "0");
		return `${hour12}:${mm} ${ampm}`;
	};

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const [workoutId, streakId] = await Promise.all([
					getScheduledReminderId(WORKOUT_REMINDER_KEY),
					getScheduledReminderId(STREAK_REMINDER_KEY),
				]);
				if (cancelled) return;
				setWorkoutReminderEnabled(Boolean(workoutId));
				setStreakReminderEnabled(Boolean(streakId));
			} finally {
				if (!cancelled) setNotificationsLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const setDailyReminder = async (
		storageKey: string,
		enabled: boolean,
		setEnabled: (v: boolean) => void,
		options: { title: string; body: string },
	) => {
		setEnabled(enabled);
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

				const hour = __DEV__ ? devNextMinute.hour : 9;
				const minute = __DEV__ ? devNextMinute.minute : 0;

				const id = await scheduleDailyReminder(
					storageKey,
					hour,
					minute,
					options.title,
					options.body,
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

				showAlert(
					"Reminder enabled",
					`Scheduled daily at ${formatTime(hour, minute)}.${
						__DEV__ ? " (Dev schedules for next minute.)" : ""
					}`,
					"success",
				);
			} else {
				await cancelDailyReminder(storageKey);
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

					<View className="flex-row items-center justify-between py-3">
						<View className="flex-1 pr-4">
							<Text className="text-white text-base font-semibold">
								Workout reminder
							</Text>
							<Text className="text-zinc-400 text-sm mt-1">
								Daily nudge to log your training.
							</Text>
						</View>
						<Switch
							value={workoutReminderEnabled}
							disabled={notificationsLoading}
							onValueChange={(value) =>
								setDailyReminder(
									WORKOUT_REMINDER_KEY,
									value,
									setWorkoutReminderEnabled,
									{
										title: "Workout reminder",
										body: "Time to train — log your workout in FitForge.",
									},
								)
							}
							trackColor={{ false: "#3f3f46", true: accentPreset.hex500 }}
							thumbColor="#ffffff"
						/>
					</View>

					<View className="h-px bg-zinc-800 my-3" />

					<View className="flex-row items-center justify-between py-3">
						<View className="flex-1 pr-4">
							<Text className="text-white text-base font-semibold">
								Streak reminder
							</Text>
							<Text className="text-zinc-400 text-sm mt-1">
								Keep your weekly momentum going.
							</Text>
						</View>
						<Switch
							value={streakReminderEnabled}
							disabled={notificationsLoading}
							onValueChange={(value) =>
								setDailyReminder(
									STREAK_REMINDER_KEY,
									value,
									setStreakReminderEnabled,
									{
										title: "Streak reminder",
										body: "Keep the streak alive — log something today.",
									},
								)
							}
							trackColor={{ false: "#3f3f46", true: accentPreset.hex500 }}
							thumbColor="#ffffff"
						/>
					</View>
				</Card>

				<Card className="p-6">
					<Text className="text-zinc-400 text-sm mb-4">Preferences</Text>

					<Text className="text-white text-base font-semibold mb-3">Units</Text>
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
									<Text className="text-white font-semibold">{opt.label}</Text>
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
	);
}
