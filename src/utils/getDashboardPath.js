export function getDashboardPath(role) {
    switch (role) {
        case "SUPERADMIN":
        case "ADMIN":
            return "/admin/dashboard";
        case "MENTOR":
            return "/mentor/dashboard";
        case "STUDENT":
            return "/student/dashboard";
        default:
            return "/login";
    }
}