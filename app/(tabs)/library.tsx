// app/(tabs)/library.tsx
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import TabScreen from "@/components/layout/TabScreen";
import ModalView from "@/components/ui/ModalView";
import { EXERCISE_LIBRARY, Exercise } from "@/constants/exercises";

/**
 * Exercise Library Screen
 */
export default function Library() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedMuscle, setSelectedMuscle] = useState<string>("All");
	const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
		null,
	);

	const muscleGroups = [
		"All",
		"Chest",
		"Back",
		"Legs",
		"Shoulders",
		"Arms",
		"Core",
	];

	const filteredExercises = useMemo(() => {
		return EXERCISE_LIBRARY.filter((exercise) => {
			const matchesSearch = exercise.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			const matchesMuscle =
				selectedMuscle === "All" || exercise.muscle === selectedMuscle;
			return matchesSearch && matchesMuscle;
		});
	}, [searchQuery, selectedMuscle]);

	const openExerciseModal = (exercise: Exercise) => {
		setSelectedExercise(exercise);
	};

	const closeModal = () => {
		setSelectedExercise(null);
	};

	return (
		<TabScreen title="Exercise Library" subtitle="Discover movements">
			{/* Search Bar */}
			<View className="px-5 mb-6">
				<View className="bg-zinc-900 rounded-3xl p-4 flex-row items-center border border-zinc-800">
					<Ionicons name="search" size={20} color="#a1a1aa" />
					<TextInput
						className="flex-1 ml-3 text-white text-base"
						placeholder="Search exercises..."
						placeholderTextColor="#a1a1aa"
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
				</View>
			</View>

			{/* Muscle Group Filters */}
			<View className="px-5 mb-8">
				<View className="flex-row flex-wrap gap-2">
					{muscleGroups.map((group) => (
						<TouchableOpacity
							key={group}
							onPress={() => setSelectedMuscle(group)}
							className={`px-5 py-2.5 rounded-full border text-sm ${
								selectedMuscle === group
									? "bg-emerald-500 border-emerald-500"
									: "bg-zinc-900 border-zinc-800"
							}`}
						>
							<Text
								className={`font-medium capitalize ${
									selectedMuscle === group ? "text-black" : "text-white"
								}`}
							>
								{group}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			{/* Exercise List */}
			<ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
				{filteredExercises.length === 0 ? (
					<Text className="text-zinc-400 text-center py-12">
						No exercises found. Try a different search or filter.
					</Text>
				) : (
					filteredExercises.map((item) => (
						<TouchableOpacity
							key={item.id}
							onPress={() => openExerciseModal(item)}
							className="bg-zinc-900 rounded-3xl p-5 mb-4 border border-zinc-800 active:bg-zinc-800"
						>
							<View className="flex-row justify-between items-start">
								<View className="flex-1 pr-4">
									<Text className="text-white text-lg font-semibold">
										{item.name}
									</Text>
									<Text className="text-emerald-400 text-sm mt-1 capitalize">
										{item.muscle} • {item.difficulty}
									</Text>
									<Text className="text-zinc-400 text-sm mt-3 line-clamp-2">
										{item.description}
									</Text>
								</View>
								<Ionicons name="chevron-forward" size={22} color="#a1a1aa" />
							</View>
						</TouchableOpacity>
					))
				)}
			</ScrollView>

			{/* Exercise Detail Modal */}
			<ModalView
				visible={!!selectedExercise}
				onRequestClose={closeModal}
				width="90%"
				height="85%"
			>
				{selectedExercise && (
					<View className="flex-1">
						{/* Header */}
						<Text className="text-white text-3xl font-bold mb-6">
							{selectedExercise.name}
						</Text>

						{/* GIF Placeholder */}
						<View className="bg-zinc-800 rounded-3xl h-64 mb-6 items-center justify-center">
							<Ionicons name="image-outline" size={80} color="#a1a1aa" />
							<Text className="text-zinc-400 text-sm mt-4">
								GIF coming soon
							</Text>
						</View>

						{/* Instructions */}
						<Text className="text-emerald-400 text-lg font-semibold mb-3">
							Instructions
						</Text>
						<Text className="text-zinc-300 leading-6 text-base">
							{selectedExercise.description}
						</Text>

						{/* Close Button */}
						<TouchableOpacity
							onPress={closeModal}
							className="mt-auto bg-zinc-700 py-4 rounded-2xl"
						>
							<Text className="text-white text-center font-semibold text-base">
								Close
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</ModalView>
		</TabScreen>
	);
}
