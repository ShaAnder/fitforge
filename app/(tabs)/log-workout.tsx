// app/(tabs)/log-workout.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import TabScreen from "@/components/layout/TabScreen";
import Button from "@/components/ui/Button";
import ExerciseSlot from "@/components/workout/ExerciseSlot";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase";

import { Exercise, getAllExercises } from "@/lib/supabaseQueries";

/**
 * Log Workout Screen
 */
export default function LogWorkout() {
	const { user } = useAuth();
	const supabase = getSupabase();

	const [exercises, setExercises] = useState<any[]>([]);
	const [allExercises, setAllExercises] = useState<Exercise[]>([]);
	const [loadingLibrary, setLoadingLibrary] = useState(true);

	const [nextExerciseId, setNextExerciseId] = useState(1);
	const [nextSetId, setNextSetId] = useState(1); // ← Explicit number type

	const [searchQuery, setSearchQuery] = useState("");
	const [isSaving, setIsSaving] = useState(false);

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

	// Load exercises
	useEffect(() => {
		const loadLibrary = async () => {
			try {
				const data = await getAllExercises();
				setAllExercises(data);
			} catch (err: any) {
				console.error("[LogWorkout] ❌ Failed to load library:", err.message);
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
		setNextSetId((prev) => prev + 1); // ← Now safe

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

	const isWorkoutValid = (): boolean => {
		if (exercises.length === 0) return false;
		return exercises.every((exercise) =>
			exercise.sets.every(
				(set: any) => set.reps?.trim() !== "" && set.weight?.trim() !== "",
			),
		);
	};

	const saveWorkout = async () => {
		if (!user) {
			setAlert({
				visible: true,
				title: "Not Logged In",
				message: "You must be logged in.",
				type: "error",
			});
			return;
		}

		if (!isWorkoutValid()) {
			setAlert({
				visible: true,
				title: "Incomplete Workout",
				message: "Fill all reps and weights.",
				type: "error",
			});
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
			});

			if (error) throw error;

			setAlert({
				visible: true,
				title: "Success!",
				message: `Workout saved! Volume: ${totalVolume} kg`,
				type: "success",
			});

			setExercises([]);
			setSearchQuery("");
		} catch (err: any) {
			setAlert({
				visible: true,
				title: "Save Failed",
				message: err.message,
				type: "error",
			});
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
					title={isSaving ? "Saving..." : "Save Workout"}
					variant="primary"
					size="large"
					onPress={saveWorkout}
					disabled={isSaving}
				/>
			}
		>
			{/* Search Bar */}
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
								<Text className="text-emerald-400 text-xs capitalize">
									{ex.muscle} • {ex.difficulty}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				)}
			</View>

			{/* Exercise Slots with Images */}
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
