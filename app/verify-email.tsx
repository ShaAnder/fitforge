import AuthHeader from "@/components/ui/authPages/AuthHeader";
import AuthLink from "@/components/ui/authPages/AuthLink";
import { useAlert } from "@/context/AlertContext";
import { getSupabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

/**
 * Verify Email Success Screen
 */
export default function VerifyEmail() {
	const { showAlert } = useAlert();
	const { access_token, refresh_token } = useLocalSearchParams();

	useEffect(() => {
		const handleVerification = async () => {
			try {
				if (access_token && refresh_token) {
					const supabase = getSupabase();
					await supabase.auth.setSession({
						access_token: access_token as string,
						refresh_token: refresh_token as string,
					});
				}

				showAlert(
					"Account Verified",
					"Your email has been successfully confirmed!",
					"success",
				);
			} catch (err) {
				showAlert(
					"Verification Failed",
					"Please try logging in manually.",
					"error",
				);
			}
		};

		handleVerification();
	}, [access_token, refresh_token]);

	return (
		<View className="flex-1 bg-zinc-950 px-6 justify-center">
			<View className="items-center">
				<Ionicons name="checkmark-circle" size={110} color="#22c55e" />

				<AuthHeader
					title="Account Verified"
					subtitle="Your email has been successfully confirmed."
				/>

				<AuthLink to="/login" prefix="Continue to">
					Login
				</AuthLink>
			</View>
		</View>
	);
}
