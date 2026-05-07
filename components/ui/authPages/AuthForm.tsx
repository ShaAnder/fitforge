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
 * AuthForm - Reusable form component for all authentication screens.
 *
 * Features:
 * - Dynamic field rendering from a declarative array
 * - Built-in password visibility toggle with eye icon
 * - Consistent styling with our design system
 * - Uses custom Button component
 * - Automatic cleanup of password visibility on unmount
 */
export default function AuthForm({
	fields,
	buttonText,
	onSubmit,
	loading = false,
	error,
}: AuthFormProps) {
	// Track visibility state for each password field
	// Key = field.name, Value = boolean (true = visible)
	const [visiblePasswords, setVisiblePasswords] = useState<
		Record<string, boolean>
	>({});

	/**
	 * Reset password visibility when the form unmounts.
	 * Prevents stale state if user navigates away and comes back.
	 */
	useEffect(() => {
		return () => {
			setVisiblePasswords({});
		};
	}, []);

	/**
	 * Toggle password visibility for a specific field.
	 */
	const togglePasswordVisibility = (fieldName: string) => {
		setVisiblePasswords((prev) => ({
			...prev,
			[fieldName]: !prev[fieldName],
		}));
	};

	/**
	 * Wrapper around onSubmit that resets password visibility first.
	 * Improves UX by hiding passwords after submission.
	 */
	const handleSubmit = () => {
		setVisiblePasswords({});
		onSubmit();
	};

	return (
		<View className="w-full">
			{fields.map((field) => {
				const isPassword = field.type === "password";
				const isVisible = visiblePasswords[field.name] || false;

				return (
					<View key={field.name} className="mb-6">
						{/* Optional field label */}
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

							{/* Eye icon toggle - only shown for password fields */}
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

			{/* Global error message (if provided) */}
			{error && <Text className="text-red-500 text-center mb-6">{error}</Text>}

			{/* Submit Button */}
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
