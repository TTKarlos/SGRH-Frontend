import { defineStore } from "pinia"
import dashboardApi from "@/api/dashboard.api"

export const useDashboardStore = defineStore("dashboard", {
    state: () => ({
        loading: false,
        error: null,

        resumen: {
            total_empleados: 0,
            total_empresas: 0,
            total_zonas: 0,
            total_departamentos: 0,
        },

        empleadosPorEmpresa: [],
        empleadosPorZona: [],
        empleadosPorDepartamento: [],
        estadoEmpleados: null,

        statsData: null,
        lastFetch: null,
    }),

    getters: {
        getChartData: (state) => (tipo) => {
            switch (tipo) {
                case "empresas":
                    return state.empleadosPorEmpresa.map((item) => ({
                        name: item.nombre,
                        count: item.total_empleados,
                        id: item.id,
                    }))
                case "zonas":
                    return state.empleadosPorZona.map((item) => ({
                        name: item.nombre,
                        count: item.total_empleados,
                        id: item.id,
                    }))
                case "departamentos":
                    return state.empleadosPorDepartamento.map((item) => ({
                        name: item.nombre,
                        count: item.total_empleados,
                        id: item.id,
                    }))
                default:
                    return []
            }
        },

        needsRefresh: (state) => {
            if (!state.lastFetch) return true
            const fiveMinutes = 5 * 60 * 1000
            return Date.now() - state.lastFetch > fiveMinutes
        },

        totales: (state) => ({
            empleados: state.resumen.total_empleados,
            empresas: state.resumen.total_empresas,
            zonas: state.resumen.total_zonas,
            departamentos: state.resumen.total_departamentos,
        }),
    },

    actions: {
        async fetchStats(forceRefresh = false) {
            if (!forceRefresh && !this.needsRefresh && this.statsData) {
                return this.statsData
            }

            this.loading = true
            this.error = null

            try {
                const response = await dashboardApi.getStats()

                if (response.data.success) {
                    const data = response.data.data

                    this.statsData = data
                    this.resumen = data.resumen
                    this.empleadosPorEmpresa = data.empleados_por_empresa
                    this.empleadosPorZona = data.empleados_por_zona
                    this.empleadosPorDepartamento = data.empleados_por_departamento
                    this.lastFetch = Date.now()

                    return data
                } else {
                    throw new Error(response.data.message || "Error al obtener estadísticas")
                }
            } catch (error) {
                console.error("Error al cargar estadísticas del dashboard:", error)
                this.error = error.response?.data?.message || error.message || "Error al cargar datos"
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchSummary() {
            this.loading = true
            this.error = null

            try {
                const response = await dashboardApi.getSummary()

                if (response.data.success) {
                    this.resumen = response.data.data
                    return response.data.data
                } else {
                    throw new Error(response.data.message || "Error al obtener resumen")
                }
            } catch (error) {
                console.error("Error al cargar resumen del dashboard:", error)
                this.error = error.response?.data?.message || error.message || "Error al cargar resumen"
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchEmpleadosPorEmpresa() {
            try {
                const response = await dashboardApi.getEmpleadosPorEmpresa()

                if (response.data.success) {
                    this.empleadosPorEmpresa = response.data.data.empresas || []
                    return this.empleadosPorEmpresa
                } else {
                    throw new Error(response.data.message || "Error al obtener datos por empresa")
                }
            } catch (error) {
                console.error("Error al cargar empleados por empresa:", error)
                throw error
            }
        },

        async fetchEmpleadosPorZona() {
            try {
                const response = await dashboardApi.getEmpleadosPorZona()

                if (response.data.success) {
                    this.empleadosPorZona = response.data.data.zonas || []
                    return this.empleadosPorZona
                } else {
                    throw new Error(response.data.message || "Error al obtener datos por zona")
                }
            } catch (error) {
                console.error("Error al cargar empleados por zona:", error)
                throw error
            }
        },

        async fetchEmpleadosPorDepartamento() {
            try {
                const response = await dashboardApi.getEmpleadosPorDepartamento()

                if (response.data.success) {
                    this.empleadosPorDepartamento = response.data.data.departamentos || []
                    return this.empleadosPorDepartamento
                } else {
                    throw new Error(response.data.message || "Error al obtener datos por departamento")
                }
            } catch (error) {
                console.error("Error al cargar empleados por departamento:", error)
                throw error
            }
        },

        async fetchEstadoEmpleados() {
            try {
                const response = await dashboardApi.getEstadoEmpleados()

                if (response.data.success) {
                    this.estadoEmpleados = response.data.data
                    return this.estadoEmpleados
                } else {
                    throw new Error(response.data.message || "Error al obtener estado de empleados")
                }
            } catch (error) {
                console.error("Error al cargar estado de empleados:", error)
                throw error
            }
        },

        clearData() {
            this.statsData = null
            this.resumen = {
                total_empleados: 0,
                total_empresas: 0,
                total_zonas: 0,
                total_departamentos: 0,
            }
            this.empleadosPorEmpresa = []
            this.empleadosPorZona = []
            this.empleadosPorDepartamento = []
            this.estadoEmpleados = null
            this.lastFetch = null
            this.error = null
        },

        async refreshData() {
            return await this.fetchStats(true)
        },
    },
})
