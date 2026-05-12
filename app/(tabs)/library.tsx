import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import TabScreen from "@/components/layout/TabScreen";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ModalView from "@/components/ui/ModalView";

import { useAccent } from "@/hooks/useAccent";

import {
	Exercise,
	getAllExercises,
	getUniqueMuscles,
} from "@/lib/supabaseQueries";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Exercise Library Screen.
 *
 * Allows users to browse, search, and filter the full list of exercises.
 * Supports muscle group filtering and detailed modal view.
 */
export default function Library() {
	const accent = useAccent();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedMuscle, setSelectedMuscle] = useState<string>("All");
	const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
		null,
	);

	// Dynamic data
	const [exercises, setExercises] = useState<Exercise[]>([]);
	const [loading, setLoading] = useState(true);

	/**
	 * Load all exercises on screen mount.
	 */
	useEffect(() => {
		const loadExercises = async () => {
			try {
				const data = await getAllExercises();
				setExercises(data);
			} catch (err: any) {
				// Error handled silently - UI will show empty state
			} finally {
				setLoading(false);
			}
		};

		loadExercises();
	}, []);

	/**
	 * Filter exercises based on search query and selected muscle group.
	 */
	const filteredExercises = useMemo(() => {
		return exercises.filter((exercise: Exercise) => {
			const matchesSearch = exercise.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			const matchesMuscle =
				selectedMuscle === "All" || exercise.muscle === selectedMuscle;
			return matchesSearch && matchesMuscle;
		});
	}, [exercises, searchQuery, selectedMuscle]);

	/**
	 * Get unique muscle groups for filter chips.
	 */
	const muscleGroups = useMemo(() => {
		const unique = getUniqueMuscles(exercises);
		return ["All", ...unique];
	}, [exercises]);

	const openExerciseModal = (exercise: Exercise) => {
		setSelectedExercise(exercise);
	};

	const closeModal = () => {
		setSelectedExercise(null);
	};

	return (
		<SafeAreaView
			className="flex-1 bg-zinc-950"
			edges={["top"]} // Good
		>
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
				{!loading && (
					<View className="px-5 mb-8">
						<View className="flex-row flex-wrap gap-2">
							{muscleGroups
								.filter((group) => group !== "All")
								.map((group) => {
									const isActive = selectedMuscle === group;
									return (
										<TouchableOpacity
											key={group}
											onPress={() => {
												if (isActive) {
													setSelectedMuscle("All");
												} else {
													setSelectedMuscle(group);
												}
											}}
											className={`px-5 py-2.5 rounded-full border text-sm ${
												isActive
													? `${accent.bg500} ${accent.border500}`
													: "bg-zinc-900 border-zinc-800"
											}`}
										>
											<Text
												className={`font-medium capitalize ${
													isActive ? "text-black" : "text-white"
												}`}
											>
												{group}
											</Text>
										</TouchableOpacity>
									);
								})}
						</View>
					</View>
				)}

				{/* Exercise List */}
				<ScrollView
					className="flex-1 px-5"
					showsVerticalScrollIndicator={false}

				>
					{loading ? (
						<View className="flex-1 justify-center items-center min-h-[400px]">
							<LoadingScreen
								message="Loading exercises..."
								subMessage=""
								showBrand={false}
								size="large"
								fullScreen={false}
							/>
						</View>
					) : filteredExercises.length === 0 ? (
						<View className="py-20 items-center">
							<Ionicons name="search-outline" size={60} color="#3f3f46" />
							<Text className="text-zinc-400 text-center mt-6 text-base">
								No exercises found
							</Text>
							<Text className="text-zinc-500 text-center text-sm mt-1">
								Try a different search or filter
							</Text>
						</View>
					) : (
						filteredExercises.map((item: Exercise) => (
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
										<Text
											className={`${accent.text400} text-sm mt-1 capitalize`}
										>
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
						<View className="flex-1 relative">
							<ScrollView
								className="flex-1 px-6 pt-6"
								showsVerticalScrollIndicator={false}
								bounces={false}
							>
								{/* GIF Placeholder */}
								<View className="bg-zinc-800 h-72 mb-6 rounded-2xl items-center justify-center overflow-hidden">
									<Ionicons name="image-outline" size={90} color="#a1a1aa" />
									<Text className="text-zinc-400 text-sm mt-4">
										GIF coming soon
									</Text>
								</View>

								{/* Exercise Info */}
								<Text className="text-white text-4xl font-bold mb-1">
									{selectedExercise.name}
								</Text>

								<Text className="text-zinc-500 text-lg capitalize mb-1">
									{selectedExercise.muscle} • {selectedExercise.difficulty}
								</Text>

								<Text
									className={`${accent.text500} text-lg font-semibold mb-8`}
								>
									{selectedExercise.estimated_calories_per_set} ~ calories per
									set
								</Text>

								<Text
									className={`${accent.text400} text-xl font-semibold mb-3`}
								>
									About this exercise
								</Text>
								<Text className="text-zinc-300 leading-6 text-base mb-8">
									{selectedExercise.description}
								</Text>

								<Text
									className={`${accent.text400} text-xl font-semibold mb-3`}
								>
									How to perform
								</Text>

								<View className="mb-12">
									{selectedExercise.instructions
										?.replace(/\\n/g, "\n")
										.split("\n")
										.filter((line) => line.trim().length > 0)
										.map((line, index) => (
											<Text
												key={index}
												className="text-zinc-300 leading-7 text-base mb-3"
											>
												• {line.trim()}
											</Text>
										))}
								</View>
							</ScrollView>

							{/* Fixed Close Button */}
							<View className="absolute bottom-6 left-6 right-6">
								<TouchableOpacity
									onPress={closeModal}
									className="bg-zinc-700 py-4 rounded-2xl active:bg-zinc-600"
								>
									<Text className="text-white text-center font-semibold text-base">
										Close
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}
				</ModalView>
			</TabScreen>
		</SafeAreaView>
	);
}
