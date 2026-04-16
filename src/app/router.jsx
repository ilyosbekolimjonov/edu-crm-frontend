import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import MentorDashboardPage from "../pages/MentorDashboardPage";
import StudentDashboardPage from "../pages/StudentDashboardPage";

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
                <MentorDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/dashboard",
        element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/overview",
        element: <Navigate to="/student/dashboard" replace />,
    },
    {
        path: "/student/groups",
        element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/groups/:groupId",
        element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/groups/:groupId/lessons/:lessonId",
        element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/attendance",
        element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/profile",
        element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/rating",
        element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/shop",
        element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/payments",
        element: (
            <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboardPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/student/lessons",
        element: <Navigate to="/student/groups" replace />,
    },
    {
        path: "/student/homeworks",
        element: <Navigate to="/student/groups" replace />,
    },
    {
        path: "*",
        element: <Navigate to="/login" replace />,
    },
]);
