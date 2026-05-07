module.exports = {
	preset: "jest-expo",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
		"^react-native-css-interop/jsx-runtime$":
			"<rootDir>/__mocks__/react-native-css-interop/jsx-runtime.js",
		"^react-native-css-interop/jsx-dev-runtime$":
			"<rootDir>/__mocks__/react-native-css-interop/jsx-dev-runtime.js",
		"^react-native-css-interop$":
			"<rootDir>/__mocks__/react-native-css-interop.js",
		"^react-native-css-interop(?:/.*)?$":
			"<rootDir>/__mocks__/react-native-css-interop.js",
	},
	transformIgnorePatterns: [
		"node_modules/(?!(react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@expo/vector-icons|expo-router|nativewind|react-native-reanimated|@react-navigation/.*))",
	],
};
