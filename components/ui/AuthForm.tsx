import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface AuthFormField {
	name: string;
	label?: string;
	placeholder: string;
	type?: "text" | "email" | "password";
	value: string;
	onChangeText: (text: string) => void;
}

interface AuthFormProps {
	fields: AuthFormField[];
	buttonText: string;
	onSubmit: () => void;
	loading?: boolean;
	error?: string;
}

/**
 * AuthForm - Specialized form component for authentication screens
 *
 * Features:
 *   - Dynamic field rendering from a declarative array
 *   - Automatic password visibility toggle
 *   - Uses our custom Button component
 *   - Resets password visibility when form unmounts or after submit
 */
export default function AuthForm({
	fields,
	buttonText,
	onSubmit,
	loading = false,
	error,
}: AuthFormProps) {
	// state to track which password fields are visible
	// key = field.name, value = bool (true = visible)
	const [visiblePasswords, setVisiblePasswords] = useState<
		Record<string, boolean>
	>({});

	// Reset visibility when the form unmounts (user leaves the screen)
	// different from successful submit catches fringe cases like failed
	// login / refresh
	useEffect(() => {
		return () => {
			setVisiblePasswords({});
		};
	}, []);

	// Toggle eye icon for password fields
	const togglePasswordVisibility = (fieldName: string) => {
		setVisiblePasswords((prev) => ({
			...prev,
			[fieldName]: !prev[fieldName],
		}));
	};

	// Wrapper around onSubmit so we can reset visibility on successful submit
	const handleSubmit = () => {
		// Reset visibility before submitting (good UX + prevents stale state)
		setVisiblePasswords({});
		onSubmit();
	};

	return (
		<View className="w-full">
			{fields.map((field) => {
				const isPassword = field.type === "password";
				const isVisible = visiblePasswords[field.name] || false;

				return (
					<View key={field.name} className="mb-5">
						{field.label && (
							<Text className="text-zinc-400 text-sm mb-2 ml-1">
								{field.label}
							</Text>
						)}

						<View className="relative">
							<TextInput
								className="bg-zinc-900 text-white p-5 rounded-2xl text-base pr-12"
								placeholder={field.placeholder}
								placeholderTextColor="#71717a"
								value={field.value}
								onChangeText={field.onChangeText}
								secureTextEntry={isPassword && !isVisible}
								keyboardType={
									field.type === "email" ? "email-address" : "default"
								}
								autoCapitalize="none"
							/>

							{/* Eye toggle - only for password fields */}
							{isPassword && (
								<TouchableOpacity
									onPress={() => togglePasswordVisibility(field.name)}
									className="absolute right-5 top-1/2 -translate-y-1/2"
								>
									<Ionicons
										name={isVisible ? "eye-off-outline" : "eye-outline"}
										size={24}
										color="#a1a1aa"
									/>
								</TouchableOpacity>
							)}
						</View>
					</View>
				);
			})}

			{error && <Text className="text-red-500 text-center mb-6">{error}</Text>}

			{/* Use our custom Button component */}
			<Button
				title={buttonText}
				variant="primary"
				size="large"
				onPress={handleSubmit}
				disabled={loading}
			/>
		</View>
	);
}
