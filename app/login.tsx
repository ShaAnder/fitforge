import AuthForm from "@/components/ui/authPages/AuthForm";
import AuthHeader from "@/components/ui/authPages/AuthHeader";
import AuthLink from "@/components/ui/authPages/AuthLink";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

/**
 * Login Screen - Allows existing users to sign in with email and password.
 *
 * Uses the shared AuthContext for authentication logic and provides
 * quick links to signup and password reset.
 */
export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const { signIn } = useAuth();
	const router = useRouter();

	/**
	 * Handle login submission.
	 *
	 * On success, redirects to the main dashboard.
	 * Errors are handled globally inside AuthContext.
	 */
	const handleLogin = async () => {
		if (!email || !password) return;

		setLoading(true);

		try {
			await signIn(email, password);
			router.replace("/(tabs)/dashboard");
		} catch (err: any) {
			// Error handled globally in AuthContext + AlertContext
		} finally {
			setLoading(false);
		}
	};

	// Form configuration passed to reusable AuthForm component
	const loginFields = [
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
	];

	return (
		<View className="flex-1 bg-zinc-950 px-6 justify-center">
			<AuthHeader title="FitForge" subtitle="Welcome back, warrior" />

			<AuthForm
				fields={loginFields}
				buttonText="Log In"
				onSubmit={handleLogin}
				loading={loading}
			/>

			{/* Quick navigation links */}
			<AuthLink to="/signup" prefix="Don't have an account?">
				Sign up
			</AuthLink>

			<AuthLink to="/forgot-password" prefix="Forgotten your password?">
				Reset
			</AuthLink>
		</View>
	);
}
