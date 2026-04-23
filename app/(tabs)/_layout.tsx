// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";

import NavDrawer from "@/components/ui/NavDrawer";

export default function TabLayout() {
	const [drawerVisible, setDrawerVisible] = useState(false);

	return (
		<>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarShowLabel: false,

					tabBarStyle: {
						backgroundColor: "#18181b",
						borderTopColor: "#27272a",
						height: 78,
						paddingBottom: 10,
						paddingTop: 8,
					},

					tabBarActiveTintColor: "#ffffff",
					tabBarInactiveTintColor: "#a1a1aa",
				}}
			>
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

				{/* 3-Dot More - Pure custom button, NO route */}
				<Tabs.Screen
					name="more" // Leading underscore tells Expo Router to ignore this as a real route
					options={{
						tabBarIcon: ({ color }) => (
							<Ionicons name="ellipsis-horizontal" size={28} color={color} />
						),
						tabBarButton: ({ children, style }) => (
							<Pressable style={style} onPress={() => setDrawerVisible(true)}>
								{children}
							</Pressable>
						),
					}}
				/>

				{/* Hidden screens */}
				<Tabs.Screen name="index" options={{ href: null }} />
				<Tabs.Screen name="profile" options={{ href: null }} />
			</Tabs>

			{/* Clean Modal Drawer with Click Outside to Close */}
			<Modal
				visible={drawerVisible}
				animationType="slide"
				transparent
				onRequestClose={() => setDrawerVisible(false)}
			>
				<View
					className="flex-1 bg-black/70 justify-end"
					onStartShouldSetResponder={() => true} // Enables touch handling
					onResponderRelease={(e) => {
						// If user taps on the overlay (not on the drawer content), close it
						if (e.target === e.currentTarget) {
							setDrawerVisible(false);
						}
					}}
				>
					<View className="bg-zinc-900 rounded-t-3xl min-h-[65%] p-6">
						<NavDrawer
							isOpen={drawerVisible}
							onClose={() => setDrawerVisible(false)}
						/>
					</View>
				</View>
			</Modal>
		</>
	);
}
