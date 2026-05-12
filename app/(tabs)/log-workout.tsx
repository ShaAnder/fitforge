/**
 * Log Workout Screen.
 *
 * Main screen for recording a new workout session.
 * Features:
 * - Real-time exercise search with dropdown suggestions
 * - Dynamic exercise slots with set management
 * - Total volume calculation
 * - Validation before saving
 * - Refreshes dashboard data on successful save
 */

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import TabScreen from "@/components/layout/TabScreen";
import Button from "@/components/ui/Button";
import ExerciseSlot from "@/components/workout/ExerciseSlot";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { useAccent } from "@/hooks/useAccent";
import { getSupabase } from "@/lib/supabase";

import { convertInputWeightToKg } from "@/helpers/unitConverter";
import { getAllExercises } from "@/lib/supabaseQueries";
import type { Exercise, LogWorkoutExercise, LogWorkoutSet } from "@/types";
import { getErrorMessage } from "@/utils/getError";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogWorkout() {
	const { user, profile, refreshWorkouts } = useAuth();
	const { showAlert } = useAlert();
	const accent = useAccent();
	const supabase = getSupabase();

	const userUnit = (profile?.units as "kg" | "lb") ?? "kg";

	const [exercises, setExercises] = useState<LogWorkoutExercise[]>([]);
	const [allExercises, setAllExercises] = useState<Exercise[]>([]);
	const [loadingLibrary, setLoadingLibrary] = useState(true);

	const [nextExerciseId, setNextExerciseId] = useState(1);
	const [nextSetId, setNextSetId] = useState(1);

	const [searchQuery, setSearchQuery] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const loadLibrary = async () => {
			try {
				const data = await getAllExercises();
				setAllExercises(data);
			} catch (err: unknown) {
				const message = getErrorMessage(err);
				showAlert("Failed to Load", message, "error");
			} finally {
				setLoadingLibrary(false);
			}
		};

		loadLibrary();
	}, []);

	const filteredExercises = useMemo(() => {
		if (!searchQuery.trim()) return [];
		return allExercises
			.filter((ex) => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
			.slice(0, 12);
	}, [allExercises, searchQuery]);

	const addExercise = (exercise: Exercise) => {
		const localId = nextExerciseId;
		setNextExerciseId((prev) => prev + 1);
		setNextSetId((prev) => prev + 1);
		setExercises((prev) => [
			{
				localId,
				id: Number(exercise.id),
				name: exercise.name,
				muscle: exercise.muscle,
				difficulty: exercise.difficulty,
				sets: [{ id: nextSetId, reps: "", weight: "" }],
			},
			...prev,
		]);

		setSearchQuery("");
	};

	const updateExercise = (
		localId: number,
		newData: Partial<LogWorkoutExercise>,
	) => {
		setExercises((prev) =>
			prev.map((ex) => {
				if (ex.localId === localId) {
					const updated = { ...ex, ...newData };
					// We return as safe assertion
					return updated as LogWorkoutExercise;
				}
				return ex;
			}),
		);
	};

	const removeExercise = (localId: number) => {
		setExercises((prev) => prev.filter((ex) => ex.localId !== localId));
	};

	const calculateTotalVolume = (): number => {
		return exercises.reduce((total, exercise) => {
			const exerciseVolume = exercise.sets.reduce(
				(sum: number, set: LogWorkoutSet) => {
					const weight = parseFloat(set.weight || "0");
					const reps = parseFloat(set.reps || "0");
					const kgWeight = convertInputWeightToKg(weight, userUnit);
					return sum + kgWeight * reps;
				},
				0,
			);

			return total + exerciseVolume;
		}, 0);
	};

	const isWorkoutValid = (): boolean => {
		if (exercises.length === 0) return false;

		return exercises.every((exercise) =>
			exercise.sets.every(
				(set) =>
					(set.reps || "").trim() !== "" && (set.weight || "").trim() !== "",
			),
		);
	};

	const saveWorkout = async () => {
		if (!user) {
			showAlert(
				"Not Logged In",
				"You must be logged in to save workouts.",
				"error",
			);
			return;
		}

		if (!isWorkoutValid()) {
			showAlert(
				"Incomplete Workout",
				"Please fill all reps and weights before saving.",
				"error",
			);
			return;
		}

		setIsSaving(true);

		const normalizedExercises = exercises.map((exercise) => ({
			...exercise,
			sets: exercise.sets.map((set: LogWorkoutSet) => ({
				...set,
				weight: convertInputWeightToKg(parseFloat(set.weight) || 0, userUnit),
			})),
		}));

		const totalVolume = calculateTotalVolume();

		try {
			const { error } = await supabase.from("workouts").insert({
				user_id: user.id,
				exercises: normalizedExercises,
				total_volume: totalVolume,
				notes: "",
				date: new Date().toISOString(),
			});

			if (error) throw error;

			showAlert(
				"Workout Logged!",
				`Session saved successfully. Total volume: ${Math.round(totalVolume)} kg`,
				"success",
			);

			setExercises([]);
			setSearchQuery("");
			await refreshWorkouts();
		} catch (err: unknown) {
			const message = getErrorMessage(err);
			showAlert("Save Failed", message || "Could not save workout.", "error");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			<TabScreen
				title="Log Workout"
				subtitle="Today's Session"
				footer={
					<Button
						title={isSaving ? "Saving Workout..." : "Save Workout"}
						variant="primary"
						size="large"
						onPress={saveWorkout}
						disabled={isSaving}
					/>
				}
			>
				<View className="px-5 pt-4 pb-6 relative z-10">
					<View className="bg-zinc-900 rounded-2xl flex-row items-center px-5 border border-zinc-800">
						<Ionicons name="search" size={20} color="#a1a1aa" />
						<TextInput
							className="flex-1 ml-3 py-4 text-white text-base"
							placeholder="Search exercises..."
							placeholderTextColor="#71717a"
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
					</View>

					{searchQuery.length > 0 && filteredExercises.length > 0 && (
						<View className="absolute top-16 left-5 right-5 bg-zinc-900 rounded-2xl border border-zinc-800 z-20 max-h-80 overflow-hidden">
							{filteredExercises.map((ex) => (
								<TouchableOpacity
									key={ex.id}
									className="px-5 py-4 border-b border-zinc-800 active:bg-zinc-800"
									onPress={() => addExercise(ex)}
								>
									<Text className="text-white text-base font-medium">
										{ex.name}
									</Text>
									<Text className={`${accent.text400} text-xs capitalize`}>
										{ex.muscle} • {ex.difficulty}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>

				{exercises.map((exercise) => (
					<ExerciseSlot
						key={exercise.localId}
						exercise={exercise}
						weightUnit={userUnit}
						onUpdate={(newData) => updateExercise(exercise.localId, newData)}
						onRemove={() => removeExercise(exercise.localId)}
						nextSetId={nextSetId}
						setNextSetId={setNextSetId}
					/>
				))}

				{!loadingLibrary && exercises.length === 0 && (
					<View className="items-center py-20">
						<Ionicons name="barbell-outline" size={70} color="#3f3f46" />
						<Text className="text-zinc-500 mt-6 text-center px-10">
							Search above to add exercises
						</Text>
					</View>
				)}

				<View className="h-32" />
			</TabScreen>
		</SafeAreaView>
	);
}
