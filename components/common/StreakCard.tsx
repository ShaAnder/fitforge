import { useAccent } from "@/hooks/useAccent";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import Card from "../ui/Card";

interface StreakCardProps {
	// Current streak count (number of days in a row)
	streak: number;
}

/**
 * StreakCard Component.
 *
 * Prominently displays the user's current training streak with a large number
 * and flame icon. Used on the Dashboard to motivate consistent training.
 */
export default function StreakCard({ streak }: StreakCardProps) {
	const accent = useAccent();

	return (
		<Card className="p-8 items-center">
			{/* Streak Label */}
			<Text
				className={`${accent.text400} uppercase tracking-widest text-sm font-medium`}
			>
				Current Streak
			</Text>

			{/* Large Streak Number + Flame Icon */}
			<View className="flex-row items-center mt-6">
				<Text className="text-8xl font-bold text-white">{streak}</Text>
				<Ionicons
					name="flame"
					size={52}
					color="#eab308"
					style={{ marginLeft: 16 }}
				/>
			</View>

			{/* Subtitle */}
			<Text className="text-zinc-400 text-xl mt-2">days in a row</Text>
		</Card>
	);
}
