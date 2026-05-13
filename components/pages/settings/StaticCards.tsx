import Card from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export function ContactCard() {
	const router = useRouter();

	return (
		<Card className="p-6">
			<Text className="text-zinc-400 text-sm mb-4">Contact</Text>
			<TouchableOpacity
				// TODO: Improve typed routes when report-bug screen is built
				onPress={() => router.push("/(tabs)/report-bug" as any)}
				className="flex-row items-center justify-between py-4"
				activeOpacity={0.85}
			>
				<Text className="text-white text-lg font-semibold">Report a bug</Text>
				<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
			</TouchableOpacity>
		</Card>
	);
}

export function LegalCard() {
	const router = useRouter();

	return (
		<Card className="p-6">
			<Text className="text-zinc-400 text-sm mb-4">Legal</Text>

			<TouchableOpacity
				onPress={() => router.push("/privacy")}
				className="flex-row items-center justify-between py-4"
				activeOpacity={0.85}
			>
				<Text className="text-white text-lg font-semibold">Privacy Policy</Text>
				<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
			</TouchableOpacity>

			<View className="h-px bg-zinc-800" />

			<TouchableOpacity
				onPress={() => router.push("/terms")}
				className="flex-row items-center justify-between py-4"
				activeOpacity={0.85}
			>
				<Text className="text-white text-lg font-semibold">Terms of Service</Text>
				<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
			</TouchableOpacity>
		</Card>
	);
}
