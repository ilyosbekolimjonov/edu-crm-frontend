import { useEffect, useState } from "react";
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, MenuItem, } from "@mui/material";
import { Add, DeleteOutline, EditOutlined, UploadFileOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";
import api from "../../services/axios";
import { registerStudentRequest, uploadUserImageRequest } from "../../services/auth.service";
import PhoneInput from "../common/PhoneInput";

const initialForm = {
    fullName: "",
    username: "",
    email: "",
    phone: "+998",
    role: "ASSISTANT",
    password: "",
    confirmPassword: "",
};

export default function EmployeesManagementSection() {
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [createForm, setCreateForm] = useState({ ...initialForm, imageFile: null });

    const handleCreateImageChange = (event) => {
        const files = Array.from(event.target.files || []);

        if (files.length > 1) {
            toast.error("Faqat bitta rasm tanlash mumkin");
            event.target.value = "";
            return;
        }

        setCreateForm((prev) => ({ ...prev, imageFile: files[0] || null }));
    };

    const loadEmployees = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/auth/users");
            const users = Array.isArray(data) ? data : [];
            setEmployees(users.filter((user) => user.role !== "MENTOR" && user.role !== "STUDENT"));
        } catch (error) {
            const message = error?.response?.data?.message || "Xodimlarni yuklashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const handleCreateEmployee = async () => {
        if (!createForm.fullName || !createForm.username || !createForm.email || !createForm.phone || !createForm.password || !createForm.confirmPassword || !createForm.role) {
            toast.error("Majburiy maydonlarni to'ldiring");
            return;
        }
        if (!/^\+998\d{9}$/.test(createForm.phone)) {
            toast.error("Telefon +998XXXXXXXXX formatida bo'lishi kerak");
            return;
        }
        if (createForm.password !== createForm.confirmPassword) {
            toast.error("Parollar mos emas");
            return;
        }

        setCreating(true);
        try {
            let image;
            if (createForm.imageFile) {
                const uploaded = await uploadUserImageRequest(createForm.imageFile);
                image = uploaded?.imageUrl;
            }

            await registerStudentRequest({
                fullName: createForm.fullName,
                username: createForm.username,
                email: createForm.email,
                phone: createForm.phone,
                password: createForm.password,
                role: createForm.role,
                image,
            });

            toast.success("Xodim qo'shildi");
            setCreateOpen(false);
            setCreateForm({ ...initialForm, imageFile: null });
            await loadEmployees();
        } catch (error) {
            const message = error?.response?.data?.message || "Xodim qo'shishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setCreating(false);
        }
    };

    const openEdit = (employee) => {
        setEditingEmployee(employee);
        setForm({
            fullName: employee.fullName || "",
            username: employee.username || "",
            email: employee.email || "",
            phone: employee.phone || "",
            role: employee.role || "ASSISTANT",
            password: "",
        });
        setEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingEmployee) return;
        if (!form.fullName || !form.username || !form.email || !form.phone || !form.role) {
            toast.error("Majburiy maydonlarni to'ldiring");
            return;
        }
        if (!/^\+998\d{9}$/.test(form.phone)) {
            toast.error("Telefon +998XXXXXXXXX formatida bo'lishi kerak");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                fullName: form.fullName,
                username: form.username,
                email: form.email,
                phone: form.phone,
                role: form.role,
            };
            if (form.password) payload.password = form.password;

            await api.patch(`/auth/users/${editingEmployee.id}`, payload);
            toast.success("Xodim yangilandi");
            setEditOpen(false);
            setEditingEmployee(null);
            setForm(initialForm);
            await loadEmployees();
        } catch (error) {
            const message = error?.response?.data?.message || "Xodimni yangilashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (employee) => {
        const confirmed = window.confirm(`"${employee.fullName}" ni o'chirmoqchimisiz?`);
        if (!confirmed) return;

        try {
            await api.delete(`/auth/users/${employee.id}`);
            toast.success("Xodim o'chirildi");
            await loadEmployees();
        } catch (error) {
            const message = error?.response?.data?.message || "Xodimni o'chirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                <Typography sx={{ fontSize: 24, fontWeight: 700 }}>Xodimlar</Typography>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setCreateOpen(true)}
                    sx={{ textTransform: "none" }}
                >
                    Xodim qo'shish
                </Button>
            </Stack>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>FIO</TableCell>
                        <TableCell>Lavozim</TableCell>
                        <TableCell>Telefon</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Yaratilgan sana</TableCell>
                        <TableCell align="right">Amallar</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Typography sx={{ color: "#6b7280", py: 1.5 }}>Yuklanmoqda...</Typography>
                            </TableCell>
                        </TableRow>
                    ) : employees.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Typography sx={{ color: "#6b7280", py: 1.5 }}>Xodimlar topilmadi</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        employees.map((employee, index) => (
                            <TableRow key={employee.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Avatar
                                            src={employee.image ? `${api.defaults.baseURL}${employee.image}` : undefined}
                                            sx={{ width: 28, height: 28, fontSize: 12 }}
                                        >
                                            {employee.fullName?.[0] || "E"}
                                        </Avatar>
                                        <Typography>{employee.fullName}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>{employee.role}</TableCell>
                                <TableCell>{employee.phone}</TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>{new Date(employee.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => openEdit(employee)}>
                                        <EditOutlined fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(employee)}>
                                        <DeleteOutline fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={createOpen} onClose={() => (!creating ? setCreateOpen(false) : null)} maxWidth="sm" fullWidth>
                <DialogTitle>Xodim qo'shish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="FIO" value={createForm.fullName} onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))} fullWidth />
                        <TextField label="Username" value={createForm.username} onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))} fullWidth />
                        <TextField label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} fullWidth />
                        <PhoneInput value={createForm.phone} onChange={(value) => setCreateForm((p) => ({ ...p, phone: value }))} />
                        <TextField label="Parol" type="password" value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} fullWidth />
                        <TextField label="Parolni tasdiqlang" type="password" value={createForm.confirmPassword} onChange={(e) => setCreateForm((p) => ({ ...p, confirmPassword: e.target.value }))} fullWidth />
                        <TextField select label="Role" value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))} fullWidth>
                            <MenuItem value="ASSISTANT">ASSISTANT</MenuItem>
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                        </TextField>

                        <Box
                            component="label"
                            sx={{
                                border: "1px dashed #b9bec8",
                                borderRadius: 2,
                                p: 2,
                                textAlign: "center",
                                cursor: "pointer",
                                backgroundColor: "#fafbfc",
                            }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                multiple={false}
                                onChange={handleCreateImageChange}
                            />
                            <UploadFileOutlined sx={{ color: "#667085", mb: 0.5 }} />
                            <Typography sx={{ fontSize: 13, color: "#344054" }}>Surat yuklash uchun bosing</Typography>
                            <Typography sx={{ fontSize: 12, color: "#98a2b3" }}>
                                {createForm.imageFile ? createForm.imageFile.name : "PNG/JPG/JPEG"}
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCreateOpen(false)} disabled={creating}>Bekor qilish</Button>
                    <Button variant="contained" onClick={handleCreateEmployee} disabled={creating}>{creating ? "Saqlanmoqda..." : "Saqlash"}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editOpen} onClose={() => (!submitting ? setEditOpen(false) : null)} maxWidth="sm" fullWidth>
                <DialogTitle>Xodimni tahrirlash</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="FIO" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} fullWidth />
                        <TextField label="Username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} fullWidth />
                        <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} fullWidth />
                        <PhoneInput value={form.phone} onChange={(value) => setForm((p) => ({ ...p, phone: value }))} />
                        <TextField select label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} fullWidth>
                            <MenuItem value="ASSISTANT">ASSISTANT</MenuItem>
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                            <MenuItem value="SUPERADMIN">SUPERADMIN</MenuItem>
                        </TextField>
                        <TextField label="Yangi parol (ixtiyoriy)" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} fullWidth />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditOpen(false)} disabled={submitting}>Bekor qilish</Button>
                    <Button variant="contained" onClick={handleUpdate} disabled={submitting}>{submitting ? "Saqlanmoqda..." : "Saqlash"}</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
