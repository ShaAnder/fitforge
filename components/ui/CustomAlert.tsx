import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface CustomAlertProps {
	visible: boolean;
	title: string;
	message: string;
	onClose: () => void;
	type?: "success" | "error" | "info";
}

/**
 * CustomAlert - Branded modal alert for FitForge.
 *
 * Replaces the native Alert.alert() with a dark, gym-themed modal.
 * Supports success (emerald), error (red), and info states.
 */
export default function CustomAlert({
	visible,
	title,
	message,
	onClose,
	type = "info",
}: CustomAlertProps) {
	const [show, setShow] = useState(visible);

	useEffect(() => {
		setShow(visible);
	}, [visible]);

	const colors = {
		success: { bg: "#22c55e", icon: "checkmark-circle" },
		error: { bg: "#ef4444", icon: "alert-circle" },
		info: { bg: "#eab308", icon: "information-circle" },
	};

	const currentColor = colors[type];

	const handleClose = () => {
		setShow(false);
		// Small delay so animation can finish
		setTimeout(onClose, 200);
	};

	return (
		<Modal transparent visible={show} animationType="fade" statusBarTranslucent>
			<View className="flex-1 bg-black/70 justify-center items-center px-6">
				<View className="bg-zinc-900 w-full max-w-[340px] rounded-3xl p-8 border border-zinc-700">
					{/* Icon */}
					<View className="items-center mb-6">
						<Ionicons
							name={currentColor.icon as any}
							size={64}
							color={currentColor.bg}
						/>
					</View>

					{/* Title */}
					<Text className="text-white text-2xl font-bold text-center mb-3 tracking-tight">
						{title}
					</Text>

					{/* Message */}
					<Text className="text-zinc-400 text-base text-center leading-6 mb-8">
						{message}
					</Text>

					{/* Action Button */}
					<TouchableOpacity
						onPress={handleClose}
						className="bg-emerald-500 py-4 rounded-2xl"
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
