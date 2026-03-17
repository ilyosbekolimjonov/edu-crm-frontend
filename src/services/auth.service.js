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

export const updateUserRequest = async (id, payload) => {
    const { data } = await api.patch(`/auth/users/${id}`, payload);
    return data;
};

export const deleteUserRequest = async (id) => {
    const { data } = await api.delete(`/auth/users/${id}`);
    return data;
};