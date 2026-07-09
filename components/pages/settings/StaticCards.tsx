import Card from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

/**
 * ContactCard component.
 *
 * Shows a simple card in settings with a single action to report bugs.
 * Uses the shared Card UI primitive and expo-router for navigation.
 * Keeps the UI consistent with other settings sections.
 */
export function ContactCard() {
	// Get the router instance so we can navigate to other screens
	const router = useRouter();

	return (
		<Card className="p-6">
			{/* Section label for this card */}
			<Text className="text-zinc-400 text-sm mb-4">Contact</Text>

			{/* Touchable row that navigates to the report-bug screen */}
			<TouchableOpacity
				onPress={() => router.push("/(tabs)/report-bug")}
				className="flex-row items-center justify-between py-4"
				activeOpacity={0.85}
			>
				<Text className="text-white text-lg font-semibold">Report a bug</Text>
				{/* Chevron icon on the right to indicate it's tappable */}
				<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
			</TouchableOpacity>
		</Card>
	);
}

/**
 * LegalCard component.
 *
 * Displays links to Privacy Policy and Terms of Service.
 * Separated into its own card for clean visual grouping in settings.
 * Uses a thin divider line between the two options.
 */
export function LegalCard() {
	// Get the router instance so we can navigate to other screens
	const router = useRouter();

	return (
		<Card className="p-6">
			{/* Section label for this card */}
			<Text className="text-zinc-400 text-sm mb-4">Legal</Text>

			{/* First legal link: Privacy Policy */}
			<TouchableOpacity
				onPress={() => router.push("/privacy")}
				className="flex-row items-center justify-between py-4"
				activeOpacity={0.85}
			>
				<Text className="text-white text-lg font-semibold">Privacy Policy</Text>
				{/* Chevron icon on the right to indicate it's tappable */}
				<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
			</TouchableOpacity>

			{/* Thin horizontal divider between the two legal links */}
			<View className="h-px bg-zinc-800" />

			{/* Second legal link: Terms of Service */}
			<TouchableOpacity
				onPress={() => router.push("/terms")}
				className="flex-row items-center justify-between py-4"
				activeOpacity={0.85}
			>
				<Text className="text-white text-lg font-semibold">
					Terms of Service
				</Text>
				{/* Chevron icon on the right to indicate it's tappable */}
				<Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
			</TouchableOpacity>
		</Card>
	);
}
