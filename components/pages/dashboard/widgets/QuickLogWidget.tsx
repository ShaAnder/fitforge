import Button from "@/components/ui/Button";
import { useRouter } from "expo-router";

/**
 * QuickLogWidget - Floating action button to log a new workout.
 */
export default function QuickLogWidget() {
	const router = useRouter();

	return (
		<Button
			title="QUICK LOG WORKOUT"
			icon="add-circle"
			variant="primary"
			size="large"
			onPress={() => router.push("/(tabs)/log-workout")}
		/>
	);
}
