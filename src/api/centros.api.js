import api from "./axios"

export default {
    getAll(params) {
        return api.get("/centros", { params })
    },

    getCount(params) {
        return api.get("/centros/count", { params })
    },

    getById(id) {
        return api.get(`/centros/${id}`)
    },

    create(centro) {
        return api.post("/centros", centro)
    },

    update(id, centro) {
        return api.put(`/centros/${id}`, centro)
    },

    delete(id) {
        return api.delete(`/centros/${id}`)
    }
}