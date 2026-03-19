import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { getDashboardPath } from "../../utils/getDashboardPath";

export default function ProtectedRoute({ allowedRoles, children, guestOnly = false }) {
    const { accessToken, role } = useAuthStore();

    if (guestOnly) {
        if (accessToken && role) {
            return <Navigate to={getDashboardPath(role)} replace />;
        }

        return children;
    }

    if (!accessToken || !role) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles?.length && !allowedRoles.includes(role)) {
        return <Navigate to={getDashboardPath(role)} replace />;
    }

    return children;
}
