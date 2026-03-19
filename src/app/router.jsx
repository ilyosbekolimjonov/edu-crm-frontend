import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import RolePlaceholderPage from "../pages/RolePlaceholderPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },
    {
        path: "/login",
        element: (
            <ProtectedRoute guestOnly>
                <LoginPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/admin/dashboard",
        element: (
            <ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
                <AdminDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/mentor/dashboard",
        element: (
            <ProtectedRoute allowedRoles={["MENTOR"]}>
                <RolePlaceholderPage
                    title="Mentor Dashboard"
                    description="Mentor paneli alohida sahifa sifatida tayyorlanmoqda. Auth flow hozirdan ishlaydi."
                />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/dashboard",
        element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                <RolePlaceholderPage
                    title="Student Dashboard"
                    description="Student paneli alohida sahifa sifatida tayyorlanmoqda. Auth flow hozirdan ishlaydi."
                />
            </ProtectedRoute>
        ),
    },
    {
        path: "*",
        element: <Navigate to="/login" replace />,
    },
]);
