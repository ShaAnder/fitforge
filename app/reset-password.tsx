import AuthForm from "@/components/ui/authPages/AuthForm";
import AuthHeader from "@/components/ui/authPages/AuthHeader";
import AuthLink from "@/components/ui/authPages/AuthLink";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAlert } from "@/context/AlertContext";
import { getSupabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

/**
 * ResetPassword Screen
 */
export default function ResetPassword() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	const { showAlert } = useAlert();
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
			showAlert("Error", "Please check your passwords", "error");
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

			await new Promise((resolve) => setTimeout(resolve, 400));

			showAlert(
				"Password Reset Successful",
				"Your password has been updated.\n\nPlease log in with your new password.",
				"success",
			);

			router.replace("/login");
		} catch (error: any) {
			showAlert("Error", error.message || "Failed to reset password", "error");
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
			<AuthHeader title="Reset Password" />

			<AuthForm
				fields={resetFields}
				buttonText="Update Password"
				onSubmit={handleReset}
				loading={isProcessing}
			/>

			<AuthLink to="/login">Login</AuthLink>
		</View>
	);
}
