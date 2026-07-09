import AuthForm from "@/components/ui/authPages/AuthForm";
import AuthHeader from "@/components/ui/authPages/AuthHeader";
import AuthLink from "@/components/ui/authPages/AuthLink";
import { useAlert } from "@/context/AlertContext";
import { getSupabase } from "@/lib/supabase";
import { getErrorMessage } from "@/utils/getError";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
/**
 * Forgot Password Screen.
 *
 * Allows users to request a password reset link via email.
 * Uses Supabase Auth's built-in reset flow with a custom redirect URL.
 */
export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const { showAlert } = useAlert();
	const supabase = getSupabase();
	const router = useRouter();

	/**
	 * Send password reset email through Supabase.
	 */
	const handleReset = async () => {
		if (!email) {
			showAlert("Error", "Please enter your email", "error");
			return;
		}

		setLoading(true);

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				// Custom redirect URL for web-based password reset flow
				// Points to a static page that handles the deep link on web
				redirectTo:
					"https://shaander.github.io/fitforge/web-redirect-reset.html",
			});

			if (error) throw error;

			showAlert(
				"Reset Link Sent",
				"Check your email for the password reset link.",
				"success",
			);
		} catch (err: unknown) {
			const message = getErrorMessage(err);
			showAlert("Failed to resend reset link", message, "error");
		} finally {
			setLoading(false);
		}
	};

	// Form configuration for reusable AuthForm component
	const forgotFields = [
		{
			name: "email",
			placeholder: "Enter your email",
			type: "email" as const,
			value: email,
			onChangeText: setEmail,
		},
	];

	return (
		<View className="flex-1 bg-zinc-950 px-6 justify-center">
			<AuthHeader
				title="Forgot Password"
				subtitle="We'll send you a reset link"
			/>

			<AuthForm
				fields={forgotFields}
				buttonText="Send Reset Link"
				onSubmit={handleReset}
				loading={loading}
			/>

			<AuthLink to="/login">Login</AuthLink>
		</View>
	);
}
