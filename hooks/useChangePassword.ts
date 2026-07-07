import { useAlert } from "@/context/AlertContext";
import { getSupabase } from "@/lib/supabase";
import { getErrorMessage } from "@/utils/getError";
import { useState } from "react";

/**
 * Custom hook that manages the change password modal and submission flow.
 *
 * Handles validation, calls Supabase to update the password,
 * shows success/error alerts, and resets state cleanly.
 */
export function useChangePassword() {
	// get our alert context so we can show nice messages to the user
	const { showAlert } = useAlert();

	// state for the modal visibility
	const [visible, setVisible] = useState(false);
	// hold the new password the user types
	const [newPassword, setNewPassword] = useState("");
	// hold the confirmation password
	const [confirmPassword, setConfirmPassword] = useState("");
	// track loading state during the actual update
	const [loading, setLoading] = useState(false);

	// open the change password modal
	const open = () => setVisible(true);

	const close = () => {
		// don't let the user close while we're submitting
		if (loading) return;
		setVisible(false);
	};

	const submit = async () => {
		// trim and basic length check
		const trimmed = newPassword.trim();
		if (trimmed.length < 8) {
			showAlert("Password too short", "Use at least 8 characters.", "info");
			return;
		}
		// make sure both fields match
		if (trimmed !== confirmPassword.trim()) {
			showAlert("Passwords don't match", "Please try again.", "info");
			return;
		}

		setLoading(true);
		try {
			// get our Supabase client
			const supabase = getSupabase();
			// update the user's password
			const { error } = await supabase.auth.updateUser({ password: trimmed });
			if (error) throw error;

			// success path - close modal and clear fields
			setVisible(false);
			setNewPassword("");
			setConfirmPassword("");
			showAlert(
				"Password updated",
				"Your password has been changed.",
				"success",
			);
		} catch (err: unknown) {
			// show user-friendly error
			showAlert(
				"Change password failed",
				getErrorMessage(err) || "Please try again.",
				"error",
			);
		} finally {
			// always stop loading
			setLoading(false);
		}
	};

	return {
		visible,
		newPassword,
		confirmPassword,
		loading,
		setNewPassword,
		setConfirmPassword,
		open,
		close,
		submit,
	};
}
