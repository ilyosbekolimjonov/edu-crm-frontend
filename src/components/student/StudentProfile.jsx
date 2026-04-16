import { useEffect, useMemo, useState } from "react";
import { Avatar, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { UploadFileOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";
import api from "../../services/axios";
import PhoneInput from "../common/PhoneInput";

const toForm = (profile) => ({
    fullName: profile?.fullName || "",
    username: profile?.username || "",
    phone: profile?.phone || "+998",
    currentPassword: "",
    password: "",
    confirmPassword: "",
});

export default function StudentProfile({ profile, onSubmit, submitting }) {
    const [form, setForm] = useState(toForm(profile));
    const [imageFile, setImageFile] = useState(null);
    const [changePassword, setChangePassword] = useState(false);
    const imagePreviewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);

    useEffect(() => {
        setForm(toForm(profile));
        setImageFile(null);
        setChangePassword(false);
    }, [profile]);

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        };
    }, [imagePreviewUrl]);

    const changeField = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []);

        if (files.length > 1) {
            toast.error("Faqat bitta rasm tanlash mumkin");
            event.target.value = "";
            return;
        }

        setImageFile(files[0] || null);
    };

    const handleSubmit = async () => {
        const fullName = form.fullName.trim();
        const username = form.username.trim();
        const currentPassword = form.currentPassword.trim();
        const password = form.password.trim();
        const confirmPassword = form.confirmPassword.trim();

        if (fullName.length < 3 || fullName.length > 100) {
            toast.error("FIO 3 dan 100 tagacha belgi bo'lishi kerak");
            return;
        }
        if (username.length < 3 || username.length > 30 || /\s/.test(username)) {
            toast.error("Username 3-30 belgi va bo'sh joysiz bo'lishi kerak");
            return;
        }
        if (!/^\+998\d{9}$/.test(form.phone)) {
            toast.error("Telefon +998XXXXXXXXX formatida bo'lishi kerak");
            return;
        }
        if (changePassword) {
            if (!currentPassword || !password || !confirmPassword) {
                toast.error("Joriy parol, yangi parol va tasdiqlash parolini kiriting");
                return;
            }
            if (currentPassword.length < 6) {
                toast.error("Joriy parol kamida 6 belgi bo'lishi kerak");
                return;
            }
            if (password.length < 6) {
                toast.error("Parol kamida 6 belgi bo'lishi kerak");
                return;
            }
            if (password !== confirmPassword) {
                toast.error("Parollar mos emas");
                return;
            }
        }

        const payload = new FormData();
        payload.append("fullName", fullName);
        payload.append("username", username);
        payload.append("phone", form.phone);
        if (changePassword && password) {
            payload.append("currentPassword", currentPassword);
            payload.append("password", password);
        }
        if (imageFile) payload.append("image", imageFile);

        await onSubmit(payload);
    };

    return (
        <Paper elevation={0} sx={{ p: 2, border: "1px solid #dfe7e3", borderRadius: 1, maxWidth: 720 }}>
            <Stack spacing={2}>
                <Typography sx={{ fontSize: 24, fontWeight: 800 }}>Profile</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        src={
                            imagePreviewUrl
                                ? imagePreviewUrl
                                : profile?.image
                                  ? `${api.defaults.baseURL}${profile.image}`
                                  : undefined
                        }
                        sx={{ width: 64, height: 64 }}
                    >
                        {profile?.fullName?.[0] || "S"}
                    </Avatar>
                    <Box
                        component="label"
                        sx={{
                            border: "1px dashed #b9bec8",
                            borderRadius: 1,
                            p: 1.5,
                            cursor: "pointer",
                            bgcolor: "#fafbfc",
                            minWidth: 240,
                        }}
                    >
                        <input type="file" accept="image/*" hidden multiple={false} onChange={handleImageChange} />
                        <Stack direction="row" spacing={1} alignItems="center">
                            <UploadFileOutlined sx={{ color: "#667085" }} />
                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Rasm tanlash</Typography>
                                <Typography sx={{ fontSize: 12, color: "#667085" }}>
                                    {imageFile ? imageFile.name : "PNG/JPG/JPEG"}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
                <TextField label="FIO" value={form.fullName} onChange={changeField("fullName")} fullWidth />
                <TextField label="Username" value={form.username} onChange={changeField("username")} fullWidth />
                <TextField label="Email" value={profile?.email || ""} fullWidth disabled />
                <PhoneInput value={form.phone} onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))} required />
                <Button
                    variant="outlined"
                    onClick={() => {
                        setChangePassword((prev) => !prev);
                        setForm((prev) => ({ ...prev, currentPassword: "", password: "", confirmPassword: "" }));
                    }}
                    sx={{ alignSelf: "flex-start", textTransform: "none", borderRadius: 1 }}
                >
                    {changePassword ? "Parolni o'zgartirmaslik" : "Parolni o'zgartirish"}
                </Button>
                {changePassword ? (
                    <Stack spacing={2}>
                        <TextField label="Joriy parol" type="password" value={form.currentPassword} onChange={changeField("currentPassword")} fullWidth required />
                        <TextField label="Yangi parol" type="password" value={form.password} onChange={changeField("password")} fullWidth required />
                        <TextField label="Yangi parolni tasdiqlang" type="password" value={form.confirmPassword} onChange={changeField("confirmPassword")} fullWidth required />
                    </Stack>
                ) : null}
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    sx={{ alignSelf: "flex-start", textTransform: "none", borderRadius: 1, bgcolor: "#147d64" }}
                >
                    {submitting ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
            </Stack>
        </Paper>
    );
}
