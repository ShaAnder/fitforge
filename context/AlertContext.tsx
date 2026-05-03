import CustomAlert from "@/components/ui/CustomAlert";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

type AlertType = "success" | "error" | "info";

type AlertContextType = {
	showAlert: (
		title: string,
		message: string,
		type?: AlertType,
		onClose?: () => void, // ← NEW: optional callback
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
	console.log("[AlertProvider] 🔄 Mounted");

	const [alert, setAlert] = useState<{
		visible: boolean;
		title: string;
		message: string;
		type: AlertType;
		onClose?: () => void;
	} | null>(null);

	const showAlert = (
		title: string,
		message: string,
		type: AlertType = "info",
		onClose?: () => void,
	) => {
		console.log(`[AlertProvider] 📢 SHOW ALERT: ${type} | ${title}`);
		setAlert({ visible: true, title, message, type, onClose });
	};

	const hideAlert = () => {
		console.log("[AlertProvider] 🙈 HIDE ALERT called");
		const currentOnClose = alert?.onClose;
		setAlert(null);

		// Run custom onClose if provided
		if (currentOnClose) {
			currentOnClose();
		}
	};

	useEffect(() => {
		if (alert) {
			console.log(
				`[AlertProvider] Alert Updated → Visible: ${alert.visible}, Type: ${alert.type}`,
			);
		}
	}, [alert]);

	return (
		<AlertContext.Provider value={{ showAlert, hideAlert, alert }}>
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
