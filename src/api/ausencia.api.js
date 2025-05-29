import axios from './axios'

const ausenciaApi = {
    getAll: (params = {}) => {
        return axios.get('/ausencias', { params })
    },

    getById: (id) => {
        return axios.get(`/ausencias/${id}`)
    },

    getByEmpleado: (idEmpleado, params = {}) => {
        return axios.get(`/ausencias/empleado/${idEmpleado}`, { params })
    },

    create: (ausencia) => {
        return axios.post('/ausencias', ausencia)
    },

    update: (id, ausencia) => {
        return axios.put(`/ausencias/${id}`, ausencia)
    },

    delete: (id) => {
        return axios.delete(`/ausencias/${id}`)
    }
}

export default ausenciaApi