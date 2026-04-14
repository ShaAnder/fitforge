// app/(tabs)/index.tsx
// This file acts as the entry point for the tabs group
// It automatically redirects to the dashboard so the app opens on the right screen

import { Redirect } from "expo-router";

export default function TabsIndex() {
	return <Redirect href="/(tabs)/dashboard" />;
}
