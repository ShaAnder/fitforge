import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function Signup() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const { signup } = useAuth();
	const router = useRouter();

	const handleSignup = async () => {
		if (!email || !password || !confirmPassword) {
			setError("Please fill all fields");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);
		setError("");

		try {
			await signup(email, password);
			// Note: username will be saved later in profiles table
			Alert.alert(
				"Account Created",
				"Please check your email to confirm your account.",
			);
			router.replace("/login");
		} catch (err: any) {
			setError(err.message || "Failed to create account");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-zinc-950 px-6 justify-center">
			<View className="mb-12 items-center">
				<Text className="text-white text-5xl font-bold tracking-tighter">
					FitForge
				</Text>
				<Text className="text-zinc-400 text-lg mt-2">Create your account</Text>
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
				className="bg-zinc-900 text-white p-5 rounded-2xl mb-4 text-base"
				placeholder="Password"
				placeholderTextColor="#71717a"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<TextInput
				className="bg-zinc-900 text-white p-5 rounded-2xl mb-8 text-base"
				placeholder="Confirm Password"
				placeholderTextColor="#71717a"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
			/>

			<TouchableOpacity
				onPress={handleSignup}
				disabled={loading}
				className="bg-emerald-500 py-5 rounded-3xl"
			>
				{loading ? (
					<ActivityIndicator color="#000" />
				) : (
					<Text className="text-black font-semibold text-xl text-center">
						Create Account
					</Text>
				)}
			</TouchableOpacity>

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
