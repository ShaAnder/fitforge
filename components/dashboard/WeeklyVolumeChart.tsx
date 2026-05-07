import React, { useState } from "react";
import { View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import { useAccent } from "@/hooks/useAccent";

interface WeeklyVolumeChartProps {
	// Array of { value, label } objects for each day of the week
	chartData: { value: number; label: string }[];
}

/**
 * Weekly Volume Chart Component.
 *
 * Displays a bar chart showing the user's weekly lifting volume.
 * Dynamically calculates bar width and spacing based on available screen width.
 */
export default function WeeklyVolumeChart({
	chartData,
}: WeeklyVolumeChartProps) {
	const [containerWidth, setContainerWidth] = useState<number>(0);
	const accent = useAccent();

	// Wait for container to measure its width before rendering chart
	if (containerWidth === 0) {
		return (
			<View
				className="w-full h-80"
				onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
			/>
		);
	}

	// Find highest value and round up to nice increments for y-axis
	const maxValue = Math.max(...chartData.map((item) => item.value), 100);
	const roundedMax = Math.ceil(maxValue / 50) * 50;

	// Calculate usable space for bars
	const horizontalPadding = containerWidth * 0.05;
	const availableWidth = containerWidth - horizontalPadding * 2;

	// Responsive spacing and bar width
	const spacing = containerWidth > 420 ? 24 : 14;
	const barWidth = Math.max(
		26,
		(availableWidth - spacing * (chartData.length - 1)) / chartData.length,
	);

	return (
		<View
			className="items-center justify-center w-full"
			style={{ marginLeft: spacing }}
		>
			<BarChart
				data={chartData}
				width={availableWidth}
				barWidth={barWidth}
				spacing={spacing}
				height={300}
				frontColor={accent.hex500}
				noOfSections={3}
				maxValue={roundedMax}
				stepValue={roundedMax / 3}
				hideRules={false}
				rulesType="solid"
				rulesColor="#27272a"
				yAxisThickness={0}
				xAxisThickness={0}
				hideYAxisText
				initialSpacing={0}
				endSpacing={0}
				xAxisLabelsHeight={40}
				xAxisLabelTextStyle={{
					color: "#a1a1aa",
					fontSize: 16,
					paddingTop: 20,
				}}
			/>
		</View>
	);
}
