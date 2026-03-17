import { useEffect, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { Add, DeleteOutline, EditOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";
import {
    deleteUserRequest,
    getUsersRequest,
    registerStudentRequest,
    updateUserRequest,
} from "../../services/auth.service";
import api from "../../services/axios";
import TeacherCreateDrawer from "./TeacherCreateDrawer";

const initialEditForm = {
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    about: "",
    experience: "0",
    telegram: "",
    linkedin: "",
};

export default function TeachersSection() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [editForm, setEditForm] = useState(initialEditForm);
    const [submittingEdit, setSubmittingEdit] = useState(false);

    const loadTeachers = async () => {
        setLoading(true);
        try {
            const [teachersRes, coursesRes] = await Promise.all([
                getUsersRequest("MENTOR"),
                api.get("/courses"),
            ]);

            setTeachers(Array.isArray(teachersRes) ? teachersRes : []);
            setCourses(Array.isArray(coursesRes?.data) ? coursesRes.data : []);
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
            const registerRes = await registerStudentRequest(payload);
            const mentorUserId = registerRes?.userId;
            const selectedCourseIds = (Array.isArray(form.courseIds) ? form.courseIds : [])
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id) && id > 0);

            if (mentorUserId && selectedCourseIds.length > 0) {
                await Promise.all(
                    selectedCourseIds.map((courseId) =>
                        api.patch(`/courses/${courseId}`, { mentorId: mentorUserId }),
                    ),
                );
            }

            toast.success("O'qituvchi muvaffaqiyatli qo'shildi");
            await loadTeachers();
        } catch (error) {
            const message = error?.response?.data?.message || "O'qituvchi qo'shishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
            throw error;
        }
    };

    const handleOpenEdit = (teacher) => {
        setEditingTeacher(teacher);
        setEditForm({
            fullName: teacher.fullName || "",
            username: teacher.username || "",
            email: teacher.email || "",
            phone: teacher.phone || "",
            password: "",
            about: teacher.Mentor?.about || "",
            experience: String(teacher.Mentor?.experience ?? 0),
            telegram: teacher.Mentor?.telegram || "",
            linkedin: teacher.Mentor?.linkedin || "",
        });
        setEditOpen(true);
    };

    const handleUpdateTeacher = async () => {
        if (!editingTeacher) return;
        if (!editForm.fullName || !editForm.username || !editForm.email || !editForm.phone) {
            toast.error("FIO, username, email va telefon majburiy");
            return;
        }

        setSubmittingEdit(true);
        try {
            const payload = {
                fullName: editForm.fullName,
                username: editForm.username,
                email: editForm.email,
                phone: editForm.phone,
                about: editForm.about || undefined,
                experience: Number.isNaN(Number(editForm.experience))
                    ? 0
                    : Math.max(0, Number(editForm.experience)),
                telegram: editForm.telegram || undefined,
                linkedin: editForm.linkedin || undefined,
            };

            if (editForm.password) {
                payload.password = editForm.password;
            }

            await updateUserRequest(editingTeacher.id, payload);
            toast.success("O'qituvchi ma'lumoti yangilandi");
            setEditOpen(false);
            setEditingTeacher(null);
            setEditForm(initialEditForm);
            await loadTeachers();
        } catch (error) {
            const message = error?.response?.data?.message || "O'qituvchini yangilashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeleteTeacher = async (teacher) => {
        const confirmed = window.confirm(`"${teacher.fullName}" ni o'chirmoqchimisiz?`);
        if (!confirmed) return;

        try {
            await deleteUserRequest(teacher.id);
            toast.success("O'qituvchi o'chirildi");
            await loadTeachers();
        } catch (error) {
            const message = error?.response?.data?.message || "O'qituvchini o'chirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
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
                        <TableCell align="right">Amallar</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={11}>
                                <Stack direction="row" justifyContent="center" sx={{ py: 2 }}>
                                    <CircularProgress size={22} />
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ) : teachers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={11}>
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
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpenEdit(teacher)}>
                                        <EditOutlined fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDeleteTeacher(teacher)}>
                                        <DeleteOutline fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <TeacherCreateDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSubmit={handleCreateTeacher}
                availableCourses={courses}
            />

            <Dialog
                open={editOpen}
                onClose={() => (!submittingEdit ? setEditOpen(false) : null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>O'qituvchini tahrirlash</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="FIO"
                            value={editForm.fullName}
                            onChange={(event) =>
                                setEditForm((prev) => ({ ...prev, fullName: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            label="Username"
                            value={editForm.username}
                            onChange={(event) =>
                                setEditForm((prev) => ({ ...prev, username: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={editForm.email}
                            onChange={(event) =>
                                setEditForm((prev) => ({ ...prev, email: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            label="Telefon"
                            value={editForm.phone}
                            onChange={(event) =>
                                setEditForm((prev) => ({ ...prev, phone: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            label="About"
                            value={editForm.about}
                            onChange={(event) =>
                                setEditForm((prev) => ({ ...prev, about: event.target.value }))
                            }
                            multiline
                            minRows={2}
                            fullWidth
                        />
                        <TextField
                            label="Tajriba (yil)"
                            type="number"
                            value={editForm.experience}
                            onChange={(event) =>
                                setEditForm((prev) => ({ ...prev, experience: event.target.value }))
                            }
                            fullWidth
                            slotProps={{ htmlInput: { min: 0 } }}
                        />
                        <TextField
                            label="Telegram"
                            value={editForm.telegram}
                            onChange={(event) =>
                                setEditForm((prev) => ({ ...prev, telegram: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            label="LinkedIn"
                            value={editForm.linkedin}
                            onChange={(event) =>
                                setEditForm((prev) => ({ ...prev, linkedin: event.target.value }))
                            }
                            fullWidth
                        />
                        <TextField
                            label="Yangi parol (ixtiyoriy)"
                            type="password"
                            value={editForm.password}
                            onChange={(event) =>
                                setEditForm((prev) => ({ ...prev, password: event.target.value }))
                            }
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditOpen(false)} disabled={submittingEdit}>
                        Bekor qilish
                    </Button>
                    <Button variant="contained" onClick={handleUpdateTeacher} disabled={submittingEdit}>
                        {submittingEdit ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
