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
 * Reusable Card component for wrapping content with consistent styling.
 *
 * @param children   - Content to display inside the card
 * @param variant    - Visual elevation style ("default" or "elevated")
   - Additional Tailwind/NativeWind classes for customization
 * @param ...props   - All other props passed down to the View component
 */
export default function Card({
	children,
	variant = "default",
	className = "",
	...props
}: CardProps) {
	// Base card styles
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
