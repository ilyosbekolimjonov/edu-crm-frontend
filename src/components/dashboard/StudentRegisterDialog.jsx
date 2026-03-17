import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, } from "@mui/material";
import { UploadFileOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";

const initialForm = { fullName: "", username: "", email: "", phone: "", password: "", gender: "Erkak", imageFile: null, };

export default function StudentRegisterDialog({ open, onClose, onSubmit }) {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleClose = () => {
        if (submitting) return;
        setForm(initialForm);
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.fullName || !form.username || !form.email || !form.phone || !form.password) {
            toast.error("Barcha majburiy maydonlarni to'ldiring");
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(form);
            setForm(initialForm);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Talaba qo'shish</DialogTitle>
            <DialogContent>
                <Stack component="form" onSubmit={handleSubmit} spacing={2} sx={{ pt: 1 }}>
                    <TextField
                        label="Talaba FIO"
                        value={form.fullName}
                        onChange={handleChange("fullName")}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Username"
                        value={form.username}
                        onChange={handleChange("username")}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Telefon"
                        value={form.phone}
                        onChange={handleChange("phone")}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Parol"
                        type="password"
                        value={form.password}
                        onChange={handleChange("password")}
                        required
                        fullWidth
                    />
                    <TextField
                        select
                        label="Jinsi"
                        value={form.gender}
                        onChange={handleChange("gender")}
                        fullWidth
                    >
                        <MenuItem value="Erkak">Erkak</MenuItem>
                        <MenuItem value="Ayol">Ayol</MenuItem>
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
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))
                                }
                            />
                            <UploadFileOutlined sx={{ color: "#667085", mb: 0.5 }} />
                            <Stack spacing={0.3} alignItems="center">
                                <Box sx={{ fontSize: 13, color: "#344054" }}>Surat yuklash uchun bosing</Box>
                                <Box sx={{ fontSize: 12, color: "#98a2b3" }}>
                                    {form.imageFile ? form.imageFile.name : "PNG/JPG/JPEG"}
                                </Box>
                            </Stack>
                        </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={submitting}>
                    Bekor qilish
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
                    {submitting ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
