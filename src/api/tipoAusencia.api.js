import axios from './axios'

const tipoAusenciaApi = {
    getAll: (params = {}) => {
        return axios.get('/tipos-ausencia', { params })
    },

    getById: (id) => {
        return axios.get(`/tipos-ausencia/${id}`)
    },

    create: (tipoAusencia) => {
        return axios.post('/tipos-ausencia', tipoAusencia)
    },

    update: (id, tipoAusencia) => {
        return axios.put(`/tipos-ausencia/${id}`, tipoAusencia)
    },

    delete: (id) => {
        return axios.delete(`/tipos-ausencia/${id}`)
    }
}

export default tipoAusenciaApi