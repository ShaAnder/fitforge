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
 * - Exercise name
 * - Multiple sets with reps + weight
 * - Delete button per set
 * - First exercise cannot be deleted (minimum 1 exercise)
 */
export default function ExerciseSlot({
	exercise,
	weightUnit = "kg",
	onUpdate,
	onRemove,
	nextSetId,
	setNextSetId,
}: ExerciseSlotProps) {
	const accent = useAccent();
	const isFirstExercise = exercise.id === 1;

	const addSet = () => {
		const newSetId = nextSetId;
		setNextSetId((prev) => prev + 1);

		onUpdate({
			sets: [...exercise.sets, { id: newSetId, reps: "", weight: "" }],
		});
	};

	const removeSet = (setId: number) => {
		if (exercise.sets.length === 1) return;

		onUpdate({
			sets: exercise.sets.filter((set) => set.id !== setId),
		});
	};

	return (
		<View className="bg-zinc-900 rounded-3xl p-5 mb-6">
			<View className="flex-row items-center justify-between mb-4">
				<TextInput
					className="flex-1 text-white text-xl font-semibold bg-transparent "
					placeholder="Exercise name"
					placeholderTextColor="#71717a"
					value={exercise.name}
					onChangeText={(name) => onUpdate({ name })}
				/>

				{!isFirstExercise && (
					<TouchableOpacity onPress={onRemove} className="ml-3">
						<Ionicons name="trash-outline" size={24} color="#ef4444" />
					</TouchableOpacity>
				)}
			</View>

			{exercise.sets.map((set, index) => (
				<View key={set.id} className="flex-row gap-3 mb-3 x items-center">
					<Text className="text-zinc-400 text-base w-8 self-center font-medium">
						{index + 1}
					</Text>

					<TextInput
						className="flex-1 bg-zinc-800 text-white rounded-2xl px-4 py-3"
						placeholder="Reps"
						keyboardType="number-pad"
						value={set.reps}
						onChangeText={(reps) => {
							const newSets = [...exercise.sets];
							newSets[index].reps = reps;
							onUpdate({ sets: newSets });
						}}
					/>

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

					{exercise.sets.length > 1 && (
						<TouchableOpacity onPress={() => removeSet(set.id)}>
							<Ionicons name="trash-outline" size={20} color="#ef4444" />
						</TouchableOpacity>
					)}
				</View>
			))}

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
