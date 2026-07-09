import Card from "@/components/ui/Card";
import { Profile } from "@/types";
import { Text, TouchableOpacity, View } from "react-native";

interface PreferencesCardProps {
	profile: Profile | null;
	updateProfile: (data: Partial<Profile>) => Promise<void>;
}

/**
 * PreferencesCard Component
 *
 * Lets the user choose their preferred units (kg/lb)
 * and which day the week should start on (Monday or Sunday).
 * Both choices are saved directly to the profile.
 */
export function PreferencesCard({
	profile,
	updateProfile,
}: PreferencesCardProps) {
	return (
		<Card className="p-6">
			<Text className="text-zinc-400 text-sm mb-4">Preferences</Text>

			{/* Units section */}
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

			{/* Week start section */}
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
	);
}
