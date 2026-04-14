import { View, Text } from "react-native";

export default function Dashboard() {
	return (
		<View className="flex-1 bg-zinc-950 items-center justify-center">
			<Text className="text-white text-3xl font-bold">Dashboard</Text>
			<Text className="text-zinc-400 mt-4">Welcome to FitForge</Text>
		</View>
	);
}
