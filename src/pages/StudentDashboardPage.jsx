import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Stack, Typography } from "@mui/material";
import toast from "react-hot-toast";
import StudentAttendance from "../components/student/StudentAttendance";
import StudentGroupDetail from "../components/student/StudentGroupDetail";
import StudentGroups from "../components/student/StudentGroups";
import StudentLayout from "../components/student/StudentLayout";
import StudentLessonDetail from "../components/student/StudentLessonDetail";
import StudentOverview from "../components/student/StudentOverview";
import StudentPlaceholder from "../components/student/StudentPlaceholder";
import StudentProfile from "../components/student/StudentProfile";
import {
    getStudentAttendanceRequest,
    getStudentDashboardRequest,
    getStudentGroupsRequest,
    getStudentLessonRequest,
    getStudentLessonsRequest,
    getStudentProfileRequest,
    submitStudentHomeworkRequest,
    updateStudentProfileRequest,
} from "../services/student.service";

const toArray = (value) => (Array.isArray(value) ? value : []);

export default function StudentDashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { groupId, lessonId } = useParams();
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState(null);
    const [groups, setGroups] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [attendance, setAttendance] = useState(null);
    const [profile, setProfile] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [loadingLesson, setLoadingLesson] = useState(false);
    const [submittingHomeworkId, setSubmittingHomeworkId] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);

    const currentProfile = useMemo(() => profile || dashboard?.profile || null, [dashboard, profile]);
    const activeSection = location.pathname.includes("/student/profile")
        ? "profile"
        : location.pathname.includes("/student/rating")
          ? "rating"
          : location.pathname.includes("/student/shop")
            ? "shop"
            : location.pathname.includes("/student/payments")
              ? "payments"
        : location.pathname.includes("/student/attendance")
          ? "attendance"
          : location.pathname.includes("/student/groups")
            ? "groups"
            : "overview";

    const loadAttendance = useCallback(async (nextGroupId = "") => {
        try {
            const data = await getStudentAttendanceRequest(nextGroupId || undefined);
            setAttendance(data);
        } catch (error) {
            const message = error?.response?.data?.message || "Davomat yuklanmadi";
            toast.error(Array.isArray(message) ? message[0] : message);
        }
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                getStudentDashboardRequest(),
                getStudentGroupsRequest(),
                getStudentLessonsRequest(),
                getStudentAttendanceRequest(),
                getStudentProfileRequest(),
            ]);

            const [dashboardRes, groupsRes, lessonsRes, attendanceRes, profileRes] = results;
            if (results.some((result) => result.status === "rejected")) {
                toast.error("Ba'zi student ma'lumotlari yuklanmadi");
            }

            if (dashboardRes.status === "fulfilled") setDashboard(dashboardRes.value);
            if (groupsRes.status === "fulfilled") setGroups(toArray(groupsRes.value));
            if (lessonsRes.status === "fulfilled") setLessons(toArray(lessonsRes.value));
            if (attendanceRes.status === "fulfilled") setAttendance(attendanceRes.value);
            if (profileRes.status === "fulfilled") setProfile(profileRes.value);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    useEffect(() => {
        if (!lessonId) {
            setSelectedLesson(null);
            return;
        }

        setLoadingLesson(true);
        getStudentLessonRequest(lessonId)
            .then((data) => {
                setSelectedLesson(data);
                setLessons((prev) => prev.map((lesson) => (lesson.id === lessonId ? { ...lesson, viewed: true } : lesson)));
            })
            .catch((error) => {
                const message = error?.response?.data?.message || "Dars ochilmadi";
                toast.error(Array.isArray(message) ? message[0] : message);
            })
            .finally(() => setLoadingLesson(false));
    }, [lessonId]);

    const handleSubmitHomework = async (id, payload) => {
        setSubmittingHomeworkId(id);
        try {
            await submitStudentHomeworkRequest(id, payload);
            toast.success("Homework yuborildi");
            const [lessonData, dashboardData] = await Promise.all([
                getStudentLessonRequest(lessonId),
                getStudentDashboardRequest(),
            ]);
            setSelectedLesson(lessonData);
            setDashboard(dashboardData);
        } catch (error) {
            const message = error?.response?.data?.message || "Homework yuborilmadi";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setSubmittingHomeworkId(null);
        }
    };

    const handleProfileSubmit = async (payload) => {
        setSavingProfile(true);
        try {
            const updated = await updateStudentProfileRequest(payload);
            toast.success("Profil yangilandi");
            setProfile(updated);
            setDashboard((prev) => (prev ? { ...prev, profile: updated } : prev));
        } catch (error) {
            const message = error?.response?.data?.message || "Profil yangilanmadi";
            toast.error(Array.isArray(message) ? message[0] : message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleAttendanceGroupChange = (nextGroupId) => {
        setSelectedGroupId(nextGroupId);
        loadAttendance(nextGroupId);
    };

    const selectedGroup = groups.find((group) => String(group.id) === String(groupId)) || null;
    const selectedGroupLessons = lessons.filter((lesson) => String(lesson.group?.id) === String(groupId));

    const content = () => {
        if (lessonId) {
            if (loadingLesson && !selectedLesson) {
                return (
                    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "50vh" }} spacing={1}>
                        <CircularProgress size={28} />
                        <Typography sx={{ color: "#667085" }}>Dars yuklanmoqda...</Typography>
                    </Stack>
                );
            }
            return (
                <StudentLessonDetail
                    lesson={selectedLesson}
                    onBack={() => navigate(`/student/groups/${groupId}`)}
                    onSubmitHomework={handleSubmitHomework}
                    submitting={submittingHomeworkId === selectedLesson?.homework?.id || loadingLesson}
                />
            );
        }

        if (groupId) {
            return (
                <StudentGroupDetail
                    group={selectedGroup}
                    lessons={selectedGroupLessons}
                    onBack={() => navigate("/student/groups")}
                    onOpenLesson={(id) => navigate(`/student/groups/${groupId}/lessons/${id}`)}
                />
            );
        }

        if (activeSection === "groups") {
            return <StudentGroups groups={groups} onOpenGroup={(id) => navigate(`/student/groups/${id}`)} />;
        }

        if (activeSection === "attendance") {
            return (
                <StudentAttendance
                    attendance={attendance}
                    groups={groups}
                    selectedGroupId={selectedGroupId}
                    onChangeGroup={handleAttendanceGroupChange}
                />
            );
        }

        if (activeSection === "profile") {
            return <StudentProfile profile={currentProfile} onSubmit={handleProfileSubmit} submitting={savingProfile} />;
        }

        if (activeSection === "rating") {
            return <StudentPlaceholder title="Reyting" />;
        }

        if (activeSection === "shop") {
            return <StudentPlaceholder title="Do'kon" />;
        }

        if (activeSection === "payments") {
            return <StudentPlaceholder title="To'lovlarim" />;
        }

        return <StudentOverview dashboard={dashboard} />;
    };

    return (
        <StudentLayout activeSection={activeSection} profile={currentProfile}>
            {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "70vh" }} spacing={1}>
                    <CircularProgress size={28} />
                    <Typography sx={{ color: "#667085" }}>Yuklanmoqda...</Typography>
                </Stack>
            ) : (
                content()
            )}
        </StudentLayout>
    );
}
