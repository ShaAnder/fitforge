import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface HeaderProps {
	// Main title text (defaults to "FitForge")
	title?: string;
	// Whether to show the flame icon on the right (defaults to true)
	showFlame?: boolean;
	// Optional subtitle text displayed below the title
	subtitle?: string;
}

/**
 * App header component with title, optional flame icon, and subtitle.
 * Used primarily on screens like Dashboard.
 *
 * @param title      - Main heading text
 * @param showFlame  - Show flame icon on the right side
 * @param subtitle   - Optional smaller text below the title
 */
export default function Header({
	title = "FitForge",
	showFlame = true,
	subtitle,
}: HeaderProps) {
	return (
		<View className="mb-10">
			<View className="flex-row justify-between items-center">
				{/* Main Title */}
				<Text className="text-4xl font-bold text-white tracking-tighter">
					{title}
				</Text>

				{/* Flame Icon */}
				{showFlame && <Ionicons name="flame" size={36} color="#eab308" />}
			</View>

			{/* Subtitle - only rendered if provided */}
			{subtitle && (
				<Text className="text-zinc-400 text-base mt-1">{subtitle}</Text>
			)}
		</View>
	);
}
