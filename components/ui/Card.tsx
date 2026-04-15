import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
	children: React.ReactNode;
	variant?: "default" | "elevated";
}

export default function Card({
	children,
	variant = "default",
	className = "",
	...props
}: CardProps) {
	return (
		<View
			className={`
        bg-zinc-900 
        rounded-3xl 
        border 
        border-zinc-800 
        ${variant === "elevated" ? "shadow-2xl" : ""}
        ${className}
      `}
			{...props}
		>
			{children}
		</View>
	);
}
