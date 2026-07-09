import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";

import NavDrawer from "@/components/ui/NavDrawer";
import { useAccent } from "@/hooks/useAccent";
import {
	initialWindowMetrics,
	SafeAreaProvider,
	useSafeAreaInsets,
} from "react-native-safe-area-context";

/**
 * Main Tab Layout for the app.
 *
 * Configures bottom tab navigation with 5 tabs + custom center "Log Workout" button.
 * Includes a slide-up modal drawer for "More" options.
 */
export default function TabLayout() {
	const [drawerVisible, setDrawerVisible] = useState(false);
	const accent = useAccent();
	const insets = useSafeAreaInsets();

	return (
		<>
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				<Tabs
					screenOptions={{
						headerShown: false,
						tabBarShowLabel: false,

						tabBarStyle: {
							backgroundColor: "#18181b",
							borderTopColor: "#27272a",
							height: 78 + insets.bottom,
							paddingBottom: 10 + insets.bottom,
							paddingTop: 8,
						},

						tabBarActiveTintColor: "#ffffff",
						tabBarInactiveTintColor: "#a1a1aa",
					}}
				>
					{/* Dashboard tab */}
					<Tabs.Screen
						name="dashboard"
						options={{
							tabBarIcon: ({ color }) => (
								<Ionicons name="home-outline" size={28} color={color} />
							),
						}}
					/>

					{/* Exercise Library tab */}
					<Tabs.Screen
						name="library"
						options={{
							tabBarIcon: ({ color }) => (
								<Ionicons name="barbell-outline" size={28} color={color} />
							),
						}}
					/>

					{/* Custom floating "Log Workout" button in the center */}
					<Tabs.Screen
						name="log-workout"
						options={{
							tabBarIcon: () => (
								<View className="-mt-11 items-center">
									<View className="bg-[#18181b] w-[88px] h-[88px] rounded-full items-center justify-center -mb-8 shadow-2xl">
										<View
											className={`bg-zinc-900 w-[72px] h-[72px] rounded-full items-center justify-center border ${accent.border500_20}`}
										>
											<Ionicons
												name="add-circle-outline"
												size={48}
												color={accent.hex500}
											/>
										</View>
									</View>
								</View>
							),
						}}
					/>

					{/* History tab */}
					<Tabs.Screen
						name="history"
						options={{
							tabBarIcon: ({ color }) => (
								<Ionicons name="calendar-outline" size={28} color={color} />
							),
						}}
					/>

					{/* More button - triggers custom drawer instead of normal tab navigation */}
					<Tabs.Screen
						name="more"
						options={{
							tabBarIcon: ({ color }) => (
								<Ionicons name="ellipsis-horizontal" size={28} color={color} />
							),
							// Custom press handler to open drawer instead of navigating
							tabBarButton: ({ children, style }) => (
								<Pressable style={style} onPress={() => setDrawerVisible(true)}>
									{children}
								</Pressable>
							),
						}}
					/>

					{/* Hidden screens - not shown in tab bar (accessed via navigation) */}
					<Tabs.Screen name="index" options={{ href: null }} />
					<Tabs.Screen name="profile" options={{ href: null }} />
					<Tabs.Screen name="privacy" options={{ href: null }} />
					<Tabs.Screen name="terms" options={{ href: null }} />
					<Tabs.Screen name="settings" options={{ href: null }} />
					<Tabs.Screen name="report-bug" options={{ href: null }} />
					<Tabs.Screen name="achievements" options={{ href: null }} />
					<Tabs.Screen name="community" options={{ href: null }} />
				</Tabs>

				{/* Slide-up Modal Drawer for "More" options */}
				<Modal
					visible={drawerVisible}
					animationType="slide"
					transparent
					onRequestClose={() => setDrawerVisible(false)}
				>
					{/* Background overlay - tap anywhere to close the drawer */}
					<Pressable
						className="flex-1 bg-black/70 justify-end"
						onPress={() => setDrawerVisible(false)}
					>
						{/* Drawer content container - prevents closing when tapping inside */}
						<Pressable
							onPress={(e) => e.stopPropagation()}
							style={{ height: "70%" }}
							className="w-full"
						>
							<NavDrawer
								isOpen={drawerVisible}
								onClose={() => setDrawerVisible(false)}
							/>
						</Pressable>
					</Pressable>
				</Modal>
			</SafeAreaProvider>
		</>
	);
}
