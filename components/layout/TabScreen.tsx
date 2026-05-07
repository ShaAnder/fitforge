import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

import Header from "@/components/common/Header";

interface TabScreenProps {
	/** Main title shown in the header */
	title: string;
	/** Optional subtitle shown below the title */
	subtitle?: string;
	/** Main content of the screen */
	children: React.ReactNode;
	/** Optional fixed footer (e.g. Save button) that stays at the bottom */
	footer?: React.ReactNode;
}

/**
 * TabScreen - Reusable wrapper for all tab-based screens in FitForge.
 *
 * Provides consistent layout, safe area handling, branded header,
 * scrollable content area, and optional fixed footer across the app.
 */
export default function TabScreen({
	title,
	subtitle,
	children,
	footer,
}: TabScreenProps) {
	const router = useRouter();

	return (
		<View className="flex-1 bg-zinc-950">
			{/* Safe top padding for devices with notches, dynamic islands, or status bar */}
			<View className="pt-12" />

			{/* Consistent branded header with profile avatar across all tabs */}
			<Header
				title={title}
				subtitle={subtitle}
				onProfilePress={() => router.push("/(tabs)/profile")}
			/>

			{/* Scrollable main content area */}
			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 50 }}
			>
				{children}
			</ScrollView>

			{/* Fixed footer section (does not scroll with content) */}
			{footer && (
				<View
					className="px-5 mt-5 pb-8 bg-zinc-950"
					style={{ paddingBottom: 50 }}
				>
					{footer}
				</View>
			)}
		</View>
	);
}
