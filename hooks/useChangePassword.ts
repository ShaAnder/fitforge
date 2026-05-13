import { useAlert } from "@/context/AlertContext";
import { getSupabase } from "@/lib/supabase";
import { getErrorMessage } from "@/utils/getError";
import { useState } from "react";

export function useChangePassword() {
	const { showAlert } = useAlert();

	const [visible, setVisible] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const open = () => setVisible(true);

	const close = () => {
		if (loading) return;
		setVisible(false);
	};

	const submit = async () => {
		const trimmed = newPassword.trim();
		if (trimmed.length < 8) {
			showAlert("Password too short", "Use at least 8 characters.", "info");
			return;
		}
		if (trimmed !== confirmPassword.trim()) {
			showAlert("Passwords don't match", "Please try again.", "info");
			return;
		}

		setLoading(true);
		try {
			const supabase = getSupabase();
			const { error } = await supabase.auth.updateUser({ password: trimmed });
			if (error) throw error;

			setVisible(false);
			setNewPassword("");
			setConfirmPassword("");
			showAlert("Password updated", "Your password has been changed.", "success");
		} catch (err: unknown) {
			showAlert(
				"Change password failed",
				getErrorMessage(err) || "Please try again.",
				"error",
			);
		} finally {
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
