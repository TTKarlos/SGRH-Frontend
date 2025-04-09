import { defineStore } from "pinia"
import centrosApi from "../api/centros.api"

export const useCentrosStore = defineStore("centros", {
    state: () => ({
        centros: [],
        loading: false,
        error: null,
        currentCentro: null,
    }),

    actions: {
        async fetchCentros() {
            this.loading = true
            this.error = null

            try {
                const response = await centrosApi.getAll()
                const data = response.data

                if (data.success) {
                    this.centros = data.data.centros || []
                    return this.centros
                } else {
                    throw new Error(data.message || "Error al cargar centros")
                }
            } catch (err) {
                console.error("Error al cargar centros:", err)
                this.error = err.message || "Error al cargar centros"
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchCentroById(id) {
            this.loading = true
            this.error = null
            this.currentCentro = null

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
                this.error = err.message || "Error al cargar el centro"
                return null
            } finally {
                this.loading = false
            }
        },

        async createCentro(centroData) {
            this.loading = true
            this.error = null

            try {
                const response = await centrosApi.create(centroData)
                const data = response.data

                if (data.success) {
                    await this.fetchCentros()
                    return data.data.centro
                } else {
                    throw new Error(data.message || "Error al crear el centro")
                }
            } catch (err) {
                console.error("Error al crear el centro:", err)
                this.error = err.message || "Error al crear el centro"
                return null
            } finally {
                this.loading = false
            }
        },

        async updateCentro(id, centroData) {
            this.loading = true
            this.error = null

            try {
                const response = await centrosApi.update(id, centroData)
                const data = response.data

                if (data.success) {
                    this.currentCentro = data.data.centro

                    const index = this.centros.findIndex(c => c.id_centro === Number(id))
                    if (index !== -1) {
                        this.centros[index] = data.data.centro
                    }

                    return this.currentCentro
                } else {
                    throw new Error(data.message || "Error al actualizar el centro")
                }
            } catch (err) {
                console.error("Error al actualizar el centro:", err)
                this.error = err.message || "Error al actualizar el centro"
                return null
            } finally {
                this.loading = false
            }
        },

        async deleteCentro(id) {
            this.loading = true
            this.error = null

            try {
                const response = await centrosApi.delete(id)
                const data = response.data

                if (data.success) {
                    this.centros = this.centros.filter(
                        c => c.id_centro !== Number(id)
                    )

                    if (this.currentCentro && this.currentCentro.id_centro === Number(id)) {
                        this.currentCentro = null
                    }

                    return true
                } else {
                    throw new Error(data.message || "Error al eliminar el centro")
                }
            } catch (err) {
                console.error("Error al eliminar el centro:", err)
                this.error = err.message || "Error al eliminar el centro"
                return false
            } finally {
                this.loading = false
            }
        }
    }
})