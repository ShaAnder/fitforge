import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AuthForm from "@/components/ui/AuthForm";

/**
 * Login Screen - Allows existing users to sign in with email and password.
 *
 * Features:
 *   - Email + Password input fields
 *   - Basic validation and error display
 *   - Loading state during login attempt
 *   - Link to Signup screen
 *   - Link to Forgot Password screen
 */
export default function Login() {
	// set our state here
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// destructure our signing from useauth
	const { signIn } = useAuth();
	// set our router
	const router = useRouter();

	// check if the user has name and pass fields populated if not
	// seterror feedback
	const handleLogin = async () => {
		if (!email || !password) {
			setError("Please fill in all fields");
			return;
		}

		// if filled set our loading to true and error to empty
		setLoading(true);
		setError("");

		// try signing in with the credentials
		try {
			// use our signing function from useAuth
			await signIn(email, password);
			// move the user to dashboard, we replace as we don't want the user
			// to go back to / see login UNLESS they logout
			router.replace("/(tabs)/dashboard");
		} catch (err: any) {
			// pass error message for feedback if invalid login
			setError(err.message || "Invalid credentials");
		} finally {
			// set loading to false
			setLoading(false);
		}
	};

	// Set our fields for the form
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
			<View className="mb-12 items-center">
				<Text className="text-white text-5xl font-bold tracking-tighter">
					FitForge
				</Text>
				<Text className="text-zinc-400 text-lg mt-2">Welcome back</Text>
			</View>

			{/* Reusable AuthForm handles inputs, password toggle, button, error */}
			<AuthForm
				fields={loginFields}
				buttonText="Log In"
				onSubmit={handleLogin}
				loading={loading}
				error={error}
			/>

			<TouchableOpacity
				onPress={() => router.replace("/signup")}
				className="mt-8"
			>
				<Text className="text-zinc-400 text-center text-base">
					Don't have an account?{" "}
					<Text className="text-emerald-500">Sign up</Text>
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => router.push("/forgot-password")}
				className="mt-4"
			>
				<Text className="text-emerald-500 text-center">Forgot password?</Text>
			</TouchableOpacity>
		</View>
	);
}
