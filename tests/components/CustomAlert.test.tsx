jest.mock("../../hooks/useAccent", () => ({
	useAccent: () => ({
		hex500: "#22c55e",
		bg500: "bg-green-500",
	}),
}));

import renderer, { act } from "react-test-renderer";
import { Text, TouchableOpacity, Modal } from "react-native";

import CustomAlert from "../../components/ui/CustomAlert";

describe("CustomAlert", () => {
	it("renders the supplied title and message", () => {
		let tree: renderer.ReactTestRenderer;
		act(() => {
			tree = renderer.create(
				<CustomAlert
					visible
					title="Saved"
					message="Your changes were stored."
					onClose={jest.fn()}
					type="success"
				/>,
			);
		});
		const renderedTree = tree!;

		expect(renderedTree.root.findByType(Modal).props.visible).toBe(true);
		expect(renderedTree.root.findAllByType(Text).length).toBeGreaterThan(0);
	});

	it("fires onClose after the dismiss button is pressed", () => {
		jest.useFakeTimers();
		const onClose = jest.fn();
		let tree: renderer.ReactTestRenderer;
		act(() => {
			tree = renderer.create(
				<CustomAlert
					visible
					title="Saved"
					message="Your changes were stored."
					onClose={onClose}
				/>,
			);
		});
		const renderedTree = tree!;

		const button = renderedTree.root.findAllByType(TouchableOpacity)[0];

		act(() => {
			button.props.onPress();
			jest.advanceTimersByTime(250);
		});

		expect(onClose).toHaveBeenCalledTimes(1);
		jest.useRealTimers();
	});
});
