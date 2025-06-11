import api from "./axios"

export default {
    getStats(params) {
        return api.get("/dashboard/stats", { params })
    },

    getSummary(params) {
        return api.get("/dashboard/summary", { params })
    },

    getEmpleadosPorEmpresa(params) {
        return api.get("/dashboard/empleados-por-empresa", { params })
    },

    getEmpleadosPorZona(params) {
        return api.get("/dashboard/empleados-por-zona", { params })
    },

    getEmpleadosPorDepartamento(params) {
        return api.get("/dashboard/empleados-por-departamento", { params })
    },

    getEstadoEmpleados(params) {
        return api.get("/dashboard/estado-empleados", { params })
    },
}
