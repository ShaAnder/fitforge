import "react-native-gesture-handler/jestSetup";

if (
	typeof window !== "undefined" &&
	typeof window.dispatchEvent !== "function"
) {
	window.dispatchEvent = jest.fn();
}

// doing this to keep jest happy
jest.mock("react-native-reanimated", () => {
	const Reanimated = require("react-native-reanimated/mock");
	Reanimated.default.call = () => {};
	return Reanimated;
});

jest.mock("expo-router", () => ({
	Redirect: () => null,
	Stack: {
		Screen: () => null,
	},
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
	}),
	useSegments: () => [],
	useRootNavigationState: () => ({ key: "test" }),
}));

jest.mock("expo-splash-screen", () => ({
	preventAutoHideAsync: jest.fn(),
	hideAsync: jest.fn(),
}));

jest.mock("expo-notifications", () => ({}));

jest.mock("@expo/vector-icons", () => {
	return {
		Ionicons: () => null,
	};
});
