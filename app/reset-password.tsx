// app/reset-password.tsx
import { getSupabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

/**
 * ResetPassword Screen - Allows users to set a new password after clicking the reset link in email.
 *
 * This screen is reached via deep link from Supabase's password reset email.
 */
export default function ResetPassword() {
	// state for the passwsord reset
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	// set our vars
	const supabase = getSupabase();
	const router = useRouter();

	// Supabase passes these tokens in the deep link URL
	const { access_token, refresh_token } = useLocalSearchParams();

	//check if password or confirm password and if passwords match and if longer than 6 chars
	const handleReset = async () => {
		if (!password || !confirmPassword) {
			Alert.alert("Error", "Please fill both password fields");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Error", "Passwords do not match");
			return;
		}

		if (password.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			// Set the session using tokens from the deep link
			if (access_token && refresh_token) {
				const { error: sessionError } = await supabase.auth.setSession({
					access_token: access_token as string,
					refresh_token: refresh_token as string,
				});
				if (sessionError) throw sessionError;
			} else {
				throw new Error("Missing access or refresh token.");
			}

			// Update the user's password and grab error response for feedback
			const { error } = await supabase.auth.updateUser({
				password: password,
			});

			if (error) throw error;

			Alert.alert("Success", "Your password has been reset successfully!");
			router.replace("/login");
		} catch (error: any) {
			Alert.alert("Error", error.message || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-zinc-950 px-6 justify-center">
			<Text className="text-white text-4xl font-bold mb-10 text-center">
				Reset Password
			</Text>

			<TextInput
				className="bg-zinc-900 text-white p-5 rounded-2xl mb-4 text-base"
				placeholder="New Password"
				placeholderTextColor="#71717a"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<TextInput
				className="bg-zinc-900 text-white p-5 rounded-2xl mb-8 text-base"
				placeholder="Confirm New Password"
				placeholderTextColor="#71717a"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
			/>

			<TouchableOpacity
				onPress={handleReset}
				disabled={loading}
				className="bg-emerald-500 py-5 rounded-3xl"
			>
				<Text className="text-black font-semibold text-xl text-center">
					{loading ? "Updating..." : "Update Password"}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				onPress={() => router.replace("/login")}
				className="mt-8"
			>
				<Text className="text-zinc-400 text-center">Back to Login</Text>
			</TouchableOpacity>
		</View>
	);
}
