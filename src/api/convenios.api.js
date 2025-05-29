import api from "./axios"

export default {
    getAll(params) {
        return api.get("/convenios", { params })
    },

    getById(id) {
        return api.get(`/convenios/${id}`)
    },

    create(convenio) {
        return api.post("/convenios", convenio)
    },

    update(id, convenio) {
        return api.put(`/convenios/${id}`, convenio)
    },

    delete(id) {
        return api.delete(`/convenios/${id}`)
    }
}