import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

export function resolveAvatarUrl(
	avatarUrl: string | null | undefined,
): string | null {
	if (!avatarUrl) return null;

	const trimmed = avatarUrl.trim();
	if (!trimmed || trimmed.toLowerCase() === "null") return null;

	// Already a usable remote URL (public or signed)
	if (/^https?:\/\//i.test(trimmed)) return trimmed;

	const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").replace(
		/\/+$/,
		"",
	);
	if (!supabaseUrl) return null;

	// Accept a few common stored shapes:
	// - "userId-123.jpeg"
	// - "avatars/userId-123.jpeg"
	// - "storage/v1/object/public/avatars/userId-123.jpeg"
	let objectPath = trimmed.replace(/^\/+/, "");
	objectPath = objectPath.replace(
		/^storage\/v1\/object\/public\/avatars\//i,
		"",
	);
	objectPath = objectPath.replace(/^avatars\//i, "");

	const encoded = objectPath
		.split("/")
		.filter(Boolean)
		.map(encodeURIComponent)
		.join("/");

	if (!encoded) return null;

	return `${supabaseUrl}/storage/v1/object/public/avatars/${encoded}`;
}

interface AvatarProps {
	size?: number;
	borderColor?: string;
	borderWidth?: number;
	showBorder?: boolean;
	onPress?: () => void;
	localUri?: string | null;
}

export default function Avatar({
	size = 56,
	borderColor = "#10b981",
	borderWidth = 2,
	showBorder = true,
	onPress,
	localUri,
}: AvatarProps) {
	const { profile } = useAuth();
	const [avatarKey, setAvatarKey] = useState(0);

	useEffect(() => {
		setAvatarKey((prev) => prev + 1);
	}, [profile?.avatar_url]);

	const avatarUrl = localUri ? localUri : resolveAvatarUrl(profile?.avatar_url);

	if (__DEV__) {
		// Helps debug “filename vs url” issues without spamming prod logs
		console.log("🔍 Final Avatar URL:", avatarUrl);
	}

	const Inner = (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: 999,
				overflow: "hidden",
				borderWidth: showBorder ? borderWidth : 0,
				borderColor,
				backgroundColor: "#18181b",
			}}
		>
			{avatarUrl ? (
				<Image
					key={avatarKey}
					source={{ uri: avatarUrl }}
					style={{ width: size, height: size }}
					resizeMode="cover"
					onError={(e) => console.log("❌ Load Error:", e.nativeEvent)}
				/>
			) : (
				<View className="flex-1 items-center justify-center bg-zinc-800">
					<Ionicons
						name="person-circle-outline"
						size={size * 0.7}
						color="#22c55e"
					/>
				</View>
			)}
		</View>
	);

	if (onPress) {
		return (
			<TouchableOpacity onPress={onPress} className="active:opacity-80">
				{Inner}
			</TouchableOpacity>
		);
	}

	return <View>{Inner}</View>;
}
