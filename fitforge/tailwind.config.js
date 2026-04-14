/** @type {import('tailwindcss').Config} */

// tailwind module exporter to tell tailwind where we look for className="..."
// In this case we will be building everything in components and app
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],

	// tells tailwind to use nativewind RN compatible preset
	presets: [require("nativewind/preset")],

	// tailwind themes - light dark ect
	theme: {
		extend: {},
	},

	// tailwind plugins for typography forms ect later
	plugins: [],
};

// This works identical to web Tailwind config. The only difference in React Native is the content paths.
