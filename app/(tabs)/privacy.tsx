import TabScreen from "@/components/layout/TabScreen";
import { PRIVACY } from "@/constants/legal";
import { Text, View } from "react-native";

export default function PrivacyScreen() {
	return (
		<TabScreen title="Privacy" subtitle={`Updated ${PRIVACY.updated}`}>
			<View className="gap-6">
				{PRIVACY.intro?.map((p, i) => (
					<Text key={`${i}-${p}`} className="text-zinc-300 text-base leading-6">
						{p}
					</Text>
				))}

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
	);
}
