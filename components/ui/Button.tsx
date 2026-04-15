import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
	title: string;
	variant?: "primary" | "secondary" | "outline";
	icon?: keyof typeof Ionicons.glyphMap;
	iconPosition?: "left" | "right";
}

export default function Button({
	title,
	variant = "primary",
	icon,
	iconPosition = "left",
	className = "",
	...props
}: ButtonProps) {
	const baseStyle =
		"py-4 px-6 rounded-3xl flex-row items-center justify-center active:opacity-90";

	const variantStyles = {
		primary: "bg-emerald-500",
		secondary: "bg-zinc-800",
		outline: "border border-zinc-700",
	};

	const textColor = variant === "primary" ? "text-black" : "text-white";

	return (
		<TouchableOpacity
			className={`${baseStyle} ${variantStyles[variant]} ${className}`}
			{...props}
		>
			{icon && iconPosition === "left" && (
				<Ionicons
					name={icon}
					size={20}
					color={variant === "primary" ? "#000" : "#fff"}
				/>
			)}

			<Text className={`font-semibold text-base ml-2 ${textColor}`}>
				{title}
			</Text>

			{icon && iconPosition === "right" && (
				<Ionicons
					name={icon}
					size={20}
					color={variant === "primary" ? "#000" : "#fff"}
					className="ml-2"
				/>
			)}
		</TouchableOpacity>
	);
}
