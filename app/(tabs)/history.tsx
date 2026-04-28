// app/(tabs)/history.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import TabScreen from "@/components/layout/TabScreen";
import CustomAlert from "@/components/ui/CustomAlert";
import { useAuth } from "@/context/AuthContext";
import { fetchWorkouts } from "@/lib/supabaseWorkoutQuery";

/**
 * History Screen
 *
 * Displays a list of past saved workouts.
 * Tapping a workout opens a detailed modal view.
 */
export default function History() {
	const { user } = useAuth();

	const [workouts, setWorkouts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

	const [alert, setAlert] = useState<{
		visible: boolean;
		title: string;
		message: string;
		type: "success" | "error" | "info";
	}>({
		visible: false,
		title: "",
		message: "",
		type: "info",
	});

	useEffect(() => {
		if (user?.id) loadWorkouts();
	}, [user]);

	const loadWorkouts = async () => {
		try {
			setLoading(true);
			const data = await fetchWorkouts(user!.id);

			setWorkouts(data);
		} catch (err: any) {
			setAlert({
				visible: true,
				title: "Failed to Load",
				message: err.message || "Could not load workout history.",
				type: "error",
			});
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

	const closeAlert = () => {
		setAlert((prev) => ({ ...prev, visible: false }));
	};

	return (
		<TabScreen title="History" subtitle="Past Workouts">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{loading ? (
					<Text className="text-zinc-400 text-center py-10">
						Loading workouts...
					</Text>
				) : workouts.length === 0 ? (
					<View className="flex-1 items-center justify-center py-20 min-h-[500px]">
						<Ionicons name="calendar-outline" size={80} color="#3f3f46" />
						<Text className="text-zinc-400 text-2xl font-semibold mt-8">
							No workouts yet
						</Text>
						<Text className="text-zinc-500 text-center mt-3 px-10 text-base">
							Your saved workouts will appear here once you log some sessions
						</Text>
					</View>
				) : (
					workouts.map((workout) => (
						<TouchableOpacity
							key={workout.id}
							onPress={() => openWorkoutDetail(workout)}
							className="bg-zinc-900 rounded-3xl p-5 mb-4 active:bg-zinc-800"
						>
							<View className="flex-row justify-between items-start">
								<View>
									<Text className="text-white text-lg font-semibold">
										{new Date(workout.date).toLocaleDateString("en-US", {
											weekday: "long",
											month: "short",
											day: "numeric",
										})}
									</Text>
									<Text className="text-zinc-400 text-sm mt-1">
										{workout.exercises?.length || 0} exercises
									</Text>
								</View>

								<View className="items-end">
									<Text className="text-emerald-400 font-bold text-xl">
										{workout.total_volume || 0} kg
									</Text>
									<Text className="text-zinc-500 text-xs">total volume</Text>
								</View>
							</View>
						</TouchableOpacity>
					))
				)}
			</ScrollView>

			{/* Workout Detail Modal */}
			{selectedWorkout && (
				<Pressable
					className="absolute inset-0 bg-black/90 z-50 justify-center px-5"
					onPress={closeDetail}
				>
					<Pressable
						onPress={(e) => e.stopPropagation()}
						className="bg-zinc-900 rounded-3xl p-6"
					>
						<Text className="text-white text-2xl font-bold mb-4">
							{new Date(selectedWorkout.date).toLocaleDateString()}
						</Text>

						<ScrollView>
							{Array.isArray(selectedWorkout.exercises) &&
							selectedWorkout.exercises.length > 0 ? (
								selectedWorkout.exercises.map((ex: any, idx: number) => (
									<View key={idx} className="mb-6 bg-zinc-800 rounded-2xl p-4">
										<Text className="text-emerald-400 font-semibold text-lg mb-3">
											{ex?.name || "Unnamed Exercise"}
										</Text>
										{Array.isArray(ex?.sets) && ex.sets.length > 0 ? (
											ex.sets.map((set: any, sIdx: number) => (
												<Text
													key={sIdx}
													className="text-zinc-300 text-base mb-1"
												>
													Set {sIdx + 1}: {set?.reps || "?"} reps ×{" "}
													{set?.weight || "?"} kg
												</Text>
											))
										) : (
											<Text className="text-zinc-500">No sets recorded</Text>
										)}
									</View>
								))
							) : (
								<Text className="text-zinc-400 text-center py-8">
									No exercises found in this workout
								</Text>
							)}
						</ScrollView>

						<TouchableOpacity
							onPress={closeDetail}
							className="bg-zinc-700 py-4 rounded-2xl mt-4"
						>
							<Text className="text-white text-center font-semibold">
								Close
							</Text>
						</TouchableOpacity>
					</Pressable>
				</Pressable>
			)}

			<CustomAlert
				visible={alert.visible}
				title={alert.title}
				message={alert.message}
				type={alert.type}
				onClose={closeAlert}
			/>
		</TabScreen>
	);
}
