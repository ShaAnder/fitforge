import AuthForm from "@/components/ui/AuthForm";
import CustomAlert from "@/components/ui/CustomAlert";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

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

	// custom alert state
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

	const { signup } = useAuth();
	const router = useRouter();

	/**
	 * Handles the signup process.
	 * We do this to register a new user, validate input, and provide feedback.
	 * @returns {Promise<void>}
	 */
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
			setAlert({
				visible: true,
				title: "Account Created",
				message: "Please check your email to confirm your account.",
				type: "success",
			});
			router.replace("/login");
		} catch (err: any) {
			setError(err.message || "Failed to create account");
		} finally {
			setLoading(false);
		}
	};

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
				<Text className="text-zinc-400 text-lg mt-2">Join the grind</Text>
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
				className="mt-10"
			>
				<Text className="text-zinc-400 text-center text-base">
					Already have an account?{" "}
					<Text className="text-emerald-500">Log in</Text>
				</Text>
			</TouchableOpacity>

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
