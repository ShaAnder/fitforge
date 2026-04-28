import React from "react";
import { DimensionValue, Modal, Pressable, StyleSheet } from "react-native";

interface ModalViewProps {
	visible: boolean;
	onRequestClose?: () => void;
	children: React.ReactNode;
	overlayOpacity?: number;
	/** Width of the modal content (e.g. "90%", 400) */
	width?: DimensionValue;
	/** Height of the modal content (e.g. "85%", "90%") */
	height?: DimensionValue;
}

export default function ModalView({
	visible,
	onRequestClose,
	children,
	overlayOpacity = 0.85,
	width = "90%",
	height = "75%",
}: ModalViewProps) {
	return (
		<Modal
			transparent
			visible={visible}
			animationType="fade"
			statusBarTranslucent
			onRequestClose={onRequestClose}
		>
			<Pressable
				style={[
					styles.overlay,
					{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` },
				]}
				onPress={onRequestClose}
			>
				<Pressable
					onPress={(e) => e.stopPropagation()}
					style={[styles.content, { width, height, maxWidth: 420 }]}
				>
					{children}
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		backgroundColor: "#18181b",
		borderRadius: 24,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.6,
		shadowRadius: 20,
		elevation: 20,
	},
});
