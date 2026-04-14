/** @type {import('tailwindcss').Config} */

// tailwind module exporter to tell tailwind where we look for className="..."
// In this case we will be building everything in components and app
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],

	// tells tailwind to use nativewind RN compatible preset
	presets: [require("nativewind/preset")],

	// tailwind themes - light dark ect
	theme: {
		extend: {
			colors: {
				// primary color set
				primary: {
					500: "#22c55e", // Bright green (success, active tab, buttons)
					600: "#16a34a",
				},
				// Dark gym background colors
				zinc: {
					900: "#18181b", // Main background
					800: "#27272a", // Cards / surfaces
					700: "#3f3f46",
				},
				accent: "#eab308", // Yellow for streaks / achievements
				muted: "#a1a1aa", // Secondary text
			},
		},
	},

	// tailwind plugins for typography forms ect later
	plugins: [],
};

// This works identical to web Tailwind config. The only difference in React Native is the content paths.
