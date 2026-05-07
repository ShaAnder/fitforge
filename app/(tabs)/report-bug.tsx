import TabScreen from "@/components/layout/TabScreen";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function ReportBugScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const { showAlert } = useAlert();

	const [title, setTitle] = useState("");
	const [details, setDetails] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const submit = async () => {
		if (!user?.id) {
			showAlert("Not signed in", "Please sign in and try again.", "error");
			return;
		}

		if (!title.trim() || !details.trim()) {
			showAlert("Missing info", "Add a title and details.", "info");
			return;
		}

		setSubmitting(true);
		try {
			const supabase = getSupabase();

			// Save to database (for records)
			const { error: dbError } = await supabase.from("bug_reports").insert({
				user_id: user.id,
				title: title.trim(),
				details: details.trim(),
			});
			if (dbError) throw dbError;

			// Send real email via Edge Function
			const { error: emailError } = await supabase.functions.invoke(
				"send-bug-report",
				{
					body: {
						title: title.trim(),
						details: details.trim(),
						user_email: user.email,
					},
				},
			);
			if (emailError) throw emailError;

			showAlert(
				"Report Sent",
				"Thank you! We received your bug report.",
				"success",
			);
			router.replace("/(tabs)/dashboard");

			// Clear form
			setTitle("");
			setDetails("");
		} catch (err: any) {
			showAlert("Report failed", err?.message || "Please try again.", "error");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<TabScreen
			title="Report a bug"
			subtitle="Help us improve"
			footer={
				<Button
					title={submitting ? "Sending..." : "Send report"}
					size="large"
					variant="primary"
					onPress={submit}
					disabled={submitting}
				/>
			}
		>
			<View className="gap-6">
				<Button
					title="Back to Dashboard"
					variant="outline"
					onPress={() => router.replace("/(tabs)/dashboard")}
				/>

				<Card className="p-6">
					<Text className="text-zinc-400 text-sm mb-2 ml-1">Title</Text>
					<TextInput
						className="bg-zinc-900 text-white p-5 rounded-2xl text-base"
						placeholder="Short summary"
						placeholderTextColor="#71717a"
						value={title}
						onChangeText={setTitle}
						autoCapitalize="sentences"
					/>

					<View className="h-5" />

					<Text className="text-zinc-400 text-sm mb-2 ml-1">Details</Text>
					<TextInput
						className="bg-zinc-900 text-white p-5 rounded-2xl text-base"
						placeholder="What happened? Steps to reproduce?"
						placeholderTextColor="#71717a"
						value={details}
						onChangeText={setDetails}
						multiline
						textAlignVertical="top"
						style={{ minHeight: 160 }}
						autoCapitalize="sentences"
					/>
				</Card>
			</View>
		</TabScreen>
	);
}
