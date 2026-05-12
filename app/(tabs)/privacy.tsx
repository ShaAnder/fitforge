import TabScreen from "@/components/layout/TabScreen";
import { PRIVACY } from "@/constants/legal";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Privacy Screen - Static legal page.
 *
 * Displays the app's privacy policy using content from the centralized
 * constants file. Renders intro text and structured sections.
 */
export default function PrivacyScreen() {
	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			<TabScreen title="Privacy" subtitle={`Updated ${PRIVACY.updated}`}>
				<View className="gap-6">
					{/* Introduction paragraphs */}
					{PRIVACY.intro?.map((p, i) => (
						<Text
							key={`${i}-${p}`}
							className="text-zinc-300 text-base leading-6"
						>
							{p}
						</Text>
					))}

					{/* Policy sections */}
					{PRIVACY.sections.map((section) => (
						<View key={section.heading} className="gap-2">
							<Text className="text-white text-xl font-bold">
								{section.heading}
							</Text>

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
