import CustomAlert from "@/components/ui/CustomAlert";
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

type AlertType = "success" | "error" | "info";

type AlertContextType = {
	showAlert: (
		title: string,
		message: string,
		type?: AlertType,
		onClose?: () => void,
	) => void;
	hideAlert: () => void;
	alert: {
		visible: boolean;
		title: string;
		message: string;
		type: AlertType;
		onClose?: () => void;
	} | null;
};

// we create the context that will hold our alert state and actions
const AlertContext = createContext<AlertContextType | undefined>(undefined);

/**
 * AlertProvider component.
 *
 * Manages showing and hiding alerts across the whole app.
 * Uses a stable context value and ref for the onClose callback
 * so we don't cause unnecessary re-renders in children.
 */
export function AlertProvider({ children }: { children: ReactNode }) {
	// we store the current alert data (or null when nothing is showing)
	const [alert, setAlert] = useState<{
		visible: boolean;
		title: string;
		message: string;
		type: AlertType;
		onClose?: () => void;
	} | null>(null);

	const showAlert = useCallback(
		(
			title: string,
			message: string,
			type: AlertType = "info",
			onClose?: () => void,
		) => {
			// log every time an alert is triggered (helpful in dev)
			console.log(`[AlertProvider] 📢 SHOW ALERT: ${type} | ${title}`);
			// we set the new alert object which will cause the CustomAlert to appear
			setAlert({ visible: true, title, message, type, onClose });
		},
		[],
	);

	// we use a ref to store the onClose callback so hideAlert stays stable
	// this avoids adding alert to the dependency array of hideAlert
	const onCloseRef = useRef<(() => void) | undefined>(undefined);

	useEffect(() => {
		// every time the alert changes, we update the ref with the latest onClose
		onCloseRef.current = alert?.onClose;
	}, [alert?.onClose]);

	const hideAlert = useCallback(() => {
		// first we clear the alert state so the modal disappears
		setAlert(null);

		// we run the onClose callback after the state update using a timeout
		// this prevents any sync timing issues with React state
		const currentOnClose = onCloseRef.current;
		if (currentOnClose) {
			setTimeout(currentOnClose, 0);
		}
	}, []);

	// we memoize the context value so children only re-render when something actually changes
	const contextValue = useMemo(
		() => ({ showAlert, hideAlert, alert }),
		[showAlert, hideAlert, alert],
	);

	useEffect(() => {
		// extra logging so we can see when the alert state actually updates
		if (alert) {
			console.log(
				`[AlertProvider] Alert Updated → Visible: ${alert.visible}, Type: ${alert.type}`,
			);
		}
	}, [alert]);

	return (
		<AlertContext.Provider value={contextValue}>
			{children}

			{/* we only render CustomAlert when there is an active alert */}
			{alert && (
				<CustomAlert
					visible={alert.visible}
					title={alert.title}
					message={alert.message}
					type={alert.type}
					onClose={hideAlert}
				/>
			)}
		</AlertContext.Provider>
	);
}

/**
 * useAlert hook.
 *
 * Gives components access to showAlert and hideAlert.
 * Throws a clear error if used outside of AlertProvider.
 */
export const useAlert = () => {
	const context = useContext(AlertContext);
	if (context === undefined) {
		console.error("[useAlert] ❌ Used outside of AlertProvider!");
		throw new Error("useAlert must be used within an AlertProvider");
	}
	return context;
};
