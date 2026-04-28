import { useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import TabScreen from "@/components/layout/TabScreen";
import Button from "@/components/ui/Button";
import ExerciseSlot from "@/components/workout/ExerciseSlot";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase";

// Local exercise library for real-time suggestions
const EXERCISE_LIBRARY = [
	"Bench Press",
	"Squat",
	"Deadlift",
	"Overhead Press",
	"Pull Up",
	"Barbell Row",
	"Dumbbell Curl",
	"Tricep Extension",
	"Leg Press",
	"Lunges",
	"Lat Pulldown",
	"Face Pull",
	"Incline Bench Press",
	"Romanian Deadlift",
	"Push Up",
	"Plank",
	"Chest Fly",
	"Lateral Raise",
	"Hammer Curl",
	"Calf Raise",
];

/**
 * LogWorkout Screen
 *
 * Main screen for logging a complete workout session.
 *
 * Features:
 * - Real-time search with dropdown suggestions
 * - Tap suggestion or press Enter to add new exercise
 * - Dynamic sets per exercise (reps + weight)
 * - Strict validation before saving
 * - Uses TabScreen wrapper for consistent layout
 */
export default function LogWorkout() {
	const { user } = useAuth();
	const supabase = getSupabase();

	// Stable ID counters
	const [nextExerciseId, setNextExerciseId] = useState(1);
	const [nextSetId, setNextSetId] = useState(1);

	// Current workout (starts empty)
	const [exercises, setExercises] = useState<any[]>([]);

	const [searchQuery, setSearchQuery] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	// Custom Alert State
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

	/**
	 * Live filtered suggestions from the exercise library.
	 */
	const filteredExercises = useMemo(() => {
		if (!searchQuery.trim()) return [];
		return EXERCISE_LIBRARY.filter((name) =>
			name.toLowerCase().includes(searchQuery.toLowerCase()),
		).slice(0, 10);
	}, [searchQuery]);

	/**
	 * Adds a new exercise from search or manual entry.
	 * Clears search field after adding.
	 */
	const addExercise = (name: string) => {
		if (!name.trim()) return;

		const exerciseId = nextExerciseId;
		const setId = nextSetId;

		setNextExerciseId((prev) => prev + 1);
		setNextSetId((prev) => prev + 1);

		setExercises((prev) => [
			...prev,
			{
				id: exerciseId,
				name: name.trim(),
				sets: [{ id: setId, reps: "", weight: "" }],
			},
		]);

		setSearchQuery("");
	};

	const updateExercise = (id: number, newData: any) => {
		setExercises((prev) =>
			prev.map((ex) => (ex.id === id ? { ...ex, ...newData } : ex)),
		);
	};

	const removeExercise = (id: number) => {
		setExercises((prev) => prev.filter((ex) => ex.id !== id));
	};

	/**
	 * Strict validation before saving:
	 * - At least one exercise
	 * - Every exercise has a name
	 * - Every set has both reps and weight filled
	 */
	const isWorkoutValid = (): boolean => {
		if (exercises.length === 0) return false;

		return exercises.every((exercise) => {
			if (!exercise.name?.trim()) return false;
			return exercise.sets.every(
				(set: any) => set.reps?.trim() !== "" && set.weight?.trim() !== "",
			);
		});
	};

	const saveWorkout = async () => {
		if (!user) {
			setAlert({
				visible: true,
				title: "Not Logged In",
				message: "You must be logged in to save workouts.",
				type: "error",
			});
			return;
		}

		if (!isWorkoutValid()) {
			setAlert({
				visible: true,
				title: "Incomplete Workout",
				message:
					"Please add at least one exercise and fill in reps + weight for every set.",
				type: "error",
			});
			return;
		}

		setIsSaving(true);

		try {
			const { error } = await supabase.from("workouts").insert({
				user_id: user.id,
				exercises: exercises,
				total_volume: 0,
				notes: "",
			});

			if (error) throw error;

			setAlert({
				visible: true,
				title: "Success!",
				message: "Workout saved successfully.",
				type: "success",
			});

			// Reset form after successful save
			setExercises([]);
			setSearchQuery("");
		} catch (err: any) {
			setAlert({
				visible: true,
				title: "Save Failed",
				message: err.message || "Failed to save workout.",
				type: "error",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const closeAlert = () => {
		setAlert((prev) => ({ ...prev, visible: false }));
	};

	return (
		<TabScreen
			title="Log Workout"
			subtitle="Today's Session"
			footer={
				<Button
					title={isSaving ? "Saving..." : "Save Workout"}
					variant="primary"
					size="large"
					onPress={saveWorkout}
					disabled={isSaving}
				/>
			}
		>
			{/* Search Bar */}
			<View className="pt-4 pb-6 relative z-10">
				<TextInput
					className="bg-zinc-900 text-white px-5 py-4 rounded-2xl text-base"
					placeholder="Search or type exercise name..."
					placeholderTextColor="#71717a"
					value={searchQuery}
					onChangeText={setSearchQuery}
					onSubmitEditing={() => addExercise(searchQuery)}
				/>

				{/* Dropdown Suggestions */}
				{searchQuery.length > 0 && filteredExercises.length > 0 && (
					<View className="absolute top-16 left-5 right-5 bg-zinc-900 rounded-2xl border border-zinc-800 z-20 shadow-xl">
						{filteredExercises.map((item) => (
							<TouchableOpacity
								key={item}
								className="px-5 py-4 border-b border-zinc-800 active:bg-zinc-800"
								onPress={() => addExercise(item)}
							>
								<Text className="text-white text-base">{item}</Text>
							</TouchableOpacity>
						))}
					</View>
				)}
			</View>

			{/* List of Exercises */}
			{exercises.map((exercise) => (
				<ExerciseSlot
					key={exercise.id}
					exercise={exercise}
					onUpdate={(newData) => updateExercise(exercise.id, newData)}
					onRemove={() => removeExercise(exercise.id)}
					nextSetId={nextSetId}
					setNextSetId={setNextSetId}
				/>
			))}

			{/* Bottom padding */}
			<View className="h-32" />
		</TabScreen>
	);
}
