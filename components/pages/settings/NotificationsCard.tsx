import Card from "@/components/ui/Card";
import { getAccentPreset } from "@/constants/accents";
import { REMINDER_CONFIG, formatReminderTime } from "@/constants/reminders";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { Profile } from "@/types";
import { Switch, Text, TouchableOpacity, View } from "react-native";

interface NotificationsCardProps {
	reminder: ReturnType<typeof useReminderSettings>;
	profile: Profile | null;
}

export function NotificationsCard({
	reminder,
	profile,
}: NotificationsCardProps) {
	const accentPreset = getAccentPreset(profile?.accent);

	return (
		<Card className="p-6">
			<Text className="text-zinc-400 text-sm mb-4">Notifications</Text>

			<ReminderRow
				reminderKey="workout"
				enabled={reminder.workoutReminderEnabled}
				time={reminder.workoutTime}
				loading={reminder.notificationsLoading}
				accentHex={accentPreset.hex500}
				onSetTime={() => reminder.openModal("workout")}
				onToggle={(value) =>
					reminder.setDailyReminder(
						"workout",
						value,
						reminder.setWorkoutReminderEnabled,
					)
				}
			/>

			<View className="h-px bg-zinc-800 my-3" />

			<ReminderRow
				reminderKey="streak"
				enabled={reminder.streakReminderEnabled}
				time={reminder.streakTime}
				loading={reminder.notificationsLoading}
				accentHex={accentPreset.hex500}
				onSetTime={() => reminder.openModal("streak")}
				onToggle={(value) =>
					reminder.setDailyReminder(
						"streak",
						value,
						reminder.setStreakReminderEnabled,
					)
				}
			/>
		</Card>
	);
}

interface ReminderRowProps {
	reminderKey: "workout" | "streak";
	enabled: boolean;
	time: string;
	loading: boolean;
	accentHex: string;
	onSetTime: () => void;
	onToggle: (value: boolean) => void;
}

function ReminderRow({
	reminderKey,
	enabled,
	time,
	loading,
	accentHex,
	onSetTime,
	onToggle,
}: ReminderRowProps) {
	const config = REMINDER_CONFIG[reminderKey];

	return (
		<View className="py-3">
			<View className="flex-row items-start justify-between gap-4">
				<View className="flex-1 pr-4">
					<Text className="text-white text-base font-semibold">
						{config.label}
					</Text>
					<Text className="text-zinc-400 text-sm mt-1">
						{config.description}
					</Text>
					<Text className="text-zinc-500 text-xs mt-3">
						Time: {formatReminderTime(time)}
					</Text>
				</View>
				<View className="items-end gap-3">
					<TouchableOpacity
						onPress={onSetTime}
						className="px-4 py-2 rounded-2xl border border-zinc-700 bg-zinc-900"
					>
						<Text className="text-white font-semibold">Set time</Text>
					</TouchableOpacity>
					<Switch
						value={enabled}
						disabled={loading}
						onValueChange={onToggle}
						trackColor={{ false: "#3f3f46", true: accentHex }}
						thumbColor="#ffffff"
					/>
				</View>
			</View>
		</View>
	);
}
