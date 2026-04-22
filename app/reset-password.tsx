import AuthForm from "@/components/ui/AuthForm";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { getSupabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

/**
 * ResetPassword Screen - Clean version.
 *
 * Flow:
 *   1. Use temporary tokens to allow password update
 *   2. Update password
 *   3. Immediately sign out
 *   4. Navigate to login screen
 *   5. Let the global auth listener + protection logic handle the rest naturally
 */
export default function ResetPassword() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	const supabase = getSupabase();
	const router = useRouter();
	const { access_token, refresh_token } = useLocalSearchParams();

	const handleReset = async () => {
		if (
			!password ||
			!confirmPassword ||
			password !== confirmPassword ||
			password.length < 6
		) {
			Alert.alert("Error", "Please check your passwords");
			return;
		}

		setIsProcessing(true);

		try {
			if (access_token && refresh_token) {
				await supabase.auth.setSession({
					access_token: access_token as string,
					refresh_token: refresh_token as string,
				});
			}

			// 2. Update the password
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;

			// 3. Immediately sign out
			await supabase.auth.signOut();

			// 4. Navigate to
			router.replace("/login");

			Alert.alert(
				"Password Reset Successful",
				"Your password has been updated.\n\nPlease log in with your new password.",
			);
		} catch (error: any) {
			Alert.alert("Error", error.message || "Failed to reset password");
		} finally {
			setIsProcessing(false);
		}
	};

	if (isProcessing) {
		return <LoadingScreen />;
	}
	const resetFields = [
		{
			name: "password",
			placeholder: "New Password",
			type: "password" as const,
			value: password,
			onChangeText: setPassword,
		},
		{
			name: "confirmPassword",
			placeholder: "Confirm New Password",
			type: "password" as const,
			value: confirmPassword,
			onChangeText: setConfirmPassword,
		},
	];

	return (
		<View className="flex-1 bg-zinc-950 px-6 justify-center">
			<Text className="text-white text-4xl font-bold mb-10 text-center">
				Reset Password
			</Text>

			<AuthForm
				fields={resetFields}
				buttonText="Update Password"
				onSubmit={handleReset}
				loading={isProcessing}
			/>

			<TouchableOpacity
				onPress={() => router.replace("/login")}
				className="mt-8"
			>
				<Text className="text-zinc-400 text-center">Back to Login</Text>
			</TouchableOpacity>
		</View>
	);
}
