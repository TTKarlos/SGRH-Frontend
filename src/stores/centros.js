import { defineStore } from "pinia"
import centrosApi from "../api/centros.api"
import { useNotificationStore } from "./notification"
import api from "../api/axios"

export const useCentrosStore = defineStore("centros", {
    state: () => ({
        centros: [],
        loading: false,
        error: null,
        currentCentro: null,
        totalCentros: 0,
    }),

    actions: {
        async fetchCentrosCount() {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await api.get("/centros/count")
                const data = response.data

                if (data.success) {
                    this.totalCentros = data.data.total || 0
                    return this.totalCentros
                } else {
                    throw new Error(data.message || "Error al obtener el conteo de centros")
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al obtener el conteo de centros"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return 0
            } finally {
                this.loading = false
            }
        },

        async fetchCentros(params = {}) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await centrosApi.getAll(params)
                const data = response.data

                if (data.success) {
                    this.centros = data.data.centros || []

                    if (data.data.pagination) {
                        this.totalCentros = data.data.pagination.total || this.centros.length
                    } else {
                        this.totalCentros = this.centros.length
                    }

                    return this.centros
                } else {
                    throw new Error(data.message || "Error al cargar centros")
                }
            } catch (err) {
                console.error("Error al cargar centros:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar centros"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchCentroById(id) {
            this.loading = true
            this.error = null
            this.currentCentro = null
            const notificationStore = useNotificationStore()

            try {
                const response = await centrosApi.getById(id)
                const data = response.data

                if (data.success) {
                    this.currentCentro = data.data.centro
                    return this.currentCentro
                } else {
                    throw new Error(data.message || "Error al cargar el centro")
                }
            } catch (err) {
                console.error("Error al cargar el centro:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar el centro"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return null
            } finally {
                this.loading = false
            }
        },

        async createCentro(centroData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await centrosApi.create(centroData)
                const data = response.data

                if (data.success) {
                    await this.fetchCentros()
                    this.totalCentros++
                    notificationStore.success("Centro creado correctamente")
                    return data.data.centro
                } else {
                    throw new Error(data.message || "Error al crear el centro")
                }
            } catch (err) {
                console.error("Error al crear el centro:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al crear el centro"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return null
            } finally {
                this.loading = false
            }
        },

        async updateCentro(id, centroData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await centrosApi.update(id, centroData)
                const data = response.data

                if (data.success) {
                    this.currentCentro = data.data.centro

                    const index = this.centros.findIndex((c) => c.id_centro === Number(id))
                    if (index !== -1) {
                        this.centros[index] = data.data.centro
                    }

                    notificationStore.success("Centro actualizado correctamente")
                    return this.currentCentro
                } else {
                    throw new Error(data.message || "Error al actualizar el centro")
                }
            } catch (err) {
                console.error("Error al actualizar el centro:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al actualizar el centro"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return null
            } finally {
                this.loading = false
            }
        },

        async deleteCentro(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await centrosApi.delete(id)
                const data = response.data

                if (data.success) {
                    this.centros = this.centros.filter((c) => c.id_centro !== Number(id))

                    if (this.currentCentro && this.currentCentro.id_centro === Number(id)) {
                        this.currentCentro = null
                    }

                    this.totalCentros--
                    notificationStore.success("Centro eliminado correctamente")
                    return true
                } else {
                    throw new Error(data.message || "Error al eliminar el centro")
                }
            } catch (err) {
                console.error("Error al eliminar el centro:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al eliminar el centro"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return false
            } finally {
                this.loading = false
            }
        },
    },
})
