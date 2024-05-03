import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import NotFound from "./components/NotFound/NotFound";
import Login from "./components/Authentication/Login";
import Register from "./components/Authentication/Register";
import Gyms from "./components/Gyms/Gyms";
import Routes from "./components/Routes/Routes";
import Route from "./components/Routes/Route";
import Navbar from "./components/NavBar";
import { Outlet } from "react-router-dom";
import GymAdministrator from "./components/Gyms/GymAdministrator";
import Gym from "./components/Gyms/Gym";
import { ErrorBoundary } from "react-error-boundary";
import { AlertProvider } from "./components/UI/AlertProvider";

const NavbarWrapper = () => {
    return (
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <AlertProvider>
                <Navbar />
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
            { path: "/route-creator/:id", element: <App /> },
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
