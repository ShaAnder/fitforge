/** @type {import('tailwindcss').Config} */

// tailwind module exporter to tell tailwind where we look for className="..."
// In this case we will be building everything in components and app
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],

	// tells tailwind to use nativewind RN compatible preset
	presets: [require("nativewind/preset")],

	// tailwind themes - light dark ect, we're setting customs here so we can use them in our code base, without them tailwind falls back to defaults.
	theme: {
		extend: {
			colors: {
				// primary color set
				primary: {
					// Bright green (success)
					500: "#22c55e",
					600: "#16a34a",
				},
				// Dark gym background colors
				zinc: {
					// Main background
					900: "#18181b",
					// Cards / surfaces
					800: "#27272a",
					700: "#3f3f46",
				},
				// Yellow for streaks / achievements
				accent: "#eab308",
				// Secondary text
				muted: "#a1a1aa",
			},
		},
	},

	// tailwind plugins for typography forms ect later
	plugins: [],
};

// This works identical to web Tailwind config. The only difference in React Native is the content paths.
