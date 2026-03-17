import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Button,
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
    DeleteOutline,
    DiamondOutlined,
    EditOutlined,
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
    const [mentorsData, setMentorsData] = useState([]);
    const [roomsData, setRoomsData] = useState([]);
    const [upcomingGroups, setUpcomingGroups] = useState([]);
    const [activeManagementTab, setActiveManagementTab] = useState("Kurslar");
    const [courseDialogOpen, setCourseDialogOpen] = useState(false);
    const [creatingCourse, setCreatingCourse] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [courseEditDialogOpen, setCourseEditDialogOpen] = useState(false);
    const [updatingCourse, setUpdatingCourse] = useState(false);
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [creatingRoom, setCreatingRoom] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [roomEditDialogOpen, setRoomEditDialogOpen] = useState(false);
    const [updatingRoom, setUpdatingRoom] = useState(false);
    const [roomForm, setRoomForm] = useState({
        name: "",
        capacity: "",
    });
    const [courseForm, setCourseForm] = useState({
        name: "",
        about: "",
        durationMinutes: "60",
        durationMonths: "1",
        price: "",
        introVideo: "",
        level: "BEGINNER",
        mentorId: "",
    });
    const [courseEditForm, setCourseEditForm] = useState({
        name: "",
        about: "",
        durationMinutes: "60",
        durationMonths: "1",
        price: "",
        introVideo: "",
        level: "BEGINNER",
        mentorId: "",
    });
    const [roomEditForm, setRoomEditForm] = useState({
        name: "",
        capacity: "",
        isActive: true,
    });

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

    const loadDashboardData = async () => {
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

    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        const loadMentors = async () => {
            try {
                const { data } = await api.get("/auth/users", { params: { role: "MENTOR" } });
                setMentorsData(Array.isArray(data) ? data : []);
            } catch {
                setMentorsData([]);
            }
        };

        loadMentors();
    }, []);

    const handleCreateCourse = async () => {
        if (
            !courseForm.name ||
            !courseForm.about ||
            !courseForm.price ||
            !courseForm.mentorId ||
            !courseForm.durationMinutes ||
            !courseForm.durationMonths
        ) {
            toast.error("Kurs nomi, about, davomiylik, narx va mentorni kiriting");
            return;
        }

        setCreatingCourse(true);
        try {
            await api.post("/courses", {
                name: courseForm.name,
                about: courseForm.about,
                durationMinutes: Number(courseForm.durationMinutes),
                durationMonths: Number(courseForm.durationMonths),
                price: Number(courseForm.price),
                introVideo: courseForm.introVideo || undefined,
                level: courseForm.level,
                mentorId: Number(courseForm.mentorId),
            });

            toast.success("Kurs muvaffaqiyatli yaratildi");
            setCourseDialogOpen(false);
            setCourseForm({
                name: "",
                about: "",
                durationMinutes: "60",
                durationMonths: "1",
                price: "",
                introVideo: "",
                level: "BEGINNER",
                mentorId: "",
            });
            await loadDashboardData();
        } catch (error) {
            const message = error?.response?.data?.message || "Kurs yaratishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setCreatingCourse(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!roomForm.name || !roomForm.capacity) {
            toast.error("Xona nomi va sig'imni kiriting");
            return;
        }

        setCreatingRoom(true);
        try {
            await api.post("/rooms", {
                name: roomForm.name,
                capacity: Number(roomForm.capacity),
            });

            toast.success("Xona muvaffaqiyatli yaratildi");
            setRoomDialogOpen(false);
            setRoomForm({ name: "", capacity: "" });
            await loadDashboardData();
        } catch (error) {
            const message = error?.response?.data?.message || "Xona yaratishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setCreatingRoom(false);
        }
    };

    const openCourseEditDialog = (course) => {
        setEditingCourse(course);
        setCourseEditForm({
            name: course.name || "",
            about: course.about || "",
            durationMinutes: String(course.durationMinutes ?? 60),
            durationMonths: String(course.durationMonths ?? 1),
            price: String(course.price ?? ""),
            introVideo: course.introVideo || "",
            level: course.level || "BEGINNER",
            mentorId: String(course.mentor?.id ?? ""),
        });
        setCourseEditDialogOpen(true);
    };

    const handleUpdateCourse = async () => {
        if (!editingCourse) return;
        if (
            !courseEditForm.name ||
            !courseEditForm.about ||
            !courseEditForm.price ||
            !courseEditForm.mentorId ||
            !courseEditForm.durationMinutes ||
            !courseEditForm.durationMonths
        ) {
            toast.error("Kurs nomi, about, davomiylik, narx va mentorni kiriting");
            return;
        }

        setUpdatingCourse(true);
        try {
            await api.patch(`/courses/${editingCourse.id}`, {
                name: courseEditForm.name,
                about: courseEditForm.about,
                durationMinutes: Number(courseEditForm.durationMinutes),
                durationMonths: Number(courseEditForm.durationMonths),
                price: Number(courseEditForm.price),
                introVideo: courseEditForm.introVideo || undefined,
                level: courseEditForm.level,
                mentorId: Number(courseEditForm.mentorId),
            });

            toast.success("Kurs yangilandi");
            setCourseEditDialogOpen(false);
            setEditingCourse(null);
            await loadDashboardData();
        } catch (error) {
            const message = error?.response?.data?.message || "Kursni yangilashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setUpdatingCourse(false);
        }
    };

    const handleDeleteCourse = async (course) => {
        const confirmed = window.confirm(`"${course.name}" kursini o'chirmoqchimisiz?`);
        if (!confirmed) return;

        try {
            await api.delete(`/courses/${course.id}`);
            toast.success("Kurs o'chirildi");
            await loadDashboardData();
        } catch (error) {
            const message = error?.response?.data?.message || "Kursni o'chirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    const openRoomEditDialog = (room) => {
        setEditingRoom(room);
        setRoomEditForm({
            name: room.name || "",
            capacity: String(room.capacity ?? ""),
            isActive: Boolean(room.isActive),
        });
        setRoomEditDialogOpen(true);
    };

    const handleUpdateRoom = async () => {
        if (!editingRoom) return;
        if (!roomEditForm.name || !roomEditForm.capacity) {
            toast.error("Xona nomi va sig'imni kiriting");
            return;
        }

        setUpdatingRoom(true);
        try {
            await api.patch(`/rooms/${editingRoom.id}`, {
                name: roomEditForm.name,
                capacity: Number(roomEditForm.capacity),
                isActive: roomEditForm.isActive,
            });

            toast.success("Xona yangilandi");
            setRoomEditDialogOpen(false);
            setEditingRoom(null);
            await loadDashboardData();
        } catch (error) {
            const message = error?.response?.data?.message || "Xonani yangilashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setUpdatingRoom(false);
        }
    };

    const handleDeleteRoom = async (room) => {
        const confirmed = window.confirm(`"${room.name}" xonasini o'chirmoqchimisiz?`);
        if (!confirmed) return;

        try {
            await api.delete(`/rooms/${room.id}`);
            toast.success("Xona o'chirildi");
            await loadDashboardData();
        } catch (error) {
            const message = error?.response?.data?.message || "Xonani o'chirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

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
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            sx={{ mb: 1.25 }}
                                        >
                                            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>Kurslar</Typography>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => setCourseDialogOpen(true)}
                                                sx={{ textTransform: "none", borderRadius: 2 }}
                                            >
                                                Kurs qo'shish
                                            </Button>
                                        </Stack>
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
                                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                            <Typography sx={{ fontWeight: 700 }}>{course.name}</Typography>
                                                            <Stack direction="row" spacing={0.25}>
                                                                <IconButton size="small" onClick={() => openCourseEditDialog(course)}>
                                                                    <EditOutlined fontSize="small" />
                                                                </IconButton>
                                                                <IconButton size="small" color="error" onClick={() => handleDeleteCourse(course)}>
                                                                    <DeleteOutline fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                        </Stack>
                                                        <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
                                                            {course.about || "Izoh yo'q"}
                                                        </Typography>
                                                        <Stack direction="row" spacing={0.75} sx={{ mt: 0.8, flexWrap: "wrap" }}>
                                                            <Chip
                                                                size="small"
                                                                label={`${course.durationMinutes ?? 0} min`}
                                                                variant="outlined"
                                                            />
                                                            <Chip
                                                                size="small"
                                                                label={`${course.durationMonths ?? 0} oy`}
                                                                variant="outlined"
                                                            />
                                                            <Chip
                                                                size="small"
                                                                label={`${course.price ?? "-"} so'm`}
                                                                variant="outlined"
                                                            />
                                                        </Stack>
                                                        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                                            Mentor: {course.mentor?.fullName || "-"}
                                                        </Typography>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        )}
                                    </Paper>
                                ) : activeManagementTab === "Xonalar" ? (
                                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2" }}>
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            sx={{ mb: 1.25 }}
                                        >
                                            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>Xonalar</Typography>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => setRoomDialogOpen(true)}
                                                sx={{ textTransform: "none", borderRadius: 2 }}
                                            >
                                                Xona qo'shish
                                            </Button>
                                        </Stack>
                                        {roomsData.length === 0 ? (
                                            <Typography sx={{ color: "#6b7280" }}>Xonalar topilmadi</Typography>
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: {
                                                        xs: "1fr",
                                                        md: "repeat(2, minmax(0, 1fr))",
                                                        xl: "repeat(3, minmax(0, 1fr))",
                                                    },
                                                    gap: 1,
                                                }}
                                            >
                                                {roomsData.map((room) => (
                                                    <Paper
                                                        key={room.id}
                                                        elevation={0}
                                                        sx={{ p: 1.25, border: "1px solid #edf0f5", borderRadius: 2 }}
                                                    >
                                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                            <Typography sx={{ fontWeight: 700 }}>{room.name}</Typography>
                                                            <Stack direction="row" spacing={0.25}>
                                                                <IconButton size="small" onClick={() => openRoomEditDialog(room)}>
                                                                    <EditOutlined fontSize="small" />
                                                                </IconButton>
                                                                <IconButton size="small" color="error" onClick={() => handleDeleteRoom(room)}>
                                                                    <DeleteOutline fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                        </Stack>
                                                        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                                            Sig'im: {room.capacity} | Holat: {room.isActive ? "Faol" : "Nofaol"}
                                                        </Typography>
                                                    </Paper>
                                                ))}
                                            </Box>
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

            <Dialog
                open={courseDialogOpen}
                onClose={() => (!creatingCourse ? setCourseDialogOpen(false) : null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Yangi kurs yaratish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Kurs nomi"
                            value={courseForm.name}
                            onChange={(event) =>
                                setCourseForm((prev) => ({ ...prev, name: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            label="About"
                            value={courseForm.about}
                            onChange={(event) =>
                                setCourseForm((prev) => ({ ...prev, about: event.target.value }))
                            }
                            multiline
                            minRows={3}
                            fullWidth
                        />
                        <TextField
                            label="Narx"
                            type="number"
                            value={courseForm.price}
                            onChange={(event) =>
                                setCourseForm((prev) => ({ ...prev, price: event.target.value }))
                            }
                            fullWidth
                            slotProps={{ htmlInput: { min: 0 } }}
                        />
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                label="Dars davomiyligi (min)"
                                type="number"
                                value={courseForm.durationMinutes}
                                onChange={(event) =>
                                    setCourseForm((prev) => ({ ...prev, durationMinutes: event.target.value }))
                                }
                                fullWidth
                                slotProps={{ htmlInput: { min: 1 } }}
                            />
                            <TextField
                                label="Kurs davomiyligi (oy)"
                                type="number"
                                value={courseForm.durationMonths}
                                onChange={(event) =>
                                    setCourseForm((prev) => ({ ...prev, durationMonths: event.target.value }))
                                }
                                fullWidth
                                slotProps={{ htmlInput: { min: 1 } }}
                            />
                        </Stack>
                        <TextField
                            label="Intro video (ixtiyoriy)"
                            value={courseForm.introVideo}
                            onChange={(event) =>
                                setCourseForm((prev) => ({ ...prev, introVideo: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            select
                            label="Daraja"
                            value={courseForm.level}
                            onChange={(event) =>
                                setCourseForm((prev) => ({ ...prev, level: event.target.value }))
                            }
                            fullWidth
                        >
                            <MenuItem value="BEGINNER">BEGINNER</MenuItem>
                            <MenuItem value="PRE_INTERMEDIATE">PRE_INTERMEDIATE</MenuItem>
                            <MenuItem value="INTERMEDIATE">INTERMEDIATE</MenuItem>
                            <MenuItem value="UPPER_INTERMEDIATE">UPPER_INTERMEDIATE</MenuItem>
                            <MenuItem value="ADVANCED">ADVANCED</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Mentor"
                            value={courseForm.mentorId}
                            onChange={(event) =>
                                setCourseForm((prev) => ({ ...prev, mentorId: event.target.value }))
                            }
                            fullWidth
                        >
                            {mentorsData.map((mentor) => (
                                <MenuItem key={mentor.id} value={mentor.id}>
                                    {mentor.fullName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setCourseDialogOpen(false)}
                        disabled={creatingCourse}
                        sx={{ textTransform: "none" }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateCourse}
                        disabled={creatingCourse}
                        sx={{ textTransform: "none" }}
                    >
                        {creatingCourse ? "Yaratilmoqda..." : "Yaratish"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={roomDialogOpen}
                onClose={() => (!creatingRoom ? setRoomDialogOpen(false) : null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Xona qo'shish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Xona nomi"
                            value={roomForm.name}
                            onChange={(event) =>
                                setRoomForm((prev) => ({ ...prev, name: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            label="Sig'im"
                            type="number"
                            value={roomForm.capacity}
                            onChange={(event) =>
                                setRoomForm((prev) => ({ ...prev, capacity: event.target.value }))
                            }
                            fullWidth
                            slotProps={{ htmlInput: { min: 1 } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setRoomDialogOpen(false)}
                        disabled={creatingRoom}
                        sx={{ textTransform: "none" }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateRoom}
                        disabled={creatingRoom}
                        sx={{ textTransform: "none" }}
                    >
                        {creatingRoom ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={courseEditDialogOpen}
                onClose={() => (!updatingCourse ? setCourseEditDialogOpen(false) : null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Kursni tahrirlash</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Kurs nomi"
                            value={courseEditForm.name}
                            onChange={(event) =>
                                setCourseEditForm((prev) => ({ ...prev, name: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            label="About"
                            value={courseEditForm.about}
                            onChange={(event) =>
                                setCourseEditForm((prev) => ({ ...prev, about: event.target.value }))
                            }
                            multiline
                            minRows={3}
                            fullWidth
                        />
                        <TextField
                            label="Narx"
                            type="number"
                            value={courseEditForm.price}
                            onChange={(event) =>
                                setCourseEditForm((prev) => ({ ...prev, price: event.target.value }))
                            }
                            fullWidth
                            slotProps={{ htmlInput: { min: 0 } }}
                        />
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                label="Dars davomiyligi (min)"
                                type="number"
                                value={courseEditForm.durationMinutes}
                                onChange={(event) =>
                                    setCourseEditForm((prev) => ({ ...prev, durationMinutes: event.target.value }))
                                }
                                fullWidth
                                slotProps={{ htmlInput: { min: 1 } }}
                            />
                            <TextField
                                label="Kurs davomiyligi (oy)"
                                type="number"
                                value={courseEditForm.durationMonths}
                                onChange={(event) =>
                                    setCourseEditForm((prev) => ({ ...prev, durationMonths: event.target.value }))
                                }
                                fullWidth
                                slotProps={{ htmlInput: { min: 1 } }}
                            />
                        </Stack>
                        <TextField
                            label="Intro video (ixtiyoriy)"
                            value={courseEditForm.introVideo}
                            onChange={(event) =>
                                setCourseEditForm((prev) => ({ ...prev, introVideo: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            select
                            label="Daraja"
                            value={courseEditForm.level}
                            onChange={(event) =>
                                setCourseEditForm((prev) => ({ ...prev, level: event.target.value }))
                            }
                            fullWidth
                        >
                            <MenuItem value="BEGINNER">BEGINNER</MenuItem>
                            <MenuItem value="PRE_INTERMEDIATE">PRE_INTERMEDIATE</MenuItem>
                            <MenuItem value="INTERMEDIATE">INTERMEDIATE</MenuItem>
                            <MenuItem value="UPPER_INTERMEDIATE">UPPER_INTERMEDIATE</MenuItem>
                            <MenuItem value="ADVANCED">ADVANCED</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Mentor"
                            value={courseEditForm.mentorId}
                            onChange={(event) =>
                                setCourseEditForm((prev) => ({ ...prev, mentorId: event.target.value }))
                            }
                            fullWidth
                        >
                            {mentorsData.map((mentor) => (
                                <MenuItem key={mentor.id} value={mentor.id}>
                                    {mentor.fullName}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setCourseEditDialogOpen(false)}
                        disabled={updatingCourse}
                        sx={{ textTransform: "none" }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateCourse}
                        disabled={updatingCourse}
                        sx={{ textTransform: "none" }}
                    >
                        {updatingCourse ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={roomEditDialogOpen}
                onClose={() => (!updatingRoom ? setRoomEditDialogOpen(false) : null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Xonani tahrirlash</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Xona nomi"
                            value={roomEditForm.name}
                            onChange={(event) =>
                                setRoomEditForm((prev) => ({ ...prev, name: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            label="Sig'im"
                            type="number"
                            value={roomEditForm.capacity}
                            onChange={(event) =>
                                setRoomEditForm((prev) => ({ ...prev, capacity: event.target.value }))
                            }
                            fullWidth
                            slotProps={{ htmlInput: { min: 1 } }}
                        />
                        <TextField
                            select
                            label="Holat"
                            value={roomEditForm.isActive ? "active" : "inactive"}
                            onChange={(event) =>
                                setRoomEditForm((prev) => ({ ...prev, isActive: event.target.value === "active" }))
                            }
                            fullWidth
                        >
                            <MenuItem value="active">Faol</MenuItem>
                            <MenuItem value="inactive">Nofaol</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setRoomEditDialogOpen(false)}
                        disabled={updatingRoom}
                        sx={{ textTransform: "none" }}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateRoom}
                        disabled={updatingRoom}
                        sx={{ textTransform: "none" }}
                    >
                        {updatingRoom ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}