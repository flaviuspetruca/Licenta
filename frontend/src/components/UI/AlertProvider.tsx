import React, { createContext, useContext, useState } from "react";
import Alert from "./Alert";

type AlertContextType = {
    showAlert: (payload: AlertPayload) => void;
    hideAlert: () => void;
    alert: AlertPayload | null;
};

export const AlertContext = createContext<AlertContextType>({
    showAlert: () => {},
    hideAlert: () => {},
    alert: null,
});

export enum AlertType {
    SUCCESS = "success",
    ERROR = "error",
}
export type AlertPayload = { title: string; description: string; type: AlertType };

type Props = {
    children: React.ReactNode;
};

export const AlertProvider = ({ children }: Props) => {
    const [alert, setAlert] = useState<AlertPayload | null>(null);

    const showAlert = (payload: AlertPayload) => {
        setAlert(payload);
    };

    const hideAlert = () => {
        setAlert(null);
    };

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert, alert }}>
            <Alert payload={alert} hideAlert={hideAlert}></Alert>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);
