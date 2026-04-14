import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

// import our global.css
import "../global.css";

// our root layout, sets up all the default look / root of the app
export default function RootLayout() {
	// use effect so we can see when its all mounted for the moment
	useEffect(() => {
		console.log("✅ FitForge root layout loaded with NativeWind + dark theme");
	}, []);

	return (
		// First we setup BG - this will be our dark mode default
		<View className="flex-1 bg-red-500">
			{/* We use stack because the tabs we will use live inside the tabs folder.
      We will also use headerShown: false, to remove the default and design our own later */}
			<Stack screenOptions={{ headerShown: false }}>
				{/* All tab screens will be rendered here automatically */}
			</Stack>
		</View>
	);
}
