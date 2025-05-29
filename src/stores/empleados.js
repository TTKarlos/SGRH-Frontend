import { defineStore } from "pinia"
import api from "../api/axios"
import { useNotificationStore } from "./notification"
import { useAuthStore } from "./auth"

export const useEmpleadosStore = defineStore("empleados", {
    state: () => ({
        empleados: [],
        currentEmpleado: null,
        loading: false,
        error: null,
        totalEmpleados: 0,
        filters: {
            search: "",
            activo: null,
            id_departamento: "",
            id_centro: "",
        },
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        },
        actividades: []
    }),

    getters: {
        getEmpleados: (state) => state.empleados,
        getCurrentEmpleado: (state) => state.currentEmpleado,
        getLoading: (state) => state.loading,
        getError: (state) => state.error,
        getFilters: (state) => state.filters,
        getPagination: (state) => state.pagination,
        getActividades: (state) => state.actividades
    },

    actions: {
        registrarActividad(tipo, empleado, detalles = {}) {
            const authStore = useAuthStore()
            const usuario = authStore.user?.nombre || "Sistema"
            const fecha = new Date().toISOString()

            const actividad = {
                tipo,
                texto: this.generarTextoActividad(tipo, empleado, detalles),
                fecha,
                timestamp: new Date().getTime(),
                usuario,
                id_empleado: empleado?.id_empleado,
                detalles: {
                    ...detalles,
                    nombre: empleado?.nombre,
                    apellidos: empleado?.apellidos
                }
            }

            this.actividades.unshift(actividad)

            if (this.actividades.length > 50) {
                this.actividades = this.actividades.slice(0, 50)
            }

            try {
                api.post('/actividades', actividad).catch(err => {
                    console.warn("No se pudo guardar la actividad en la API:", err)
                })
            } catch (err) {
                console.warn("Error al guardar actividad:", err)
            }

            return actividad
        },

        generarTextoActividad(tipo, empleado, detalles) {
            const authStore = useAuthStore()
            const usuario = detalles.usuario || authStore.user?.nombre || "Usuario"
            const nombreCompleto = empleado ?
                `${empleado.nombre || ''} ${empleado.apellidos || ""}` :
                detalles.nombreCompleto || "empleado"

            switch (tipo) {
                case 'empleado_create':
                    return `<strong>${usuario}</strong> creó el empleado <strong>${nombreCompleto}</strong>`

                case 'empleado_update':
                    return `<strong>${usuario}</strong> actualizó los datos de <strong>${nombreCompleto}</strong>`

                case 'empleado_delete':
                    return `<strong>${usuario}</strong> eliminó el empleado <strong>${nombreCompleto}</strong>`

                case 'empleado_status':
                    const estado = detalles.activo ? "activó" : "desactivó"
                    return `<strong>${usuario}</strong> ${estado} al empleado <strong>${nombreCompleto}</strong>`

                default:
                    return `<strong>${usuario}</strong> realizó una acción con el empleado <strong>${nombreCompleto}</strong>`
            }
        },

        async fetchEmpleados(params = {}) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const mergedParams = {
                    ...this.filters,
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...params,
                }

                const response = await api.get("/empleados", { params: mergedParams })
                const data = response.data

                if (data.success) {
                    this.empleados = data.data.empleados || []

                    const apiPagination = data.data.pagination || {}
                    this.pagination = {
                        page: apiPagination.page || 1,
                        limit: apiPagination.limit || 10,
                        total: apiPagination.total || 0,
                        totalPages: apiPagination.totalPages || 1,
                    }

                    this.totalEmpleados = this.pagination.total

                    return this.empleados
                } else {
                    throw new Error(data.message || "Error al cargar empleados")
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar empleados"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchEmpleadosCount() {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await api.get("/empleados/count")
                const data = response.data

                if (data.success) {
                    this.totalEmpleados = data.data.total || 0
                    return this.totalEmpleados
                } else {
                    throw new Error(data.message || "Error al obtener el conteo de empleados")
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al obtener el conteo de empleados"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return 0
            } finally {
                this.loading = false
            }
        },

        async fetchEmpleadoById(id) {
            this.loading = true
            this.error = null
            this.currentEmpleado = null
            const notificationStore = useNotificationStore()

            try {
                const response = await api.get(`/empleados/${id}`)
                const data = response.data

                if (data.success) {
                    this.currentEmpleado = data.data.empleado
                    return data.data.empleado
                } else {
                    throw new Error(data.message || "Error al cargar el empleado")
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar el empleado"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return null
            } finally {
                this.loading = false
            }
        },

        async createEmpleado(empleadoData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await api.post("/empleados", empleadoData)
                const data = response.data

                if (data.success) {
                    notificationStore.success("Empleado creado correctamente")

                    this.registrarActividad('empleado_create', data.data.empleado)

                    await this.fetchEmpleados()
                    this.totalEmpleados++
                    return data.data.empleado
                } else {
                    throw new Error(data.message || "Error al crear el empleado")
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al crear el empleado"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return null
            } finally {
                this.loading = false
            }
        },

        async updateEmpleado(id, empleadoData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await api.put(`/empleados/${id}`, empleadoData)
                const data = response.data

                if (data.success) {
                    notificationStore.success("Empleado actualizado correctamente")

                    this.registrarActividad('empleado_update', data.data.empleado)

                    if (this.currentEmpleado && this.currentEmpleado.id_empleado === id) {
                        this.currentEmpleado = data.data.empleado
                    }

                    const index = this.empleados.findIndex((e) => e.id_empleado === id)
                    if (index !== -1) {
                        this.empleados[index] = data.data.empleado
                    }

                    return data.data.empleado
                } else {
                    throw new Error(data.message || "Error al actualizar el empleado")
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al actualizar el empleado"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return null
            } finally {
                this.loading = false
            }
        },

        async deleteEmpleado(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const empleado = this.empleados.find(e => e.id_empleado === id) || this.currentEmpleado

                const response = await api.delete(`/empleados/${id}`)
                const data = response.data

                if (data.success) {
                    notificationStore.success("Empleado eliminado correctamente")

                    if (empleado) {
                        this.registrarActividad('empleado_delete', empleado)
                    }

                    this.empleados = this.empleados.filter((e) => e.id_empleado !== id)
                    this.totalEmpleados--

                    if (this.currentEmpleado && this.currentEmpleado.id_empleado === id) {
                        this.currentEmpleado = null
                    }

                    return true
                } else {
                    throw new Error(data.message || "Error al eliminar el empleado")
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al eliminar el empleado"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return false
            } finally {
                this.loading = false
            }
        },

        async changeEmpleadoStatus(id, activo) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await api.patch(`/empleados/${id}/status`, { activo })
                const data = response.data

                if (data.success) {
                    const statusText = activo ? "activado" : "desactivado"
                    notificationStore.success(`Empleado ${statusText} correctamente`)

                    const empleado = this.empleados.find(e => e.id_empleado === id) || this.currentEmpleado

                    if (empleado) {
                        this.registrarActividad('empleado_status', empleado, { activo })
                    }

                    if (this.currentEmpleado && this.currentEmpleado.id_empleado === id) {
                        this.currentEmpleado = { ...this.currentEmpleado, activo }
                    }

                    const index = this.empleados.findIndex((e) => e.id_empleado === id)
                    if (index !== -1) {
                        this.empleados[index] = { ...this.empleados[index], activo }
                    }

                    return true
                } else {
                    throw new Error(data.message || `Error al ${activo ? "activar" : "desactivar"} el empleado`)
                }
            } catch (err) {
                const errorMsg =
                    err.response?.data?.message || err.message || `Error al ${activo ? "activar" : "desactivar"} el empleado`
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return false
            } finally {
                this.loading = false
            }
        },

        updateFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters }
            this.pagination.page = 1
        },

        resetFilters() {
            this.filters = {
                search: "",
                activo: null,
                id_departamento: "",
                id_centro: "",
            }
            this.pagination.page = 1
        },

        setPage(page) {
            this.pagination.page = page
        },
    },
})