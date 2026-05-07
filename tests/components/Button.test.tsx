jest.mock("../../hooks/useAccent", () => ({
	useAccent: () => ({
		bg500: "bg-green-500",
		bg600Active: "active:bg-green-600",
		hex500: "#22c55e",
	}),
}));

import renderer, { act } from "react-test-renderer";
import { Text, TouchableOpacity } from "react-native";

import Button from "../../components/ui/Button";

describe("Button", () => {
	it("renders the button title", () => {
		let tree: renderer.ReactTestRenderer;
		act(() => {
			tree = renderer.create(<Button title="Save workout" />);
		});
		const renderedTree = tree!;

		expect(renderedTree.root.findByType(Text).props.children).toBe(
			"Save workout",
		);
	});

	it("applies primary styling by default", () => {
		let tree: renderer.ReactTestRenderer;
		act(() => {
			tree = renderer.create(<Button title="Primary" />);
		});
		const renderedTree = tree!;
		const touchable = renderedTree.root.findByType(TouchableOpacity);

		expect(touchable.props.className).toContain("bg-green-500");
		expect(touchable.props.className).toContain("active:bg-green-600");
	});

	it("applies outline styling when requested", () => {
		let tree: renderer.ReactTestRenderer;
		act(() => {
			tree = renderer.create(
				<Button title="Outline" variant="outline" size="large" />,
			);
		});
		const renderedTree = tree!;
		const touchable = renderedTree.root.findByType(TouchableOpacity);

		expect(touchable.props.className).toContain("border-zinc-700");
		expect(touchable.props.className).toContain("py-6");
	});
});
