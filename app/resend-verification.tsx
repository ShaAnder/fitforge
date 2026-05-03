import AuthForm from "@/components/ui/authPages/AuthForm";
import AuthHeader from "@/components/ui/authPages/AuthHeader";
import AuthLink from "@/components/ui/authPages/AuthLink";
import { useAlert } from "@/context/AlertContext";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

/**
 * Resend Verification Screen
 */
export default function ResendVerification() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const { showAlert } = useAlert();
	const supabase = getSupabase();
	const router = useRouter();

	const handleResend = async () => {
		if (!email) {
			showAlert("Error", "Please enter your email", "error");
			return;
		}

		setLoading(true);

		try {
			const { error } = await supabase.auth.resend({
				type: "signup",
				email: email.trim(),
				options: {
					emailRedirectTo:
						"https://shaander.github.io/fitforge/web-redirect-reset.html",
				},
			});

			if (error) throw error;

			showAlert(
				"Verification Email Sent",
				"Please check your inbox (and spam folder).",
				"success",
			);
		} catch (err: any) {
			showAlert(
				"Error",
				err.message || "Failed to resend verification email",
				"error",
			);
		} finally {
			setLoading(false);
		}
	};

	const fields = [
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
				title="Resend Verification"
				subtitle="Enter your email to receive a new verification link"
			/>

			<AuthForm
				fields={fields}
				buttonText="Resend Verification Email"
				onSubmit={handleResend}
				loading={loading}
			/>

			<AuthLink to="/login">Login</AuthLink>
		</View>
	);
}
