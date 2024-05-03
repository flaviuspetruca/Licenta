import { useEffect } from "react";
import { AlertPayload, AlertType } from "./AlertProvider";

type Props = {
    payload: AlertPayload | null;
    hideAlert: () => void;
};

const alertTypeStyle = (type: AlertType | undefined) => {
    switch (type) {
        case AlertType.SUCCESS:
            return "text-green-800 bg-green-50 dark:bg-green-800 dark:text-green-400";
        case AlertType.ERROR:
            return "text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400";
        default:
            return "text-blue-800 bg-blue-50 dark:bg-blue-800 dark:text-blue-400";
    }
};

const Alert = ({ payload, hideAlert }: Props) => {
    useEffect(() => {
        if (payload) {
            setTimeout(() => {
                hideAlert();
            }, 5000);
        }
    }, [payload, hideAlert]);

    return (
        <div
            className={`fixed top-0 left-0 w-full bg-transparent z-50 transition-opacity ${payload ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
            <div className={`p-20 w-full transition-transform ${payload ? "scale-100" : "scale-0"}`}>
                <div
                    className={`flex items-center w-full p-4 text-sm rounded-lg ${alertTypeStyle(payload?.type)}`}
                    role="alert"
                >
                    <svg
                        className="flex-shrink-0 inline w-4 h-4 me-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                    <div className="w-full flex flex-row justify-between">
                        <div>
                            <span className="font-medium">{payload?.title + ":"}&nbsp;</span>
                            <span>{payload?.description}</span>
                        </div>
                        <button onClick={hideAlert} className="ml-2">
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alert;
