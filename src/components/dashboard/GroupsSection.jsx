import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Checkbox, FormControlLabel, FormGroup, MenuItem, Stack, TextField, Typography } from "@mui/material";
import toast from "react-hot-toast";
import api from "../../services/axios";
import useAuthStore from "../../store/auth.store";
import GroupDetailPanel from "./groups/GroupDetailPanel";
import GroupLessonDialogs from "./groups/GroupLessonDialogs";
import GroupListPanel from "./groups/GroupListPanel";
import GroupManagementDialogs from "./groups/GroupManagementDialogs";

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

const LESSON_SUB_TABS = ["Uyga vazifa", "Videolar", "Vazifani tekshirish"];

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
    const { role } = useAuthStore();
    const canManageGroups = role === "ADMIN" || role === "SUPERADMIN";
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
    const [pendingAttendanceChanges, setPendingAttendanceChanges] = useState({});
    const [savingAttendance, setSavingAttendance] = useState(false);
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
    const [lessonAbout, setLessonAbout] = useState("");
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
            if (!canManageGroups) {
                const { data } = await api.get("/groups");
                setGroups(Array.isArray(data) ? data : []);
                setCourses([]);
                setRooms([]);
                setMentors([]);
                setStudents([]);
                return;
            }

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
        setPendingAttendanceChanges({});
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
                about: lessonAbout.trim() || undefined,
                groupId: selectedGroup.id,
            });
            toast.success("Dars yaratildi");
            setLessonCreateOpen(false);
            setLessonName("");
            setLessonAbout("");
            await loadLessons(selectedGroup.id);
        } catch (error) {
            const message = error?.response?.data?.message || "Dars yaratishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setCreatingLesson(false);
        }
    };

    const handleDeleteLesson = async (lesson) => {
        if (!selectedGroup || !lesson) return;
        const confirmed = window.confirm(`"${lesson.name}" darsini o'chirmoqchimisiz?`);
        if (!confirmed) return;

        try {
            await api.delete(`/lessons/${lesson.id}`);
            toast.success("Dars o'chirildi");
            if (homeworkEditorLesson?.id === lesson.id) {
                setHomeworkEditorLesson(null);
                setHomeworkTask("");
                setHomeworkUploadFile(null);
            }
            if (videoTargetLesson?.id === lesson.id) {
                setVideoDialogOpen(false);
                setVideoTargetLesson(null);
                setVideoUploadFile(null);
                setVideoForm({ note: "" });
            }
            if (videoListLesson?.id === lesson.id) {
                setVideoListDialogOpen(false);
                setVideoListLesson(null);
            }
            setLessonsData((prev) => prev.filter((item) => item.id !== lesson.id));
            await loadLessons(selectedGroup.id);
        } catch (error) {
            const message = error?.response?.data?.message || "Darsni o'chirishda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
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
        setHomeworkTask(lesson.homework?.task || "");
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

            if (homeworkEditorLesson.homework?.id) {
                await api.patch(`/homeworks/${homeworkEditorLesson.homework.id}`, {
                    task: homeworkTask.trim(),
                    file: fileUrl || undefined,
                });
                toast.success("Uyga vazifa yangilandi");
            } else {
                await api.post("/homeworks", {
                    lessonId: homeworkEditorLesson.id,
                    task: homeworkTask.trim(),
                    file: fileUrl || undefined,
                });
                toast.success("Uyga vazifa biriktirildi");
            }
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
                setPendingAttendanceChanges({});
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

    const effectiveAttendanceMap = useMemo(() => {
        const map = new Map(attendanceMap);
        Object.values(pendingAttendanceChanges).forEach((change) => {
            const key = `${change.studentId}-${dateKey(viewMonth, change.day)}`;
            if (change.present === null) {
                map.delete(key);
            } else {
                map.set(key, change.present);
            }
        });
        return map;
    }, [attendanceMap, pendingAttendanceChanges, viewMonth]);

    const hasPendingAttendanceChanges = Object.keys(pendingAttendanceChanges).length > 0;

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

    const stageAttendance = (studentId, day, present) => {
        if (!selectedGroup || !isLessonDay(day)) return;
        const keyDate = dateKey(viewMonth, day);
        const cellKey = `${studentId}-${keyDate}`;
        const original = attendanceMap.has(cellKey) ? attendanceMap.get(cellKey) : null;
        const current = effectiveAttendanceMap.has(cellKey) ? effectiveAttendanceMap.get(cellKey) : null;
        const next = current === present ? null : present;

        setPendingAttendanceChanges((prev) => {
            const nextChanges = { ...prev };
            if (next === original) {
                delete nextChanges[cellKey];
            } else {
                nextChanges[cellKey] = { studentId, day, present: next };
            }
            return nextChanges;
        });
    };

    const saveAttendanceChanges = async () => {
        if (!selectedGroup || !hasPendingAttendanceChanges) return;
        setSavingAttendance(true);
        try {
            await api.patch(`/groups/${selectedGroup.id}/attendance/bulk`, {
                month: viewMonth,
                changes: Object.values(pendingAttendanceChanges),
            });
            toast.success("Davomat saqlandi");
            await loadAttendance(selectedGroup.id, viewMonth);
        } catch (error) {
            const message = error?.response?.data?.message || "Davomatni saqlashda xatolik";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setSavingAttendance(false);
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

            const value = effectiveAttendanceMap.get(`${student.id}-${dateKey(viewMonth, day)}`);
            if (attendanceStatusFilter === "PRESENT") return value === true;
            if (attendanceStatusFilter === "ABSENT") return value === false;
            if (attendanceStatusFilter === "NONE") return value === undefined;
            return true;
        });
    }, [attendancePayload, attendanceNameFilter, attendanceDayFilter, attendanceStatusFilter, effectiveAttendanceMap, viewMonth, isLessonDay]);

    const exportAttendance = () => {
        if (!attendancePayload) return;
        const days = lessonDaysInMonth;
        const headers = ["Student", ...days.map((day) => `${viewMonth}-${String(day).padStart(2, "0")}`)];
        const rows = filteredAttendanceStudents.map((student) => {
            const values = days.map((day) => {
                const status = effectiveAttendanceMap.get(`${student.id}-${dateKey(viewMonth, day)}`);
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
                <GroupListPanel
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    filteredGroups={visibleGroups}
                    groupStats={groupStats}
                    loading={loading}
                    canManageGroups={canManageGroups}
                    openView={openView}
                    openEdit={openEdit}
                    handleArchiveToggle={handleArchiveToggle}
                    handleDelete={handleDelete}
                    openCreate={() => setCreateOpen(true)}
                />
            ) : (
                <GroupDetailPanel
                    group={selectedGroup}
                    canManageGroups={canManageGroups}
                    groupViewTabs={GROUP_VIEW_TABS}
                    groupViewTab={groupViewTab}
                    setGroupViewTab={setGroupViewTab}
                    onBack={() => {
                        setSelectedGroup(null);
                        setAttendancePayload(null);
                        setPendingAttendanceChanges({});
                        setLessonsData([]);
                        setHomeworkEditorLesson(null);
                        setVideoDialogOpen(false);
                        setVideoTargetLesson(null);
                        setVideoListDialogOpen(false);
                        setVideoListLesson(null);
                        setLessonName("");
                        setLessonAbout("");
                    }}
                    onEdit={() => openEdit(selectedGroup)}
                    onAddMentor={() => setMentorAddOpen(true)}
                    onAddStudent={() => setStudentAddOpen(true)}
                    lessonsProps={{
                        lessonTabs: LESSON_SUB_TABS,
                        lessonSubTab,
                        setLessonSubTab,
                        onCreateLesson: () => setLessonCreateOpen(true),
                        homeworkEditorLesson,
                        setHomeworkEditorLesson,
                        homeworkTask,
                        setHomeworkTask,
                        homeworkUploadFile,
                        setHomeworkUploadFile,
                        creatingHomework,
                        handleCreateHomework,
                        lessonsLoading,
                        lessonsData,
                        openHomeworkEditor,
                        openVideoDialog,
                        openVideoListDialog,
                        handleDeleteLesson,
                        loadLessons,
                    }}
                    attendanceProps={{
                        viewMonth,
                        setViewMonth,
                        lessonDaysInMonth,
                        filteredAttendanceStudents,
                        attendanceNameFilter,
                        setAttendanceNameFilter,
                        attendanceDayFilter,
                        setAttendanceDayFilter,
                        attendanceStatusFilter,
                        setAttendanceStatusFilter,
                        exportAttendance,
                        hasPendingAttendanceChanges,
                        pendingAttendanceChanges,
                        savingAttendance,
                        setPendingAttendanceChanges,
                        saveAttendanceChanges,
                        isLessonDay,
                        effectiveAttendanceMap,
                        stageAttendance,
                    }}
                />
            )}

            <GroupManagementDialogs
                createOpen={createOpen}
                setCreateOpen={setCreateOpen}
                editOpen={editOpen}
                setEditOpen={setEditOpen}
                mentorAddOpen={mentorAddOpen}
                setMentorAddOpen={setMentorAddOpen}
                studentAddOpen={studentAddOpen}
                setStudentAddOpen={setStudentAddOpen}
                submitting={submitting}
                renderForm={renderForm}
                handleCreate={handleCreate}
                handleUpdate={handleUpdate}
                mentors={mentors}
                students={students}
                quickMentorIds={quickMentorIds}
                setQuickMentorIds={setQuickMentorIds}
                quickStudentIds={quickStudentIds}
                setQuickStudentIds={setQuickStudentIds}
                applyMentorQuickAdd={applyMentorQuickAdd}
                applyStudentQuickAdd={applyStudentQuickAdd}
            />

            <GroupLessonDialogs
                lessonCreateOpen={lessonCreateOpen}
                setLessonCreateOpen={setLessonCreateOpen}
                creatingLesson={creatingLesson}
                lessonCreateMode={lessonCreateMode}
                setLessonCreateMode={setLessonCreateMode}
                lessonName={lessonName}
                setLessonName={setLessonName}
                lessonAbout={lessonAbout}
                setLessonAbout={setLessonAbout}
                handleCreateLesson={handleCreateLesson}
                videoDialogOpen={videoDialogOpen}
                setVideoDialogOpen={setVideoDialogOpen}
                addingVideo={addingVideo}
                videoTargetLesson={videoTargetLesson}
                videoUploadFile={videoUploadFile}
                setVideoUploadFile={setVideoUploadFile}
                videoForm={videoForm}
                setVideoForm={setVideoForm}
                handleAddVideoToLesson={handleAddVideoToLesson}
                videoListDialogOpen={videoListDialogOpen}
                setVideoListDialogOpen={setVideoListDialogOpen}
                videoListLesson={videoListLesson}
                toPublicUrl={toPublicUrl}
            />
        </Stack>
    );
}
