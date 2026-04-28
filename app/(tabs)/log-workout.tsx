import { useState } from "react";
import { ScrollView, View } from "react-native";

import Header from "@/components/common/Header";
import Button from "@/components/ui/Button";
import ExerciseSlot from "@/components/workout/ExerciseSlot";

/**
 * LogWorkout Screen
 *
 * Main workout logging screen.
 * Add Exercise and Save Workout buttons are both at the bottom for easy access.
 */
export default function LogWorkout() {
	const [nextExerciseId, setNextExerciseId] = useState(2);
	const [nextSetId, setNextSetId] = useState(2);

	const [exercises, setExercises] = useState([
		{
			id: 1,
			name: "",
			sets: [{ id: 1, reps: "", weight: "" }],
		},
	]);

	const addNewExercise = () => {
		const exerciseId = nextExerciseId;
		const setId = nextSetId;

		setNextExerciseId((prev) => prev + 1);
		setNextSetId((prev) => prev + 1);

		setExercises((prev) => [
			...prev,
			{
				id: exerciseId,
				name: "",
				sets: [{ id: setId, reps: "", weight: "" }],
			},
		]);
	};

	const updateExercise = (id: number, newData: any) => {
		setExercises((prev) =>
			prev.map((ex) => (ex.id === id ? { ...ex, ...newData } : ex)),
		);
	};

	const removeExercise = (id: number) => {
		setExercises((prev) => prev.filter((ex) => ex.id !== id));
	};

	return (
		<View className="flex-1 bg-zinc-950">
			<View className="mt-10">
				<Header title="Log Workout" subtitle="Today's Session" />
			</View>

			<ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
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
			</ScrollView>

			{/* Bottom Action Buttons */}
			<View className="px-5 pb-8 bg-zinc-950 flex-row gap-3">
				<Button
					title="+ Add Exercise"
					variant="secondary"
					size="large"
					onPress={addNewExercise}
					className="flex-1"
				/>

				<Button
					title="Save Workout"
					variant="primary"
					size="large"
					onPress={() => console.log("TODO: Save workout", exercises)}
					className="flex-1"
				/>
			</View>
		</View>
	);
}
