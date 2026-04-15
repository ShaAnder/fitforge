// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

// Main tab layout, this will act as our navigation bar
export default function TabLayout() {
	return (
		<Tabs
			// options and additional styling, tailwind not accepted here so we're just using our theeme colors hard coded for now
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,

				tabBarStyle: {
					backgroundColor: "#18181b",
					borderTopColor: "#27272a",
					// Extra height for bigger button
					height: 78,
					paddingBottom: 10,
					paddingTop: 8,
				},

				tabBarActiveTintColor: "#ffffff",
				tabBarInactiveTintColor: "#a1a1aa",
			}}
		>
			{/* Tab screens each add a button that will let us navigate to the current tab we are using. */}
			<Tabs.Screen
				name="dashboard"
				options={{
					tabBarIcon: ({ color }) => (
						<Ionicons name="home-outline" size={28} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="library"
				options={{
					tabBarIcon: ({ color }) => (
						<Ionicons name="barbell-outline" size={28} color={color} />
					),
				}}
			/>

			{/* Log Workout - Bigger & Prominent */}
			<Tabs.Screen
				name="log-workout"
				options={{
					tabBarIcon: () => (
						<View className="-mt-11 items-center">
							<View className="bg-[#18181b] w-[88px] h-[88px] rounded-full items-center justify-center -mb-8 shadow-2xl">
								<View className="bg-zinc-900 w-[72px] h-[72px] rounded-full items-center justify-center border border-emerald-500/20">
									<Ionicons
										name="add-circle-outline"
										size={48}
										color="#22c55e"
									/>
								</View>
							</View>
						</View>
					),
				}}
			/>

			<Tabs.Screen
				name="history"
				options={{
					tabBarIcon: ({ color }) => (
						<Ionicons name="calendar-outline" size={28} color={color} />
					),
				}}
			/>

			<Tabs.Screen
				name="profile"
				options={{
					tabBarIcon: ({ color }) => (
						<Ionicons name="person-outline" size={28} color={color} />
					),
				}}
			/>

			<Tabs.Screen name="index" options={{ href: null }} />
		</Tabs>
	);
}
