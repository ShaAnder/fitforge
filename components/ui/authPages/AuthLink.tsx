import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

import { useAccent } from "@/hooks/useAccent";

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

/**
 * AuthLink Component.
 *
 * Reusable styled link for authentication screens.
 * Provides consistent "Back to..." navigation with accent color.
 */
export default function AuthLink({
	to,
	children,
	prefix = "Back to",
	className = "mt-8",
}: AuthLinkProps) {
	const router = useRouter();
	const accent = useAccent();

	return (
		<View className={`${className} flex-row justify-center items-center gap-1`}>
			{/* Optional prefix text (e.g. "Already have an account?") */}
			{prefix && <Text className="text-zinc-400">{prefix}</Text>}

			{/* Clickable link text */}
			<TouchableOpacity
				onPress={() => router.replace(to as any)}
				className="active:opacity-70"
			>
				<Text className={`${accent.text500} font-medium`}>{children}</Text>
			</TouchableOpacity>
		</View>
	);
}
