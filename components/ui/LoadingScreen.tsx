import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

type LoadingScreenProps = {
	message?: string;
	subMessage?: string;
	showBrand?: boolean;
	size?: "small" | "large";
	fullScreen?: boolean;
};

export default function LoadingScreen({
	message = "Loading exercises...",
	subMessage = "Please wait",
	showBrand = true,
	size = "large",
	fullScreen = true,
}: LoadingScreenProps) {
	return (
		<View
			className={`items-center justify-center ${fullScreen ? "flex-1 bg-zinc-950" : ""}`}
		>
			<View className="items-center">
				{/* Brand Logo */}
				{showBrand && (
					<View className="mb-8">
						<Ionicons name="barbell" size={72} color="#22c55e" />
					</View>
				)}

				{/* Main Title (only on full screen) */}
				{showBrand && fullScreen && (
					<>
						<Text className="text-white text-4xl font-bold tracking-tighter mb-1">
							FitForge
						</Text>
						<Text className="text-zinc-400 text-lg mb-10">
							Getting ready for you...
						</Text>
					</>
				)}

				{/* Spinner */}
				<ActivityIndicator size={size} color="#22c55e" />

				{/* Messages */}
				<Text className="text-zinc-400 text-base font-medium mt-6 text-center">
					{message}
				</Text>

				{subMessage && (
					<Text className="text-zinc-500 text-sm mt-2">{subMessage}</Text>
				)}
			</View>
		</View>
	);
}
