import Button from "@/components/ui/Button";
import ModalView from "@/components/ui/ModalView";
import { useChangePassword } from "@/hooks/useChangePassword";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { Text, TextInput, View } from "react-native";

interface ReminderTimeModalProps {
	reminder: ReturnType<typeof useReminderSettings>;
}

interface ChangePasswordModalProps {
	password: ReturnType<typeof useChangePassword>;
}

interface DeleteAccountModalProps {
	deleteAccount: ReturnType<typeof useDeleteAccount>;
}

/**
 * ReminderTimeModal
 *
 * Modal that lets the user pick a new time for their daily reminder.
 * Uses two big TextInputs for hour and minute.
 */
export function ReminderTimeModal({ reminder }: ReminderTimeModalProps) {
	return (
		<ModalView
			visible={reminder.modalVisible}
			onRequestClose={reminder.closeModal}
			height="42%"
		>
			<View className="flex-1 px-6 pt-8">
				<Text className="text-white text-3xl font-bold mb-2">
					Set Reminder Time
				</Text>
				<Text className="text-zinc-400 text-lg mb-10">
					When should we send the daily reminder?
				</Text>

				{/* hour and minute inputs side by side */}
				<View className="flex-row items-center justify-center gap-6">
					<TextInput
						className="bg-zinc-900 text-white text-6xl font-semibold text-center rounded-3xl w-36 border-2 border-zinc-700 focus:border-accent-500"
						value={reminder.tempHour}
						onChangeText={(text) =>
							reminder.setTempHour(text.replace(/[^0-9]/g, "").slice(0, 2))
						}
						keyboardType="number-pad"
						maxLength={2}
						placeholder="18"
						placeholderTextColor="#52525b"
					/>

					<Text className="text-6xl text-zinc-400 font-light">:</Text>

					<TextInput
						className="bg-zinc-900 text-white text-6xl font-semibold text-center rounded-3xl w-36 border-2 border-zinc-700 focus:border-accent-500"
						value={reminder.tempMinute}
						onChangeText={(text) =>
							reminder.setTempMinute(text.replace(/[^0-9]/g, "").slice(0, 2))
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

				{/* Cancel and Save buttons at the bottom */}
				<View className="flex-row gap-4 pb-8">
					<View className="flex-1">
						<Button
							title="Cancel"
							size="large"
							variant="outline"
							onPress={reminder.closeModal}
						/>
					</View>
					<View className="flex-1">
						<Button
							title="Save"
							size="large"
							variant="primary"
							onPress={reminder.saveTime}
						/>
					</View>
				</View>
			</View>
		</ModalView>
	);
}

/**
 * ChangePasswordModal
 *
 * Modal for changing the user's password.
 * Has two secure inputs (new password + confirm) and a loading state on submit.
 */
export function ChangePasswordModal({ password }: ChangePasswordModalProps) {
	return (
		<ModalView
			visible={password.visible}
			onRequestClose={password.close}
			height="45%"
		>
			<View className="flex-1">
				<Text className="text-white text-3xl font-bold mb-3">
					Change password
				</Text>
				<Text className="text-zinc-400 text-lg mb-8">
					Enter your new password.
				</Text>

				<Text className="text-zinc-400 text-base mb-2 ml-1">New password</Text>
				<TextInput
					className="bg-zinc-900 text-white p-5 rounded-2xl text-lg border border-zinc-700 focus:border-zinc-500"
					placeholder="••••••••"
					placeholderTextColor="#71717a"
					secureTextEntry
					autoCapitalize="none"
					value={password.newPassword}
					onChangeText={password.setNewPassword}
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
					value={password.confirmPassword}
					onChangeText={password.setConfirmPassword}
				/>

				<View className="flex-1" />

				{/* Confirm and Cancel buttons with loading state */}
				<View className="flex-row gap-3">
					<View className="flex-1">
						<Button
							title={password.loading ? "Confirming..." : "Confirm"}
							size="large"
							variant="primary"
							onPress={password.submit}
							disabled={password.loading}
						/>
					</View>
					<View className="flex-1">
						<Button
							title="Cancel"
							size="large"
							variant="outline"
							onPress={password.close}
							disabled={password.loading}
						/>
					</View>
				</View>
			</View>
		</ModalView>
	);
}

/**
 * DeleteAccountModal
 *
 * Two-step modal for deleting the account.
 * Step 1: confirm email
 * Step 2: enter password to confirm deletion
 */
export function DeleteAccountModal({ deleteAccount }: DeleteAccountModalProps) {
	return (
		<ModalView
			visible={deleteAccount.visible}
			onRequestClose={deleteAccount.reset}
			height="40%"
		>
			<View className="flex-1">
				{/* STEP 1: confirm email */}
				{deleteAccount.step === 1 && (
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
							{deleteAccount.userEmail}
						</Text>

						<TextInput
							className="bg-zinc-900 text-white p-5 rounded-2xl text-lg border border-zinc-700 focus:border-zinc-500"
							placeholder="your@email.com"
							placeholderTextColor="#71717a"
							value={deleteAccount.confirmEmail}
							onChangeText={deleteAccount.setConfirmEmail}
							autoCapitalize="none"
							keyboardType="email-address"
						/>

						<View className="flex-1" />

						<View className="flex-row gap-3">
							<View className="flex-1">
								<Button
									title="Continue"
									size="large"
									variant="primary"
									onPress={deleteAccount.submit}
								/>
							</View>
							<View className="flex-1">
								<Button
									title="Cancel"
									size="large"
									variant="outline"
									onPress={deleteAccount.reset}
								/>
							</View>
						</View>
					</>
				)}

				{/* STEP 2: confirm with password */}
				{deleteAccount.step === 2 && (
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
							value={deleteAccount.password}
							onChangeText={deleteAccount.setPassword}
						/>

						<View className="flex-1" />

						<View className="flex-row gap-3">
							<View className="flex-1">
								<Button
									title={
										deleteAccount.loading ? "Deleting Account..." : "Confirm"
									}
									size="large"
									variant="primary"
									onPress={deleteAccount.submit}
									disabled={deleteAccount.loading}
								/>
							</View>
							<View className="flex-1">
								<Button
									title="Cancel"
									size="large"
									variant="outline"
									onPress={deleteAccount.reset}
									disabled={deleteAccount.loading}
								/>
							</View>
						</View>
					</>
				)}
			</View>
		</ModalView>
	);
}
