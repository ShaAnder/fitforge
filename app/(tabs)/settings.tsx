import TabScreen from "@/components/layout/TabScreen";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import { ACCENT_LIST, AccentKey, getAccentPreset } from "@/constants/accents";

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
				<Ionicons name="checkmark-circle" size={24} color="#22c55e" />
			) : (
				<Ionicons name="ellipse-outline" size={22} color="#52525b" />
			)}
		</TouchableOpacity>
	);
}

export default function SettingsScreen() {
	const router = useRouter();
	const { user, profile, updateProfile } = useAuth();

	const accentPreset = getAccentPreset(profile?.accent);
	const currentAccent = accentPreset.key;

	const setAccent = async (key: AccentKey) => {
		await updateProfile({ accent: key });
	};

	const displayName =
		(profile?.username as string | undefined) ||
		user?.email?.split("@")[0] ||
		"User";

	return (
		<TabScreen title="Settings" subtitle="Preferences">
			<View className="gap-6">
				<Card className="p-6">
					<Text className="text-zinc-400 text-sm mb-4">Appearance</Text>

					{ACCENT_LIST.map((a, idx, arr) => (
						<View key={a.key}>
							<AccentRow
								label={a.label}
								hex={a.hex500}
								selected={currentAccent === a.key}
								onPress={() => setAccent(a.key)}
							/>
							{idx < arr.length - 1 ? (
								<View className="h-px bg-zinc-800" />
							) : null}
						</View>
					))}
				</Card>

				<Card className="p-6">
					<Text className="text-zinc-400 text-sm mb-4">Account</Text>
					<Text className="text-white text-xl font-bold">{displayName}</Text>
					{user?.email ? (
						<Text className="text-zinc-400 text-sm mt-2">{user.email}</Text>
					) : null}
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
			</View>
		</TabScreen>
	);
}
