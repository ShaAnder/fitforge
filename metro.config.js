const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Wraps metro config so that native wind can properly process
// our tailwind css in our app.
module.exports = withNativeWind(config, {
	input: "./global.css",
});
