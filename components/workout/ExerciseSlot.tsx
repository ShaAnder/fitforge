import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { useAccent } from "@/hooks/useAccent";

interface Set {
	id: number;
	reps: string;
	weight: string;
}

interface ExerciseSlotProps {
	exercise: {
		id: number;
		name: string;
		sets: Set[];
	};
	weightUnit?: "kg" | "lb";
	onUpdate: (newData: any) => void;
	onRemove: () => void;
	nextSetId: number;
	setNextSetId: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * ExerciseSlot Component
 *
 * One exercise row in the workout logger.
 * Handles exercise name, multiple sets, adding/removing sets,
 * and deleting the whole exercise (except the first one).
 */
export default function ExerciseSlot({
	exercise,
	weightUnit = "kg",
	onUpdate,
	onRemove,
	nextSetId,
	setNextSetId,
}: ExerciseSlotProps) {
	// get the current accent colors for this user
	const accent = useAccent();
	// the first exercise (id === 1) cannot be deleted — we always need at least one
	const isFirstExercise = exercise.id === 1;

	const addSet = () => {
		// grab the next available id and immediately increment the counter
		const newSetId = nextSetId;
		setNextSetId((prev) => prev + 1);

		// append a new empty set to the exercise and tell the parent
		onUpdate({
			sets: [...exercise.sets, { id: newSetId, reps: "", weight: "" }],
		});
	};

	const removeSet = (setId: number) => {
		// don't allow removing the last remaining set
		if (exercise.sets.length === 1) return;

		// filter out the set being removed and update the parent
		onUpdate({
			sets: exercise.sets.filter((set) => set.id !== setId),
		});
	};

	return (
		<View className="bg-zinc-900 rounded-3xl p-5 mb-6">
			{/* header row: exercise name input + delete button (if not first exercise) */}
			<View className="flex-row items-center justify-between mb-4">
				<TextInput
					className="flex-1 text-white text-xl font-semibold bg-transparent "
					placeholder="Exercise name"
					placeholderTextColor="#71717a"
					value={exercise.name}
					onChangeText={(name) => onUpdate({ name })}
				/>

				{/* only show delete button if this is not the first exercise */}
				{!isFirstExercise && (
					<TouchableOpacity onPress={onRemove} className="ml-3">
						<Ionicons name="trash-outline" size={24} color="#ef4444" />
					</TouchableOpacity>
				)}
			</View>

			{/* render each set with reps + weight inputs */}
			{exercise.sets.map((set, index) => (
				<View key={set.id} className="flex-row gap-3 mb-3 x items-center">
					{/* set number (1-based) */}
					<Text className="text-zinc-400 text-base w-8 self-center font-medium">
						{index + 1}
					</Text>

					{/* reps input */}
					<TextInput
						className="flex-1 bg-zinc-800 text-white rounded-2xl px-4 py-3"
						placeholder="Reps"
						keyboardType="number-pad"
						value={set.reps}
						onChangeText={(reps) => {
							// create a copy of the sets array, update the current one, then push up
							const newSets = [...exercise.sets];
							newSets[index].reps = reps;
							onUpdate({ sets: newSets });
						}}
					/>

					{/* weight input (shows current unit in placeholder) */}
					<TextInput
						className="flex-1 bg-zinc-800 text-white rounded-2xl px-4 py-3"
						placeholder={`Weight (${weightUnit})`}
						keyboardType="number-pad"
						value={set.weight}
						onChangeText={(weight) => {
							const newSets = [...exercise.sets];
							newSets[index].weight = weight;
							onUpdate({ sets: newSets });
						}}
					/>

					{/* show delete button per set only when there's more than one set */}
					{exercise.sets.length > 1 && (
						<TouchableOpacity onPress={() => removeSet(set.id)}>
							<Ionicons name="trash-outline" size={20} color="#ef4444" />
						</TouchableOpacity>
					)}
				</View>
			))}

			{/* add set button at the bottom of the exercise card */}
			<TouchableOpacity
				onPress={addSet}
				className="flex-row items-center justify-center py-3 border border-dashed border-zinc-600 rounded-2xl mt-2"
			>
				<Ionicons name="add-circle-outline" size={20} color={accent.hex500} />
				<Text className={`${accent.text400} ml-2 font-medium`}>Add Set</Text>
			</TouchableOpacity>
		</View>
	);
}
