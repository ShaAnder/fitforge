import { useAlert } from "@/context/AlertContext";
import { useAccent } from "@/hooks/useAccent";
import { getSupabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function VerifyEmail() {
	const router = useRouter();
	const { showAlert } = useAlert();
	const { access_token, refresh_token } = useLocalSearchParams();
	const accent = useAccent();

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

					// Go straight to dashboard
					router.replace("/(tabs)/dashboard");
				} else {
					router.replace("/login");
				}
			} catch (err) {
				showAlert(
					"Verification Failed",
					"Please try logging in manually.",
					"error",
				);
				router.replace("/login");
			}
		};

		verifyAccount();
	}, [access_token, refresh_token]);

	// Simple loading state while processing
	return (
		<View className="flex-1 bg-zinc-950 justify-center items-center px-6">
			<View className="items-center">
				<Ionicons name="checkmark-circle" size={100} color={accent.hex500} />
				<Text className="text-white text-3xl font-bold mt-8">
					Verifying Account
				</Text>
				<ActivityIndicator
					size="large"
					color={accent.hex500}
					className="mt-6"
				/>
			</View>
		</View>
	);
}
