import api from "./axios"

export default {
    getAll(params) {
        return api.get("/departamentos", { params })
    },

    getById(id) {
        return api.get(`/departamentos/${id}`)
    },

    create(departamento) {
        return api.post("/departamentos", departamento)
    },

    update(id, departamento) {
        return api.put(`/departamentos/${id}`, departamento)
    },

    delete(id) {
        return api.delete(`/departamentos/${id}`)
    }
}