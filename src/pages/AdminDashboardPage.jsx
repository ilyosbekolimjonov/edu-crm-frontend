import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    AutoGraph,
    Book,
    CalendarMonth,
    DarkMode,
    DiamondOutlined,
    ExpandMore,
    Groups,
    Home,
    Inventory2,
    MailOutline,
    MonetizationOn,
    NotificationsNone,
    Person,
    School,
    Search,
    Settings,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import api from "../services/axios";
import useAuthStore from "../store/auth.store";
import SidebarNav from "../components/dashboard/SidebarNav";
import StudentsSection from "../components/dashboard/StudentsSection";
import TeachersSection from "../components/dashboard/TeachersSection";

const menuItems = [
    { label: "Asosiy", icon: <Home fontSize="small" /> },
    { label: "O'qituvchilar", icon: <Person fontSize="small" /> },
    { label: "Guruhlar", icon: <Groups fontSize="small" /> },
    { label: "Talabalar", icon: <School fontSize="small" /> },
    { label: "Sotuvlar", icon: <DiamondOutlined fontSize="small" /> },
    { label: "Moliya", icon: <MonetizationOn fontSize="small" /> },
    { label: "Boshqarish", icon: <Settings fontSize="small" /> },
];

const managementTabs = [
    "Kurslar",
    "Xonalar",
    "Guruhlar",
    "Xodimlar",
    "Sabablar",
    "Rollar",
    "Coin",
    "Xabar yuborish",
    "Tekshiruv",
];

const toArray = (value) => (Array.isArray(value) ? value : []);
const ACTIVE_ITEM_KEY = "lms.admin.activeItem";

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const { role, logout } = useAuthStore();
    const [activeItem, setActiveItem] = useState(
        () => localStorage.getItem(ACTIVE_ITEM_KEY) || "Asosiy",
    );
    const [language, setLanguage] = useState("O'zbekcha");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeStudents: 0,
        groups: 0,
        debtors: 0,
        frozen: 0,
        archived: 0,
    });
    const [coursesData, setCoursesData] = useState([]);
    const [roomsData, setRoomsData] = useState([]);
    const [upcomingGroups, setUpcomingGroups] = useState([]);
    const [activeManagementTab, setActiveManagementTab] = useState("Kurslar");

    const handleSidebarSelect = (label) => {
        setActiveItem(label);
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        localStorage.setItem(ACTIVE_ITEM_KEY, activeItem);
    }, [activeItem]);

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);

            const results = await Promise.allSettled([
                api.get("/courses"),
                api.get("/groups"),
                api.get("/rooms"),
                api.get("/purchased-courses"),
                api.get("/homework-submissions"),
            ]);

            const [coursesRes, groupsRes, roomsRes, paymentsRes, submissionsRes] = results;

            const hadError = results.some((result) => result.status === "rejected");
            if (hadError) {
                toast.error("Ba'zi dashboard ma'lumotlari yuklanmadi");
            }

            const courses =
                coursesRes.status === "fulfilled" ? toArray(coursesRes.value.data) : [];
            const groups =
                groupsRes.status === "fulfilled" ? toArray(groupsRes.value.data) : [];
            const rooms = roomsRes.status === "fulfilled" ? toArray(roomsRes.value.data) : [];
            const payments =
                paymentsRes.status === "fulfilled" ? toArray(paymentsRes.value.data) : [];
            const submissions =
                submissionsRes.status === "fulfilled"
                    ? toArray(submissionsRes.value.data)
                    : [];

            const uniqueStudents = new Set(
                payments
                    .map((payment) => payment.userId ?? payment.user?.id)
                    .filter(Boolean),
            );

            const activeGroups = groups.filter((group) => group.status === "ACTIVE").length;
            const debtorsCount = submissions.filter(
                (submission) => submission.status === "PENDING",
            ).length;
            const frozenCount = rooms.filter((room) => room.isActive === false).length;
            const archivedCount = courses.filter((course) => course.published === false).length;

            setStats({
                activeStudents: uniqueStudents.size,
                groups: activeGroups || groups.length,
                debtors: debtorsCount,
                frozen: frozenCount,
                archived: archivedCount,
            });

            setCoursesData(courses.slice(0, 10));
            setRoomsData(rooms.slice(0, 10));

            setUpcomingGroups(
                groups
                    .filter((group) => group.status === "ACTIVE")
                    .map((group) => ({
                        id: group.id,
                        name: group.name,
                        startTime: group.startTime,
                        weekDays: toArray(group.weekDays).join(", "),
                        students: group._count?.studentGroups ?? 0,
                    }))
                    .slice(0, 8),
            );

            setLoading(false);
        };

        fetchDashboard();
    }, []);

    const statCards = useMemo(
        () => [
            {
                label: "Faol talabalar",
                value: stats.activeStudents,
                icon: <School sx={{ color: "#8d72cf" }} />,
            },
            {
                label: "Guruhlar",
                value: stats.groups,
                icon: <Groups sx={{ color: "#8d72cf" }} />,
            },
            {
                label: "Qarzdorlar",
                value: stats.debtors,
                icon: <AutoGraph sx={{ color: "#8d72cf" }} />,
            },
            {
                label: "Muzlatilganlar",
                value: stats.frozen,
                icon: <DarkMode sx={{ color: "#8d72cf" }} />,
            },
            {
                label: "Arxivdagilar",
                value: stats.archived,
                icon: <Inventory2 sx={{ color: "#8d72cf" }} />,
            },
        ],
        [stats],
    );

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f2f4f7", display: "flex" }}>
            <SidebarNav
                items={menuItems}
                activeItem={activeItem}
                onSelect={handleSidebarSelect}
            />

            <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mb: 2 }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 320 }}>
                        <IconButton sx={{ bgcolor: "#7f56d9", color: "#fff", borderRadius: 2 }}>
                            <Home fontSize="small" />
                        </IconButton>
                        <TextField
                            size="small"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Qidirish..."
                            sx={{
                                width: 280,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    backgroundColor: "#fff",
                                },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" sx={{ color: "#9aa3b2" }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={role} size="small" sx={{ borderRadius: 2 }} />
                        <Select
                            size="small"
                            value={language}
                            onChange={(event) => setLanguage(event.target.value)}
                            sx={{ bgcolor: "#fff", borderRadius: 2, minWidth: 120 }}
                        >
                            <MenuItem value="O'zbekcha">O'zbekcha</MenuItem>
                            <MenuItem value="English">English</MenuItem>
                        </Select>
                        <IconButton sx={{ bgcolor: "#fff" }}>
                            <NotificationsNone fontSize="small" />
                        </IconButton>
                        <IconButton sx={{ bgcolor: "#fff" }}>
                            <MailOutline fontSize="small" />
                        </IconButton>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: "#1f2937", fontSize: 13 }}>
                            AB
                        </Avatar>
                        <Chip
                            label="Chiqish"
                            size="small"
                            onClick={handleLogout}
                            sx={{ cursor: "pointer" }}
                        />
                    </Stack>
                </Stack>

                <Typography sx={{ fontSize: 38, fontWeight: 700, color: "#20242e", lineHeight: 1.15 }}>
                    {activeItem === "Asosiy" ? "Salom, Admin!" : activeItem}
                </Typography>
                <Typography sx={{ color: "#6b7280", mb: 2.5 }}>
                    LMS platformasiga xush kelibsiz
                </Typography>

                {loading ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
                        <CircularProgress />
                    </Stack>
                ) : (
                    <>
                        {activeItem === "Asosiy" ? (
                            <>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            sm: "repeat(2, minmax(0, 1fr))",
                                            xl: "repeat(5, minmax(0, 1fr))",
                                        },
                                        gap: 1.5,
                                        mb: 1.5,
                                    }}
                                >
                                    {statCards.map((card) => (
                                        <Paper
                                            key={card.label}
                                            elevation={0}
                                            sx={{ p: 2, borderRadius: 2.5, border: "1px solid #eaedf3" }}
                                        >
                                            <Stack alignItems="center" spacing={1}>
                                                {card.icon}
                                                <Typography sx={{ fontSize: 13, color: "#5f6678" }}>
                                                    {card.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: 30, fontWeight: 700, color: "#1f2937" }}>
                                                    {card.value}
                                                </Typography>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Box>

                                <Accordion defaultExpanded sx={{ borderRadius: "12px !important" }}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <CalendarMonth fontSize="small" sx={{ color: "#7f56d9" }} />
                                            <Typography sx={{ fontWeight: 700 }}>Dars jadvali</Typography>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {upcomingGroups.length === 0 ? (
                                            <Typography sx={{ color: "#6b7280" }}>Faol guruhlar topilmadi</Typography>
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: {
                                                        xs: "1fr",
                                                        md: "repeat(2, minmax(0, 1fr))",
                                                        xl: "repeat(3, minmax(0, 1fr))",
                                                    },
                                                    gap: 1.25,
                                                }}
                                            >
                                                {upcomingGroups.map((group) => (
                                                    <Paper
                                                        key={group.id}
                                                        elevation={0}
                                                        sx={{
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            border: "1px solid #edf0f5",
                                                        }}
                                                    >
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                            <Book fontSize="small" sx={{ color: "#7f56d9" }} />
                                                            <Typography sx={{ fontWeight: 700 }}>{group.name}</Typography>
                                                        </Stack>
                                                        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                                                            Vaqt: {group.startTime || "-"}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                                                            Kunlar: {group.weekDays || "-"}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                                                            Talabalar: {group.students}
                                                        </Typography>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </>
                        ) : activeItem === "Talabalar" ? (
                            <StudentsSection />
                        ) : activeItem === "O'qituvchilar" ? (
                            <TeachersSection />
                        ) : activeItem === "Boshqarish" ? (
                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                                    {managementTabs.map((tab) => (
                                        <Chip
                                            key={tab}
                                            label={tab}
                                            size="small"
                                            onClick={() => setActiveManagementTab(tab)}
                                            clickable
                                            sx={{
                                                bgcolor: activeManagementTab === tab ? "#ede9fe" : "#ffffff",
                                                color: activeManagementTab === tab ? "#6d3ee6" : "#4b5563",
                                            }}
                                        />
                                    ))}
                                </Stack>

                                {activeManagementTab === "Kurslar" ? (
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2" }}>
                                        <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1.25 }}>Kurslar</Typography>
                                        {coursesData.length === 0 ? (
                                            <Typography sx={{ color: "#6b7280" }}>Kurslar topilmadi</Typography>
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                                                    gap: 1,
                                                }}
                                            >
                                                {coursesData.map((course) => (
                                                    <Paper
                                                        key={course.id}
                                                        elevation={0}
                                                        sx={{ p: 1.25, border: "1px solid #edf0f5", borderRadius: 2 }}
                                                    >
                                                        <Typography sx={{ fontWeight: 700 }}>{course.name}</Typography>
                                                        <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
                                                            Daraja: {course.level || "-"}
                                                        </Typography>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        )}
                                    </Paper>
                                ) : activeManagementTab === "Xonalar" ? (
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2" }}>
                                        <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1.25 }}>Xonalar</Typography>
                                        {roomsData.length === 0 ? (
                                            <Typography sx={{ color: "#6b7280" }}>Xonalar topilmadi</Typography>
                                        ) : (
                                            <Stack spacing={1}>
                                                {roomsData.map((room) => (
                                                    <Paper
                                                        key={room.id}
                                                        elevation={0}
                                                        sx={{ p: 1.25, border: "1px solid #edf0f5", borderRadius: 2 }}
                                                    >
                                                        <Typography sx={{ fontWeight: 700 }}>{room.name}</Typography>
                                                        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                                            Sig'im: {room.capacity} | Holat: {room.isActive ? "Faol" : "Nofaol"}
                                                        </Typography>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        )}
                                    </Paper>
                                ) : activeManagementTab === "Guruhlar" ? (
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2" }}>
                                        <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1.25 }}>Guruhlar</Typography>
                                        {upcomingGroups.length === 0 ? (
                                            <Typography sx={{ color: "#6b7280" }}>Guruhlar topilmadi</Typography>
                                        ) : (
                                            <Stack spacing={1}>
                                                {upcomingGroups.map((group) => (
                                                    <Paper
                                                        key={group.id}
                                                        elevation={0}
                                                        sx={{ p: 1.25, border: "1px solid #edf0f5", borderRadius: 2 }}
                                                    >
                                                        <Typography sx={{ fontWeight: 700 }}>{group.name}</Typography>
                                                        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                                            Vaqt: {group.startTime || "-"} | Talabalar: {group.students}
                                                        </Typography>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        )}
                                    </Paper>
                                ) : (
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2" }}>
                                        <Typography sx={{ color: "#6b7280" }}>
                                            {activeManagementTab} bo'limi keyingi bosqichda qo'shiladi.
                                        </Typography>
                                    </Paper>
                                )}
                            </Stack>
                        ) : (
                            <Paper
                                elevation={0}
                                sx={{ p: 3, borderRadius: 2.5, border: "1px solid #eaedf3" }}
                            >
                                <Typography sx={{ color: "#6b7280" }}>
                                    {activeItem} bo'limi keyingi bosqichda qo'shiladi.
                                </Typography>
                            </Paper>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}