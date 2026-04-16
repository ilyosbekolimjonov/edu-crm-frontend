import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { Groups, Home, Logout, Payments, Person, ShoppingBag, Star, Today } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../services/axios";
import useAuthStore from "../../store/auth.store";

const items = [
    { key: "overview", label: "Overview", icon: <Home fontSize="small" />, path: "/student/dashboard" },
    { key: "groups", label: "Groups", icon: <Groups fontSize="small" />, path: "/student/groups" },
    { key: "attendance", label: "Attendance", icon: <Today fontSize="small" />, path: "/student/attendance" },
    { key: "rating", label: "Reyting", icon: <Star fontSize="small" />, path: "/student/rating" },
    { key: "shop", label: "Do'kon", icon: <ShoppingBag fontSize="small" />, path: "/student/shop" },
    { key: "payments", label: "To'lovlarim", icon: <Payments fontSize="small" />, path: "/student/payments" },
];

const bottomItems = [
    { key: "profile", label: "Profile", icon: <Person fontSize="small" />, path: "/student/profile" },
];

export default function StudentLayout({ activeSection, profile, children }) {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f4f7f6", display: { xs: "block", md: "flex" } }}>
            <Box
                sx={{
                    width: { xs: "100%", md: 260 },
                    borderRight: { md: "1px solid #dfe7e3" },
                    bgcolor: "#ffffff",
                    p: 2,
                    position: { md: "sticky" },
                    top: 0,
                    height: { md: "100vh" },
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar src={profile?.image ? `${api.defaults.baseURL}${profile.image}` : undefined}>
                        {profile?.fullName?.[0] || "S"}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700 }} noWrap>
                            {profile?.fullName || "Student"}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#667085" }} noWrap>
                            {profile?.email || "student"}
                        </Typography>
                    </Box>
                </Stack>

                <Stack spacing={1}>
                    {items.map((item) => (
                        <Button
                            key={item.key}
                            startIcon={item.icon}
                            onClick={() => navigate(item.path)}
                            variant={activeSection === item.key ? "contained" : "text"}
                            sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                borderRadius: 1,
                                color: activeSection === item.key ? "#fff" : "#25312c",
                                bgcolor: activeSection === item.key ? "#147d64" : "transparent",
                                "&:hover": { bgcolor: activeSection === item.key ? "#10624f" : "#eef5f2" },
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Stack>

                <Stack spacing={1} sx={{ mt: "auto", pt: 2, borderTop: "1px solid #eef0f4" }}>
                    {bottomItems.map((item) => (
                        <Button
                            key={item.key}
                            startIcon={item.icon}
                            onClick={() => navigate(item.path)}
                            variant={activeSection === item.key ? "contained" : "text"}
                            sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                borderRadius: 1,
                                color: activeSection === item.key ? "#fff" : "#25312c",
                                bgcolor: activeSection === item.key ? "#147d64" : "transparent",
                                "&:hover": { bgcolor: activeSection === item.key ? "#10624f" : "#eef5f2" },
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                    <Button
                        startIcon={<Logout fontSize="small" />}
                        onClick={handleLogout}
                        sx={{ justifyContent: "flex-start", textTransform: "none", borderRadius: 1, color: "#b42318" }}
                    >
                        Chiqish
                    </Button>
                </Stack>
            </Box>

            <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>{children}</Box>
        </Box>
    );
}
