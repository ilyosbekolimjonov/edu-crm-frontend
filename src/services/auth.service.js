import api from "./axios";

export const loginRequest = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
};