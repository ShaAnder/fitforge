import { View } from "react-native";

interface ProgressBarProps {
	progress: number; // 0 to 100
	height?: number; // optional custom height (default: 8)
	color?: string; // optional custom color (default: emerald-500)
	backgroundColor?: string; // optional custom background color
	className?: string;
}

/**
 * Reusable ProgressBar component.
 * Shows a horizontal progress bar with customizable height and colors.
 *
 * @param progress         - Progress percentage (0-100)
 * @param height           - Height of the progress bar in pixels
 * @param color            - Color of the filled progress
 * @param backgroundColor  - Color of the unfilled background
 * @param className        - Additional Tailwind/NativeWind classes
 */
export default function ProgressBar({
	progress,
	height = 8,
	color = "bg-emerald-500",
	backgroundColor = "bg-zinc-800",
	className = "",
}: ProgressBarProps) {
	// Ensure progress stays between 0 and 100
	const clampedProgress = Math.max(0, Math.min(100, progress));

	return (
		<View
			className={`h-${height} ${backgroundColor} rounded-full overflow-hidden ${className}`}
		>
			<View
				className={`${color} h-full rounded-full transition-all`}
				style={{ width: `${clampedProgress}%` }}
			/>
		</View>
	);
}
