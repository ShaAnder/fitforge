import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

import { useAccent } from "@/hooks/useAccent";

interface ButtonProps extends TouchableOpacityProps {
	title: string;
	variant?: "primary" | "secondary" | "outline";
	icon?: keyof typeof Ionicons.glyphMap;
	iconPosition?: "left" | "right";
	/** Button size - affects padding and text size */
	size?: "small" | "medium" | "large";
}

/**
 * Reusable Button Component.
 *
 * Supports multiple variants, sizes, optional icons, and full TouchableOpacity props.
 * Uses the current accent color for primary buttons.
 */
export default function Button({
	title,
	variant = "primary",
	icon,
	iconPosition = "left",
	size = "medium",
	className = "",
	...props
}: ButtonProps) {
	const accent = useAccent();

	// base styles that every button variant shares
	const baseStyle =
		"flex-row items-center justify-center rounded-3xl active:opacity-90";

	// different visual styles depending on the variant chosen
	const variantStyles = {
		primary: `${accent.bg500} ${accent.bg600Active}`,
		secondary: "bg-zinc-800 active:bg-zinc-700",
		outline: "border border-zinc-700 bg-transparent active:bg-zinc-900",
	};

	// padding changes based on size
	const sizeStyles = {
		small: "py-3 px-5",
		medium: "py-4 px-6",
		large: "py-6 px-8",
	};

	// text size also scales with button size
	const textSize = {
		small: "text-sm",
		medium: "text-base",
		large: "text-xl",
	}[size];

	// primary buttons use black text, everything else uses white
	const textColor = variant === "primary" ? "text-black" : "text-white";
	const iconColor = variant === "primary" ? "#000" : "#fff";
	const iconSize = size === "large" ? 24 : 20;

	return (
		<TouchableOpacity
			className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
			{...props}
		>
			{/* show icon on the left if provided and iconPosition is left */}
			{icon && iconPosition === "left" && (
				<Ionicons
					name={icon}
					size={iconSize}
					color={iconColor}
					className="mr-3"
				/>
			)}

			{/* the actual button label */}
			<Text className={`font-semibold ${textColor} ${textSize}`}>{title}</Text>

			{/* show icon on the right if provided and iconPosition is right */}
			{icon && iconPosition === "right" && (
				<Ionicons
					name={icon}
					size={iconSize}
					color={iconColor}
					className="ml-3"
				/>
			)}
		</TouchableOpacity>
	);
}
