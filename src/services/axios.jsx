import axios from "axios";

const BASE_URL = "http://localhost:3000";

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

const forceLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
};

const onRefreshed = (token) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;
        const status = error?.response?.status;

        if (!originalRequest || status !== 401) {
            return Promise.reject(error);
        }

        const isAuthRoute = (originalRequest.url || "").includes("/auth/login") || (originalRequest.url || "").includes("/auth/refresh");
        if (isAuthRoute) {
            forceLogout();
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            forceLogout();
            return Promise.reject(error);
        }

        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (!storedRefreshToken) {
            forceLogout();
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve) => {
                refreshSubscribers.push((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(api(originalRequest));
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await axios.post(
                `${BASE_URL}/auth/refresh`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${storedRefreshToken}`,
                    },
                },
            );

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            onRefreshed(data.accessToken);

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            forceLogout();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default api;