import { Text } from "react-native";
import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";

interface StatCardProps {
	// Main label for the stat (e.g. "DAYS TRAINED")
	title: string;
	// Primary value to display (can be number or string)
	value: string | number;
	// Optional subtitle (e.g. "/ 31")
	subtitle?: string;
	// Optional progress percentage (0-100) - shows a progress bar when provided
	progress?: number;
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
}: StatCardProps) {
	return (
		<Card className="p-6 flex-1">
			{/* Stat Title */}
			<Text className="text-emerald-400 text-xs font-medium tracking-widest">
				{title}
			</Text>

			{/* Main Value + Optional Subtitle */}
			<Text className="text-5xl font-bold text-white mt-3">
				{value}
				{subtitle && (
					<Text className="text-2xl text-zinc-500 font-normal">
						{" "}
						{subtitle}
					</Text>
				)}
			</Text>

			{/* Progress Bar - only rendered when progress is provided */}
			{progress !== undefined && (
				<ProgressBar progress={progress} height={8} className="mt-6" />
			)}
		</Card>
	);
}
