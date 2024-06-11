import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../../configs";
import { fetchFn } from "../../utils/http";
import { AlertType, useAlert } from "../UI/AlertProvider";
import { useEffect } from "react";

export default function ResetPassword() {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (token === null) {
            showAlert({
                title: "Error",
                description: "Invalid or missing reset token.",
                type: AlertType.ERROR,
            });
            navigate("/forgot-password");
            return;
        }

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        if (data["password"] !== data["password_confirmation"]) {
            showAlert({
                title: "Error",
                description: "Passwords do not match",
                type: AlertType.ERROR,
            });
            return;
        }

        delete data["password_confirmation"];
        data["token"] = token;

        const response = await fetchFn(`${BACKEND_ENDPOINT}/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            showAlert({
                title: "Success",
                description: "Your password has been reset successfully. You can now log in with your new password.",
                type: AlertType.SUCCESS,
            });
            navigate("/login");
        } else {
            showAlert({
                title: "Error",
                description: "There was an error resetting your password. Please try again.",
                type: AlertType.ERROR,
            });
        }
    };

    useEffect(() => {
        if (!token) {
            showAlert({
                title: "Error",
                description: "Invalid or missing reset token.",
                type: AlertType.ERROR,
            });
            navigate("/forgot-password");
        }
    }, [token, navigate, showAlert]);

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                        Reset Password
                    </h2>
                </div>

                <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-9" onSubmit={handleSubmit}>
                        <div>
                            <div className="form-input-container">
                                <label htmlFor="password" className="input-label">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="input-class"
                                />
                            </div>
                            <div className="form-input-container">
                                <label htmlFor="password_confirmation" className="input-label">
                                    Confirm Password
                                </label>
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="input-class"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-md font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Submit
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        <Link
                            to="/login"
                            className="text-lg font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                        >
                            Back to login
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
