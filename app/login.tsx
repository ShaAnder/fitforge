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

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const { signIn } = useAuth();
	const router = useRouter();

	const handleLogin = async () => {
		if (!email || !password) {
			setError("Please fill in all fields");
			return;
		}

		setLoading(true);
		setError("");

		try {
			await signIn(email, password);
			router.replace("/(tabs)/dashboard");
		} catch (err: any) {
			setError(err.message || "Invalid credentials");
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
					Don't have an account?
					<Text className="text-emerald-500">Sign up</Text>
				</Text>
			</TouchableOpacity>
		</View>
	);
}
