import { Text, View } from "react-native";

type AuthHeaderProps = {
	title: string;
	subtitle?: string;
};

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
	return (
		<View className="mb-6 items-center">
			<Text className="text-white text-5xl font-bold tracking-tighter">
				{title}
			</Text>
			{subtitle && (
				<Text className="text-zinc-400 text-lg mt-3 text-center">
					{subtitle}
				</Text>
			)}
		</View>
	);
}
