import { useState } from "react";
import {
    Box,
    Button,
    Drawer,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { UploadFileOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";

const initialForm = {
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    about: "",
    experience: "0",
    telegram: "",
    linkedin: "",
    courseIds: [],
    imageFile: null,
};

export default function TeacherCreateDrawer({ open, onClose, onSubmit, availableCourses = [] }) {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []);

        if (files.length > 1) {
            toast.error("Faqat bitta rasm tanlash mumkin");
            event.target.value = "";
            return;
        }

        setForm((prev) => ({ ...prev, imageFile: files[0] || null }));
    };

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
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            sx={{
                "& .MuiDrawer-paper": {
                    width: 360,
                    p: 2,
                    backgroundColor: "#fff",
                },
            }}
        >
            <Stack spacing={2} component="form" onSubmit={handleSubmit}>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 18 }}>O'qituvchi qo'shish</Typography>
                    <Typography sx={{ color: "#6b7280", fontSize: 13 }}>
                        Yangi o'qituvchi ma'lumotlarini kiriting
                    </Typography>
                </Box>

                <TextField label="Telefon raqam" value={form.phone} onChange={handleChange("phone")} required fullWidth />
                <TextField label="Mail" type="email" value={form.email} onChange={handleChange("email")} required fullWidth />
                <TextField label="O'qituvchi FIO" value={form.fullName} onChange={handleChange("fullName")} required fullWidth />
                <TextField label="Username" value={form.username} onChange={handleChange("username")} required fullWidth />
                <TextField label="Parol" type="password" value={form.password} onChange={handleChange("password")} required fullWidth />
                <TextField
                    label="About"
                    placeholder="O'qituvchi haqida qisqacha"
                    value={form.about}
                    onChange={handleChange("about")}
                    fullWidth
                    multiline
                    minRows={2}
                />
                <TextField
                    label="Tajriba (yil)"
                    type="number"
                    value={form.experience}
                    onChange={handleChange("experience")}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0 } }}
                />
                <TextField
                    label="Telegram"
                    placeholder="https://t.me/username"
                    value={form.telegram}
                    onChange={handleChange("telegram")}
                    fullWidth
                />
                <TextField
                    label="LinkedIn"
                    placeholder="https://linkedin.com/in/username"
                    value={form.linkedin}
                    onChange={handleChange("linkedin")}
                    fullWidth
                />

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
                        onChange={handleImageChange}
                    />
                    <UploadFileOutlined sx={{ color: "#667085", mb: 0.5 }} />
                    <Typography sx={{ fontSize: 13, color: "#344054" }}>Surat yuklash uchun bosing</Typography>
                    <Typography sx={{ fontSize: 12, color: "#98a2b3" }}>
                        {form.imageFile ? form.imageFile.name : "PNG/JPG/JPEG"}
                    </Typography>
                </Box>

                <TextField
                    select
                    label="O'qitadigan kurslar"
                    value={form.courseIds}
                    onChange={(event) => setForm((prev) => ({ ...prev, courseIds: event.target.value }))}
                    fullWidth
                    slotProps={{ select: { multiple: true } }}
                    helperText="Ixtiyoriy: kurslarni biriktirib qo'ying"
                >
                    {availableCourses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                            {course.name}
                        </MenuItem>
                    ))}
                </TextField>

                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
                    <Button onClick={handleClose} disabled={submitting}>
                        Bekor qilish
                    </Button>
                    <Button variant="contained" type="submit" disabled={submitting}>
                        {submitting ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </Stack>
            </Stack>
        </Drawer>
    );
}
