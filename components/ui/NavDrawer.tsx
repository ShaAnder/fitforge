import Avatar from "@/components/common/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useAccent } from "@/hooks/useAccent";
import type { IoniconsName } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface NavDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

type DrawerRoute =
	| "/(tabs)/dashboard"
	| "/(tabs)/community"
	| "/(tabs)/achievements"
	| "/(tabs)/settings"
	| "/privacy"
	| "/terms";

type DrawerMenuItem =
	| {
			title: string;
			icon: IoniconsName;
			route: DrawerRoute;
			isSignOut?: false;
	  }
	| {
			title: "Sign Out";
			icon: IoniconsName;
			route: "signout";
			isSignOut: true;
	  };

/**
 * Normalizes route paths by removing route groups (e.g. /(tabs)) and trailing slashes.
 * Used to determine which menu item is currently active.
 */
function normalizeRoutePath(path: string) {
	return (
		(path || "/")
			.replace(/\/\([^)]*\)/g, "") // remove route groups like /(tabs)
			.replace(/\/+$/, "") // remove trailing slashes
			.trim() || "/"
	);
}

/**
 * NavDrawer Component - Slide-up menu for "More" tab.
 *
 * Provides quick navigation to all major sections and account actions.
 * Includes user info at the top and a clean scrollable menu.
 */
export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { user, profile, signOut } = useAuth();
	const accent = useAccent();

	// Menu configuration
	const menuItems: DrawerMenuItem[] = [
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
		{
			title: "Sign Out",
			icon: "log-out-outline",
			route: "signout", // special flag
			isSignOut: true,
		},
	];

	// Current active route for highlighting
	const currentPath = normalizeRoutePath(pathname);

	/**
	 * Get display name: prefers username, falls back to email prefix.
	 */
	const getDisplayName = () => {
		const username = (profile?.username as string | undefined | null) ?? null;
		if (username && username.trim()) return username.trim();

		const email = user?.email ?? null;
		if (!email) return "Guest";

		return email.split("@")[0] || email;
	};

	const handleMenuPress = (route: DrawerRoute) => {
		router.push(route);
		onClose();
	};

	const handleSignOut = async () => {
		try {
			await signOut();
			onClose();
		} catch (err: unknown) {
			// Error handled globally via AlertContext — log in dev for visibility
			if (__DEV__) {
				// eslint-disable-next-line no-console
				console.warn("Sign out failed:", String(err));
			}
		}
	};

	// Don't render anything if drawer is closed
	if (!isOpen) return null;

	return (
		<View className="bg-zinc-900 rounded-t-3xl flex-1 p-6">
			{/* Header: User info + Close button */}
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

			{/* Scrollable Menu Items */}
			<ScrollView className="flex-1">
				{menuItems.map((item) => {
					const active =
						!item.isSignOut && normalizeRoutePath(item.route) === currentPath;

					const iconColor = item.isSignOut
						? "#ef4444"
						: active
							? accent.hex500
							: "#a1a1aa";

					const textClass = item.isSignOut
						? "text-red-500 text-xl ml-5 font-medium"
						: active
							? `${accent.text400} text-xl ml-5 font-semibold`
							: "text-white text-xl ml-5 font-medium";

					return (
						<TouchableOpacity
							key={item.title}
							onPress={() => {
								if (item.isSignOut) {
									handleSignOut();
								} else {
									handleMenuPress(item.route);
								}
							}}
							className="flex-row items-center py-5 border-b border-zinc-800"
						>
							<Ionicons name={item.icon} size={26} color={iconColor} />
							<Text className={textClass}>{item.title}</Text>
						</TouchableOpacity>
					);
				})}
			</ScrollView>
		</View>
	);
}
