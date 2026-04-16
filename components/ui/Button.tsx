import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

// type declaration for button props, we're extending touchable opacity from
// rn so we can inherit all the button props without having to redefine later.
interface ButtonProps extends TouchableOpacityProps {
	// title of our button must be string
	title: string;
	// our button variation classes
	variant?: "primary" | "secondary" | "outline";
	// pass icon if it is present
	icon?: keyof typeof Ionicons.glyphMap;
	// if icon let us choose a position for the icon
	iconPosition?: "left" | "right";
}

/**
 * Reusable Button component with support for different variants, optional icons, and full NativeWind className support.
 *
 * @param title       - Text displayed on the button
 * @param variant     - Visual style of the button
 * @param icon        - Optional icon from Ionicons
 * @param iconPosition - Position of the icon relative to the text
 * @param className   - Additional Tailwind/NativeWind classes
 * @param ...props    - All standard TouchableOpacity props
 */
export default function Button({
	title,
	variant = "primary",
	icon,
	iconPosition = "left",
	className = "",
	...props
}: ButtonProps) {
	// COnstants for styling later we can adapt these to a theme

	// Base styles common to all button variants
	const baseStyle =
		"py-4 px-6 rounded-3xl flex-row items-center justify-center active:opacity-90";

	// Variant-specific background and border styles
	const variantStyles = {
		primary: "bg-primary-500 active:bg-primary-600",
		secondary: "bg-zinc-800 active:bg-zinc-700",
		outline: "border border-zinc-700 bg-transparent active:bg-zinc-900",
	};

	// Text and icon colors based on variant
	const textColor = variant === "primary" ? "text-black" : "text-white";
	const iconColor = variant === "primary" ? "#000" : "#fff";

	return (
		<TouchableOpacity
			className={`${baseStyle} ${variantStyles[variant]} ${className}`}
			{...props}
		>
			{/* Icon - Left or Right */}
			{icon && (
				<Ionicons
					name={icon}
					size={20}
					color={iconColor}
					className={iconPosition === "left" ? "mr-2" : "ml-2"}
				/>
			)}

			{/* Button Title */}
			<Text className={`font-semibold text-base ${textColor}`}>{title}</Text>
		</TouchableOpacity>
	);
}
