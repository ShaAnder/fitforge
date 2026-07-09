import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountCard } from "@/components/pages/settings/AccountCard";
import { AppearanceCard } from "@/components/pages/settings/AppearanceCard";
import {
	ChangePasswordModal,
	DeleteAccountModal,
	ReminderTimeModal,
} from "@/components/pages/settings/Modals";
import { NotificationsCard } from "@/components/pages/settings/NotificationsCard";
import { PreferencesCard } from "@/components/pages/settings/PreferencesCard";
import {
	ContactCard,
	LegalCard,
} from "@/components/pages/settings/StaticCards";

import TabScreen from "@/components/layout/TabScreen";
import { useChangePassword } from "@/hooks/useChangePassword";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { useReminderSettings } from "@/hooks/useReminderSettings";

/**
 * SettingsScreen - Main settings hub for the app.
 *
 * Composes multiple focused cards for appearance, notifications, preferences,
 * account management, and legal/contact links. All modals are rendered at the
 * bottom so they can be controlled from the parent.
 */
export default function SettingsScreen() {
	const { user, profile, updateProfile, signOut } = useAuth();

	// Custom hooks that encapsulate reminder, password, and delete logic
	const reminder = useReminderSettings({ profile, updateProfile });
	const password = useChangePassword();
	const deleteAccount = useDeleteAccount({ user, signOut });

	// Fallback display name if profile username is missing
	const displayName = profile?.username || user?.email?.split("@")[0] || "User";

	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			<TabScreen title="Settings" subtitle="Preferences">
				<View className="gap-6">
					{/* Appearance settings (theme, accent color, etc.) */}
					<AppearanceCard profile={profile} updateProfile={updateProfile} />

					{/* Notification and reminder toggles + time pickers */}
					<NotificationsCard reminder={reminder} profile={profile} />

					{/* Workout preferences (units, week start, etc.) */}
					<PreferencesCard profile={profile} updateProfile={updateProfile} />

					{/* Account info + actions (change password, delete account) */}
					<AccountCard
						displayName={displayName}
						email={user?.email}
						onChangePassword={password.open}
						onDeleteAccount={deleteAccount.open}
					/>

					{/* Static contact / report bug card */}
					<ContactCard />

					{/* Static legal links card */}
					<LegalCard />

					{/* Sign out button at the bottom with extra padding */}
					<View className="pb-6">
						<Button
							title="Sign Out"
							variant="outline"
							size="large"
							onPress={signOut}
						/>
					</View>
				</View>
			</TabScreen>

			{/* All modals are mounted here so they can be opened from any card */}
			<ReminderTimeModal reminder={reminder} />
			<ChangePasswordModal password={password} />
			<DeleteAccountModal deleteAccount={deleteAccount} />
		</SafeAreaView>
	);
}
