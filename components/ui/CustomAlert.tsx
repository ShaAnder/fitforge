import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

import { useAccent } from "@/hooks/useAccent";

interface CustomAlertProps {
	visible: boolean;
	title: string;
	message: string;
	onClose: () => void;
	type?: "success" | "error" | "info";
}

type AlertIconName = "checkmark-circle" | "alert-circle" | "information-circle";

/**
 * CustomAlert Component
 *
 * A reusable modal alert used across the app.
 * Shows success, error, or info messages with an icon and a close button.
 * Uses a local `show` state + timeout so the fade-out animation can finish before unmounting.
 */
export default function CustomAlert({
	visible,
	title,
	message,
	onClose,
	type = "info",
}: CustomAlertProps) {
	const accent = useAccent();

	// we keep a local `show` state so we can animate the modal out before calling onClose
	const [show, setShow] = useState(visible);

	useEffect(() => {
		// sync the local show state whenever the parent passes a new visible prop
		setShow(visible);
	}, [visible]);

	// map each alert type to its background color and icon
	const colors: Record<
		NonNullable<CustomAlertProps["type"]>,
		{ bg: string; icon: AlertIconName }
	> = {
		success: { bg: accent.hex500, icon: "checkmark-circle" },
		error: { bg: "#ef4444", icon: "alert-circle" },
		info: { bg: "#eab308", icon: "information-circle" },
	};

	const currentColor = colors[type];

	const handleClose = () => {
		// start the fade-out animation
		setShow(false);
		// wait a bit for the animation to finish, then call the parent's onClose
		setTimeout(onClose, 200);
	};

	return (
		<Modal transparent visible={show} animationType="fade" statusBarTranslucent>
			{/* dark overlay that covers the whole screen */}
			<View className="flex-1 bg-black/70 justify-center items-center px-6">
				{/* main alert card */}
				<View className="bg-zinc-900 w-full max-w-[340px] rounded-3xl p-8 border border-zinc-700">
					{/* icon at the top */}
					<View className="items-center mb-6">
						<Ionicons
							name={currentColor.icon}
							size={64}
							color={currentColor.bg}
						/>
					</View>

					{/* title */}
					<Text className="text-white text-2xl font-bold text-center mb-3 tracking-tight">
						{title}
					</Text>

					{/* message body */}
					<Text className="text-zinc-400 text-base text-center leading-6 mb-8">
						{message}
					</Text>

					{/* close button (uses the current accent color) */}
					<TouchableOpacity
						onPress={handleClose}
						className={`${accent.bg500} py-4 rounded-2xl`}
					>
						<Text className="text-black font-semibold text-lg text-center">
							Got it
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}
