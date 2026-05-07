import { useAlert } from "@/context/AlertContext";
import { useAccent } from "@/hooks/useAccent";
import { getSupabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

/**
 * Verify Email Screen.
 *
 * This screen is opened via the magic link from Supabase's email verification.
 * It exchanges the tokens, verifies the account, and redirects the user.
 */
export default function VerifyEmail() {
	const router = useRouter();
	const { showAlert } = useAlert();
	const accent = useAccent();

	// Tokens passed from Supabase via deep link / URL parameters
	const { access_token, refresh_token } = useLocalSearchParams();

	/**
	 * Automatically verify the user's email when the screen mounts.
	 *
	 * 1. Sets the session using tokens from the email link.
	 * 2. Shows success message and redirects to dashboard.
	 * 3. Falls back to login on any error.
	 */
	useEffect(() => {
		const verifyAccount = async () => {
			try {
				if (access_token && refresh_token) {
					const supabase = getSupabase();

					// Exchange verification tokens for a valid session
					await supabase.auth.setSession({
						access_token: access_token as string,
						refresh_token: refresh_token as string,
					});

					showAlert("Account Verified", "Welcome to FitForge!", "success");

					// Go straight to the main app
					router.replace("/(tabs)/dashboard");
				} else {
					// Missing tokens → invalid link
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

	// Simple loading UI while verification is in progress
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
