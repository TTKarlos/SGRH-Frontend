import api from "./axios"

export default {
    getAll(params) {
        return api.get("/empresas", { params })
    },

    getById(id) {
        return api.get(`/empresas/${id}`)
    },

    create(empresa) {
        return api.post("/empresas", empresa)
    },

    update(id, empresa) {
        return api.put(`/empresas/${id}`, empresa)
    },

    delete(id) {
        return api.delete(`/empresas/${id}`)
    }
}