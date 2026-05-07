// app/(tabs)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import { resolveAvatarUrl } from "@/components/common/Avatar";
import TabScreen from "@/components/layout/TabScreen";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useAccent } from "@/hooks/useAccent";
import { uploadAvatar } from "@/lib/supabaseQueries";

/**
 * Profile Screen - Batch edit mode (avatar preview + save together)
 */
export default function Profile() {
	const params = useLocalSearchParams<{ edit?: string }>();
	const { user, profile, updateProfile, signOut } = useAuth();
	const accent = useAccent();
	const router = useRouter();

	const [isEditing, setIsEditing] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [username, setUsername] = useState(profile?.username || "");
	const [selectedAvatarAsset, setSelectedAvatarAsset] = useState<any>(null);
	const [avatarKey, setAvatarKey] = useState(0);

	const displayName = profile?.username || user?.email?.split("@")[0] || "User";

	useFocusEffect(
		useCallback(() => {
			const editParam = params?.edit;
			if (editParam === "1") {
				setIsEditing(true);
				// Optional: clear the param so it doesn't stick on refresh
				router.setParams({ edit: undefined });
			}
		}, [params?.edit]),
	);

	useEffect(() => {
		if (!isEditing) {
			setUsername(profile?.username || "");
			setSelectedAvatarAsset(null);
		}
	}, [profile?.username, isEditing]);

	const handlePickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (result.canceled || !result.assets?.[0]) return;

		setSelectedAvatarAsset(result.assets[0]);
		setAvatarKey((prev) => prev + 1);
	};

	const saveChanges = async () => {
		if (!user?.id) return;

		setUploading(true);
		try {
			let newAvatarUrl = profile?.avatar_url;

			if (selectedAvatarAsset) {
				newAvatarUrl = await uploadAvatar(user.id, selectedAvatarAsset);
			}

			await updateProfile({
				username: username.trim(),
				avatar_url: newAvatarUrl,
			});

			setIsEditing(false);
			setSelectedAvatarAsset(null);
			setAvatarKey((prev) => prev + 1);

			Alert.alert("Success", "Profile updated!");
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to update profile");
		} finally {
			setUploading(false);
		}
	};

	const discardChanges = () => {
		setUsername(profile?.username || "");
		setSelectedAvatarAsset(null);
		setIsEditing(false);
	};

	const displayedAvatarUrl = selectedAvatarAsset
		? selectedAvatarAsset.uri
		: resolveAvatarUrl(profile?.avatar_url);

	return (
		<TabScreen title="Profile" subtitle="Your Account">
			{/* Profile Picture */}
			<View className="items-center mt-8 mb-10">
				<TouchableOpacity
					onPress={isEditing ? handlePickImage : undefined}
					disabled={!isEditing || uploading}
				>
					<View
						className={`w-36 h-36 rounded-full border-4 ${accent.border500} overflow-hidden bg-zinc-800 relative`}
					>
						{displayedAvatarUrl ? (
							<Image
								key={avatarKey}
								source={{ uri: displayedAvatarUrl }}
								className="w-full h-full"
								resizeMode="cover"
							/>
						) : (
							<View className="flex-1 items-center justify-center">
								<Ionicons name="person" size={80} color={accent.hex500} />
							</View>
						)}

						{uploading && (
							<View className="absolute inset-0 bg-black/60 items-center justify-center">
								<ActivityIndicator size="large" color={accent.hex500} />
							</View>
						)}
					</View>
				</TouchableOpacity>

				{isEditing && (
					<TouchableOpacity
						onPress={handlePickImage}
						className="mt-4"
						disabled={uploading}
					>
						<Text className={`${accent.text400} font-medium`}>
							Change Profile Picture
						</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* Username */}
			<View className="bg-zinc-900 rounded-3xl p-6 mb-6">
				<Text className="text-zinc-400 text-sm mb-2">Username</Text>
				{isEditing ? (
					<TextInput
						className="bg-zinc-800 text-white text-xl px-4 py-3 rounded-2xl"
						value={username}
						onChangeText={setUsername}
						autoFocus
					/>
				) : (
					<Text className="text-white text-3xl font-bold tracking-tighter">
						{displayName}
					</Text>
				)}
			</View>

			{/* Join Date */}
			<View className="bg-zinc-900 rounded-3xl p-6 mb-10">
				<Text className="text-zinc-400 text-sm">Member Since</Text>
				<Text className="text-white text-xl">
					{user?.created_at
						? new Date(user.created_at).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})
						: "N/A"}
				</Text>
			</View>

			{/* Achievements */}
			<View className="mb-10">
				<Text className="text-zinc-400 text-lg font-semibold mb-5">
					Achievements
				</Text>
				<Text className="text-zinc-500 text-center py-8">
					Achievements coming soon...
				</Text>
			</View>

			{/* Lifetime Totals */}
			<View className="mb-10">
				<Text className="text-zinc-400 text-lg font-semibold mb-5">
					Lifetime Totals
				</Text>
				<Text className="text-zinc-500 text-center py-8">
					Lifetime totals builder coming soon...
				</Text>
			</View>

			{/* Action Buttons */}
			<View className="gap-4">
				{isEditing ? (
					<>
						<Button
							title={uploading ? "Saving..." : "Save Changes"}
							variant="primary"
							size="large"
							onPress={saveChanges}
							disabled={uploading}
						/>
						<Button
							title="Discard Changes"
							variant="outline"
							size="large"
							onPress={discardChanges}
							disabled={uploading}
						/>
					</>
				) : (
					<>
						<Button
							title="Edit Profile"
							variant="secondary"
							size="large"
							onPress={() => setIsEditing(true)}
						/>
						<Button
							title="Sign Out"
							variant="outline"
							size="large"
							onPress={signOut}
						/>
					</>
				)}
			</View>
		</TabScreen>
	);
}
