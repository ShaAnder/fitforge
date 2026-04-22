import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

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

	return (
		<View className="flex-1 bg-zinc-950 px-6 justify-center">
			<View className="mb-12 items-center">
				<Text className="text-white text-5xl font-bold tracking-tighter">
					FitForge
				</Text>
				<Text className="text-zinc-400 text-lg mt-2">Welcome back</Text>
			</View>

			{Boolean(error) && (
				<Text className="text-red-500 text-center mb-6">{error}</Text>
			)}

			<TextInput
				className="bg-zinc-900 text-white p-5 rounded-2xl mb-4 text-base"
				placeholder="Email"
				placeholderTextColor="#71717a"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
			/>

			<TextInput
				className="bg-zinc-900 text-white p-5 rounded-2xl mb-8 text-base"
				placeholder="Password"
				placeholderTextColor="#71717a"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<TouchableOpacity
				onPress={handleLogin}
				disabled={loading}
				className="bg-emerald-500 py-5 rounded-3xl"
			>
				{loading ? (
					<ActivityIndicator color="#000" />
				) : (
					<Text className="text-black font-semibold text-xl text-center">
						Log In
					</Text>
				)}
			</TouchableOpacity>

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
