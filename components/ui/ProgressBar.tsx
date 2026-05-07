import { View } from "react-native";

import { useAccent } from "@/hooks/useAccent";

interface ProgressBarProps {
	progress: number; // 0 to 100
	height?: number; // optional custom height (default: 8)
	color?: string; // optional custom fill color class (default: accent)
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
	color,
	backgroundColor = "bg-zinc-800",
	className = "",
}: ProgressBarProps) {
	const accent = useAccent();
	const resolvedColor = color ?? accent.bg500;
	// Ensure progress stays between 0 and 100
	const clampedProgress = Math.max(0, Math.min(100, progress));

	return (
		<View
			className={`${backgroundColor} rounded-full overflow-hidden ${className}`}
			// we use style for dynamic height instead of className to prevent it hardlocking
			style={{ height }}
		>
			<View
				className={`${resolvedColor} h-full rounded-full transition-all`}
				style={{ width: `${clampedProgress}%` }}
			/>
		</View>
	);
}
