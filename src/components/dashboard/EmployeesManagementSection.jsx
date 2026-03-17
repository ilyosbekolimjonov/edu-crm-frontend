import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, MenuItem, } from "@mui/material";
import { DeleteOutline, EditOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";
import api from "../../services/axios";

const initialForm = {
    fullName: "",
    username: "",
    email: "",
    phone: "",
    role: "ASSISTANT",
    password: "",
};

export default function EmployeesManagementSection() {
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [editOpen, setEditOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [form, setForm] = useState(initialForm);

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
        const confirmed = window.confirm(`\"${employee.fullName}\" ni o'chirmoqchimisiz?`);
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
            <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 1.25 }}>Xodimlar</Typography>
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
                                <TableCell>{employee.fullName}</TableCell>
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

            <Dialog open={editOpen} onClose={() => (!submitting ? setEditOpen(false) : null)} maxWidth="sm" fullWidth>
                <DialogTitle>Xodimni tahrirlash</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="FIO" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} fullWidth />
                        <TextField label="Username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} fullWidth />
                        <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} fullWidth />
                        <TextField label="Telefon" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} fullWidth />
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
