// components/dashboard/WeeklyVolumeChart.tsx
import React, { useState } from "react";
import { View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

// typescript types for our  weekly volume, expects a chartData array of objects with value / labels only
interface WeeklyVolumeChartProps {
	chartData: {
		value: number;
		label: string;
		topLabelComponent: () => React.ReactNode;
	}[];
}

type BarchartDataItem = {
	value: number;
	label: string;
	// any other properties the chart might add
};

/**
 * WeeklyVolumeChart - Fully responsive bar chart that measures its parent container and dynamically calculates width, bar thickness, and spacing.
 *
 * This component ensures the chart always stays centered and fits nicely inside its card, with special handling for the last label (Sunday) not being cut off.
 *
 * @param chartData - Array of { value: number; label: string } for each day
 *
 * References:
 * - BarChart Props: https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts/blob/master/docs/BarChart/BarChartProps.md
 * - onLayout: https://reactnative.dev/docs/view#onlayout
 */
export default function WeeklyVolumeChart({
	chartData,
}: WeeklyVolumeChartProps) {
	const [containerWidth, setContainerWidth] = useState<number>(0);

	// check if container width set
	if (containerWidth === 0) {
		// if not create a view with the size params we need and then set
		// that container width for actual barchart (fallback)
		return (
			<View
				className="w-full h-80"
				onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
			/>
		);
	}

	// set our spacing based on container width size
	const spacing = containerWidth > 420 ? 24 : 14;
	// 10% padding on each side
	const horizontalPadding = containerWidth * 0.05;
	// calc available width by container - 2x the horizontal padding
	const availableWidth = containerWidth - horizontalPadding * 2 - spacing * 2;

	// set our bar width based on availabile width - spacing so t hey feel like they fill the space
	const barWidth = Math.max(
		26,
		(availableWidth - spacing * (chartData.length - 1)) / chartData.length,
	);

	// Find the max value in your data
	const maxMinutes = Math.max(...chartData.map((item) => item.value));
	// Round up to the nearest 10 for a clean chart top
	const roundedMax = Math.ceil(maxMinutes / 10) * 10;
	// Number of sections (each section = 10 minutes)
	const noOfSections = roundedMax / 10;

	return (
		<View
			className="items-center justify-center "
			style={{ paddingRight: spacing }}
		>
			{/* removed w-full */}
			<BarChart
				data={chartData}
				isAnimated
				noOfSections={noOfSections}
				stepValue={30}
				maxValue={roundedMax}
				rulesType="solid"
				width={availableWidth}
				barWidth={barWidth}
				spacing={spacing}
				height={300}
				frontColor="#22c55e"
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
