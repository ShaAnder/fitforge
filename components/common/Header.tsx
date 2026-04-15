import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface HeaderProps {
	title?: string;
	showFlame?: boolean;
	subtitle?: string;
}

export default function Header({
	title = "FitForge",
	showFlame = true,
	subtitle,
}: HeaderProps) {
	return (
		<View className="mb-10">
			<View className="flex-row justify-between items-center">
				<Text className="text-4xl font-bold text-white tracking-tighter">
					{title}
				</Text>

				{showFlame && <Ionicons name="flame" size={36} color="#eab308" />}
			</View>

			{subtitle && (
				<Text className="text-zinc-400 text-base mt-1">{subtitle}</Text>
			)}
		</View>
	);
}
