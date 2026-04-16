import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/axios";
import TeacherPasswordForm from "./TeacherPasswordForm";
import TeacherProfileCard from "./TeacherProfileCard";

const toForm = (profile) => ({
    fullName: profile?.user?.fullName || "",
    username: profile?.user?.username || "",
    phone: profile?.user?.phone || "+998",
    about: profile?.about || "",
    experience: profile?.experience ?? 0,
    telegram: profile?.telegram || "",
    linkedin: profile?.linkedin || "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
});

const errorMessage = (error, fallback) => {
    const message = error?.response?.data?.message || fallback;
    return Array.isArray(message) ? message[0] : message;
};

export default function TeacherProfileSection({ profile, onSaved }) {
    const [form, setForm] = useState(toForm(profile));
    const [imageFile, setImageFile] = useState(null);
    const [changePassword, setChangePassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const imagePreviewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);

    const currentAvatar = profile?.user?.image ? `${api.defaults.baseURL}${profile.user.image}` : "";
    const resolvedAvatar = imagePreviewUrl || currentAvatar;
    const initials = (profile?.user?.fullName || "T").trim().slice(0, 1).toUpperCase();

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

    const validate = () => {
        if (form.fullName.trim().length < 3) {
            toast.error("FIO kamida 3 belgidan iborat bo'lishi kerak");
            return false;
        }
        if (form.username.trim().length < 3 || /\s/.test(form.username)) {
            toast.error("Username kamida 3 belgi va bo'sh joysiz bo'lishi kerak");
            return false;
        }
        if (!/^\+998\d{9}$/.test(form.phone)) {
            toast.error("Telefon +998XXXXXXXXX formatida bo'lishi kerak");
            return false;
        }
        if (changePassword) {
            if (!form.currentPassword || !form.password || !form.confirmPassword) {
                toast.error("Parolni o'zgartirish uchun barcha parol maydonlarini to'ldiring");
                return false;
            }
            if (form.password.length < 6) {
                toast.error("Yangi parol kamida 6 belgidan iborat bo'lishi kerak");
                return false;
            }
            if (form.password !== form.confirmPassword) {
                toast.error("Yangi parollar mos emas");
                return false;
            }
        }
        return true;
    };

    const submit = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            const payload = new FormData();
            payload.append("fullName", form.fullName.trim());
            payload.append("username", form.username.trim());
            payload.append("phone", form.phone);
            payload.append("experience", String(Number(form.experience) || 0));

            if (form.about.trim()) payload.append("about", form.about.trim());
            if (form.telegram.trim()) payload.append("telegram", form.telegram.trim());
            if (form.linkedin.trim()) payload.append("linkedin", form.linkedin.trim());

            if (changePassword) {
                payload.append("currentPassword", form.currentPassword.trim());
                payload.append("password", form.password.trim());
            }

            if (imageFile) payload.append("image", imageFile);

            const { data } = await api.patch("/teacher/profile", payload);
            toast.success("Profil yangilandi");
            setForm((prev) => ({
                ...toForm(data),
                currentPassword: "",
                password: "",
                confirmPassword: "",
            }));
            setImageFile(null);
            setChangePassword(false);
            onSaved?.(data);
        } catch (error) {
            toast.error(errorMessage(error, "Profilni saqlashda xatolik"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <TeacherProfileCard profile={profile} avatarSrc={resolvedAvatar} />

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Profil rasmi</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    {resolvedAvatar ? (
                        <img
                            src={resolvedAvatar}
                            alt="Teacher avatar"
                            className="h-16 w-16 rounded-xl border border-slate-200 bg-white object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-emerald-50 text-lg font-bold text-emerald-700">
                            {initials}
                        </div>
                    )}

                    <label className="min-w-64 cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white p-3 transition hover:border-emerald-300 hover:bg-emerald-50/30">
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            multiple={false}
                            onChange={handleImageChange}
                        />
                        <p className="text-sm font-semibold text-slate-800">Rasm tanlash</p>
                        <p className="mt-1 text-xs text-slate-500">
                            {imageFile ? imageFile.name : "PNG, JPG yoki JPEG. Maksimal 10MB"}
                        </p>
                    </label>
                </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                    Email
                    <input
                        value={profile?.user?.email || ""}
                        disabled
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                    />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                    FIO
                    <input
                        value={form.fullName}
                        onChange={changeField("fullName")}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                    Username
                    <input
                        value={form.username}
                        onChange={changeField("username")}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                    Telefon
                    <input
                        value={form.phone}
                        onChange={changeField("phone")}
                        placeholder="+998901234567"
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                    Tajriba (yil)
                    <input
                        type="number"
                        min="0"
                        value={form.experience}
                        onChange={changeField("experience")}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                    Telegram
                    <input
                        value={form.telegram}
                        onChange={changeField("telegram")}
                        placeholder="https://t.me/username"
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="block text-sm font-semibold text-slate-700 lg:col-span-2">
                    LinkedIn
                    <input
                        value={form.linkedin}
                        onChange={changeField("linkedin")}
                        placeholder="https://linkedin.com/in/username"
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>

                <label className="block text-sm font-semibold text-slate-700 lg:col-span-2">
                    Haqida
                    <textarea
                        value={form.about}
                        onChange={changeField("about")}
                        rows={4}
                        className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                </label>
            </div>

            <div className="mt-6">
                <TeacherPasswordForm
                    enabled={changePassword}
                    onToggle={() => {
                        setChangePassword((prev) => !prev);
                        setForm((prev) => ({
                            ...prev,
                            currentPassword: "",
                            password: "",
                            confirmPassword: "",
                        }));
                    }}
                    currentPassword={form.currentPassword}
                    password={form.password}
                    confirmPassword={form.confirmPassword}
                    onChange={changeField}
                />
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={submit}
                    disabled={saving}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
            </div>
        </div>
    );
}
