import { useAlert } from "@/context/AlertContext";
import { getSupabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function VerifyEmail() {
	const router = useRouter();
	const { showAlert } = useAlert();
	const { access_token, refresh_token } = useLocalSearchParams();
	const [isProcessing, setIsProcessing] = useState(true);

	useEffect(() => {
		const verifyAccount = async () => {
			try {
				if (access_token && refresh_token) {
					const supabase = getSupabase();

					await supabase.auth.setSession({
						access_token: access_token as string,
						refresh_token: refresh_token as string,
					});

					showAlert("Account Verified", "Welcome to FitForge!", "success");

					// Small delay to let alert show
					setTimeout(() => {
						router.replace("/(tabs)/dashboard");
					}, 1200);
				}
			} catch (err) {
				showAlert(
					"Verification Failed",
					"Please try logging in manually.",
					"error",
				);
				router.replace("/login");
			} finally {
				setIsProcessing(false);
			}
		};

		verifyAccount();
	}, [access_token, refresh_token]);

	if (isProcessing) {
		return (
			<View className="flex-1 bg-zinc-950 justify-center items-center px-6">
				<View className="items-center">
					<Ionicons name="checkmark-circle" size={100} color="#22c55e" />
					<Text className="text-white text-3xl font-bold mt-8">
						Verifying Account
					</Text>
					<ActivityIndicator size="large" color="#22c55e" className="mt-6" />
				</View>
			</View>
		);
	}

	return null;
}
