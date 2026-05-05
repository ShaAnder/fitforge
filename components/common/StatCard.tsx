import { Text, View } from "react-native";
import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";

interface StatCardProps {
	// Main label for the stat (e.g. "DAYS TRAINED")
	title: string;
	// Primary value to display (can be number or string)
	value: string | number;
	// Optional subtitle (e.g. "/ 31" or "logged")
	subtitle?: string;
	// Optional progress percentage (0-100) - shows a progress bar when provided
	progress?: number;
	// Allow custom styling for layout (flex-1, w-full, etc.)
	className?: string;
}

/**
 * StatCard component for displaying key fitness metrics with optional progress bar.
 * Used in dashboards for stats like training days, total volume, etc.
 *
 * @param title     - Label text shown at the top
 * @param value     - Main value (displayed large and bold)
 * @param subtitle  - Optional smaller text displayed next to the value
 * @param progress  - Optional progress percentage (0-100). Renders ProgressBar if provided.
 */
export default function StatCard({
	title,
	value,
	subtitle,
	progress,
	className = "",
}: StatCardProps) {
	return (
		<Card className={`p-6 ${className}`}>
			{/* Stat Title */}
			<Text className="text-emerald-400 text-sm font-medium tracking-widest text-center">
				{title}
			</Text>

			{/* Main Value + Optional Subtitle */}
			<View className="items-center mt-3">
				<Text className="text-5xl font-bold text-white">{value}</Text>
				{subtitle && (
					<Text className="text-2xl text-zinc-500 font-normal mt-1">
						{subtitle}
					</Text>
				)}
			</View>

			{/* Progress Bar - only rendered when progress is provided */}
			{progress !== undefined && (
				<ProgressBar progress={progress} height={1} className="mt-6" />
			)}
		</Card>
	);
}
