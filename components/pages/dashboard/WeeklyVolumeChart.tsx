import React, { useState } from "react";
import { View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import { useAccent } from "@/hooks/useAccent";
import type { WeeklyVolumeItem } from "@/types";

interface WeeklyVolumeChartProps {
	chartData: WeeklyVolumeItem[];
}

/**
 * Weekly Volume Chart Component.
 *
 * Displays a bar chart of weekly lifting volume using react-native-gifted-charts.
 * Dynamically sizes bars based on screen width so it looks good on any device.
 * Handles the case where container width isn't known yet on first render.
 */
export default function WeeklyVolumeChart({
	chartData,
}: WeeklyVolumeChartProps) {
	// Track the actual rendered width of the container
	// We measure it on first layout because we need real pixel values for bar sizing
	const [containerWidth, setContainerWidth] = useState<number>(0);

	// Pull the user's chosen accent color for the bars
	const accent = useAccent();

	// While we don't know the container width yet, render an empty placeholder
	// The onLayout callback will fire and give us the real width on next render
	if (containerWidth === 0) {
		return (
			<View
				className="w-full h-80"
				onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
			/>
		);
	}

	// Find the highest value in the data so we can set a sensible max on the Y axis
	const maxValue = Math.max(...chartData.map((item) => item.value), 100);

	// Round the max up to the nearest 50 so the chart doesn't look cramped
	const roundedMax = Math.ceil(maxValue / 50) * 50;

	// Calculate available space for bars after accounting for side padding
	const horizontalPadding = containerWidth * 0.05;
	const availableWidth = containerWidth - horizontalPadding * 2;

	// Use tighter spacing on smaller screens, wider on larger ones
	const spacing = containerWidth > 420 ? 24 : 14;

	// Calculate bar width so bars fill the available space nicely without overflowing
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
				// Transform our WeeklyVolumeItem data into the shape the chart expects
				data={chartData.map((item) => ({
					value: item.value,
					label: item.label || item.day || "",
					topLabelComponent: item.topLabelComponent,
				}))}
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
