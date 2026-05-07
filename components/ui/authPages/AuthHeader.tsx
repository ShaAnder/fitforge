import { Text, View } from "react-native";

type AuthHeaderProps = {
	title: string;
	subtitle?: string;
};

/**
 * AuthHeader Component.
 *
 * Reusable header for all authentication screens (Login, Signup, Forgot Password, etc.).
 * Provides consistent large branding and optional subtitle.
 */
export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
	return (
		<View className="mb-6 items-center">
			{/* Main Title - Large and prominent */}
			<Text className="text-white text-5xl font-bold tracking-tighter">
				{title}
			</Text>

			{/* Optional Subtitle - Smaller helper text */}
			{subtitle && (
				<Text className="text-zinc-400 text-lg mt-3 text-center">
					{subtitle}
				</Text>
			)}
		</View>
	);
}
