import TabScreen from "@/components/layout/TabScreen";
import { TERMS } from "@/constants/legal";
import { Text, View } from "react-native";

export default function TermsScreen() {
	return (
		<TabScreen title="Terms" subtitle={`Updated ${TERMS.updated}`}>
			<View className="gap-6">
				{TERMS.intro?.map((p, i) => (
					<Text key={`${i}-${p}`} className="text-zinc-300 text-base leading-6">
						{p}
					</Text>
				))}

				{TERMS.sections.map((section) => (
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
