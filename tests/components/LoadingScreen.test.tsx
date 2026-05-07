jest.mock("../../hooks/useAccent", () => ({
	useAccent: () => ({
		hex500: "#22c55e",
	}),
}));

import renderer, { act } from "react-test-renderer";
import { Text } from "react-native";

import LoadingScreen from "../../components/ui/LoadingScreen";

function collectText(node: any): string[] {
	if (!node) return [];
	if (typeof node === "string") return [node];
	if (Array.isArray(node)) return node.flatMap(collectText);
	return collectText(node.children);
}

describe("LoadingScreen", () => {
	it("renders the default branding and copy", () => {
		let tree: renderer.ReactTestRenderer;
		act(() => {
			tree = renderer.create(<LoadingScreen />);
		});
		const renderedTree = tree!;
		const textNodes = renderedTree.root.findAllByType(Text);
		const renderedText = textNodes.flatMap((node) =>
			collectText(node.props.children),
		);

		expect(renderedText).toContain("FitForge");
		expect(renderedText).toContain("Loading exercises...");
		expect(renderedText).toContain("Please wait");
	});

	it("supports custom messages", () => {
		let tree: renderer.ReactTestRenderer;
		act(() => {
			tree = renderer.create(
				<LoadingScreen message="Loading dashboard" subMessage="Almost there" />,
			);
		});
		const renderedTree = tree!;
		const textNodes = renderedTree.root.findAllByType(Text);
		const renderedText = textNodes.flatMap((node) =>
			collectText(node.props.children),
		);

		expect(renderedText).toContain("Loading dashboard");
		expect(renderedText).toContain("Almost there");
	});
});
