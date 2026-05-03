import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type AuthLinkProps = {
	to:
		| "/login"
		| "/signup"
		| "/forgot-password"
		| "/resend-verification"
		| string;
	children: string;
	prefix?: string;
	className?: string;
};

export default function AuthLink({
	to,
	children,
	prefix = "Back to",
	className = "mt-8",
}: AuthLinkProps) {
	const router = useRouter();

	return (
		<View className={`${className} flex-row justify-center items-center gap-1`}>
			{prefix && <Text className="text-zinc-400">{prefix}</Text>}

			<TouchableOpacity
				onPress={() => router.replace(to as any)}
				className="active:opacity-70"
			>
				<Text className="text-emerald-500 font-medium">{children}</Text>
			</TouchableOpacity>
		</View>
	);
}
