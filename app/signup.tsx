import AuthForm from "@/components/ui/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

/**
 * Signup Screen - Allows new users to create an account with email and password.
 *
 * Features:
 *   - Email, Password, and Confirm Password fields
 *   - Basic validation (required fields, password match, minimum length)
 *   - Loading state and error display
 *   - Link back to Login screen
 */
export default function Signup() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// same as signin we destructure this from useAuth
	const { signup } = useAuth();
	// set our router
	const router = useRouter();

	// get user credentials, all fields must be filled
	const handleSignup = async () => {
		if (!email || !password || !confirmPassword) {
			setError("Please fill all fields");
			return;
		}

		// if passwords don't match tell user
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		// if password len < 6 = pw must be longer
		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		// set our loading state
		setLoading(true);
		setError("");

		try {
			await signup(email, password);
			// Note: username will be saved later in profiles table
			Alert.alert(
				"Account Created",
				"Please check your email to confirm your account.",
			);
			// send user to login
			router.replace("/login");
		} catch (err: any) {
			// if error let user know
			setError(err.message || "Failed to create account");
		} finally {
			setLoading(false);
		}
	};

	// Authform signup fields
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
			<View className="mb-12 items-center">
				<Text className="text-white text-5xl font-bold tracking-tighter">
					FitForge
				</Text>
				<Text className="text-zinc-400 text-lg mt-2">Create your account</Text>
			</View>

			<AuthForm
				fields={signupFields}
				buttonText="Create Account"
				onSubmit={handleSignup}
				loading={loading}
				error={error}
			/>

			<TouchableOpacity
				onPress={() => router.replace("/login")}
				className="mt-8"
			>
				<Text className="text-zinc-400 text-center text-base">
					Already have an account?{" "}
					<Text className="text-emerald-500">Login</Text>
				</Text>
			</TouchableOpacity>
		</View>
	);
}
