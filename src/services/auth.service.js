import api from "./axios";

export const loginRequest = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
};

export const registerStudentRequest = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
};

export const getUsersRequest = async (role) => {
    const { data } = await api.get("/auth/users", {
        params: role ? { role } : undefined,
    });
    return data;
};