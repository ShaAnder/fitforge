const React = require("react");

module.exports = {
	SafeAreaProvider: ({ children }) =>
		React.createElement(React.Fragment, null, children),
	SafeAreaView: ({ children }) =>
		React.createElement(React.Fragment, null, children),
	// provide a minimal runtime wrapper used by the library
	wrapJSX: (node) => node,
};
