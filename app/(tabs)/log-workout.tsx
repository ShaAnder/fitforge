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

import { Exercise, getAllExercises } from "@/lib/supabaseQueries";

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
export default function LogWorkout() {
	const { user, refreshWorkouts } = useAuth();
	const { showAlert } = useAlert();
	const accent = useAccent();
	const supabase = getSupabase();

	const [exercises, setExercises] = useState<any[]>([]);
	const [allExercises, setAllExercises] = useState<Exercise[]>([]);
	const [loadingLibrary, setLoadingLibrary] = useState(true);

	const [nextExerciseId, setNextExerciseId] = useState(1);
	const [nextSetId, setNextSetId] = useState(1);

	const [searchQuery, setSearchQuery] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	/**
	 * Load full exercise library on mount.
	 */
	useEffect(() => {
		const loadLibrary = async () => {
			try {
				const data = await getAllExercises();
				setAllExercises(data);
			} catch (err: any) {
				// Library load failure is non-critical
			} finally {
				setLoadingLibrary(false);
			}
		};

		loadLibrary();
	}, []);

	/**
	 * Filter exercises for search dropdown (max 12 results).
	 */
	const filteredExercises = useMemo(() => {
		if (!searchQuery.trim()) return [];
		return allExercises
			.filter((ex) => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
			.slice(0, 12);
	}, [allExercises, searchQuery]);

	/**
	 * Add selected exercise to current workout.
	 */
	const addExercise = (exercise: Exercise) => {
		const localId = nextExerciseId;
		setNextExerciseId((prev) => prev + 1);
		setNextSetId((prev) => prev + 1);

		setExercises((prev) => [
			{
				localId,
				...exercise,
				sets: [{ id: nextSetId, reps: "", weight: "" }],
			},
			...prev,
		]);

		setSearchQuery("");
	};

	const updateExercise = (localId: number, newData: any) => {
		setExercises((prev) =>
			prev.map((ex) => (ex.localId === localId ? { ...ex, ...newData } : ex)),
		);
	};

	const removeExercise = (localId: number) => {
		setExercises((prev) => prev.filter((ex) => ex.localId !== localId));
	};

	/**
	 * Calculate total volume lifted in current workout.
	 */
	const calculateTotalVolume = (): number => {
		return exercises.reduce((total, exercise) => {
			const exerciseVolume = exercise.sets.reduce((sum: number, set: any) => {
				const weight = parseFloat(set.weight) || 0;
				const reps = parseFloat(set.reps) || 0;
				return sum + weight * reps;
			}, 0);
			return total + exerciseVolume;
		}, 0);
	};

	/**
	 * Validate that all sets have reps and weight filled.
	 */
	const isWorkoutValid = (): boolean => {
		if (exercises.length === 0) return false;
		return exercises.every((exercise) =>
			exercise.sets.every(
				(set: any) => set.reps?.trim() !== "" && set.weight?.trim() !== "",
			),
		);
	};

	/**
	 * Save the complete workout to Supabase.
	 */
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
		const totalVolume = calculateTotalVolume();

		try {
			const { error } = await supabase.from("workouts").insert({
				user_id: user.id,
				exercises,
				total_volume: totalVolume,
				notes: "",
				date: new Date().toISOString(),
			});

			if (error) throw error;

			// Success flow
			showAlert(
				"Workout Logged!",
				`Session saved successfully. Total volume: ${totalVolume} kg`,
				"success",
			);

			// Reset form
			setExercises([]);
			setSearchQuery("");

			// Refresh dashboard data
			await refreshWorkouts();
		} catch (err: any) {
			showAlert(
				"Save Failed",
				err.message || "Could not save workout.",
				"error",
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
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
			{/* Search Bar with Dropdown Suggestions */}
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

			{/* Current Workout Exercises */}
			{exercises.map((exercise) => (
				<ExerciseSlot
					key={exercise.localId}
					exercise={exercise}
					onUpdate={(newData) => updateExercise(exercise.localId, newData)}
					onRemove={() => removeExercise(exercise.localId)}
					nextSetId={nextSetId}
					setNextSetId={setNextSetId}
				/>
			))}

			{/* Empty State */}
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
	);
}
