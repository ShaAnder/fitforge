import AuthForm from "@/components/ui/AuthForm";
import CustomAlert from "@/components/ui/CustomAlert";
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
 *   5. Let the global auth listener + protection logic handle redirect
 */
export default function ResetPassword() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	// custom alert
	const [alert, setAlert] = useState<{
		visible: boolean;
		title: string;
		message: string;
		type?: "success" | "error";
	}>({
		visible: false,
		title: "",
		message: "",
	});

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

			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;

			await supabase.auth.signOut();

			// Small delay for clean transition
			await new Promise((resolve) => setTimeout(resolve, 400));

			setAlert({
				visible: true,
				title: "Password Reset Successful",
				message:
					"Your password has been updated.\n\nPlease log in with your new password.",
				type: "success",
			});

			router.replace("/login");
		} catch (error: any) {
			setAlert({
				visible: true,
				title: "Error",
				message: error.message || "Failed to reset password",
				type: "error",
			});
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
			<Text className="text-white text-5xl font-bold mb-12 text-center">
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
				className="mt-12"
			>
				<Text className="text-zinc-400 text-center">Back to Login</Text>
			</TouchableOpacity>

			<CustomAlert
				visible={alert.visible}
				title={alert.title}
				message={alert.message}
				type={alert.type}
				onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
			/>
		</View>
	);
}
