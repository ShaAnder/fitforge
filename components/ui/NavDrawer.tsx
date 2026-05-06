import Avatar from "@/components/common/Avatar";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface NavDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

function normalizeRoutePath(path: string) {
	// Route groups like /(tabs) aren't in the actual URL pathname.
	return (
		(path || "/")
			.replace(/\/\([^)]*\)/g, "")
			.replace(/\/+$/, "")
			.trim() || "/"
	);
}

export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { user, profile, signOut } = useAuth();

	const menuItems = [
		{ title: "Dashboard", icon: "home-outline", route: "/(tabs)/dashboard" },
		{ title: "Community", icon: "people-outline", route: "/(tabs)/community" },
		{
			title: "Achievements",
			icon: "trophy-outline",
			route: "/(tabs)/achievements",
		},
		{ title: "Settings", icon: "settings-outline", route: "/(tabs)/settings" },
		{ title: "Privacy", icon: "shield-outline", route: "/privacy" },
		{ title: "Terms", icon: "document-text-outline", route: "/terms" },
	];

	const currentPath = normalizeRoutePath(pathname);

	const getDisplayName = () => {
		const username = (profile?.username as string | undefined | null) ?? null;
		if (username && username.trim()) return username.trim();

		const email = user?.email ?? null;
		if (!email) return "Guest";

		return email.split("@")[0] || email;
	};

	const handleMenuPress = (route: string) => {
		router.push(route as any);
		onClose();
	};

	const handleSignOut = async () => {
		try {
			await signOut();
			onClose();
		} catch (error) {
			console.error("Sign out failed:", error);
		}
	};

	if (!isOpen) return null;

	return (
		<View className="bg-zinc-900 rounded-t-3xl flex-1 p-6">
			{/* Header: user avatar + name + close */}
			<View className="flex-row items-center justify-between mb-8">
				<View className="flex-row items-center gap-4">
					<Avatar size={56} />
					<View>
						<Text className="text-white text-3xl font-bold tracking-tighter">
							FitForge
						</Text>
						<Text className="text-zinc-400 text-sm">{getDisplayName()}</Text>
					</View>
				</View>

				<TouchableOpacity
					onPress={onClose}
					className="w-11 h-11 rounded-full bg-zinc-800 items-center justify-center"
				>
					<Ionicons name="close" size={22} color="#a1a1aa" />
				</TouchableOpacity>
			</View>

			{/* Menu */}
			<ScrollView className="flex-1">
				{menuItems.map((item) => {
					const active = normalizeRoutePath(item.route) === currentPath;
					const iconColor = active ? "#22c55e" : "#a1a1aa";
					const textClass = active
						? "text-emerald-400 text-xl ml-5 font-semibold"
						: "text-white text-xl ml-5 font-medium";

					return (
						<TouchableOpacity
							key={item.title}
							onPress={() => handleMenuPress(item.route)}
							className="flex-row items-center py-5 border-b border-zinc-800"
						>
							<Ionicons name={item.icon as any} size={26} color={iconColor} />
							<Text className={textClass}>{item.title}</Text>
						</TouchableOpacity>
					);
				})}
			</ScrollView>

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
