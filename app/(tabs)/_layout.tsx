import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

// here we will set our tab layout,
export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				// We must set this again because Tabs is a separate navigator
				headerShown: false,

				// Icon-only tabs
				tabBarShowLabel: false,

				// Tab bar styling
				tabBarStyle: {
					backgroundColor: "#18181b",
					borderTopColor: "#27272a",
					height: 64,
				},
				tabBarActiveTintColor: "#22c55e",
				tabBarInactiveTintColor: "#a1a1aa",
			}}
		>
			<Tabs.Screen
				name="dashboard"
				options={{
					title: "Dashboard",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home-outline" size={size + 2} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="library"
				options={{
					title: "Library",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="barbell-outline" size={size + 2} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="log-workout"
				options={{
					title: "Log Workout",
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name="add-circle-outline"
							size={size + 20}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="history"
				options={{
					title: "History",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="calendar-outline" size={size + 2} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person-outline" size={size + 2} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
