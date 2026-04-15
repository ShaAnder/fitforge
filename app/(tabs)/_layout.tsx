import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,

				tabBarStyle: {
					backgroundColor: "#18181b",
					borderTopColor: "#27272a",
					height: 70,
					paddingBottom: 8,
					paddingTop: 8,
				},

				tabBarActiveTintColor: "#22c55e",
				tabBarInactiveTintColor: "#a1a1aa",
			}}
		>
			<Tabs.Screen
				name="dashboard"
				options={{
					title: "Dashboard",
					tabBarIcon: ({ color }) => (
						<Ionicons name="home-outline" size={28} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="library"
				options={{
					title: "Library",
					tabBarIcon: ({ color }) => (
						<Ionicons name="barbell-outline" size={28} color={color} />
					),
				}}
			/>

			{/* Log Workout - Large Floating Button */}
			<Tabs.Screen
				name="log-workout"
				options={{
					tabBarIcon: ({ color }) => (
						<View className="-mt-8 items-center">
							<View className="bg-[#18181b] w-20 h-20 rounded-full items-center justify-center -mb-6">
								<Ionicons name="add-circle-outline" size={52} color={color} />
							</View>
						</View>
					),
				}}
			/>

			<Tabs.Screen
				name="history"
				options={{
					title: "History",
					tabBarIcon: ({ color }) => (
						<Ionicons name="calendar-outline" size={28} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color }) => (
						<Ionicons name="person-outline" size={28} color={color} />
					),
				}}
			/>

			<Tabs.Screen name="index" options={{ href: null }} />
		</Tabs>
	);
}
