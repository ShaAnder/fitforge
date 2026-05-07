import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import TabScreen from "@/components/layout/TabScreen";
import ModalView from "@/components/ui/ModalView";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { convertWeight, getUnitLabel } from "@/helpers/unitConverter";
import { useAccent } from "@/hooks/useAccent";
import { fetchWorkouts } from "@/lib/supabaseQueries";

/**
 * History Screen - Displays past workouts with details.
 *
 * Features:
 * - List of past workouts with date, time, and total volume
 * - Pull-to-refresh via useFocusEffect
 * - Modal detail view showing individual exercises and sets
 * - Unit conversion based on user preference (kg/lb)
 */
export default function History() {
	const { user, profile } = useAuth();
	const { showAlert } = useAlert();
	const accent = useAccent();

	// User preferences
	const userUnit = (profile?.units as "kg" | "lb") ?? "kg";
	const unitLabel = getUnitLabel(userUnit);

	const [workouts, setWorkouts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

	/**
	 * Reload workouts every time the screen comes into focus.
	 */
	useFocusEffect(
		useCallback(() => {
			if (user?.id) loadWorkouts();
		}, [user]),
	);

	/**
	 * Load all workouts for the current user.
	 */
	const loadWorkouts = async () => {
		try {
			setLoading(true);
			const data = await fetchWorkouts(user!.id);
			setWorkouts(data || []);
		} catch (err: any) {
			showAlert(
				"Failed to Load",
				err.message || "Could not load history.",
				"error",
			);
		} finally {
			setLoading(false);
		}
	};

	const openWorkoutDetail = (workout: any) => {
		setSelectedWorkout(workout);
	};

	const closeDetail = () => {
		setSelectedWorkout(null);
	};

	return (
		<TabScreen title="History" subtitle="Past Workouts">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{loading ? (
					<Text className="text-zinc-400 text-center py-12">
						Loading workouts...
					</Text>
				) : workouts.length === 0 ? (
					<View className="items-center justify-center py-20 min-h-[500px]">
						<Ionicons name="calendar-outline" size={80} color="#3f3f46" />
						<Text className="text-zinc-400 text-2xl font-semibold mt-8">
							No workouts yet
						</Text>
						<Text className="text-zinc-500 text-center mt-4 px-10">
							Your logged workouts will appear here
						</Text>
					</View>
				) : (
					workouts.map((workout) => {
						const totalVolumeConverted = convertWeight(
							workout.total_volume || 0,
							userUnit,
						);

						const workoutDate = new Date(workout.date);

						const dateString = workoutDate.toLocaleDateString("en-US", {
							weekday: "long",
							month: "short",
							day: "numeric",
						});

						const timeString = workoutDate.toLocaleTimeString("en-US", {
							hour: "numeric",
							minute: "2-digit",
							hour12: true,
						});

						return (
							<TouchableOpacity
								key={workout.id}
								onPress={() => openWorkoutDetail(workout)}
								className="bg-zinc-900 rounded-3xl p-5 mb-4 active:bg-zinc-800"
							>
								<View className="flex-row justify-between items-start">
									<View>
										<Text className="text-white text-lg font-semibold">
											{dateString}
										</Text>
										<Text className="text-zinc-400 text-sm mt-1">
											{timeString} • {workout.exercises?.length || 0} exercises
										</Text>
									</View>

									<View className="items-end">
										<Text className={`${accent.text400} font-bold text-xl`}>
											{totalVolumeConverted} {unitLabel}
										</Text>
										<Text className="text-zinc-500 text-xs">total volume</Text>
									</View>
								</View>
							</TouchableOpacity>
						);
					})
				)}
			</ScrollView>

			{/* Workout Detail Modal */}
			<ModalView
				visible={!!selectedWorkout}
				onRequestClose={closeDetail}
				width="90%"
				height="70%"
			>
				<Text className="text-white text-2xl font-bold mb-6">
					{selectedWorkout &&
						new Date(selectedWorkout.date).toLocaleDateString("en-US", {
							weekday: "long",
							month: "long",
							day: "numeric",
						})}{" "}
					•{" "}
					{selectedWorkout &&
						new Date(selectedWorkout.date).toLocaleTimeString("en-US", {
							hour: "numeric",
							minute: "2-digit",
							hour12: true,
						})}
				</Text>

				<ScrollView
					className="flex-1 -mx-1 px-1"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 40 }}
				>
					{selectedWorkout?.exercises?.map((ex: any, idx: number) => (
						<View key={idx} className="mb-6 bg-zinc-800 rounded-2xl p-5">
							<Text className={`${accent.text400} font-semibold text-lg mb-3`}>
								{ex?.name || "Unnamed Exercise"}
							</Text>

							{ex?.sets?.map((set: any, sIdx: number) => {
								const weightConverted = convertWeight(
									set?.weight || 0,
									userUnit,
								);
								return (
									<Text key={sIdx} className="text-zinc-300 text-base mb-1">
										Set {sIdx + 1}: {set?.reps || "?"} reps × {weightConverted}{" "}
										{unitLabel}
									</Text>
								);
							})}
						</View>
					)) || (
						<Text className="text-zinc-400 text-center py-12">
							No exercises in this workout
						</Text>
					)}
				</ScrollView>

				<TouchableOpacity
					onPress={closeDetail}
					className="bg-zinc-700 py-4 rounded-2xl mt-4"
				>
					<Text className="text-white text-center font-semibold">Close</Text>
				</TouchableOpacity>
			</ModalView>
		</TabScreen>
	);
}
