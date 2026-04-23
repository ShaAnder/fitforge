import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
	/** Main title text (defaults to "FitForge") */
	title?: string;

	/** Optional subtitle text displayed below the title */
	subtitle?: string;

	/** Called when the profile icon is pressed */
	onProfilePress?: () => void;

	/** logo bool to determine if we render logo or not */
	flameIcon?: boolean;
}

/**
 * Header - Reusable header for main screens.
 *
 * - Flame icon on the left next to "FitForge"
 * - Profile icon on the right (clickable)
 */
/**
 * Header - Reusable header for main screens.
 *
 * - Flame icon + "FitForge" on the left
 * - Profile icon (placeholder for user profile picture) on the right
 */
export default function Header({
	title = "FitForge",
	subtitle,
	onProfilePress,
	flameIcon = true,
}: HeaderProps) {
	return (
		<View className="mb-10">
			<View className="flex-row justify-between items-center">
				{/* Left: Flame + Title */}
				<View className="flex-row items-center gap-3">
					{flameIcon && <Ionicons name="flame" size={36} color="#eab308" />}

					<Text className="text-4xl font-bold text-white tracking-tighter">
						{title}
					</Text>
				</View>

				{/* Right: Profile Picture / Icon */}
				{onProfilePress && (
					<TouchableOpacity onPress={onProfilePress} className="p-1">
						{/* TODO: Replace Ionicons with actual user profile picture */}
						<Ionicons name="person-circle-outline" size={34} color="#22c55e" />
					</TouchableOpacity>
				)}
			</View>

			{subtitle && (
				<Text className="text-zinc-400 text-base mt-1 ml-1">{subtitle}</Text>
			)}
		</View>
	);
}
