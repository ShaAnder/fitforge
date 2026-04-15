import { Text, View } from "react-native";
import Card from "../ui/Card";

interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	progress?: number;
}

export default function StatCard({
	title,
	value,
	subtitle,
	progress,
}: StatCardProps) {
	return (
		<Card className="p-6 flex-1">
			<Text className="text-emerald-400 text-xs font-medium">{title}</Text>

			<Text className="text-5xl font-bold text-white mt-4">
				{value}
				{subtitle && (
					<Text className="text-2xl text-zinc-500"> {subtitle}</Text>
				)}
			</Text>

			{progress !== undefined && (
				<View className="h-2 bg-zinc-800 rounded-full mt-6 overflow-hidden">
					<View
						className="h-2 bg-emerald-500 rounded-full"
						style={{ width: `${progress}%` }}
					/>
				</View>
			)}
		</Card>
	);
}
