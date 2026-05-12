import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

import { useAccent } from "@/hooks/useAccent";

type LoadingScreenProps = {
	message?: string;
	subMessage?: string;
	showBrand?: boolean;
	size?: "small" | "large";
	fullScreen?: boolean;
};

/**
 * LoadingScreen Component.
 *
 * Reusable full-screen or inline loading state with branding,
 * spinner, and customizable messages. Used during auth, data fetching,
 * and initial app load.
 */
export default function LoadingScreen({
	message = "Loading exercises...",
	subMessage = "Please wait",
	showBrand = true,
	size = "large",
	fullScreen = true,
}: LoadingScreenProps) {
	const accent = useAccent();

	return (
		<View
			className={`items-center justify-center ${fullScreen ? "flex-1 bg-zinc-950" : ""}`}
		>
			<View key="loading-content" className="items-center">
				{/* Brand Logo - Optional */}
				{showBrand && (
					<View key="brand-logo" className="mb-8">
						<Ionicons name="barbell" size={72} color={accent.hex500} />
					</View>
				)}

				{/* App Name + Tagline - Only on full screen loading */}
				{showBrand && fullScreen && (
					<View key="brand-copy">
						<Text className="text-white text-4xl font-bold tracking-tighter mb-1">
							FitForge
						</Text>
						<Text className="text-zinc-400 text-lg mb-10">
							Getting ready for you...
						</Text>
					</View>
				)}

				{/* Loading Spinner */}
				<ActivityIndicator key="spinner" size={size} color={accent.hex500} />

				{/* Main Message */}
				<Text
					key="main-message"
					className="text-zinc-400 text-base font-medium mt-6 text-center"
				>
					{message}
				</Text>

				{/* Optional Sub Message */}
				{subMessage && (
					<Text key="sub-message" className="text-zinc-500 text-sm mt-2">
						{subMessage}
					</Text>
				)}
			</View>
		</View>
	);
}
