import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Signup() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const { signup } = useAuth();
	const router = useRouter();

	const handleSignup = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please fill all fields");
			return;
		}

		setLoading(true);
		try {
			await signup(email, password);
			Alert.alert(
				"Success",
				"Account created! Please check your email to confirm.",
			);
			router.replace("/login");
		} catch (error: any) {
			Alert.alert("Signup Failed", error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-zinc-950 px-6 justify-center">
			<Text className="text-white text-4xl font-bold mb-10 text-center">
				Create Account
			</Text>

			<TextInput
				className="bg-zinc-900 text-white p-4 rounded-2xl mb-4"
				placeholder="Email"
				placeholderTextColor="#71717a"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
			/>

			<TextInput
				className="bg-zinc-900 text-white p-4 rounded-2xl mb-8"
				placeholder="Password"
				placeholderTextColor="#71717a"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<TouchableOpacity
				onPress={handleSignup}
				disabled={loading}
				className="bg-emerald-500 py-4 rounded-3xl"
			>
				<Text className="text-black font-semibold text-center text-lg">
					{loading ? "Creating account..." : "Sign Up"}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={() => router.push("/login")} className="mt-6">
				<Text className="text-zinc-400 text-center">
					Already have an account? Log in
				</Text>
			</TouchableOpacity>
		</View>
	);
}
