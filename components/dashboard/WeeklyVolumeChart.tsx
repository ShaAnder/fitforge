import React, { useState } from "react";
import { View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import { useAccent } from "@/hooks/useAccent";

interface WeeklyVolumeChartProps {
	chartData: { value: number; label: string }[];
}

/**
 * WeeklyVolumeChart - Optimized to reduce Reanimated warnings
 */
export default function WeeklyVolumeChart({
	chartData,
}: WeeklyVolumeChartProps) {
	const [containerWidth, setContainerWidth] = useState<number>(0);
	const accent = useAccent();

	if (containerWidth === 0) {
		return (
			<View
				className="w-full h-80"
				onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
			/>
		);
	}

	const maxValue = Math.max(...chartData.map((item) => item.value), 100);
	const roundedMax = Math.ceil(maxValue / 50) * 50;

	const horizontalPadding = containerWidth * 0.05;
	const availableWidth = containerWidth - horizontalPadding * 2;
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
