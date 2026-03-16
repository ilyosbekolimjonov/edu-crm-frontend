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
import StudentRegisterDialog from "./StudentRegisterDialog";

export default function StudentsSection() {
    const [registerOpen, setRegisterOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

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
        const payload = {
            fullName: form.fullName,
            username: form.username,
            email: form.email,
            phone: form.phone,
            password: form.password,
            role: "STUDENT",
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
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <Stack direction="row" justifyContent="center" sx={{ py: 2 }}>
                                    <CircularProgress size={22} />
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ) : students.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <Typography sx={{ color: "#6b7280", py: 1.5 }}>
                                    Hozircha student topilmadi
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        students.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{student.fullName}</TableCell>
                                <TableCell>{student.username}</TableCell>
                                <TableCell>{student.phone}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{new Date(student.createdAt).toLocaleString()}</TableCell>
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
        </Paper>
    );
}
