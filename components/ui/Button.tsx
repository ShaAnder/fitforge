import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
	title: string;
	variant?: "primary" | "secondary" | "outline";
	icon?: keyof typeof Ionicons.glyphMap;
	iconPosition?: "left" | "right";
	/** Button size - affects padding and text size */
	size?: "small" | "medium" | "large";
}

/**
 * Reusable Button component with support for different variants, sizes, and optional icons.
 *
 * @param title        - Text displayed on the button
 * @param variant      - Visual style of the button
 * @param icon         - Optional icon from Ionicons
 * @param iconPosition - Position of the icon relative to the text
 * @param size         - Size of the button (small / medium / large)
 * @param className    - Additional Tailwind/NativeWind classes
 * @param ...props     - All standard TouchableOpacity props
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
	// Base styles common to all buttons
	const baseStyle =
		"flex-row items-center justify-center rounded-3xl active:opacity-90";

	// Variant styles
	const variantStyles = {
		primary: "bg-emerald-500 active:bg-emerald-600",
		secondary: "bg-zinc-800 active:bg-zinc-700",
		outline: "border border-zinc-700 bg-transparent active:bg-zinc-900",
	};

	// Size-specific padding and text sizing
	const sizeStyles = {
		small: "py-3 px-5",
		medium: "py-4 px-6",
		large: "py-6 px-8",
	};

	// Text size based on button size
	const textSize = {
		small: "text-sm",
		medium: "text-base",
		large: "text-xl",
	}[size];

	const textColor = variant === "primary" ? "text-black" : "text-white";
	const iconColor = variant === "primary" ? "#000" : "#fff";
	const iconSize = size === "large" ? 24 : 20;

	return (
		<TouchableOpacity
			className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
			{...props}
		>
			{/* Icon - Left */}
			{icon && iconPosition === "left" && (
				<Ionicons
					name={icon}
					size={iconSize}
					color={iconColor}
					className="mr-3"
				/>
			)}

			{/* Button Title */}
			<Text className={`font-semibold ${textColor} ${textSize}`}>{title}</Text>

			{/* Icon - Right */}
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
