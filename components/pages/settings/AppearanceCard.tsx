import Card from "@/components/ui/Card";
import { ACCENT_LIST, AccentKey, getAccentPreset } from "@/constants/accents";
import { Profile } from "@/types";
import { Text, TouchableOpacity, View } from "react-native";

interface AppearanceCardProps {
	profile: Profile | null;
	updateProfile: (data: Partial<Profile>) => Promise<void>;
}

/**
 * AppearanceCard Component
 *
 * Lets the user pick their accent color.
 * Shows a row of color circles and updates the profile when one is tapped.
 */
export function AppearanceCard({
	profile,
	updateProfile,
}: AppearanceCardProps) {
	// get the current accent preset based on what's saved in the profile
	const accentPreset = getAccentPreset(profile?.accent);
	const currentAccent = accentPreset.key;

	const setAccent = async (key: AccentKey) => {
		// update the profile with the new accent key
		await updateProfile({ accent: key });
	};

	return (
		<Card className="p-6">
			<Text className="text-zinc-400 text-sm mb-4">Appearance</Text>

			{/* horizontal row of color swatches */}
			<View className="flex-row items-center justify-between">
				{ACCENT_LIST.map((a) => {
					const selected = currentAccent === a.key;
					return (
						<TouchableOpacity
							key={a.key}
							onPress={() => setAccent(a.key)}
							activeOpacity={0.85}
							style={{
								width: 34,
								height: 34,
								borderRadius: 999,
								backgroundColor: a.hex500,
								// show a white border when this color is currently selected
								borderWidth: selected ? 3 : 0,
								borderColor: selected ? "#fff" : "transparent",
							}}
						/>
					);
				})}
			</View>
		</Card>
	);
}
