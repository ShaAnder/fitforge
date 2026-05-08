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

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
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
			console.log(`[AlertProvider] 📢 SHOW ALERT: ${type} | ${title}`);
			setAlert({ visible: true, title, message, type, onClose });
		},
		[],
	);

	// make hideAlert stable and avoid depending on `alert` identity
	const onCloseRef = useRef<(() => void) | undefined>(undefined);

	useEffect(() => {
		onCloseRef.current = alert?.onClose;
	}, [alert?.onClose]);

	const hideAlert = useCallback(() => {
		setAlert(null);

		// Run callback AFTER state update
		const currentOnClose = onCloseRef.current;
		if (currentOnClose) {
			setTimeout(currentOnClose, 0); // prevent any sync issues
		}
	}, []);

	// Stable context value (prevents child re-renders when nothing changed)
	const contextValue = useMemo(
		() => ({ showAlert, hideAlert, alert }),
		[showAlert, hideAlert, alert],
	);

	useEffect(() => {
		if (alert) {
			console.log(
				`[AlertProvider] Alert Updated → Visible: ${alert.visible}, Type: ${alert.type}`,
			);
		}
	}, [alert]);

	return (
		<AlertContext.Provider value={contextValue}>
			{children}

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

export const useAlert = () => {
	const context = useContext(AlertContext);
	if (context === undefined) {
		console.error("[useAlert] ❌ Used outside of AlertProvider!");
		throw new Error("useAlert must be used within an AlertProvider");
	}
	return context;
};
