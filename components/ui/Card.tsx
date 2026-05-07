import { View, ViewProps } from "react-native";

// CardProps extends ViewProps so we can pass any native View props
// without having to redefine them.
interface CardProps extends ViewProps {
	// Content to be rendered inside the card
	children: React.ReactNode;
	// Visual style of the card
	variant?: "default" | "elevated";
}

/**
 * Reusable Card Component.
 *
 * Provides consistent elevated container styling used throughout the app
 * for grouping related content (stats, forms, settings sections, etc.).
 */
export default function Card({
	children,
	variant = "default",
	className = "",
	...props
}: CardProps) {
	// Base card styles - dark theme with rounded corners and subtle border
	const baseStyles = "bg-zinc-900 rounded-3xl border border-zinc-800";

	// Variant-specific styles
	const variantStyles = {
		default: "",
		elevated: "shadow-2xl", // Note: shadow-2xl works on web. For native shadow, consider using a shadow library later.
	};

	// Combine all styles (more readable and easier to maintain)
	const cardClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

	return (
		<View className={cardClassName} {...props}>
			{children}
		</View>
	);
}
