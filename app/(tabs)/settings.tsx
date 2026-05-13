// import TabScreen from "@/components/layout/TabScreen";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountCard } from "@/components/pages/settings/AccountCard";
import { AppearanceCard } from "@/components/pages/settings/AppearanceCard";
import { NotificationsCard } from "@/components/pages/settings/NotificationsCard";
import { PreferencesCard } from "@/components/pages/settings/PreferencesCard";
import {
	ContactCard,
	LegalCard,
} from "@/components/pages/settings/StaticCards";
import {
	ChangePasswordModal,
	DeleteAccountModal,
	ReminderTimeModal,
} from "@/components/pages/settings/Modals";

import { useChangePassword } from "@/hooks/useChangePassword";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import TabScreen from "@/components/layout/TabScreen";

export default function SettingsScreen() {
	const { user, profile, updateProfile, signOut } = useAuth();

	const reminder = useReminderSettings({ profile, updateProfile });
	const password = useChangePassword();
	const deleteAccount = useDeleteAccount({ user, signOut });

	const displayName = profile?.username || user?.email?.split("@")[0] || "User";

	return (
		<SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
			<TabScreen title="Settings" subtitle="Preferences">
				<View className="gap-6">
					<AppearanceCard profile={profile} updateProfile={updateProfile} />

					<NotificationsCard reminder={reminder} profile={profile} />

					<PreferencesCard profile={profile} updateProfile={updateProfile} />

					<AccountCard
						displayName={displayName}
						email={user?.email}
						onChangePassword={password.open}
						onDeleteAccount={deleteAccount.open}
					/>

					<ContactCard />

					<LegalCard />

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

			<ReminderTimeModal reminder={reminder} />
			<ChangePasswordModal password={password} />
			<DeleteAccountModal deleteAccount={deleteAccount} />
		</SafeAreaView>
	);
}
