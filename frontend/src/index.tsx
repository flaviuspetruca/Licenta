import React, { useEffect, useState } from "react";
import "./Platform.scss";
import "./index.css";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { RouterProvider, createBrowserRouter, useLocation, useNavigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
import GymRegister from "./components/Gyms/GymRegister";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import GymSubmission from "./components/Gyms/GymSubmission";
import ForgotPassword from "./components/Authentication/ForgotPassword";
import ResetPassword from "./components/Authentication/ResetPassword";

const useUser = (navigate: ReturnType<typeof useNavigate>, requiredRole?: "admin" | "user") => {
    const [user, setUser] = useState<Omit<UserTypeDB, "password"> | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const decoded = jwtDecode(token as string);
        if (new Date().getTime() / 1000 > (decoded.exp as number)) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        delete decoded.exp;
        delete decoded.iat;
        const newUser = decoded as Omit<UserTypeDB, "password">;
        setUser(newUser);

        if (requiredRole && newUser.role !== requiredRole) {
            navigate("/routes");
        }
    }, [navigate, requiredRole]);

    return user;
};

const ProtectedRoute = ({ requiredRole }: { requiredRole: "admin" | "user" }) => {
    const navigate = useNavigate();
    const user = useUser(navigate, requiredRole);

    return user?.role === requiredRole ? <Outlet /> : null;
};

const NavbarWrapper = () => {
    const navigate = useNavigate();
    const path = useLocation().pathname;
    const user = useUser(navigate);

    useEffect(() => {
        if (path === "/") {
            navigate("/routes");
        }
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
            { path: "/gym-register", element: <GymRegister /> },
            { path: "/route/:id", element: <Route /> },
            {
                path: "/admin",
                element: <ProtectedRoute requiredRole="admin" />,
                children: [{ path: "/admin", element: <AdminPanel /> }],
            },
            {
                path: "/submission/:id",
                element: <ProtectedRoute requiredRole="admin" />,
                children: [{ path: "/submission/:id", element: <GymSubmission /> }],
            },
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
    {
        path: "/forgot-password",
        element: (
            <AlertProvider>
                <ForgotPassword />
            </AlertProvider>
        ),
    },
    {
        path: "/reset-password",
        element: (
            <AlertProvider>
                <ResetPassword />
            </AlertProvider>
        ),
    },
]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<RouterProvider router={router} />);
