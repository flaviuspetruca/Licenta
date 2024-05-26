import { Link, useNavigate } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../../configs";
import { fetchFn } from "../../utils/http";
import { AlertType, useAlert } from "../UI/AlertProvider";
import { useEffect } from "react";

export default function Register() {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
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
        const response = await fetchFn(`${BACKEND_ENDPOINT}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            const token = await response.text();
            localStorage.setItem("token", token);
            navigate("/routes");
        } else if (response.status === 409) {
            showAlert({
                title: "Error",
                description: "Email or username already in use. Please try again with different credentials",
                type: AlertType.ERROR,
            });
        }
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/routes");
        }
    }, [navigate]);

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                        Register for an account
                    </h2>
                </div>

                <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-9" onSubmit={handleSubmit}>
                        <div>
                            <div className="form-input-container">
                                <label htmlFor="firstname" className="input-label">
                                    First Name
                                </label>
                                <input
                                    id="name"
                                    name="firstname"
                                    type="text"
                                    autoComplete="firstname"
                                    required
                                    className="input-class"
                                />
                            </div>
                            <div className="form-input-container">
                                <label htmlFor="surname" className="input-label">
                                    Surname
                                </label>
                                <input
                                    id="surname"
                                    name="surname"
                                    type="text"
                                    autoComplete="surname"
                                    required
                                    className="input-class"
                                />
                            </div>
                            <div className="form-input-container">
                                <label htmlFor="username" className="input-label">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className="input-class"
                                />
                            </div>
                            <div className="form-input-container">
                                <label htmlFor="email" className="input-label">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input-class"
                                />
                            </div>
                        </div>

                        <div className="">
                            <div className="form-input-container">
                                <label htmlFor="password" className="input-label">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
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
                                    autoComplete="current-password"
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
                            Already have an account?
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
