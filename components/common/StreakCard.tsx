import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import Card from "../ui/Card";

interface StreakCardProps {
	// Current streak count (number of days in a row)
	streak: number;
}

/**
 * StreakCard component to prominently display the user's current streak.
 *
 * @param streak - Number of consecutive days trained
 */
export default function StreakCard({ streak }: StreakCardProps) {
	return (
		<Card className="p-10 items-center">
			{/* Streak Label */}
			<Text className="text-emerald-400 uppercase tracking-widest text-sm font-medium">
				Current Streak
			</Text>

			{/* Streak Number + Flame Icon */}
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
