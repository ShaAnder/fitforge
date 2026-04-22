import AuthForm from "@/components/ui/AuthForm";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

/**
 * ForgotPassword Screen - Allows users to request a password reset link.
 *
 * Features:
 *   - Single email input
 *   - Loading state and error handling
 *   - Redirects back to login after sending the request
 */
export default function ForgotPassword() {
	//set our stat
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	// declare router variable
	const router = useRouter();
	// declare supabase var
	const supabase = getSupabase();

	// handle user not inputting email
	const handleReset = async () => {
		if (!email) {
			Alert.alert("Error", "Please enter your email");
			return;
		}

		//set loading
		setLoading(true);

		// we want the error section of the returned promise so only destructure error but sned reditrect
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: "https://shaander.github.io/fitforge/web-redirect-reset.html",
		});

		// if error use it to let user know what happened
		if (error) {
			Alert.alert("Error", error.message);
		} else {
			// else send them to login screen
			Alert.alert("Success", "Check your email for the password reset link");
			router.replace("/login");
		}
		setLoading(false);
	};

	// Authform forgot fields
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
			<Text className="text-white text-4xl font-bold mb-8 text-center">
				Forgot Password
			</Text>

			<AuthForm
				fields={forgotFields}
				buttonText="Send Reset Link"
				onSubmit={handleReset}
				loading={loading}
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
