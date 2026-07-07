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

/**
 * Custom hook that manages the entire delete account flow.
 *
 * Handles the two-step confirmation, re-authentication, calling our edge function,
 * and cleaning up after deletion. Keeps everything in one place so the UI stays simple.
 */
export function useDeleteAccount({ user, signOut }: UseDeleteAccountProps) {
	// our alert context for user feedback
	const { showAlert } = useAlert();
	// router so we can send the user back to login after deletion
	const router = useRouter();

	// modal visibility
	const [visible, setVisible] = useState(false);
	// step 1 = confirm email, step 2 = password (for safety)
	const [step, setStep] = useState<1 | 2>(1);
	// user must type their email to confirm
	const [confirmEmail, setConfirmEmail] = useState("");
	// password for re-auth before deletion
	const [password, setPassword] = useState("");
	// loading state during the delete process
	const [loading, setLoading] = useState(false);

	// open the delete account modal
	const open = () => setVisible(true);

	const reset = () => {
		// clean everything up and close the modal
		setVisible(false);
		setStep(1);
		setConfirmEmail("");
		setPassword("");
		setLoading(false);
	};

	const submit = async () => {
		// only run the first step logic here
		if (step !== 1) {
			return;
		}
		// make sure they typed their exact email
		if (confirmEmail.trim() !== user?.email) {
			showAlert(
				"Email doesn't match",
				"Please type the exact email shown.",
				"info",
			);
			setStep(2);
			return;
		}

		// password is required for re-auth
		if (!password.trim()) {
			showAlert("Password required", "Please enter your password.", "info");
			return;
		}

		setLoading(true);
		try {
			// get our Supabase client
			const supabase = getSupabase();

			// re-authenticate the user before allowing deletion
			const { error: reauthError } = await supabase.auth.signInWithPassword({
				email: user!.email!,
				password,
			});
			if (reauthError) throw reauthError;

			// call our edge function that actually deletes the account
			const { error: fnError } =
				await supabase.functions.invoke("delete-account");
			if (fnError) throw fnError;

			showAlert(
				"Account Deleted",
				"Your account has been permanently deleted.",
				"success",
			);

			// sign out and send them back to login
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
