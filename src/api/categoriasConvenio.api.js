import api from "./axios"

export default {
    getAll(params) {
        return api.get("/categorias-convenio", { params })
    },

    getById(id) {
        return api.get(`/categorias-convenio/${id}`)
    },

    getByConvenio(idConvenio) {
        return api.get(`/categorias-convenio/convenio/${idConvenio}`)
    },

    create(categoria) {
        return api.post("/categorias-convenio", categoria)
    },

    update(id, categoria) {
        return api.put(`/categorias-convenio/${id}`, categoria)
    },

    delete(id) {
        return api.delete(`/categorias-convenio/${id}`)
    }
}