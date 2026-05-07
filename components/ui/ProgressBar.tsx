import { View } from "react-native";

import { useAccent } from "@/hooks/useAccent";

interface ProgressBarProps {
	// 0 to 100
	progress: number;
	// optional custom height (default: 8)
	height?: number;
	// optional custom fill color class (default: accent)
	color?: string;
	backgroundColor?: string;
	// optional custom background color
	className?: string;
}

/**
 * Reusable ProgressBar Component.
 *
 * Displays a horizontal progress bar used in stats cards
 * (e.g. "Days Trained" progress).
 */
export default function ProgressBar({
	progress,
	height = 8,
	color,
	backgroundColor = "bg-zinc-800",
	className = "",
}: ProgressBarProps) {
	const accent = useAccent();

	// Use accent color by default, otherwise use provided color
	const resolvedColor = color ?? accent.bg500;

	// Clamp progress between 0 and 100 to prevent invalid widths
	const clampedProgress = Math.max(0, Math.min(100, progress));

	return (
		<View
			className={`${backgroundColor} rounded-full overflow-hidden ${className}`}
			// We use inline style for dynamic height to avoid Tailwind limitations
			style={{ height }}
		>
			{/* Filled progress bar with smooth width transition */}
			<View
				className={`${resolvedColor} h-full rounded-full transition-all`}
				style={{ width: `${clampedProgress}%` }}
			/>
		</View>
	);
}
