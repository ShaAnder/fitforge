import AuthForm from "@/components/ui/authPages/AuthForm";
import AuthHeader from "@/components/ui/authPages/AuthHeader";
import AuthLink from "@/components/ui/authPages/AuthLink";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAlert } from "@/context/AlertContext";
import { getSupabase } from "@/lib/supabase";
import { getErrorMessage } from "@/utils/getError";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

/**
 * Reset Password Screen.
 *
 * Called after user clicks the password reset link from their email.
 * Handles token exchange and password update via Supabase Auth.
 */
export default function ResetPassword() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	const { showAlert } = useAlert();
	const supabase = getSupabase();
	const router = useRouter();

	// Tokens passed via deep link / URL params from Supabase email
	const { access_token, refresh_token } = useLocalSearchParams();

	/**
	 * Handle password reset submission.
	 *
	 * 1. Validates passwords match and meet minimum length.
	 * 2. Sets the session using tokens from the reset link.
	 * 3. Updates the user's password.
	 * 4. Signs out and redirects to login.
	 */
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
			// Exchange reset tokens for a valid session
			if (access_token && refresh_token) {
				await supabase.auth.setSession({
					access_token: access_token as string,
					refresh_token: refresh_token as string,
				});
			}

			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;

			// Sign out so user must log in with new password
			await supabase.auth.signOut();

			// Small delay for better UX before redirect
			await new Promise((resolve) => setTimeout(resolve, 400));

			showAlert(
				"Password Reset Successful",
				"Your password has been updated.\n\nPlease log in with your new password.",
				"success",
			);

			router.replace("/login");
		} catch (err: unknown) {
			const message = getErrorMessage(err);
			showAlert("Failed To Reset Password", message, "error");
		} finally {
			setIsProcessing(false);
		}
	};

	// Show full-screen loader during processing
	if (isProcessing) {
		return <LoadingScreen />;
	}

	// Form fields for reusable AuthForm component
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
