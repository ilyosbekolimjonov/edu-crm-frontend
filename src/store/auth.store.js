import { create } from "zustand";

const useAuthStore = create((set) => ({
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    role: localStorage.getItem("role") || null,

    setAuth: ({ accessToken, refreshToken, role }) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("role", role);

        set({ accessToken, refreshToken, role });
    },

    logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");

        set({
            accessToken: null,
            refreshToken: null,
            role: null,
        });
    },
}));

export default useAuthStore;