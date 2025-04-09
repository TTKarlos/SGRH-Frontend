import api from "./axios"

export default {
    getAll(params) {
        return api.get("/users", { params })
    },

    getById(id) {
        return api.get(`/users/${id}`)
    },

    create(usuario) {
        return api.post("/users", usuario)
    },

    update(id, usuario) {
        return api.put(`/users/${id}`, usuario)
    },

    delete(id) {
        return api.delete(`/users/${id}`)
    },

    changeStatus(id, activo) {
        return api.patch(`/users/${id}/status`, { activo })
    },

    resetPassword(id, data) {
        return api.post(`/users/${id}/reset-password`, data)
    }
}