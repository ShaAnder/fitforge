import { useAlert } from "@/context/AlertContext";
import { getSupabase } from "@/lib/supabase";
import { getErrorMessage } from "@/utils/getError";
import { User } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useState } from "react";

interface UseDeleteAccountProps {
	user: User | null;
	signOut: () => Promise<void>;
}

export function useDeleteAccount({ user, signOut }: UseDeleteAccountProps) {
	const { showAlert } = useAlert();
	const router = useRouter();

	const [visible, setVisible] = useState(false);
	const [step, setStep] = useState<1 | 2>(1);
	const [confirmEmail, setConfirmEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const open = () => setVisible(true);

	const reset = () => {
		setVisible(false);
		setStep(1);
		setConfirmEmail("");
		setPassword("");
		setLoading(false);
	};

	const submit = async () => {
		if (step !== 1) {
			return;
		}
		if (confirmEmail.trim() !== user?.email) {
			showAlert(
				"Email doesn't match",
				"Please type the exact email shown.",
				"info",
			);
			setStep(2);
			return;
		}

		if (!password.trim()) {
			showAlert("Password required", "Please enter your password.", "info");
			return;
		}

		setLoading(true);
		try {
			const supabase = getSupabase();

			const { error: reauthError } = await supabase.auth.signInWithPassword({
				email: user!.email!,
				password,
			});
			if (reauthError) throw reauthError;

			const { error: fnError } =
				await supabase.functions.invoke("delete-account");
			if (fnError) throw fnError;

			showAlert(
				"Account Deleted",
				"Your account has been permanently deleted.",
				"success",
			);

			await signOut();
			router.replace("/login");
			reset();
		} catch (err: unknown) {
			showAlert(
				"Delete failed",
				getErrorMessage(err) || "Please check your password and try again.",
				"error",
			);
		} finally {
			setLoading(false);
		}
	};

	return {
		visible,
		step,
		confirmEmail,
		password,
		loading,
		userEmail: user?.email,
		setConfirmEmail,
		setPassword,
		open,
		reset,
		submit,
	};
}
