import { defineStore } from "pinia"
import empresasApi from "../api/empresas.api"
import { useNotificationStore } from "./notification"
import api from "../api/axios"

export const useEmpresasStore = defineStore("empresas", {
    state: () => ({
        empresas: [],
        loading: false,
        error: null,
        initialized: false,
        totalEmpresas: 0,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasMore: false,
        },
    }),

    getters: {
        getEmpresaById: (state) => (id) => {
            if (!id) return null
            const idNum = Number.parseInt(id)
            return state.empresas.find((empresa) => Number.parseInt(empresa.id_empresa) === idNum) || null
        },

        getEmpresaNombre: (state) => (id) => {
            if (!id) return "Desconocida"
            const idNum = Number.parseInt(id)
            const empresa = state.empresas.find((empresa) => Number.parseInt(empresa.id_empresa) === idNum)
            return empresa ? empresa.nombre : "Desconocida"
        },

        getEmpresaCif: (state) => (id) => {
            if (!id) return "---"
            const idNum = Number.parseInt(id)
            const empresa = state.empresas.find((empresa) => Number.parseInt(empresa.id_empresa) === idNum)
            return empresa ? empresa.cif : "---"
        },
    },

    actions: {
        async fetchEmpresasCount() {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await api.get("/empresas/count")
                const data = response.data

                if (data.success) {
                    this.totalEmpresas = data.data.total || 0
                    return this.totalEmpresas
                } else {
                    throw new Error(data.message || "Error al obtener el conteo de empresas")
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al obtener el conteo de empresas"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return 0
            } finally {
                this.loading = false
            }
        },

        async fetchEmpresas(params = {}) {
            const notificationStore = useNotificationStore()

            if (this.initialized && this.empresas.length > 0 && Object.keys(params).length === 0) {
                return this.empresas
            }

            this.loading = true
            this.error = null

            try {
                const response = await empresasApi.getAll(params)

                if (response.data && response.data.data) {
                    if (response.data.data.empresas) {
                        this.empresas = response.data.data.empresas
                        this.pagination = response.data.data.pagination || this.pagination
                        this.totalEmpresas = this.pagination.total || this.empresas.length
                    } else if (Array.isArray(response.data.data)) {
                        this.empresas = response.data.data
                        this.totalEmpresas = this.empresas.length
                    } else {
                        console.warn("Formato de datos no reconocido:", response.data.data)
                        this.empresas = []
                        this.totalEmpresas = 0
                    }
                } else if (Array.isArray(response.data)) {
                    this.empresas = response.data
                    this.totalEmpresas = this.empresas.length
                } else {
                    console.warn("No se encontraron datos en la respuesta:", response.data)
                    this.empresas = []
                    this.totalEmpresas = 0
                }

                this.initialized = true

                return this.empresas
            } catch (error) {
                console.error("Error al cargar empresas:", error)
                const errorMessage = error.response?.data?.message || "Error al cargar las empresas"
                this.error = errorMessage
                notificationStore.error(errorMessage, "Error")

                this.initialized = true

                return this.empresas
            } finally {
                this.loading = false
            }
        },

        async getEmpresa(id) {
            if (!id) return null

            if (!this.initialized) {
                await this.fetchEmpresas()
            }

            const idNum = Number.parseInt(id)
            const empresaExistente = this.getEmpresaById(idNum)
            if (empresaExistente) return empresaExistente

            this.loading = true
            const notificationStore = useNotificationStore()

            try {
                const response = await empresasApi.getById(idNum)
                let empresa = null

                if (response.data && response.data.data) {
                    empresa = response.data.data
                } else if (response.data) {
                    empresa = response.data
                }

                if (!empresa) return null

                if (!this.empresas.some((e) => Number.parseInt(e.id_empresa) === Number.parseInt(empresa.id_empresa))) {
                    this.empresas.push(empresa)
                }

                return empresa
            } catch (error) {
                console.error(`Error al obtener empresa con ID ${id}:`, error)
                notificationStore.error("Error al obtener la empresa", "Error")
                return null
            } finally {
                this.loading = false
            }
        },

        async createEmpresa(empresaData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await empresasApi.create(empresaData)

                let nuevaEmpresa = null
                if (response.data && response.data.data) {
                    nuevaEmpresa = response.data.data
                } else if (response.data) {
                    nuevaEmpresa = response.data
                }

                if (nuevaEmpresa) {
                    this.empresas.push(nuevaEmpresa)
                    this.totalEmpresas++
                    notificationStore.success("Empresa creada correctamente", "Éxito")
                }

                return nuevaEmpresa
            } catch (error) {
                console.error("Error al crear empresa:", error)
                const errorMessage = error.response?.data?.message || "Error al crear la empresa"
                this.error = errorMessage
                notificationStore.error(errorMessage, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateEmpresa(id, empresaData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await empresasApi.update(id, empresaData)

                let empresaActualizada = null
                if (response.data && response.data.data) {
                    empresaActualizada = response.data.data
                } else if (response.data) {
                    empresaActualizada = response.data
                }

                if (empresaActualizada) {
                    const index = this.empresas.findIndex((e) => Number.parseInt(e.id_empresa) === Number.parseInt(id))

                    if (index !== -1) {
                        this.empresas[index] = { ...empresaActualizada }
                    } else {
                        console.warn(`No se encontró la empresa con ID ${id} en el store`)
                    }

                    notificationStore.success("Empresa actualizada correctamente", "Éxito")
                }

                return empresaActualizada
            } catch (error) {
                console.error("Error al actualizar empresa:", error)
                const errorMessage = error.response?.data?.message || "Error al actualizar la empresa"
                this.error = errorMessage
                notificationStore.error(errorMessage, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteEmpresa(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                await empresasApi.delete(id)

                this.empresas = this.empresas.filter((e) => Number.parseInt(e.id_empresa) !== Number.parseInt(id))
                this.totalEmpresas--

                notificationStore.success("Empresa eliminada correctamente", "Éxito")
                return true
            } catch (error) {
                console.error("Error al eliminar empresa:", error)

                if (
                    error.response?.data?.message?.includes("tiene empleados asociados") ||
                    error.message?.includes("tiene empleados asociados")
                ) {
                    const errorMessage = "No se puede eliminar la empresa porque tiene empleados asociados"
                    this.error = errorMessage
                    notificationStore.error(errorMessage, "Error")
                } else {
                    const errorMessage = error.response?.data?.message || "Error al eliminar la empresa"
                    this.error = errorMessage
                    notificationStore.error(errorMessage, "Error")
                }

                throw error
            } finally {
                this.loading = false
            }
        },

        setEmpresas(empresas) {
            if (Array.isArray(empresas) && empresas.length > 0) {
                this.empresas = empresas
                this.totalEmpresas = empresas.length
                this.initialized = true
            }
        },

        resetState() {
            this.empresas = []
            this.loading = false
            this.error = null
            this.initialized = false
            this.totalEmpresas = 0
            this.pagination = {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                hasMore: false,
            }
        },
    },
})
