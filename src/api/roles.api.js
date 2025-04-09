import api from "./axios"

export default {
    getAll(params) {
        return api.get("/rol", { params })
    },

    getById(id) {
        return api.get(`/rol/${id}`)
    },

    getMiRol() {
        return api.get("/rol/mi-rol")
    },

    create(rol) {
        return api.post("/rol", rol)
    },

    update(id, rol) {
        return api.put(`/rol/${id}`, rol)
    },

    delete(id) {
        return api.delete(`/rol/${id}`)
    },

    updatePermisos(id, permisos) {
        return api.put(`/rol/${id}/permisos`, { permisos })
    }
}