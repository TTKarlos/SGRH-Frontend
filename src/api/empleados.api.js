import api from "./axios"

export default {
    getAll(params) {
        return api.get("/empleados", { params })
    },

    getById(id) {
        return api.get(`/empleados/${id}`)
    },

    create(empleado) {
        return api.post("/empleados", empleado)
    },

    update(id, empleado) {
        return api.put(`/empleados/${id}`, empleado)
    },

    delete(id) {
        return api.delete(`/empleados/${id}`)
    },

    changeStatus(id, activo) {
        return api.patch(`/empleados/${id}/status`, { activo })
    },
}
