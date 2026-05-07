import renderer, { act } from "react-test-renderer";

import { AlertProvider, useAlert } from "../../context/AlertContext";

// Mock the visual alert so this suite only checks provider behavior.
jest.mock("../../components/ui/CustomAlert", () => {
	return function MockCustomAlert() {
		return null;
	};
});

let alertApi: ReturnType<typeof useAlert> | null = null;

function Consumer() {
	alertApi = useAlert();
	return null;
}

describe("AlertContext", () => {
	beforeEach(() => {
		alertApi = null;
	});

	it("exposes showAlert and hideAlert through context", () => {
		act(() => {
			renderer.create(
				<AlertProvider>
					<Consumer />
				</AlertProvider>,
			);
		});

		expect(alertApi).not.toBeNull();
		expect(typeof alertApi?.showAlert).toBe("function");
		expect(typeof alertApi?.hideAlert).toBe("function");
	});

	it("stores alert state when showAlert is called", () => {
		act(() => {
			renderer.create(
				<AlertProvider>
					<Consumer />
				</AlertProvider>,
			);
		});

		act(() => {
			alertApi?.showAlert("Hello", "World", "success");
		});

		expect(alertApi?.alert?.visible).toBe(true);
		expect(alertApi?.alert?.title).toBe("Hello");
		expect(alertApi?.alert?.message).toBe("World");
		expect(alertApi?.alert?.type).toBe("success");
	});

	it("clears alert state when hideAlert is called", () => {
		act(() => {
			renderer.create(
				<AlertProvider>
					<Consumer />
				</AlertProvider>,
			);
		});

		act(() => {
			alertApi?.showAlert("Hello", "World");
		});

		act(() => {
			alertApi?.hideAlert();
		});

		expect(alertApi?.alert).toBeNull();
	});
});
