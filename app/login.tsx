/**
 * Login Screen
 * ------------
 * We provide a login form for users to authenticate with email and password.
 * We do this to allow secure access to user-specific features and data.
 */
import AuthForm from "@/components/ui/AuthForm";
import CustomAlert from "@/components/ui/CustomAlert";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	//alert state
	const [alert, setAlert] = useState<{
		visible: boolean;
		title: string;
		message: string;
		type?: "success" | "error";
	}>({
		visible: false,
		title: "",
		message: "",
	});

	const { signIn } = useAuth();
	const router = useRouter();

	/**
	 * Handles the login process.
	 * We do this to validate user credentials and navigate to the dashboard on success.
	 * @returns {Promise<void>}
	 */
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
			setError(err.message || "Invalid email or password");
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
			{/* Branding Header */}
			<View className="mb-12 items-center">
				<Text className="text-white text-5xl font-bold tracking-tighter">
					FitForge
				</Text>
				<Text className="text-zinc-400 text-lg mt-2">
					Welcome back, warrior
				</Text>
			</View>

			{/* Form */}
			<AuthForm
				fields={loginFields}
				buttonText="Log In"
				onSubmit={handleLogin}
				loading={loading}
				error={error}
			/>

			{/* Links */}
			<View className="mt-10">
				<TouchableOpacity onPress={() => router.replace("/signup")}>
					<Text className="text-zinc-400 text-center text-base">
						Don't have an account?{" "}
						<Text className="text-emerald-500 font-medium">Sign up</Text>
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => router.replace("/forgot-password")}
					className="mt-4"
				>
					<Text className="text-emerald-500 text-center text-base">
						Forgot your password?
					</Text>
				</TouchableOpacity>
			</View>
			{/* Branded Custom Alert */}
			<CustomAlert
				visible={alert.visible}
				title={alert.title}
				message={alert.message}
				type={alert.type}
				onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
			/>
		</View>
	);
}
