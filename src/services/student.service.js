import api from "./axios";

export const getStudentDashboardRequest = async () => {
    const { data } = await api.get("/student/dashboard");
    return data;
};

export const getStudentGroupsRequest = async () => {
    const { data } = await api.get("/student/groups");
    return data;
};

export const getStudentLessonsRequest = async () => {
    const { data } = await api.get("/student/lessons");
    return data;
};

export const getStudentLessonRequest = async (id) => {
    const { data } = await api.get(`/student/lessons/${id}`);
    return data;
};

export const getStudentHomeworksRequest = async () => {
    const { data } = await api.get("/student/homeworks");
    return data;
};

export const submitStudentHomeworkRequest = async (id, payload) => {
    const { data } = await api.post(`/student/homeworks/${id}/submission`, payload, {
        headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return data;
};

export const getStudentAttendanceRequest = async (groupId) => {
    const { data } = await api.get("/student/attendance", {
        params: groupId ? { groupId } : undefined,
    });
    return data;
};

export const getStudentProfileRequest = async () => {
    const { data } = await api.get("/student/profile");
    return data;
};

export const updateStudentProfileRequest = async (payload) => {
    const { data } = await api.patch("/student/profile", payload, {
        headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return data;
};
