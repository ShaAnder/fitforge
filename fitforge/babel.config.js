// babel.config.js
// NativeWind v4 needs this preset to convert className="..." into actual React Native styles. Without it, Tailwind classes are ignored.

module.exports = function (api) {
	api.cache(true);
	return {
		presets: [
			// This tells Expo to use NativeWind for JSX
			["babel-preset-expo", { jsxImportSource: "nativewind" }],
			"nativewind/babel",
		],
		plugins: [],
	};
};
