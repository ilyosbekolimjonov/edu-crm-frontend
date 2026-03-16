import { useEffect, useState } from "react";
import {
    Button,
    CircularProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import toast from "react-hot-toast";
import { getUsersRequest, registerStudentRequest } from "../../services/auth.service";
import TeacherCreateDrawer from "./TeacherCreateDrawer";

export default function TeachersSection() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadTeachers = async () => {
        setLoading(true);
        try {
            const data = await getUsersRequest("MENTOR");
            setTeachers(Array.isArray(data) ? data : []);
        } catch (error) {
            const message = error?.response?.data?.message || "O'qituvchilarni yuklashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeachers();
    }, []);

    const handleCreateTeacher = async (form) => {
        const payload = {
            fullName: form.fullName,
            username: form.username,
            email: form.email,
            phone: form.phone,
            password: form.password,
            role: "MENTOR",
            about: form.about || undefined,
            experience: Number.isNaN(Number(form.experience)) ? 0 : Math.max(0, Number(form.experience)),
            telegram: form.telegram || undefined,
            linkedin: form.linkedin || undefined,
        };

        try {
            await registerStudentRequest(payload);
            toast.success("O'qituvchi muvaffaqiyatli qo'shildi");
            await loadTeachers();
        } catch (error) {
            const message = error?.response?.data?.message || "O'qituvchi qo'shishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
            throw error;
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: "1px solid #eaedf3" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: 30, fontWeight: 700, color: "#20242e" }}>
                    O'qituvchilar
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setDrawerOpen(true)}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                >
                    O'qituvchi qo'shish
                </Button>
            </Stack>

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>FIO</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Telefon</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>About</TableCell>
                        <TableCell>Tajriba</TableCell>
                        <TableCell>Telegram</TableCell>
                        <TableCell>LinkedIn</TableCell>
                        <TableCell>Yaratilgan</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={10}>
                                <Stack direction="row" justifyContent="center" sx={{ py: 2 }}>
                                    <CircularProgress size={22} />
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ) : teachers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10}>
                                <Typography sx={{ color: "#6b7280", py: 1.5 }}>
                                    Hozircha o'qituvchi topilmadi
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        teachers.map((teacher, index) => (
                            <TableRow key={teacher.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{teacher.fullName}</TableCell>
                                <TableCell>{teacher.username}</TableCell>
                                <TableCell>{teacher.phone}</TableCell>
                                <TableCell>{teacher.email}</TableCell>
                                <TableCell>{teacher.Mentor?.about || "-"}</TableCell>
                                <TableCell>{teacher.Mentor?.experience ?? 0}</TableCell>
                                <TableCell>{teacher.Mentor?.telegram || "-"}</TableCell>
                                <TableCell>{teacher.Mentor?.linkedin || "-"}</TableCell>
                                <TableCell>{new Date(teacher.createdAt).toLocaleString()}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <TeacherCreateDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSubmit={handleCreateTeacher}
            />
        </Paper>
    );
}
