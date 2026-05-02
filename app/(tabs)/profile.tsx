// app/(tabs)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
	Alert,
	Image,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import TabScreen from "@/components/layout/TabScreen";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { uploadAvatar } from "@/lib/supabaseQueries";

/**
 * Profile Screen - Account focused (no nested ScrollView)
 */
export default function Profile() {
	const { user, profile, updateProfile, signOut } = useAuth();
	const [uploading, setUploading] = useState(false);
	const [editingUsername, setEditingUsername] = useState(false);
	const [username, setUsername] = useState(profile?.username || "");

	useEffect(() => {
		if (!editingUsername) setUsername(profile?.username || "");
	}, [profile?.username, editingUsername]);

	const handlePickImage = async () => {
		if (!user?.id) return;

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (result.canceled || !result.assets?.[0]) return;

		setUploading(true);
		try {
			const publicUrl = await uploadAvatar(user.id, result.assets[0]);
			await updateProfile({ avatar_url: publicUrl });
			Alert.alert("Success", "Profile picture updated!");
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to upload image");
		} finally {
			setUploading(false);
		}
	};

	const saveUsername = async () => {
		if (!user?.id || !username.trim()) return;
		try {
			await updateProfile({ username: username.trim() });
			setEditingUsername(false);
			Alert.alert("Success", "Username updated!");
		} catch (err: any) {
			Alert.alert("Error", err.message || "Failed to update username");
		}
	};

	return (
		<TabScreen
			title="Profile"
			subtitle="Your Account"
			footer={
				<View className="gap-4">
					<Button
						title="Edit Profile"
						variant="secondary"
						size="large"
						onPress={() => setEditingUsername(true)}
					/>
					<Button
						title="Sign Out"
						variant="secondary"
						size="large"
						onPress={signOut}
					/>
				</View>
			}
		>
			{/* Profile Picture */}
			<View className="items-center mt-8 mb-10">
				<TouchableOpacity onPress={handlePickImage} disabled={uploading}>
					<View className="w-36 h-36 rounded-full border-4 border-emerald-500 overflow-hidden bg-zinc-800">
						{profile?.avatar_url ? (
							<Image
								source={{ uri: profile.avatar_url }}
								className="w-full h-full"
							/>
						) : (
							<View className="flex-1 items-center justify-center">
								<Ionicons name="person" size={80} color="#22c55e" />
							</View>
						)}
					</View>
				</TouchableOpacity>

				<TouchableOpacity onPress={handlePickImage} className="mt-4">
					<Text className="text-emerald-400 font-medium">
						Change Profile Picture
					</Text>
				</TouchableOpacity>
			</View>

			{/* Username */}
			<View className="bg-zinc-900 rounded-3xl p-6 mb-6">
				<Text className="text-zinc-400 text-sm mb-2">Username</Text>
				{editingUsername ? (
					<View className="flex-row items-center gap-3">
						<TextInput
							className="flex-1 bg-zinc-800 text-white text-xl px-4 py-3 rounded-2xl"
							value={username}
							onChangeText={setUsername}
							autoFocus
						/>
						<TouchableOpacity
							onPress={saveUsername}
							className="bg-emerald-500 px-6 py-3 rounded-2xl"
						>
							<Text className="text-black font-semibold">Save</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => setEditingUsername(false)}>
							<Text className="text-zinc-400">Cancel</Text>
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity
						onPress={() => setEditingUsername(true)}
						className="flex-row items-center justify-between"
					>
						<Text className="text-white text-3xl font-bold tracking-tighter">
							{profile?.username || "Tap to set username"}
						</Text>
						<Ionicons name="pencil" size={24} color="#22c55e" />
					</TouchableOpacity>
				)}
			</View>

			{/* Email */}
			<View className="bg-zinc-900 rounded-3xl p-6 mb-6">
				<Text className="text-zinc-400 text-sm">Email</Text>
				<Text className="text-white text-xl">{user?.email}</Text>
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
				<View className="flex-row flex-wrap gap-4">
					<View className="bg-zinc-900 rounded-3xl p-6 items-center flex-1">
						<Ionicons name="flame" size={48} color="#eab308" />
						<Text className="text-white text-xl font-bold mt-3">
							12 Day Streak
						</Text>
					</View>
					<View className="bg-zinc-900 rounded-3xl p-6 items-center flex-1">
						<Ionicons name="barbell" size={48} color="#22c55e" />
						<Text className="text-white text-xl font-bold mt-3">
							First Lift
						</Text>
					</View>
				</View>
			</View>

			{/* Recent Workouts */}
			<View className="mb-10">
				<Text className="text-zinc-400 text-lg font-semibold mb-5">
					Recent Workouts
				</Text>
				<Text className="text-zinc-500 text-center py-8">
					Recent workout history coming soon...
				</Text>
			</View>
		</TabScreen>
	);
}
