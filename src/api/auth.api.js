import api from "./axios";

const authApi = {
    login(credentials) {
        return api.post("/auth/login", credentials);
    },

    logout() {
        return api.post("/auth/logout");
    },

    getProfile() {
        return api.get("/auth/profile");
    },

    changePassword(data) {
        return api.post("/auth/change-password", data);
    }
};

export default authApi;