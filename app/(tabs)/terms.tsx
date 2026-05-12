import TabScreen from "@/components/layout/TabScreen";
import { TERMS } from "@/constants/legal";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Terms of Service Screen - Static legal page.
 *
 * Displays the app's Terms of Service using centralized constants.
 * Renders intro text and structured sections with proper formatting.
 */
export default function TermsScreen() {
	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			<TabScreen title="Terms" subtitle={`Updated ${TERMS.updated}`}>
				<View className="gap-6">
					{/* Introduction / Overview paragraphs */}
					{TERMS.intro?.map((p, i) => (
						<Text
							key={`${i}-${p}`}
							className="text-zinc-300 text-base leading-6"
						>
							{p}
						</Text>
					))}

					{/* Main policy sections */}
					{TERMS.sections.map((section) => (
						<View key={section.heading} className="gap-2">
							{/* Section heading */}
							<Text className="text-white text-xl font-bold">
								{section.heading}
							</Text>

							{/* Section body lines */}
							{section.body.map((line, i) => (
								<Text
									key={`${section.heading}-${i}`}
									className="text-zinc-300 text-base leading-6"
								>
									{line}
								</Text>
							))}
						</View>
					))}
				</View>
			</TabScreen>
		</SafeAreaView>
	);
}
