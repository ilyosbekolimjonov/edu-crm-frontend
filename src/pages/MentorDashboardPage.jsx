import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { DashboardOutlined, Groups, Logout, Payments, Person, ShoppingBag } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import GroupsSection from "../components/dashboard/GroupsSection";
import SidebarNav from "../components/dashboard/SidebarNav";
import TeacherFinanceSection from "../components/teacher/TeacherFinanceSection";
import TeacherOverviewSection from "../components/teacher/TeacherOverviewSection";
import TeacherProfileSection from "../components/teacher/TeacherProfileSection";
import TeacherStoreSection from "../components/teacher/TeacherStoreSection";
import api from "../services/axios";
import useAuthStore from "../store/auth.store";

const menuItems = [
    { label: "Asosiy", icon: <DashboardOutlined fontSize="small" /> },
    { label: "Guruhlar", icon: <Groups fontSize="small" /> },
    { label: "Do'kon", icon: <ShoppingBag fontSize="small" /> },
    { label: "Moliya", icon: <Payments fontSize="small" /> },
];
const bottomMenuItems = [
    { label: "Profil", icon: <Person fontSize="small" /> },
    { label: "Chiqish", icon: <Logout fontSize="small" />, color: "#b42318" },
];

const sectionMeta = {
    Asosiy: {
        title: "Teacher panel",
        description: "Bugungi guruhlar va tekshiriladigan vazifalar",
    },
    Guruhlar: {
        title: "Guruhlar",
        description: "Sizga biriktirilgan guruhlar, darslar, vazifalar va tekshirish",
    },
    "Do'kon": {
        title: "Do'kon",
        description: "O'qituvchilar uchun do'kon bo'limi tayyorlanmoqda",
    },
    Moliya: {
        title: "Moliya",
        description: "Maosh va to'lovlar bo'yicha ko'rinish",
    },
    Profil: {
        title: "Profil",
        description: "Shaxsiy ma'lumotlar va parol",
    },
};

const extractFinanceRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.payments)) return payload.payments;
    if (Array.isArray(payload.salaries)) return payload.salaries;

    const keys = Object.keys(payload);
    return keys.length ? [payload] : [];
};

const financeEndpoints = [
    "/teacher/finance",
    "/teacher/payments",
    "/teacher/salary",
    "/mentor/finance",
    "/mentor/payments",
    "/mentor/salary",
];

const toPublicImage = (imagePath) => {
    if (!imagePath) return "";
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    return `${api.defaults.baseURL}${imagePath}`;
};

export default function MentorDashboardPage() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [activeItem, setActiveItem] = useState("Asosiy");
    const [profile, setProfile] = useState(null);
    const [groups, setGroups] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [financeRows, setFinanceRows] = useState([]);
    const [financeLoading, setFinanceLoading] = useState(false);
    const [financeLoaded, setFinanceLoaded] = useState(false);

    const loadSummary = async () => {
        setLoadingSummary(true);
        try {
            const [profileRes, groupsRes, submissionsRes] = await Promise.all([
                api.get("/teacher/profile"),
                api.get("/groups"),
                api.get("/homework-submissions"),
            ]);
            setProfile(profileRes.data);
            setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
            setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
        } catch {
            setProfile(null);
            setGroups([]);
            setSubmissions([]);
        } finally {
            setLoadingSummary(false);
        }
    };

    const loadFinance = async () => {
        setFinanceLoading(true);
        try {
            for (const endpoint of financeEndpoints) {
                try {
                    const { data } = await api.get(endpoint);
                    const rows = extractFinanceRows(data);
                    if (rows.length) {
                        setFinanceRows(rows);
                        setFinanceLoaded(true);
                        return;
                    }
                } catch {
                    // Endpoint mavjud bo'lmasa yoki data bo'lmasa keyingisini tekshiramiz.
                }
            }

            setFinanceRows([]);
            setFinanceLoaded(true);
        } finally {
            setFinanceLoading(false);
        }
    };

    useEffect(() => {
        loadSummary();
    }, []);

    useEffect(() => {
        if (activeItem !== "Moliya" || financeLoaded) return;
        loadFinance();
    }, [activeItem, financeLoaded]);

    const profileFinanceRows = useMemo(() => {
        if (!profile) return [];
        return extractFinanceRows(profile.finance || profile.finances || profile.payments || profile.salary);
    }, [profile]);

    const resolvedFinanceRows = useMemo(
        () => (financeRows.length ? financeRows : profileFinanceRows),
        [financeRows, profileFinanceRows],
    );

    const sidebarIdentity = useMemo(
        () => ({
            fullName: profile?.user?.fullName || profile?.fullName || "Ustoz",
            subtitle: profile?.user?.email || profile?.email || "teacher",
            imageUrl: toPublicImage(profile?.user?.image || profile?.image),
        }),
        [profile],
    );

    const handleSelect = (label) => {
        if (label === "Chiqish") {
            logout();
            navigate("/login", { replace: true });
            return;
        }
        setActiveItem(label);
    };

    const currentSection = sectionMeta[activeItem] || sectionMeta.Asosiy;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f2f4f7", display: "flex" }}>
            <SidebarNav
                items={menuItems}
                bottomItems={bottomMenuItems}
                activeItem={activeItem}
                onSelect={handleSelect}
                identity={sidebarIdentity}
                showBrand={false}
            />
            <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
                <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#20242e" }}>
                    {currentSection.title}
                </Typography>
                <Typography sx={{ color: "#667085", mb: 2 }}>
                    {currentSection.description}
                </Typography>

                {activeItem === "Profil" ? (
                    <TeacherProfileSection profile={profile} onSaved={setProfile} />
                ) : activeItem === "Guruhlar" ? (
                    <GroupsSection />
                ) : activeItem === "Moliya" ? (
                    <TeacherFinanceSection
                        rows={resolvedFinanceRows}
                        loading={financeLoading}
                        hasRealData={resolvedFinanceRows.length > 0}
                    />
                ) : activeItem === "Do'kon" ? (
                    <TeacherStoreSection />
                ) : (
                    <TeacherOverviewSection
                        profile={profile}
                        groups={groups}
                        submissions={submissions}
                        loading={loadingSummary}
                    />
                )}
            </Box>
        </Box>
    );
}
