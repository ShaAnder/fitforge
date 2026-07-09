import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useAccent } from "@/hooks/useAccent";

/**
 * Converts any stored avatar path into a reliable public Supabase Storage URL.
 *
 * Handles multiple possible formats users might have stored:
 * - Just filename (e.g. "user123.jpg")
 * - "avatars/..." path
 * - Full storage URL
 *
 * This keeps avatar display robust even if the stored value format changes over time.
 */
export function resolveAvatarUrl(
	avatarUrl: string | null | undefined,
): string | null {
	if (!avatarUrl) return null;

	const trimmed = avatarUrl.trim();
	if (!trimmed || trimmed.toLowerCase() === "null") return null;

	// Already a full remote URL — nothing to do
	if (/^https?:\/\//i.test(trimmed)) return trimmed;

	const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? "").replace(
		/\/+$/,
		"",
	);
	if (!supabaseUrl) return null;

	// Normalize different possible stored paths
	let objectPath = trimmed.replace(/^\/+/, "");
	objectPath = objectPath.replace(
		/^storage\/v1\/object\/public\/avatars\//i,
		"",
	);
	objectPath = objectPath.replace(/^avatars\//i, "");

	// Encode each path segment safely (handles spaces or special chars in filenames)
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

/**
 * Reusable Avatar Component.
 *
 * Displays user profile picture with fallback to default icon.
 * Supports local preview (during upload) and live refresh when profile updates.
 * Can be made tappable by passing an onPress handler.
 */
export default function Avatar({
	size = 56,
	borderColor,
	borderWidth = 2,
	showBorder = true,
	onPress,
	localUri,
}: AvatarProps) {
	const accent = useAccent();
	const { profile } = useAuth();

	// Force Image re-render when avatar URL changes
	// Incrementing the key tells React to treat it as a brand new Image component
	const [avatarKey, setAvatarKey] = useState(0);

	useEffect(() => {
		setAvatarKey((prev) => prev + 1);
	}, [profile?.avatar_url]);

	// Prefer local preview (during upload) over stored URL
	// This gives instant feedback while the upload is still in progress
	const avatarUrl = localUri ? localUri : resolveAvatarUrl(profile?.avatar_url);

	const Inner = (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: 999,
				overflow: "hidden",
				borderWidth: showBorder ? borderWidth : 0,
				borderColor: borderColor ?? accent.hex500,
				backgroundColor: "#18181b",
			}}
		>
			{avatarUrl ? (
				<Image
					key={avatarKey}
					source={{ uri: avatarUrl }}
					style={{ width: size, height: size, marginLeft: -3 }}
					resizeMode="cover"
				/>
			) : (
				/* Default avatar icon when no image is available */
				<View className="flex-1 items-center justify-center bg-zinc-800">
					<Ionicons
						name="person-circle-outline"
						size={size * 0.7}
						color={accent.hex500}
					/>
				</View>
			)}
		</View>
	);

	// Make avatar tappable when onPress is provided
	if (onPress) {
		return (
			<TouchableOpacity onPress={onPress} className="active:opacity-80">
				{Inner}
			</TouchableOpacity>
		);
	}

	return <View>{Inner}</View>;
}
