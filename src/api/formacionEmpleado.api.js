import axios from './axios'

const formacionEmpleadoApi = {
    getAll: (params = {}) => {
        return axios.get('/formaciones', { params })
    },

    getById: (id) => {
        return axios.get(`/formaciones/${id}`)
    },

    getByEmpleado: (idEmpleado, params = {}) => {
        return axios.get(`/formaciones/empleado/${idEmpleado}`, { params })
    },

    create: (formacion) => {
        return axios.post('/formaciones', formacion)
    },

    update: (id, formacion) => {
        return axios.put(`/formaciones/${id}`, formacion)
    },

    delete: (id) => {
        return axios.delete(`/formaciones/${id}`)
    }
}

export default formacionEmpleadoApi