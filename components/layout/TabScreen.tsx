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
 * Provides:
 * - Consistent top padding for devices with notches/dynamic islands
 * - Standardized Header with profile icon
 * - ScrollView for content with proper bottom padding
 * - Optional fixed footer that stays at the bottom (does not scroll)
 *
 * Usage:
 * <TabScreen title="Log Workout" subtitle="Today's Session" footer={<SaveButton />}>
 *   ... content ...
 * </TabScreen>
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
			{/* Safe top padding for all devices (notch, dynamic island, etc.) */}
			<View className="pt-12" />

			{/* Consistent branded header across all tab screens */}
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

			{/* Fixed footer (e.g. Save Workout button) */}
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
