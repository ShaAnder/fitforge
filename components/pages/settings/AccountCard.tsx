import Card from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface AccountCardProps {
	displayName: string;
	email: string | undefined;
	onChangePassword: () => void;
	onDeleteAccount: () => void;
}

/**
 * AccountCard Component
 *
 * Shows the logged-in user's basic info and quick links
 * to edit profile, change password, and delete account.
 */
export function AccountCard({
	displayName,
	email,
	onChangePassword,
	onDeleteAccount,
}: AccountCardProps) {
	const router = useRouter();

	return (
		<Card className="p-6">
			{/* section label */}
			<Text className="text-zinc-400 text-sm mb-4">Account</Text>

			{/* user's display name */}
			<Text className="text-white text-xl font-bold">{displayName}</Text>

			{/* show email only if it exists */}
			{email ? (
				<Text className="text-zinc-400 text-sm mt-2">{email}</Text>
			) : null}

			{/* separator line */}
			<View className="h-px bg-zinc-800 my-5" />

			{/* Edit profile row */}
			<TouchableOpacity
				onPress={() => router.push("/(tabs)/profile?edit=1")}
				className="flex-row items-center justify-between py-4"
				activeOpacity={0.85}
			>
				<Text className="text-white text-lg font-semibold">Edit profile</Text>
				<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
			</TouchableOpacity>

			<View className="h-px bg-zinc-800" />

			{/* Change password row */}
			<TouchableOpacity
				onPress={onChangePassword}
				className="flex-row items-center justify-between py-4"
				activeOpacity={0.85}
			>
				<Text className="text-white text-lg font-semibold">
					Change password
				</Text>
				<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
			</TouchableOpacity>

			<View className="h-px bg-zinc-800" />

			{/* Delete account row (styled in red to signal danger) */}
			<TouchableOpacity
				onPress={onDeleteAccount}
				className="flex-row items-center justify-between py-4"
				activeOpacity={0.85}
			>
				<Text className="text-red-400 text-lg font-semibold">
					Delete account
				</Text>
				<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
			</TouchableOpacity>
		</Card>
	);
}
