import AuthForm from "@/components/ui/AuthForm";
import CustomAlert from "@/components/ui/CustomAlert";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

/**
 * ForgotPassword Screen - Allows users to request a password reset link.
 *
 * Features:
 *   - Single email input
 *   - Loading state and error handling
 *   - Redirects back to login after sending the request
 */
export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

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

	const handleReset = async () => {
		if (!email) {
			setError("Please enter your email");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo:
					"https://shaander.github.io/fitforge/web-redirect-reset.html",
			});

			if (error) throw error;

			setAlert({
				visible: true,
				title: "Reset Link Sent",
				message: "Check your email for the password reset link.",
				type: "success",
			});
		} catch (err: any) {
			setError(err.message || "Failed to send reset link");
		} finally {
			setLoading(false);
		}
	};

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
			<View className="mb-16 items-center">
				<Text className="text-white text-5xl font-bold tracking-tighter">
					Forgot Password
				</Text>
				<Text className="text-zinc-400 text-lg mt-3">
					We'll send you a reset link
				</Text>
			</View>

			<AuthForm
				fields={forgotFields}
				buttonText="Send Reset Link"
				onSubmit={handleReset}
				loading={loading}
				error={error}
			/>

			<TouchableOpacity
				onPress={() => router.replace("/login")}
				className="mt-12"
			>
				<Text className="text-zinc-400 text-center">Back to Login</Text>
			</TouchableOpacity>
			{/* Branded Custom Alert */}
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
