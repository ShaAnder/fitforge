import AuthForm from "@/components/ui/authPages/AuthForm";
import AuthHeader from "@/components/ui/authPages/AuthHeader";
import AuthLink from "@/components/ui/authPages/AuthLink";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

/**
 * Login Screen - Allows existing users to sign in with email and password.
 */
export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const { signIn } = useAuth();
	const router = useRouter();

	const handleLogin = async () => {
		if (!email || !password) return;

		setLoading(true);

		try {
			await signIn(email, password);
			router.replace("/(tabs)/dashboard");
		} catch (err: any) {
			// Error handled globally in AuthContext
		} finally {
			setLoading(false);
		}
	};

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

			<AuthLink to="/signup" prefix="Don't have an account?">
				Sign up
			</AuthLink>

			<AuthLink to="/forgot-password" prefix="Forgotten your password?">
				Reset
			</AuthLink>
		</View>
	);
}
