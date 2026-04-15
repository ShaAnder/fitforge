import { Text, View } from "react-native";
import Card from "../ui/Card";

interface StreakCardProps {
	streak: number;
}

export default function StreakCard({ streak }: StreakCardProps) {
	return (
		<Card className="p-10 items-center">
			<Text className="text-emerald-400 uppercase tracking-widest text-sm font-medium">
				Current Streak
			</Text>

			<View className="flex-row items-center mt-6">
				<Text className="text-8xl font-bold text-white">{streak}</Text>
				<Text className="text-6xl ml-4">🔥</Text>
			</View>

			<Text className="text-zinc-400 text-xl mt-2">days in a row</Text>
		</Card>
	);
}
