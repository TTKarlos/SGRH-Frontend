import { defineStore } from "pinia"
import empleadosApi from "../api/empleados.api"

export const useEmpleadosStore = defineStore("empleados", {
    state: () => ({
        empleados: [],
        loading: false,
        error: null,
        currentEmpleado: null,
        filters: {
            search: "",
            activo: null,
            id_departamento: "",
            id_centro: ""
        },
        pagination: {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 1
        }
    }),

    actions: {
        async fetchEmpleados() {
            this.loading = true
            this.error = null

            try {
                const params = {
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...this.filters
                }

                const response = await empleadosApi.getAll(params)
                const data = response.data

                if (data.success) {
                    this.empleados = data.data.empleados || []

                    const apiPagination = data.data.pagination || {}
                    this.pagination = {
                        page: apiPagination.page || 1,
                        limit: apiPagination.limit || 10,
                        totalItems: apiPagination.total || 0,
                        totalPages: apiPagination.totalPages || 1
                    }

                    console.log('Paginación actualizada:', this.pagination)
                    return this.empleados
                } else {
                    throw new Error(data.message || "Error al cargar empleados")
                }
            } catch (err) {
                console.error("Error al cargar empleados:", err)
                this.error = err.message || "Error al cargar empleados"
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchEmpleadoById(id) {
            this.loading = true
            this.error = null
            this.currentEmpleado = null

            try {
                const response = await empleadosApi.getById(id)
                const data = response.data

                if (data.success) {
                    this.currentEmpleado = data.data.empleado
                    return this.currentEmpleado
                } else {
                    throw new Error(data.message || "Error al cargar el empleado")
                }
            } catch (err) {
                console.error("Error al cargar el empleado:", err)
                this.error = err.message || "Error al cargar el empleado"
                return null
            } finally {
                this.loading = false
            }
        },

        async createEmpleado(empleadoData) {
            this.loading = true
            this.error = null

            try {
                const response = await empleadosApi.create(empleadoData)
                const data = response.data

                if (data.success) {
                    await this.fetchEmpleados()
                    return data.data.empleado
                } else {
                    throw new Error(data.message || "Error al crear el empleado")
                }
            } catch (err) {
                console.error("Error al crear el empleado:", err)
                this.error = err.message || "Error al crear el empleado"
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateEmpleado(id, empleadoData) {
            this.loading = true
            this.error = null

            try {
                const response = await empleadosApi.update(id, empleadoData)
                const data = response.data

                if (data.success) {
                    this.currentEmpleado = data.data.empleado

                    const index = this.empleados.findIndex(e => e.id_empleado === Number(id))
                    if (index !== -1) {
                        this.empleados[index] = data.data.empleado
                    }

                    return this.currentEmpleado
                } else {
                    throw new Error(data.message || "Error al actualizar el empleado")
                }
            } catch (err) {
                console.error("Error al actualizar el empleado:", err)
                this.error = err.message || "Error al actualizar el empleado"
                return null
            } finally {
                this.loading = false
            }
        },

        async deleteEmpleado(id) {
            this.loading = true
            this.error = null

            try {
                const response = await empleadosApi.delete(id)
                const data = response.data

                if (data.success) {
                    this.empleados = this.empleados.filter(
                        e => e.id_empleado !== Number(id)
                    )

                    if (this.currentEmpleado && this.currentEmpleado.id_empleado === Number(id)) {
                        this.currentEmpleado = null
                    }

                    return true
                } else {
                    throw new Error(data.message || "Error al eliminar el empleado")
                }
            } catch (err) {
                console.error("Error al eliminar el empleado:", err)
                this.error = err.message || "Error al eliminar el empleado"
                return false
            } finally {
                this.loading = false
            }
        },

        async changeEmpleadoStatus(id, activo) {
            this.loading = true
            this.error = null

            try {
                console.log(`Store: Cambiando estado a ${activo ? 'activo' : 'inactivo'}`)
                const response = await empleadosApi.changeStatus(id, activo)
                const data = response.data

                if (data.success) {
                    if (this.currentEmpleado && this.currentEmpleado.id_empleado === Number(id)) {
                        this.currentEmpleado.activo = activo
                    }

                    const index = this.empleados.findIndex(e => e.id_empleado === Number(id))
                    if (index !== -1) {
                        this.empleados[index].activo = activo
                    }

                    return true
                } else {
                    throw new Error(data.message || `Error al ${activo ? 'activar' : 'desactivar'} el empleado`)
                }
            } catch (err) {
                console.error("Error al cambiar estado del empleado:", err)
                this.error = err.message || `Error al ${activo ? 'activar' : 'desactivar'} el empleado`
                return false
            } finally {
                this.loading = false
            }
        },

        setFilters(filters) {
            this.filters = { ...filters }
            this.pagination.page = 1
            this.fetchEmpleados()
        },

        resetFilters() {
            this.filters = {
                search: "",
                activo: null,
                id_departamento: "",
                id_centro: ""
            }
            this.pagination.page = 1
            this.fetchEmpleados()
        },

        setPage(page) {
            this.pagination.page = page
            this.fetchEmpleados()
        }
    }
})