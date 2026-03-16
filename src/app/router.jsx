import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/admin/dashboard",
        element: <AdminDashboardPage />,
    },
    {
        path: "*",
        element: <Navigate to="/login" replace />,
    },
]);