import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, } from "@mui/material";
import { ArrowBack, Clear, DeleteOutline, EditOutlined, FileDownloadOutlined, VisibilityOutlined, } from "@mui/icons-material";
import { AssignmentTurnedInOutlined, SmartDisplayOutlined, UploadFileOutlined } from "@mui/icons-material";
import toast from "react-hot-toast";
import api from "../../services/axios";

const DAY_OPTIONS = [
    { value: "MONDAY", label: "Dush" },
    { value: "TUESDAY", label: "Sesh" },
    { value: "WEDNESDAY", label: "Chor" },
    { value: "THURSDAY", label: "Pay" },
    { value: "FRIDAY", label: "Jum" },
    { value: "SATURDAY", label: "Shan" },
    { value: "SUNDAY", label: "Yak" },
];

const WEEKDAY_TO_INDEX = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

const initialForm = {
    name: "",
    courseId: "",
    mentorId: "",
    mentorIds: [],
    roomId: "",
    startDate: "",
    startTime: "09:00",
    durationMinutes: "90",
    weekDays: [],
    studentIds: [],
};

const GROUP_VIEW_TABS = [
    { value: "DAVOMAT", label: "Davomat" },
    { value: "DARSLAR", label: "Darslar" },
];

const LESSON_SUB_TABS = ["Uyga vazifa", "Videolar", "Imtihonlar", "Jurnal"];

const monthToString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const dateKey = (yearMonth, day) => `${yearMonth}-${String(day).padStart(2, "0")}`;

function downloadCsv(filename, rows) {
    const escapeValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = rows.map((row) => row.map(escapeValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export default function GroupsSection() {
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    const [courses, setCourses] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [students, setStudents] = useState([]);

    const [activeTab, setActiveTab] = useState("ACTIVE");
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [mentorAddOpen, setMentorAddOpen] = useState(false);
    const [studentAddOpen, setStudentAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [editingGroup, setEditingGroup] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [viewMonth, setViewMonth] = useState(monthToString(new Date()));
    const [attendancePayload, setAttendancePayload] = useState(null);
    const [attendanceNameFilter, setAttendanceNameFilter] = useState("");
    const [attendanceDayFilter, setAttendanceDayFilter] = useState("");
    const [attendanceStatusFilter, setAttendanceStatusFilter] = useState("ALL");
    const [quickMentorIds, setQuickMentorIds] = useState([]);
    const [quickStudentIds, setQuickStudentIds] = useState([]);
    const [groupViewTab, setGroupViewTab] = useState("DAVOMAT");
    const [lessonSubTab, setLessonSubTab] = useState("Uyga vazifa");
    const [lessonsData, setLessonsData] = useState([]);
    const [lessonsLoading, setLessonsLoading] = useState(false);
    const [lessonCreateOpen, setLessonCreateOpen] = useState(false);
    const [creatingLesson, setCreatingLesson] = useState(false);
    const [lessonCreateMode, setLessonCreateMode] = useState("CUSTOM");
    const [lessonName, setLessonName] = useState("");
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [videoListDialogOpen, setVideoListDialogOpen] = useState(false);
    const [videoTargetLesson, setVideoTargetLesson] = useState(null);
    const [videoListLesson, setVideoListLesson] = useState(null);
    const [addingVideo, setAddingVideo] = useState(false);
    const [videoForm, setVideoForm] = useState({ note: "" });
    const [videoUploadFile, setVideoUploadFile] = useState(null);
    const [homeworkEditorLesson, setHomeworkEditorLesson] = useState(null);
    const [homeworkTask, setHomeworkTask] = useState("");
    const [homeworkUploadFile, setHomeworkUploadFile] = useState(null);
    const [creatingHomework, setCreatingHomework] = useState(false);

    const toPublicUrl = (filePath) => {
        if (!filePath) return "";
        if (/^https?:\/\//i.test(filePath)) return filePath;
        return `${api.defaults.baseURL}${filePath}`;
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [groupsRes, coursesRes, roomsRes, mentorsRes, studentsRes] = await Promise.all([
                api.get("/groups"),
                api.get("/courses"),
                api.get("/rooms"),
                api.get("/auth/users", { params: { role: "MENTOR" } }),
                api.get("/auth/users", { params: { role: "STUDENT" } }),
            ]);

            setGroups(Array.isArray(groupsRes?.data) ? groupsRes.data : []);
            setCourses(Array.isArray(coursesRes?.data) ? coursesRes.data : []);
            setRooms(Array.isArray(roomsRes?.data) ? roomsRes.data : []);
            setMentors(Array.isArray(mentorsRes?.data) ? mentorsRes.data : []);
            setStudents(Array.isArray(studentsRes?.data) ? studentsRes.data : []);
        } catch (error) {
            const message = error?.response?.data?.message || "Guruhlar ma'lumotini yuklashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadGroupDetail = async (groupId) => {
        const { data } = await api.get(`/groups/${groupId}`);
        return data;
    };

    const loadAttendance = async (groupId, month) => {
        const { data } = await api.get(`/groups/${groupId}/attendance`, { params: { month } });
        setAttendancePayload(data);
    };

    const loadLessons = async (groupId) => {
        setLessonsLoading(true);
        try {
            const { data } = await api.get("/lessons", { params: { lessonGroupId: groupId } });
            setLessonsData(Array.isArray(data) ? data : []);
        } catch (error) {
            const message = error?.response?.data?.message || "Darslarni yuklashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
            setLessonsData([]);
        } finally {
            setLessonsLoading(false);
        }
    };

    const handleCreateLesson = async () => {
        if (!selectedGroup) return;
        if (!lessonName.trim()) {
            toast.error("Mavzuni kiriting");
            return;
        }

        setCreatingLesson(true);
        try {
            await api.post("/lessons", {
                name: lessonName.trim(),
                groupId: selectedGroup.id,
            });
            toast.success("Dars yaratildi");
            setLessonCreateOpen(false);
            setLessonName("");
            await loadLessons(selectedGroup.id);
        } catch (error) {
            const message = error?.response?.data?.message || "Dars yaratishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setCreatingLesson(false);
        }
    };

    const openVideoDialog = (lesson) => {
        setVideoTargetLesson(lesson);
        setVideoForm({ note: "" });
        setVideoUploadFile(null);
        setVideoDialogOpen(true);
    };

    const openVideoListDialog = (lesson) => {
        setVideoListLesson(lesson);
        setVideoListDialogOpen(true);
    };

    const handleAddVideoToLesson = async () => {
        if (!selectedGroup || !videoTargetLesson) return;
        if (!videoUploadFile) {
            toast.error("Video fayl tanlang");
            return;
        }

        setAddingVideo(true);
        try {
            const formData = new FormData();
            formData.append("file", videoUploadFile);
            if (videoForm.note.trim()) {
                formData.append("note", videoForm.note.trim());
            }
            await api.post(`/lessons/${videoTargetLesson.id}/files/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Video biriktirildi");
            setVideoDialogOpen(false);
            setVideoTargetLesson(null);
            setVideoForm({ note: "" });
            setVideoUploadFile(null);
            await loadLessons(selectedGroup.id);
        } catch (error) {
            const message = error?.response?.data?.message || "Video biriktirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setAddingVideo(false);
        }
    };

    const openHomeworkEditor = (lesson) => {
        setHomeworkEditorLesson(lesson);
        setHomeworkTask("");
        setHomeworkUploadFile(null);
    };

    const handleCreateHomework = async () => {
        if (!selectedGroup || !homeworkEditorLesson) return;
        if (!homeworkTask.trim()) {
            toast.error("Izoh (topshiriq) kiriting");
            return;
        }

        setCreatingHomework(true);
        try {
            let fileUrl;
            if (homeworkUploadFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", homeworkUploadFile);
                const uploadRes = await api.post("/homeworks/upload-file", uploadFormData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                fileUrl = uploadRes?.data?.fileUrl;
            }

            await api.post("/homeworks", {
                lessonId: homeworkEditorLesson.id,
                task: homeworkTask.trim(),
                file: fileUrl || undefined,
            });
            toast.success("Uyga vazifa biriktirildi");
            setHomeworkEditorLesson(null);
            setHomeworkTask("");
            setHomeworkUploadFile(null);
            await loadLessons(selectedGroup.id);
        } catch (error) {
            const message = error?.response?.data?.message || "Uyga vazifa yaratishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setCreatingHomework(false);
        }
    };

    const handleCreate = async () => {
        if (!form.name || !form.courseId || !form.mentorId || !form.roomId || !form.startDate || !form.startTime || !form.durationMinutes || form.weekDays.length === 0) {
            toast.error("Majburiy maydonlarni to'ldiring");
            return;
        }

        setSubmitting(true);
        try {
            const mentorIds = Array.from(new Set([Number(form.mentorId), ...form.mentorIds.map(Number)]));
            await api.post("/groups", {
                name: form.name,
                courseId: Number(form.courseId),
                mentorId: Number(form.mentorId),
                mentorIds,
                roomId: Number(form.roomId),
                startDate: form.startDate,
                startTime: form.startTime,
                durationMinutes: Number(form.durationMinutes),
                weekDays: form.weekDays,
                studentIds: form.studentIds.map(Number),
            });

            toast.success("Guruh yaratildi");
            setCreateOpen(false);
            setForm(initialForm);
            await loadData();
        } catch (error) {
            const message = error?.response?.data?.message || "Guruh yaratishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = async (group) => {
        try {
            const data = await loadGroupDetail(group.id);
            setEditingGroup(data);
            const mentorAssignmentIds = (Array.isArray(data.mentorAssignments) ? data.mentorAssignments : []).map((item) => item.mentorId);
            setForm({
                name: data.name || "",
                courseId: String(data.courseId ?? ""),
                mentorId: String(data.mentorId ?? ""),
                mentorIds: mentorAssignmentIds,
                roomId: String(data.roomId ?? ""),
                startDate: data.startDate ? data.startDate.slice(0, 10) : "",
                startTime: data.startTime || "09:00",
                durationMinutes: String(data.durationMinutes ?? 90),
                weekDays: Array.isArray(data.weekDays) ? data.weekDays : [],
                studentIds: (Array.isArray(data.studentGroups) ? data.studentGroups : []).map((s) => s.userId),
            });
            setEditOpen(true);
        } catch (error) {
            const message = error?.response?.data?.message || "Guruhni yuklashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    const handleUpdate = async () => {
        if (!editingGroup) return;

        setSubmitting(true);
        try {
            const mentorIds = Array.from(new Set([Number(form.mentorId), ...form.mentorIds.map(Number)]));
            await api.patch(`/groups/${editingGroup.id}`, {
                name: form.name,
                courseId: Number(form.courseId),
                mentorId: Number(form.mentorId),
                mentorIds,
                roomId: Number(form.roomId),
                startDate: form.startDate,
                startTime: form.startTime,
                durationMinutes: Number(form.durationMinutes),
                weekDays: form.weekDays,
                studentIds: form.studentIds.map(Number),
            });

            toast.success("Guruh yangilandi");
            setEditOpen(false);
            setEditingGroup(null);
            setForm(initialForm);
            await loadData();
            if (selectedGroup?.id === editingGroup.id) {
                const detail = await loadGroupDetail(editingGroup.id);
                setSelectedGroup(detail);
                await loadAttendance(editingGroup.id, viewMonth);
            }
        } catch (error) {
            const message = error?.response?.data?.message || "Guruhni yangilashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleArchiveToggle = async (group) => {
        const nextStatus = group.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        try {
            await api.patch(`/groups/${group.id}`, { status: nextStatus });
            toast.success("Holat yangilandi");
            await loadData();
        } catch (error) {
            const message = error?.response?.data?.message || "Holatni yangilashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    const handleDelete = async (group) => {
        const confirmed = window.confirm(`"${group.name}" guruhini o'chirmoqchimisiz?`);
        if (!confirmed) return;
        try {
            await api.delete(`/groups/${group.id}`);
            toast.success("Guruh o'chirildi");
            if (selectedGroup?.id === group.id) {
                setSelectedGroup(null);
                setAttendancePayload(null);
                setLessonsData([]);
                setVideoListDialogOpen(false);
                setVideoListLesson(null);
            }
            await loadData();
        } catch (error) {
            const message = error?.response?.data?.message || "Guruhni o'chirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    const openView = async (group) => {
        try {
            const data = await loadGroupDetail(group.id);
            setSelectedGroup(data);
            setGroupViewTab("DAVOMAT");
            setLessonSubTab("Uyga vazifa");
            setHomeworkEditorLesson(null);
            await loadAttendance(group.id, viewMonth);
            await loadLessons(group.id);
        } catch (error) {
            const message = error?.response?.data?.message || "Guruhni ko'rishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    useEffect(() => {
        if (!selectedGroup) return;
        loadAttendance(selectedGroup.id, viewMonth).catch(() => {
            toast.error("Davomatni yuklashda xatolik");
        });
    }, [viewMonth, selectedGroup]);

    useEffect(() => {
        if (lessonSubTab !== "Uyga vazifa") {
            setHomeworkEditorLesson(null);
        }
    }, [lessonSubTab]);

    const attendanceMap = useMemo(() => {
        const map = new Map();
        (attendancePayload?.records || []).forEach((record) => {
            const date = new Date(record.lessonDate);
            const key = `${record.userId}-${date.toISOString().slice(0, 10)}`;
            map.set(key, record.present);
        });
        return map;
    }, [attendancePayload]);

    const activeWeekDays = useMemo(
        () => new Set((attendancePayload?.group?.weekDays || []).map((day) => WEEKDAY_TO_INDEX[day])),
        [attendancePayload],
    );

    const isLessonDay = useCallback((day) => {
        const [year, month] = viewMonth.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return activeWeekDays.has(date.getDay());
    }, [activeWeekDays, viewMonth]);

    const lessonDaysInMonth = useMemo(() => {
        const totalDays = attendancePayload?.daysInMonth || 0;
        return Array.from({ length: totalDays }, (_, i) => i + 1).filter((day) => isLessonDay(day));
    }, [attendancePayload, isLessonDay]);

    const setAttendance = async (userId, day) => {
        if (!selectedGroup || !isLessonDay(day)) return;
        const keyDate = dateKey(viewMonth, day);
        const current = attendanceMap.get(`${userId}-${keyDate}`);
        const next = current === true ? false : true;
        try {
            await api.patch(`/groups/${selectedGroup.id}/attendance`, {
                userId,
                date: keyDate,
                present: next,
            });
            await loadAttendance(selectedGroup.id, viewMonth);
        } catch (error) {
            const message = error?.response?.data?.message || "Davomatni saqlashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    const clearAttendance = async (userId, day) => {
        if (!selectedGroup || !isLessonDay(day)) return;
        const keyDate = dateKey(viewMonth, day);
        try {
            await api.delete(`/groups/${selectedGroup.id}/attendance`, {
                params: { userId, date: keyDate },
            });
            await loadAttendance(selectedGroup.id, viewMonth);
        } catch (error) {
            const message = error?.response?.data?.message || "Davomatni o'chirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    const visibleGroups = useMemo(() => {
        if (activeTab === "ALL") return groups;
        if (activeTab === "ARCHIVED") return groups.filter((group) => group.status !== "ACTIVE");
        return groups.filter((group) => group.status === "ACTIVE");
    }, [groups, activeTab]);

    const groupStats = useMemo(() => {
        const mentorSet = new Set();
        const activeStudentIds = new Set();

        visibleGroups.forEach((group) => {
            if (group.mentor?.id) mentorSet.add(group.mentor.id);

            group.studentGroups?.forEach((sg) => {
                if (sg.user?.role === "STUDENT" && sg.user?.isActive === true && sg.user?.id) {
                    activeStudentIds.add(sg.user.id);
                }
            });
        });

        return {
            totalGroups: visibleGroups.length,
            totalMentors: mentorSet.size,
            totalStudents: activeStudentIds.size,
        };
    }, [visibleGroups]);

    const filteredAttendanceStudents = useMemo(() => {
        const rows = Array.isArray(attendancePayload?.students) ? attendancePayload.students : [];
        const day = attendanceDayFilter ? Number(attendanceDayFilter) : null;
        return rows.filter((student) => {
            if (attendanceNameFilter && !student.fullName?.toLowerCase().includes(attendanceNameFilter.toLowerCase())) {
                return false;
            }

            if (!day || attendanceStatusFilter === "ALL") return true;

            if (!isLessonDay(day)) return attendanceStatusFilter === "NONE";

            const value = attendanceMap.get(`${student.id}-${dateKey(viewMonth, day)}`);
            if (attendanceStatusFilter === "PRESENT") return value === true;
            if (attendanceStatusFilter === "ABSENT") return value === false;
            if (attendanceStatusFilter === "NONE") return value === undefined;
            return true;
        });
    }, [attendancePayload, attendanceNameFilter, attendanceDayFilter, attendanceStatusFilter, attendanceMap, viewMonth, isLessonDay]);

    const exportAttendance = () => {
        if (!attendancePayload) return;
        const days = lessonDaysInMonth;
        const headers = ["Student", ...days.map((day) => `${viewMonth}-${String(day).padStart(2, "0")}`)];
        const rows = filteredAttendanceStudents.map((student) => {
            const values = days.map((day) => {
                const status = attendanceMap.get(`${student.id}-${dateKey(viewMonth, day)}`);
                return status === true ? "Bor" : status === false ? "Yo'q" : "-";
            });
            return [student.fullName, ...values];
        });

        downloadCsv(`guruh-davomat-${attendancePayload.group?.name || "group"}-${viewMonth}.csv`, [headers, ...rows]);
    };

    const applyMentorQuickAdd = async () => {
        if (!selectedGroup) return;
        const existingMentorIds = (selectedGroup.mentorAssignments || []).map((item) => item.mentorId);
        const merged = Array.from(new Set([...existingMentorIds, ...quickMentorIds.map(Number)])).filter((v) => Number.isFinite(v));
        if (merged.length === 0) {
            toast.error("Mentor tanlang");
            return;
        }
        try {
            await api.patch(`/groups/${selectedGroup.id}`, {
                mentorId: merged[0],
                mentorIds: merged,
            });
            toast.success("O'qituvchilar biriktirildi");
            setMentorAddOpen(false);
            setQuickMentorIds([]);
            const detail = await loadGroupDetail(selectedGroup.id);
            setSelectedGroup(detail);
            await loadData();
        } catch (error) {
            const message = error?.response?.data?.message || "O'qituvchi biriktirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    const applyStudentQuickAdd = async () => {
        if (!selectedGroup) return;
        const existingStudentIds = (selectedGroup.studentGroups || []).map((item) => item.userId);
        const merged = Array.from(new Set([...existingStudentIds, ...quickStudentIds.map(Number)])).filter((v) => Number.isFinite(v));
        try {
            await api.patch(`/groups/${selectedGroup.id}`, {
                studentIds: merged,
            });
            toast.success("O'quvchilar biriktirildi");
            setStudentAddOpen(false);
            setQuickStudentIds([]);
            const detail = await loadGroupDetail(selectedGroup.id);
            setSelectedGroup(detail);
            await loadAttendance(selectedGroup.id, viewMonth);
            await loadData();
        } catch (error) {
            const message = error?.response?.data?.message || "O'quvchi biriktirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    };

    const renderForm = () => (
        <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Guruh nomi" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select label="Kurs" value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))} fullWidth>
                    {courses.map((course) => <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>)}
                </TextField>
                <TextField select label="Xona" value={form.roomId} onChange={(e) => setForm((p) => ({ ...p, roomId: e.target.value }))} fullWidth>
                    {rooms.map((room) => <MenuItem key={room.id} value={room.id}>{room.name}</MenuItem>)}
                </TextField>
            </Stack>
            <TextField select label="Asosiy mentor" value={form.mentorId} onChange={(e) => setForm((p) => ({ ...p, mentorId: e.target.value }))} fullWidth>
                {mentors.map((mentor) => <MenuItem key={mentor.id} value={mentor.id}>{mentor.fullName}</MenuItem>)}
            </TextField>
            <TextField
                select
                label="Qo'shimcha mentorlar"
                value={form.mentorIds}
                onChange={(e) => setForm((p) => ({ ...p, mentorIds: e.target.value }))}
                fullWidth
                slotProps={{ select: { multiple: true } }}
                helperText="Guruhga bir nechta o'qituvchi biriktirish mumkin"
            >
                {mentors.map((mentor) => <MenuItem key={mentor.id} value={mentor.id}>{mentor.fullName}</MenuItem>)}
            </TextField>
            <TextField
                select
                label="Talabalar"
                value={form.studentIds}
                onChange={(e) => setForm((p) => ({ ...p, studentIds: e.target.value }))}
                fullWidth
                slotProps={{ select: { multiple: true } }}
                helperText="Guruhga biriktiriladigan talabalar"
            >
                {students.map((student) => <MenuItem key={student.id} value={student.id}>{student.fullName}</MenuItem>)}
            </TextField>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Boshlanish sana" type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                <TextField label="Dars vaqti" type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                <TextField label="Davomiyligi (min)" type="number" value={form.durationMinutes} onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))} fullWidth slotProps={{ htmlInput: { min: 30 } }} />
            </Stack>
            <Box>
                <Typography sx={{ fontSize: 13, color: "#4b5563", mb: 0.5 }}>Dars kunlari</Typography>
                <FormGroup row>
                    {DAY_OPTIONS.map((day) => (
                        <FormControlLabel
                            key={day.value}
                            control={
                                <Checkbox
                                    checked={form.weekDays.includes(day.value)}
                                    onChange={(event) => {
                                        if (event.target.checked) {
                                            setForm((p) => ({ ...p, weekDays: [...p.weekDays, day.value] }));
                                        } else {
                                            setForm((p) => ({ ...p, weekDays: p.weekDays.filter((d) => d !== day.value) }));
                                        }
                                    }}
                                />
                            }
                            label={day.label}
                        />
                    ))}
                </FormGroup>
            </Box>
        </Stack>
    );

    return (
        <Stack spacing={1.5}>
            {!selectedGroup ? (
                <>
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                        <Chip
                            size="small"
                            clickable
                            label="Faol guruhlar"
                            onClick={() => setActiveTab("ACTIVE")}
                            sx={{ bgcolor: activeTab === "ACTIVE" ? "#ede9fe" : "#ffffff", color: activeTab === "ACTIVE" ? "#6d3ee6" : "#4b5563" }}
                        />
                        <Chip
                            size="small"
                            clickable
                            label="Arxiv"
                            onClick={() => setActiveTab("ARCHIVED")}
                            sx={{ bgcolor: activeTab === "ARCHIVED" ? "#ede9fe" : "#ffffff", color: activeTab === "ARCHIVED" ? "#6d3ee6" : "#4b5563" }}
                        />
                        <Chip
                            size="small"
                            clickable
                            label="Barchasi"
                            onClick={() => setActiveTab("ALL")}
                            sx={{ bgcolor: activeTab === "ALL" ? "#ede9fe" : "#ffffff", color: activeTab === "ALL" ? "#6d3ee6" : "#4b5563" }}
                        />
                    </Stack>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" }, gap: 1 }}>
                        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e9ecf2", borderRadius: 2 }}>
                            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>Jami guruhlar</Typography>
                            <Typography sx={{ fontSize: 34, fontWeight: 700 }}>{groupStats.totalGroups}</Typography>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e9ecf2", borderRadius: 2 }}>
                            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>O'qituvchilar</Typography>
                            <Typography sx={{ fontSize: 34, fontWeight: 700 }}>{groupStats.totalMentors}</Typography>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e9ecf2", borderRadius: 2 }}>
                            <Typography sx={{ fontSize: 13, color: "#6b7280" }}>O'quvchilar</Typography>
                            <Typography sx={{ fontSize: 34, fontWeight: 700 }}>{groupStats.totalStudents}</Typography>
                        </Paper>
                    </Box>

                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2", minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>Guruhlar</Typography>
                            <Button variant="contained" size="small" onClick={() => setCreateOpen(true)} sx={{ textTransform: "none", borderRadius: 2 }}>
                                Guruh qo'shish
                            </Button>
                        </Stack>

                        <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto" }}>
                            <Table size="small" sx={{ minWidth: 1100 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Guruh</TableCell>
                                        <TableCell>Kurs</TableCell>
                                        <TableCell>Davomiyligi</TableCell>
                                        <TableCell>Dars vaqti</TableCell>
                                        <TableCell>Kim qo'shgan</TableCell>
                                        <TableCell>Xona</TableCell>
                                        <TableCell>O'qituvchilar</TableCell>
                                        <TableCell>Talabalar</TableCell>
                                        <TableCell align="right">Amallar</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={10}><Typography sx={{ py: 1.5, color: "#6b7280" }}>Yuklanmoqda...</Typography></TableCell></TableRow>
                                    ) : visibleGroups.length === 0 ? (
                                        <TableRow><TableCell colSpan={10}><Typography sx={{ py: 1.5, color: "#6b7280" }}>Guruhlar topilmadi</Typography></TableCell></TableRow>
                                    ) : (
                                        visibleGroups.map((group) => (
                                            <TableRow key={group.id}>
                                                <TableCell><Chip size="small" label={group.status} color={group.status === "ACTIVE" ? "success" : "default"} /></TableCell>
                                                <TableCell>{group.name}</TableCell>
                                                <TableCell>{group.course?.name || "-"}</TableCell>
                                                <TableCell>{group.durationMinutes} min</TableCell>
                                                <TableCell>{group.startTime}</TableCell>
                                                <TableCell>{new Date(group.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>{group.room?.name || "-"}</TableCell>
                                                <TableCell>{(group.mentorAssignments?.length || 0) > 0 ? group.mentorAssignments.map((item) => item.mentor?.fullName).filter(Boolean).join(", ") : (group.mentor?.fullName || "-")}</TableCell>
                                                <TableCell>
                                                    {
                                                        group.studentGroups?.filter(
                                                            (sg) => sg.user?.role === "STUDENT" && sg.user?.isActive === true,
                                                        ).length || 0
                                                    }
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={() => openView(group)}><VisibilityOutlined fontSize="small" /></IconButton>
                                                    <IconButton size="small" onClick={() => openEdit(group)}><EditOutlined fontSize="small" /></IconButton>
                                                    <Button size="small" onClick={() => handleArchiveToggle(group)} sx={{ textTransform: "none", minWidth: 48 }}>
                                                        {group.status === "ACTIVE" ? "Arxiv" : "Aktiv"}
                                                    </Button>
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(group)}><DeleteOutline fontSize="small" /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    </Paper>
                </>
            ) : (
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e9ecf2", minWidth: 0, overflow: "hidden" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setSelectedGroup(null);
                                    setAttendancePayload(null);
                                    setLessonsData([]);
                                    setHomeworkEditorLesson(null);
                                    setVideoDialogOpen(false);
                                    setVideoTargetLesson(null);
                                    setVideoListDialogOpen(false);
                                    setVideoListLesson(null);
                                }}
                            ><ArrowBack fontSize="small" /></IconButton>
                            <Typography sx={{ fontSize: 26, fontWeight: 700 }}>{selectedGroup.name}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Button size="small" onClick={() => openEdit(selectedGroup)} sx={{ textTransform: "none" }}>Tahrirlash</Button>
                            <Button size="small" onClick={() => setMentorAddOpen(true)} sx={{ textTransform: "none" }}>+ O'qituvchi qo'shish</Button>
                            <Button size="small" onClick={() => setStudentAddOpen(true)} sx={{ textTransform: "none" }}>+ O'quvchi qo'shish</Button>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={0.75} sx={{ mb: 1.5, flexWrap: "wrap" }}>
                        {GROUP_VIEW_TABS.map((tab) => (
                            <Chip
                                key={tab.value}
                                size="small"
                                clickable
                                label={tab.label}
                                onClick={() => setGroupViewTab(tab.value)}
                                sx={{
                                    bgcolor: groupViewTab === tab.value ? "#ede9fe" : "#ffffff",
                                    color: groupViewTab === tab.value ? "#6d3ee6" : "#4b5563",
                                }}
                            />
                        ))}
                    </Stack>

                    {groupViewTab === "DARSLAR" ? (
                        <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #edf0f5", borderRadius: 2 }}>
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                alignItems={{ xs: "flex-start", md: "center" }}
                                justifyContent="space-between"
                                spacing={1}
                                sx={{ mb: 1.25 }}
                            >
                                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                                    {LESSON_SUB_TABS.map((tab) => (
                                        <Chip
                                            key={tab}
                                            label={tab}
                                            size="small"
                                            clickable
                                            onClick={() => setLessonSubTab(tab)}
                                            sx={{
                                                bgcolor: lessonSubTab === tab ? "#ede9fe" : "#ffffff",
                                                color: lessonSubTab === tab ? "#6d3ee6" : "#4b5563",
                                            }}
                                        />
                                    ))}
                                </Stack>
                                {lessonSubTab !== "Videolar" ? (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => setLessonCreateOpen(true)}
                                        sx={{ textTransform: "none", borderRadius: 2 }}
                                    >
                                        Dars e'lon qilish
                                    </Button>
                                ) : null}
                            </Stack>

                            {homeworkEditorLesson ? (
                                <Paper elevation={0} sx={{ p: 2, border: "1px solid #edf0f5", borderRadius: 2 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                        <IconButton size="small" onClick={() => setHomeworkEditorLesson(null)}>
                                            <ArrowBack fontSize="small" />
                                        </IconButton>
                                        <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
                                            Yangi uyga vazifa yaratish
                                        </Typography>
                                    </Stack>

                                    <Stack spacing={2} sx={{ maxWidth: 680 }}>
                                        <TextField
                                            label="Mavzu"
                                            value={homeworkEditorLesson.name}
                                            fullWidth
                                            disabled
                                        />
                                        <TextField
                                            label="Izoh"
                                            value={homeworkTask}
                                            onChange={(event) => setHomeworkTask(event.target.value)}
                                            multiline
                                            minRows={5}
                                            fullWidth
                                        />
                                        <Stack spacing={0.75}>
                                            <Typography sx={{ fontSize: 13, color: "#4b5563" }}>
                                                Fayl yuklash (ixtiyoriy)
                                            </Typography>
                                            <Button variant="outlined" component="label" sx={{ width: "fit-content" }}>
                                                Fayl tanlash
                                                <input
                                                    type="file"
                                                    hidden
                                                    onChange={(event) =>
                                                        setHomeworkUploadFile(event.target.files?.[0] || null)
                                                    }
                                                />
                                            </Button>
                                            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                                {homeworkUploadFile ? homeworkUploadFile.name : "Fayl tanlanmagan"}
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" justifyContent="flex-end" spacing={1.25}>
                                            <Button onClick={() => setHomeworkEditorLesson(null)} disabled={creatingHomework}>
                                                Bekor qilish
                                            </Button>
                                            <Button variant="contained" onClick={handleCreateHomework} disabled={creatingHomework}>
                                                {creatingHomework ? "Saqlanmoqda..." : "E'lon qilish"}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ) : lessonSubTab === "Uyga vazifa" ? (
                                <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", border: "1px solid #edf0f5", borderRadius: 2 }}>
                                    <Table size="small" sx={{ minWidth: 940 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Mavzu</TableCell>
                                                <TableCell>Fayllar</TableCell>
                                                <TableCell>Uyga vazifa</TableCell>
                                                <TableCell>Yaratilgan sana</TableCell>
                                                <TableCell align="right">Amallar</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {lessonsLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6}>
                                                        <Typography sx={{ py: 1.5, color: "#6b7280" }}>Yuklanmoqda...</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : lessonsData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6}>
                                                        <Typography sx={{ py: 1.5, color: "#6b7280" }}>Darslar topilmadi</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                lessonsData.map((lesson, index) => (
                                                    <TableRow key={lesson.id}>
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                size="small"
                                                                label={lesson.name}
                                                                sx={{
                                                                    bgcolor: "#ffe8e2",
                                                                    color: "#a3412d",
                                                                    borderRadius: 1,
                                                                    maxWidth: 520,
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{lesson.files?.length ?? 0}</TableCell>
                                                        <TableCell>{lesson.homework ? "Bor" : "Yo'q"}</TableCell>
                                                        <TableCell>{new Date(lesson.createdAt).toLocaleString()}</TableCell>
                                                        <TableCell align="right">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => openHomeworkEditor(lesson)}
                                                            >
                                                                <AssignmentTurnedInOutlined fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : lessonSubTab === "Videolar" ? (
                                <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", border: "1px solid #edf0f5", borderRadius: 2 }}>
                                    <Table size="small" sx={{ minWidth: 920 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Mavzu</TableCell>
                                                <TableCell>Video soni</TableCell>
                                                <TableCell>Qo'shilgan vaqt</TableCell>
                                                <TableCell align="right">Video qo'shish</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {lessonsLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={5}>
                                                        <Typography sx={{ py: 1.5, color: "#6b7280" }}>Yuklanmoqda...</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : lessonsData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5}>
                                                        <Typography sx={{ py: 1.5, color: "#6b7280" }}>Darslar topilmadi</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                lessonsData.map((lesson, index) => (
                                                    <TableRow key={lesson.id} hover>
                                                        <TableCell onClick={() => openVideoListDialog(lesson)} sx={{ cursor: "pointer" }}>{index + 1}</TableCell>
                                                        <TableCell onClick={() => openVideoListDialog(lesson)} sx={{ cursor: "pointer" }}>{lesson.name}</TableCell>
                                                        <TableCell onClick={() => openVideoListDialog(lesson)} sx={{ cursor: "pointer" }}>{lesson.files?.length ?? 0}</TableCell>
                                                        <TableCell onClick={() => openVideoListDialog(lesson)} sx={{ cursor: "pointer" }}>{new Date(lesson.createdAt).toLocaleString()}</TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                size="small"
                                                                startIcon={<SmartDisplayOutlined fontSize="small" />}
                                                                onClick={() => openVideoDialog(lesson)}
                                                            >
                                                                Video qo'shish
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Typography sx={{ color: "#6b7280", py: 2 }}>
                                    {lessonSubTab} bo'limi keyingi bosqichda qo'shiladi.
                                </Typography>
                            )}
                        </Paper>
                    ) : (
                        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ minWidth: 0 }}>
                            <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #edf0f5", borderRadius: 2, minWidth: 280 }}>
                                <Typography sx={{ fontWeight: 700, mb: 1 }}>Ma'lumotlar</Typography>
                                <Typography sx={{ fontSize: 13 }}>Kurs: {selectedGroup.course?.name || "-"}</Typography>
                                <Typography sx={{ fontSize: 13 }}>Kurs narxi: {selectedGroup.course?.price || "-"}</Typography>
                                <Typography sx={{ fontSize: 13 }}>Dars kunlari: {(selectedGroup.weekDays || []).join(", ")}</Typography>
                                <Typography sx={{ fontSize: 13 }}>Dars vaqti: {selectedGroup.startTime || "-"}</Typography>
                                <Typography sx={{ fontSize: 13, mb: 1 }}>Davomiylik: {selectedGroup.durationMinutes || 0} min</Typography>

                                <Typography sx={{ fontWeight: 700, mt: 1 }}>O'qituvchilar</Typography>
                                {(selectedGroup.mentorAssignments || []).map((item) => (
                                    <Typography key={item.mentorId} sx={{ fontSize: 12, color: "#4b5563" }}>{item.mentor?.fullName}</Typography>
                                ))}

                                <Typography sx={{ fontWeight: 700, mt: 1 }}>Talabalar</Typography>
                                {(selectedGroup.studentGroups || []).map((item) => (
                                    <Typography key={item.userId} sx={{ fontSize: 12, color: "#4b5563" }}>{item.user?.fullName}</Typography>
                                ))}
                            </Paper>

                            <Box sx={{ flex: "1 1 0", width: 0, minWidth: 0 }}>
                                <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography sx={{ fontWeight: 700 }}>Davomat</Typography>
                                        <Button size="small" onClick={() => {
                                            const [y, m] = viewMonth.split("-").map(Number);
                                            setViewMonth(monthToString(new Date(y, m - 2, 1)));
                                        }}>{"<"}</Button>
                                        <Typography sx={{ fontSize: 13 }}>{viewMonth}</Typography>
                                        <Button size="small" onClick={() => {
                                            const [y, m] = viewMonth.split("-").map(Number);
                                            setViewMonth(monthToString(new Date(y, m, 1)));
                                        }}>{">"}</Button>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        sx={{
                                            flexWrap: "wrap",
                                            justifyContent: { xs: "flex-start", md: "flex-end" },
                                            width: "100%",
                                        }}
                                    >
                                        <TextField size="small" placeholder="Student qidirish" value={attendanceNameFilter} onChange={(e) => setAttendanceNameFilter(e.target.value)} sx={{ width: { xs: "100%", sm: 220 } }} />
                                        <TextField size="small" select value={attendanceDayFilter} onChange={(e) => setAttendanceDayFilter(e.target.value)} sx={{ width: { xs: "100%", sm: 96 } }}>
                                            <MenuItem value="">Kun</MenuItem>
                                            {lessonDaysInMonth.map((day) => (
                                                <MenuItem key={day} value={String(day)}>{day}</MenuItem>
                                            ))}
                                        </TextField>
                                        <TextField size="small" select value={attendanceStatusFilter} onChange={(e) => setAttendanceStatusFilter(e.target.value)} sx={{ width: { xs: "100%", sm: 128 } }}>
                                            <MenuItem value="ALL">Barchasi</MenuItem>
                                            <MenuItem value="PRESENT">Bor</MenuItem>
                                            <MenuItem value="ABSENT">Yo'q</MenuItem>
                                            <MenuItem value="NONE">Belgilanmagan</MenuItem>
                                        </TextField>
                                        <Button size="small" startIcon={<FileDownloadOutlined fontSize="small" />} onClick={exportAttendance}>
                                            Export
                                        </Button>
                                    </Stack>
                                </Stack>

                                <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "auto", overflowY: "hidden", border: "1px solid #edf0f5", borderRadius: 2 }}>
                                    <Table size="small" sx={{ minWidth: `${220 + (lessonDaysInMonth.length * 54)}px` }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nomi</TableCell>
                                                {lessonDaysInMonth.map((day) => (
                                                    <TableCell key={day} align="center">{day}</TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredAttendanceStudents.map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell>{student.fullName}</TableCell>
                                                    {lessonDaysInMonth.map((day) => {
                                                        const activeDay = isLessonDay(day);
                                                        const value = attendanceMap.get(`${student.id}-${dateKey(viewMonth, day)}`);
                                                        return (
                                                            <TableCell key={day} align="center" sx={{ py: 0.5, px: 0.5 }}>
                                                                <Chip
                                                                    size="small"
                                                                    label={!activeDay ? "-" : value === true ? "Bor" : value === false ? "Yo'q" : "-"}
                                                                    color={!activeDay ? "default" : value === true ? "success" : value === false ? "error" : "default"}
                                                                    variant={!activeDay || value === undefined ? "outlined" : "filled"}
                                                                    onClick={() => setAttendance(student.id, day)}
                                                                    clickable={activeDay}
                                                                    sx={{ minWidth: 44 }}
                                                                />
                                                                {activeDay && value !== undefined ? (
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{ ml: 0.25, p: 0.25, verticalAlign: "middle" }}
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            clearAttendance(student.id, day);
                                                                        }}
                                                                    >
                                                                        <Clear sx={{ fontSize: 12 }} />
                                                                    </IconButton>
                                                                ) : null}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Box>
                        </Stack>
                    )}
                </Paper>
            )}

            <Dialog open={createOpen} onClose={() => (!submitting ? setCreateOpen(false) : null)} maxWidth="sm" fullWidth>
                <DialogTitle>Yangi guruh</DialogTitle>
                <DialogContent>{renderForm()}</DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCreateOpen(false)} disabled={submitting}>Bekor qilish</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={submitting}>{submitting ? "Saqlanmoqda..." : "Saqlash"}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editOpen} onClose={() => (!submitting ? setEditOpen(false) : null)} maxWidth="sm" fullWidth>
                <DialogTitle>Guruhni tahrirlash</DialogTitle>
                <DialogContent>{renderForm()}</DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditOpen(false)} disabled={submitting}>Bekor qilish</Button>
                    <Button variant="contained" onClick={handleUpdate} disabled={submitting}>{submitting ? "Saqlanmoqda..." : "Saqlash"}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={mentorAddOpen} onClose={() => setMentorAddOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>O'qituvchi qo'shish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            select
                            label="Mentorlar"
                            value={quickMentorIds}
                            onChange={(e) => setQuickMentorIds(e.target.value)}
                            fullWidth
                            slotProps={{ select: { multiple: true } }}
                        >
                            {mentors.map((mentor) => <MenuItem key={mentor.id} value={mentor.id}>{mentor.fullName}</MenuItem>)}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setMentorAddOpen(false)}>Bekor</Button>
                    <Button variant="contained" onClick={applyMentorQuickAdd}>Saqlash</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={studentAddOpen} onClose={() => setStudentAddOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>O'quvchi qo'shish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            select
                            label="O'quvchilar"
                            value={quickStudentIds}
                            onChange={(e) => setQuickStudentIds(e.target.value)}
                            fullWidth
                            slotProps={{ select: { multiple: true } }}
                        >
                            {students.map((student) => <MenuItem key={student.id} value={student.id}>{student.fullName}</MenuItem>)}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setStudentAddOpen(false)}>Bekor</Button>
                    <Button variant="contained" onClick={applyStudentQuickAdd}>Saqlash</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={lessonCreateOpen}
                onClose={() => (!creatingLesson ? setLessonCreateOpen(false) : null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Yo'qlama va mavzu kiritish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                            <Chip
                                size="small"
                                clickable
                                label="O'quv reja bo'yicha"
                                onClick={() => setLessonCreateMode("PLAN")}
                                sx={{
                                    bgcolor: lessonCreateMode === "PLAN" ? "#ede9fe" : "#ffffff",
                                    color: lessonCreateMode === "PLAN" ? "#6d3ee6" : "#4b5563",
                                }}
                            />
                            <Chip
                                size="small"
                                clickable
                                label="Boshqa"
                                onClick={() => setLessonCreateMode("CUSTOM")}
                                sx={{
                                    bgcolor: lessonCreateMode === "CUSTOM" ? "#ede9fe" : "#ffffff",
                                    color: lessonCreateMode === "CUSTOM" ? "#6d3ee6" : "#4b5563",
                                }}
                            />
                        </Stack>

                        <TextField
                            label="Mavzu"
                            value={lessonName}
                            onChange={(event) => setLessonName(event.target.value)}
                            placeholder="CRM frontend"
                            fullWidth
                            autoFocus
                        />
                        <Typography sx={{ color: "#6b7280", fontSize: 12 }}>
                            Hozir dars yaratishda faqat nom talab qilinadi. Video keyin darsga biriktiriladi.
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setLessonCreateOpen(false)} disabled={creatingLesson}>Bekor</Button>
                    <Button variant="contained" onClick={handleCreateLesson} disabled={creatingLesson}>
                        {creatingLesson ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={videoDialogOpen}
                onClose={() => (!addingVideo ? setVideoDialogOpen(false) : null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Video qo'shish</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
                            Dars: {videoTargetLesson?.name || "-"}
                        </Typography>
                        <Box
                            component="label"
                            sx={{
                                border: "1px dashed #8ad3c0",
                                borderRadius: 2,
                                p: { xs: 2, md: 3 },
                                textAlign: "center",
                                backgroundColor: "#f8fffc",
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="file"
                                accept="video/*"
                                hidden
                                onChange={(event) => setVideoUploadFile(event.target.files?.[0] || null)}
                            />
                            <UploadFileOutlined sx={{ fontSize: 36, color: "#1da67a", mb: 1 }} />
                            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                                Video faylni yuklash uchun faylni tanlang
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                Qo'llab-quvvatlanadigan formatlar: mp4, webm, mpeg, avi, mkv, mov
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#256d5a", mt: 0.75 }}>
                                {videoUploadFile ? `Tanlangan fayl: ${videoUploadFile.name}` : "Fayl tanlanmagan"}
                            </Typography>
                        </Box>
                        <TextField
                            label="Izoh (ixtiyoriy)"
                            value={videoForm.note}
                            onChange={(event) =>
                                setVideoForm((prev) => ({ ...prev, note: event.target.value }))
                            }
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setVideoDialogOpen(false)} disabled={addingVideo}>Bekor qilish</Button>
                    <Button variant="contained" onClick={handleAddVideoToLesson} disabled={addingVideo}>
                        {addingVideo ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={videoListDialogOpen}
                onClose={() => setVideoListDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>{videoListLesson?.name || "Dars videolari"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={1.25} sx={{ pt: 1 }}>
                        {videoListLesson?.files?.length ? (
                            videoListLesson.files.map((item) => (
                                <Paper
                                    key={item.id}
                                    elevation={0}
                                    sx={{ p: 1.25, border: "1px solid #edf0f5", borderRadius: 2 }}
                                >
                                    <Stack spacing={1}>
                                        <video
                                            controls
                                            src={toPublicUrl(item.file)}
                                            style={{ width: "100%", maxHeight: 260, borderRadius: 8 }}
                                        />
                                        <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                                            {item.note || "Izoh yo'q"}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            ))
                        ) : (
                            <Typography sx={{ color: "#6b7280" }}>Bu darsga hali video biriktirilmagan.</Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setVideoListDialogOpen(false)}>Yopish</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
