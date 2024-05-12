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
                description: "There already is a user with this username",
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
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Register for an account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="input-label">
                                Name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="input-class"
                                />
                            </div>
                            <label htmlFor="surname" className="input-label">
                                Surname
                            </label>
                            <div className="mt-2">
                                <input
                                    id="surname"
                                    name="surname"
                                    type="text"
                                    autoComplete="surname"
                                    required
                                    className="input-class"
                                />
                            </div>
                            <label htmlFor="username" className="input-label">
                                Username
                            </label>
                            <div className="mt-2">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className="input-class"
                                />
                            </div>
                            <label htmlFor="email" className="input-label">
                                Email
                            </label>
                            <div className="mt-2">
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

                        <div>
                            <label htmlFor="password" className="input-label">
                                Password
                            </label>
                            <div className="mt-2 mb-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="input-class"
                                />
                            </div>
                            <label htmlFor="password_confirmation" className="input-label">
                                Confirm Password
                            </label>
                            <div className="mt-2">
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
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Submit
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                            Already have an account?
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
