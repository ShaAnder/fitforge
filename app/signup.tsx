import AuthForm from "@/components/ui/authPages/AuthForm";
import AuthHeader from "@/components/ui/authPages/AuthHeader";
import AuthLink from "@/components/ui/authPages/AuthLink";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

/**
 * Signup Screen - Allows new users to create an account with email and password.
 *
 * Includes basic client-side validation and uses the shared AuthContext
 * for actual registration logic.
 */
export default function Signup() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const { signup } = useAuth();
	const router = useRouter();

	/**
	 * Handle signup form submission.
	 *
	 * Performs basic validation before calling the AuthContext signup method.
	 * On success, the context will show a success alert and the callback will
	 * redirect the user to the login screen.
	 */
	const handleSignup = async () => {
		if (!email || !password || !confirmPassword) return;
		if (password !== confirmPassword) return;
		if (password.length < 6) return;

		setLoading(true);

		try {
			await signup(email, password, () => {
				// This callback runs AFTER the success alert is closed
				router.replace("/login");
			});
		} catch (err) {
			// All errors are handled globally inside AuthContext + AlertContext
		} finally {
			setLoading(false);
		}
	};

	// Form fields configuration for the reusable AuthForm component
	const signupFields = [
		{
			name: "email",
			placeholder: "Email",
			type: "email" as const,
			value: email,
			onChangeText: setEmail,
		},
		{
			name: "password",
			placeholder: "Password",
			type: "password" as const,
			value: password,
			onChangeText: setPassword,
		},
		{
			name: "confirmPassword",
			placeholder: "Confirm Password",
			type: "password" as const,
			value: confirmPassword,
			onChangeText: setConfirmPassword,
		},
	];

	return (
		<View className="flex-1 bg-zinc-950 px-6 justify-center">
			<AuthHeader title="FitForge" subtitle="Join the grind" />

			<AuthForm
				fields={signupFields}
				buttonText="Create Account"
				onSubmit={handleSignup}
				loading={loading}
			/>

			<AuthLink to="/login" prefix="Already have an account?">
				Log in
			</AuthLink>

			<AuthLink to="/resend-verification" prefix="Didn't receive the email?">
				Resend verification
			</AuthLink>
		</View>
	);
}
