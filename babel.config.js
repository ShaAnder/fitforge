module.exports = function (api) {
	api.cache(true);
	return {
		presets: [
			// This tells Expo to use NativeWind for JSX
			["babel-preset-expo", { jsxImportSource: "nativewind" }],
			"nativewind/babel",
		],
		plugins: [
			// module-resolver plugin tells Metro (Expo's bundler) how to resolve our
			// nice @/ aliases (from tsconfig) into real file paths at build time.
			// TypeScript only handles type-checking, Metro needs this for actual bundling.
			[
				"module-resolver",
				{
					root: ["./"],
					alias: {
						"@/*": "./*",
						"@/components/*": "./components/*",
						"@/constants/*": "./constants/*",
						"@/types/*": "./types/*",
						"@/hooks/*": "./hooks/*",
						"@/lib/*": "./lib/*",
						"@/utils/*": "./utils/*",
					},
				},
			],
		],
	};
};
