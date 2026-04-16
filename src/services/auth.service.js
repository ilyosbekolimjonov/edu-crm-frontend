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

export const getProfileRequest = async () => {
    const { data } = await api.get("/auth/profile");
    return data;
};

export const updateProfileRequest = async (payload) => {
    const { data } = await api.patch("/auth/profile", payload, {
        headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
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

export const uploadUserImageRequest = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/auth/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
};
