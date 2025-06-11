import api from "./axios"

export default {
    getAll(params) {
        return api.get("/zonas", { params })
    },

    getChartData(params) {
        return api.get("/zonas/chart-data", { params })
    },

    getById(id) {
        return api.get(`/zonas/${id}`)
    },

    create(zona) {
        return api.post("/zonas", zona)
    },

    update(id, zona) {
        return api.put(`/zonas/${id}`, zona)
    },

    delete(id) {
        return api.delete(`/zonas/${id}`)
    },
}
