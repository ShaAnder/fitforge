import Avatar from "@/components/common/Avatar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

interface HeaderProps {
	title?: string;
	subtitle?: string;
	flameIcon?: boolean;
	onProfilePress?: () => void;
}

/**
 * Reusable App Header Component.
 *
 * Used across tab screens to provide consistent branding,
 * dynamic subtitle, and quick access to the profile.
 */
export default function Header({
	title = "FitForge",
	subtitle,
	flameIcon = true,
	onProfilePress,
}: HeaderProps) {
	const router = useRouter();

	return (
		<View className="mb-6 px-5">
			<View className="flex-row justify-between items-center">
				{/* LEFT SIDE: Logo / Title + Subtitle */}
				<View className="flex-row items-center gap-3">
					{/* Flame icon - optional branding element */}
					{flameIcon && <Ionicons name="flame" size={36} color="#eab308" />}

					<View>
						<Text className="text-4xl font-bold text-white tracking-tighter">
							{title}
						</Text>
						{subtitle && (
							<Text className="text-zinc-400 text-base -mt-1">{subtitle}</Text>
						)}
					</View>
				</View>

				{/* RIGHT SIDE: Profile Avatar */}
				<Avatar
					size={56}
					onPress={onProfilePress ?? (() => router.push("/(tabs)/profile"))}
				/>
			</View>
		</View>
	);
}
