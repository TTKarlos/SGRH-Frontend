import { defineStore } from "pinia"
import tiposContratoApi from "../api/tiposContrato.api"
import { useNotificationStore } from "./notification"

export const useTiposContratoStore = defineStore("tiposContrato", {
    state: () => ({
        tiposContrato: [],
        loading: false,
        error: null,
        initialized: false,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasMore: false,
        },
    }),

    getters: {
        getTipoContratoById: (state) => (id) => {
            if (!id) return null
            const idNum = Number.parseInt(id)
            return state.tiposContrato.find((tipo) => Number.parseInt(tipo.id_tipo_contrato) === idNum) || null
        },

        getTipoContratoNombre: (state) => (id) => {
            if (!id) return "Desconocido"
            const idNum = Number.parseInt(id)
            const tipo = state.tiposContrato.find((tipo) => Number.parseInt(tipo.id_tipo_contrato) === idNum)
            return tipo ? tipo.nombre : "Desconocido"
        },

        getTipoContratoCodigo: (state) => (id) => {
            if (!id) return "---"
            const idNum = Number.parseInt(id)
            const tipo = state.tiposContrato.find((tipo) => Number.parseInt(tipo.id_tipo_contrato) === idNum)
            return tipo ? tipo.codigo : "---"
        },
    },

    actions: {
        async fetchTiposContrato(params = {}) {
            const notificationStore = useNotificationStore()

            if (this.initialized && this.tiposContrato.length > 0 && Object.keys(params).length === 0) {
                console.log("Usando datos en caché:", this.tiposContrato)
                return this.tiposContrato
            }

            this.loading = true
            this.error = null

            try {
                console.log("Cargando tipos de contrato desde la API con parámetros:", params)
                const response = await tiposContratoApi.getAll(params)

                console.log("Respuesta completa de la API:", response)
                console.log("Datos de la respuesta:", response.data)

                if (response.data && response.data.data) {
                    console.log("Estructura de datos encontrada:", response.data.data)

                    if (response.data.data.tiposContrato) {
                        console.log("Tipos de contrato encontrados:", response.data.data.tiposContrato)
                        console.log("Información de paginación:", response.data.data.pagination)

                        this.tiposContrato = response.data.data.tiposContrato
                        this.pagination = response.data.data.pagination || this.pagination
                    } else if (Array.isArray(response.data.data)) {
                        console.log("Array de tipos de contrato encontrado:", response.data.data)
                        this.tiposContrato = response.data.data
                    } else {
                        console.warn("Formato de datos no reconocido:", response.data.data)
                        this.tiposContrato = []
                    }
                } else if (Array.isArray(response.data)) {
                    console.log("Array directo encontrado:", response.data)
                    this.tiposContrato = response.data
                } else {
                    console.warn("No se encontraron datos en la respuesta:", response.data)
                    this.tiposContrato = []
                }

                this.initialized = true

                console.log("Tipos de contrato cargados en el store:", this.tiposContrato)
                return this.tiposContrato
            } catch (error) {
                console.error("Error al cargar tipos de contrato:", error)
                console.error("Detalles del error:", error.response?.data || error.message)

                const errorMessage = error.response?.data?.message || "Error al cargar los tipos de contrato"
                this.error = errorMessage

                notificationStore.error(errorMessage, "Error")

                this.initialized = true

                return this.tiposContrato
            } finally {
                this.loading = false
            }
        },

        async getTipoContrato(id) {
            if (!id) return null
            const notificationStore = useNotificationStore()

            if (!this.initialized) {
                await this.fetchTiposContrato()
            }

            const idNum = Number.parseInt(id)
            const tipoExistente = this.getTipoContratoById(idNum)
            if (tipoExistente) return tipoExistente

            this.loading = true

            try {
                const response = await tiposContratoApi.getById(idNum)
                let tipoContrato = null

                if (response.data && response.data.data) {
                    tipoContrato = response.data.data
                } else if (response.data) {
                    tipoContrato = response.data
                }

                if (!tipoContrato) return null

                if (
                    !this.tiposContrato.some(
                        (t) => Number.parseInt(t.id_tipo_contrato) === Number.parseInt(tipoContrato.id_tipo_contrato),
                    )
                ) {
                    this.tiposContrato.push(tipoContrato)
                }

                return tipoContrato
            } catch (error) {
                console.error(`Error al obtener tipo de contrato con ID ${id}:`, error)
                notificationStore.error("Error al obtener el tipo de contrato", "Error")
                return null
            } finally {
                this.loading = false
            }
        },

        async createTipoContrato(tipoContratoData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                console.log("Creando tipo de contrato con datos:", tipoContratoData)
                const response = await tiposContratoApi.create(tipoContratoData)
                console.log("Respuesta de creación:", response)

                let nuevoTipoContrato = null
                if (response.data && response.data.data) {
                    nuevoTipoContrato = response.data.data
                } else if (response.data) {
                    nuevoTipoContrato = response.data
                }

                if (nuevoTipoContrato) {
                    console.log("Nuevo tipo de contrato creado:", nuevoTipoContrato)
                    this.tiposContrato.push(nuevoTipoContrato)
                    notificationStore.success("Tipo de contrato creado correctamente", "Éxito")
                }

                return nuevoTipoContrato
            } catch (error) {
                console.error("Error al crear tipo de contrato:", error)
                console.error("Detalles del error:", error.response?.data || error.message)

                const errorMessage = error.response?.data?.message || "Error al crear el tipo de contrato"
                this.error = errorMessage

                notificationStore.error(errorMessage, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateTipoContrato(id, tipoContratoData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                console.log(`Actualizando tipo de contrato con ID ${id} con datos:`, tipoContratoData)
                const response = await tiposContratoApi.update(id, tipoContratoData)
                console.log("Respuesta de actualización:", response)

                let tipoActualizado = null
                if (response.data && response.data.data) {
                    tipoActualizado = response.data.data
                } else if (response.data) {
                    tipoActualizado = response.data
                }

                if (tipoActualizado) {
                    console.log("Tipo de contrato actualizado:", tipoActualizado)

                    const index = this.tiposContrato.findIndex((t) => Number.parseInt(t.id_tipo_contrato) === Number.parseInt(id))

                    if (index !== -1) {
                        this.tiposContrato[index] = { ...tipoActualizado }
                        console.log("Tipo de contrato actualizado en el store:", this.tiposContrato[index])
                    } else {
                        console.warn(`No se encontró el tipo de contrato con ID ${id} en el store`)
                    }

                    notificationStore.success("Tipo de contrato actualizado correctamente", "Éxito")
                }

                return tipoActualizado
            } catch (error) {
                console.error("Error al actualizar tipo de contrato:", error)
                console.error("Detalles del error:", error.response?.data || error.message)

                const errorMessage = error.response?.data?.message || "Error al actualizar el tipo de contrato"
                this.error = errorMessage

                notificationStore.error(errorMessage, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteTipoContrato(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                console.log(`Eliminando tipo de contrato con ID ${id}`)
                await tiposContratoApi.delete(id)

                this.tiposContrato = this.tiposContrato.filter(
                    (t) => Number.parseInt(t.id_tipo_contrato) !== Number.parseInt(id),
                )
                console.log("Tipo de contrato eliminado del store")

                notificationStore.success("Tipo de contrato eliminado correctamente", "Éxito")
                return true
            } catch (error) {
                console.error("Error al eliminar tipo de contrato:", error)
                console.error("Detalles del error:", error.response?.data || error.message)

                if (
                    error.response?.data?.message?.includes("tiene contratos asociados") ||
                    error.message?.includes("tiene contratos asociados")
                ) {
                    const errorMessage = "No se puede eliminar el tipo de contrato porque tiene contratos asociados"
                    this.error = errorMessage
                    notificationStore.error(errorMessage, "Error")
                } else {
                    const errorMessage = error.response?.data?.message || "Error al eliminar el tipo de contrato"
                    this.error = errorMessage
                    notificationStore.error(errorMessage, "Error")
                }

                throw error
            } finally {
                this.loading = false
            }
        },

        setTiposContrato(tipos) {
            if (Array.isArray(tipos) && tipos.length > 0) {
                this.tiposContrato = tipos
                this.initialized = true
            }
        },

        resetState() {
            this.tiposContrato = []
            this.loading = false
            this.error = null
            this.initialized = false
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
