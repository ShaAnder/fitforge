// components/ui/NavDrawer.tsx
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface NavDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
	const router = useRouter();
	const { user, signOut } = useAuth();

	const menuItems = [
		{ title: "Dashboard", icon: "home-outline", route: "/(tabs)/dashboard" },
		{ title: "Settings", icon: "settings-outline", route: "/(tabs)/settings" },
		{
			title: "Achievements",
			icon: "trophy-outline",
			route: "/(tabs)/achievements",
		},
		{ title: "Community", icon: "people-outline", route: "/(tabs)/community" },
		{ title: "Privacy", icon: "shield-outline", route: "/privacy" },
	];

	const handleMenuPress = (route: string) => {
		router.push(route as any);
		onClose();
	};

	const handleSignOut = async () => {
		try {
			await signOut();
			onClose();
			// The AuthContext + route protection will automatically redirect to login
		} catch (error) {
			console.error("Sign out failed:", error);
		}
	};
	// Only render content when open (prevents unnecessary renders)
	if (!isOpen) return null;

	return (
		<View className="bg-zinc-900 rounded-t-3xl h-[70%] p-6">
			{/* Header */}
			<View className="flex-row items-center gap-4 mb-8">
				<View className="w-14 h-14 bg-emerald-500 rounded-2xl items-center justify-center">
					<Ionicons name="barbell" size={32} color="#000" />
				</View>
				<View>
					<Text className="text-white text-3xl font-bold tracking-tighter">
						FitForge
					</Text>
					{user && <Text className="text-zinc-400 text-sm">{user.email}</Text>}
				</View>
			</View>
			<ScrollView className="flex-1">
				{menuItems.map((item) => (
					<TouchableOpacity
						key={item.title}
						onPress={() => handleMenuPress(item.route)}
						className="flex-row items-center py-5 border-b border-zinc-800"
					>
						<Ionicons name={item.icon as any} size={26} color="#a1a1aa" />
						<Text className="text-white text-xl ml-5 font-medium">
							{item.title}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>{" "}
			{/* Sign Out */}
			<TouchableOpacity
				onPress={handleSignOut}
				className="flex-row items-center py-5 mt-8 border-t border-zinc-800"
			>
				<Ionicons name="log-out-outline" size={26} color="#ef4444" />
				<Text className="text-red-500 text-xl ml-5 font-medium">Sign Out</Text>
			</TouchableOpacity>
		</View>
	);
}
