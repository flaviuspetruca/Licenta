import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { RouterProvider, createBrowserRouter, useLocation, useNavigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./index.css";
import "./Platform.scss";
import NotFound from "./components/NotFound/NotFound";
import Login from "./components/Authentication/Login";
import Register from "./components/Authentication/Register";
import Gyms from "./components/Gyms/Gyms";
import Routes from "./components/Routes/Routes";
import Route from "./components/Routes/Route";
import Navbar from "./components/NavBar";
import GymAdministrator from "./components/Gyms/GymAdministrator";
import Gym from "./components/Gyms/Gym";
import { AlertProvider } from "./components/UI/AlertProvider";
import MainPanel from "./components/MainPanel";
import { UserTypeDB } from "./types";

const NavbarWrapper = () => {
    const [user, setUser] = useState<Omit<UserTypeDB, "password"> | null>(null);
    const navigate = useNavigate();
    const path = useLocation().pathname;

    useEffect(() => {
        if (path === "/") {
            navigate("/routes");
        }

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }

        const decoded = jwtDecode(token as string);
        if (new Date().getTime() / 1000 > (decoded.exp as number)) {
            localStorage.removeItem("token");
            navigate("/login");
        }
        delete decoded.exp;
        delete decoded.iat;
        setUser(decoded as Omit<UserTypeDB, "password">);
    }, [navigate, path]);

    return (
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <AlertProvider>
                <Navbar user={user} />
                <Outlet />
            </AlertProvider>
        </ErrorBoundary>
    );
};
const router = createBrowserRouter([
    {
        path: "/",
        element: <NavbarWrapper />,
        children: [
            { path: "/route-creator/:id", element: <MainPanel /> },
            { path: "/gyms", element: <Gyms /> },
            { path: "/routes", element: <Routes /> },
            { path: "/gym-admin", element: <GymAdministrator /> },
            { path: "/gym/:id", element: <Gym /> },
            { path: "/route/:id", element: <Route /> },
        ],
        errorElement: <NotFound />,
    },
    {
        path: "/login",
        element: (
            <AlertProvider>
                <Login />
            </AlertProvider>
        ),
    },
    {
        path: "/register",
        element: (
            <AlertProvider>
                <Register />
            </AlertProvider>
        ),
    },
]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<RouterProvider router={router} />);
