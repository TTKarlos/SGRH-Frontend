import api from "./axios"

export default {
    getAll(params) {
        return api.get("/tipos-contrato", { params })
    },

    getById(id) {
        return api.get(`/tipos-contrato/${id}`)
    },

    create(tipoContrato) {
        return api.post("/tipos-contrato", tipoContrato)
    },

    update(id, tipoContrato) {
        return api.put(`/tipos-contrato/${id}`, tipoContrato)
    },

    delete(id) {
        return api.delete(`/tipos-contrato/${id}`)
    }
}