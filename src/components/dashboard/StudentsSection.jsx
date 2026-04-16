import { useEffect, useState } from "react";
import {
    Avatar,
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
    uploadUserImageRequest,
    updateUserRequest,
} from "../../services/auth.service";
import api from "../../services/axios";
import PhoneInput from "../common/PhoneInput";
import StudentRegisterDialog from "./StudentRegisterDialog";

const initialEditForm = {
    fullName: "",
    username: "",
    email: "",
    phone: "+998",
    password: "",
};

export default function StudentsSection() {
    const [registerOpen, setRegisterOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState(initialEditForm);
    const [submittingEdit, setSubmittingEdit] = useState(false);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const data = await getUsersRequest("STUDENT");
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            const message = error?.response?.data?.message || "Talabalarni yuklashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const handleRegister = async (form) => {
        let image;
        if (form.imageFile) {
            const uploaded = await uploadUserImageRequest(form.imageFile);
            image = uploaded?.imageUrl;
        }

        const payload = {
            fullName: form.fullName,
            username: form.username,
            email: form.email,
            phone: form.phone,
            password: form.password,
            role: "STUDENT",
            image,
        };

        try {
            await registerStudentRequest(payload);
            toast.success("Talaba muvaffaqiyatli qo'shildi");
            await loadStudents();
        } catch (error) {
            const message = error?.response?.data?.message || "Talaba qo'shishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
            throw error;
        }
    };

    const handleOpenEdit = (student) => {
        setEditingStudent(student);
        setEditForm({
            fullName: student.fullName || "",
            username: student.username || "",
            email: student.email || "",
            phone: student.phone || "",
            password: "",
        });
        setEditOpen(true);
    };

    const handleUpdateStudent = async () => {
        if (!editingStudent) return;
        if (!editForm.fullName || !editForm.username || !editForm.email || !editForm.phone) {
            toast.error("FIO, username, email va telefon majburiy");
            return;
        }
        if (!/^\+998\d{9}$/.test(editForm.phone)) {
            toast.error("Telefon +998XXXXXXXXX formatida bo'lishi kerak");
            return;
        }

        setSubmittingEdit(true);
        try {
            const payload = {
                fullName: editForm.fullName,
                username: editForm.username,
                email: editForm.email,
                phone: editForm.phone,
            };

            if (editForm.password) {
                payload.password = editForm.password;
            }

            await updateUserRequest(editingStudent.id, payload);
            toast.success("Talaba ma'lumoti yangilandi");
            setEditOpen(false);
            setEditingStudent(null);
            setEditForm(initialEditForm);
            await loadStudents();
        } catch (error) {
            const message = error?.response?.data?.message || "Talabani yangilashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeleteStudent = async (student) => {
        const confirmed = window.confirm(`"${student.fullName}" ni o'chirmoqchimisiz?`);
        if (!confirmed) return;

        try {
            await deleteUserRequest(student.id);
            toast.success("Talaba o'chirildi");
            await loadStudents();
        } catch (error) {
            const message = error?.response?.data?.message || "Talabani o'chirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: "1px solid #eaedf3" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: 30, fontWeight: 700, color: "#20242e" }}>
                    Talabalar
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setRegisterOpen(true)}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                >
                    Talaba qo'shish
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
                        <TableCell>Yaratilgan</TableCell>
                        <TableCell align="right">Amallar</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Stack direction="row" justifyContent="center" sx={{ py: 2 }}>
                                    <CircularProgress size={22} />
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ) : students.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Typography sx={{ color: "#6b7280", py: 1.5 }}>
                                    Hozircha student topilmadi
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        students.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Avatar
                                            src={student.image ? `${api.defaults.baseURL}${student.image}` : undefined}
                                            sx={{ width: 28, height: 28, fontSize: 12 }}
                                        >
                                            {student.fullName?.[0] || "S"}
                                        </Avatar>
                                        <Typography>{student.fullName}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>{student.username}</TableCell>
                                <TableCell>{student.phone}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{new Date(student.createdAt).toLocaleString()}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpenEdit(student)}>
                                        <EditOutlined fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDeleteStudent(student)}>
                                        <DeleteOutline fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <StudentRegisterDialog
                open={registerOpen}
                onClose={() => setRegisterOpen(false)}
                onSubmit={handleRegister}
            />

            <Dialog
                open={editOpen}
                onClose={() => (!submittingEdit ? setEditOpen(false) : null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Talabani tahrirlash</DialogTitle>
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
                        <PhoneInput value={editForm.phone} onChange={(value) => setEditForm((prev) => ({ ...prev, phone: value }))} />
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
                    <Button variant="contained" onClick={handleUpdateStudent} disabled={submittingEdit}>
                        {submittingEdit ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
