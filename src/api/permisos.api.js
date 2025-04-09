import api from "./axios"

export default {
    getAllPermisos(params) {
        return api.get("/permisos", { params })
    },

    getPermisoById(id) {
        return api.get(`/permisos/${id}`)
    }
}