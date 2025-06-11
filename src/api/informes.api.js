import api from "./axios"

/**
 * Servicio para gestionar los informes PDF
 */
export default {
    /**
     * Obtiene la lista de informes disponibles
     * @returns {Promise} Respuesta con los informes disponibles
     */
    getInformesDisponibles() {
        return api.get("/informes/disponibles")
    },

    /**
     * Obtiene las opciones de departamentos para filtros
     * @returns {Promise} Respuesta con los departamentos disponibles
     */
    getOpcionesDepartamentos() {
        return api.get("/informes/opciones/departamentos")
    },

    /**
     * Obtiene las opciones de centros para filtros
     * @returns {Promise} Respuesta con los centros disponibles
     */
    getOpcionesCentros() {
        return api.get("/informes/opciones/centros")
    },

    /**
     * Obtiene las opciones de zonas para filtros
     * @returns {Promise} Respuesta con las zonas disponibles
     */
    getOpcionesZonas() {
        return api.get("/informes/opciones/zonas")
    },

    /**
     * Obtiene las opciones de empresas para filtros
     * @returns {Promise} Respuesta con las empresas disponibles
     */
    getOpcionesEmpresas() {
        return api.get("/informes/opciones/empresas")
    },

    /**
     * Obtiene el informe de empleados activos
     * @returns {Promise} Respuesta con el PDF de empleados activos
     */
    getEmpleadosActivos() {
        return api.get("/informes/empleados/estado/activos", {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el informe de empleados inactivos
     * @returns {Promise} Respuesta con el PDF de empleados inactivos
     */
    getEmpleadosInactivos() {
        return api.get("/informes/empleados/estado/inactivos", {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el informe general de empleados por departamento
     * @returns {Promise} Respuesta con el PDF de empleados por departamento
     */
    getEmpleadosPorDepartamentoGeneral() {
        return api.get("/informes/empleados/departamento/general", {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el informe de empleados de un departamento específico
     * @param {number} id - ID del departamento
     * @returns {Promise} Respuesta con el PDF de empleados del departamento
     */
    getEmpleadosPorDepartamentoEspecifico(id) {
        return api.get(`/informes/empleados/departamento/${id}`, {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el informe general de empleados por centro
     * @returns {Promise} Respuesta con el PDF de empleados por centro
     */
    getEmpleadosPorCentroGeneral() {
        return api.get("/informes/empleados/centro/general", {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el informe de empleados de un centro específico
     * @param {number} id - ID del centro
     * @returns {Promise} Respuesta con el PDF de empleados del centro
     */
    getEmpleadosPorCentroEspecifico(id) {
        return api.get(`/informes/empleados/centro/${id}`, {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el informe general de empleados por zona
     * @returns {Promise} Respuesta con el PDF de empleados por zona
     */
    getEmpleadosPorZonaGeneral() {
        return api.get("/informes/empleados/zona/general", {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el informe de empleados de una zona específica
     * @param {number} id - ID de la zona
     * @returns {Promise} Respuesta con el PDF de empleados de la zona
     */
    getEmpleadosPorZonaEspecifica(id) {
        return api.get(`/informes/empleados/zona/${id}`, {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el informe general de empleados por empresa
     * @returns {Promise} Respuesta con el PDF de empleados por empresa
     */
    getEmpleadosPorEmpresaGeneral() {
        return api.get("/informes/empleados/empresa/general", {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el informe de empleados de una empresa específica
     * @param {number} id - ID de la empresa
     * @returns {Promise} Respuesta con el PDF de empleados de la empresa
     */
    getEmpleadosPorEmpresaEspecifica(id) {
        return api.get(`/informes/empleados/empresa/${id}`, {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el informe de cumpleaños en un rango de fechas
     * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
     * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
     * @returns {Promise} Respuesta con el PDF de cumpleaños
     */
    getCumpleanosPorRango(fechaInicio, fechaFin) {
        return api.get("/informes/especiales/cumpleanos/rango", {
            params: { fechaInicio, fechaFin },
            responseType: "blob",
        })
    },

    /**
     * Obtiene el directorio de contactos
     * @returns {Promise} Respuesta con el PDF del directorio de contactos
     */
    getInformeContactos() {
        return api.get("/informes/especiales/contactos", {
            responseType: "blob",
        })
    },

    /**
     * Obtiene el dashboard ejecutivo
     * @returns {Promise} Respuesta con el PDF del dashboard ejecutivo
     */
    getDashboardEjecutivo() {
        return api.get("/informes/dashboard/ejecutivo", {
            responseType: "blob",
        })
    },

}
