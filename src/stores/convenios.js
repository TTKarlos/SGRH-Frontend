import { defineStore } from "pinia"
import conveniosApi from "../api/convenios.api"
import { useNotificationStore } from "./notification"
import categoriasConvenioApi from "../api/categoriasConvenio.api.js"

export const useConveniosStore = defineStore("convenios", {
    state: () => ({
        convenios: [],
        loading: false,
        error: null,
        currentConvenio: null,
    }),

    getters: {
        getConvenioById: (state) => (id) => {
            if (!id) return null
            return state.convenios.find((convenio) => convenio.id_convenio === Number(id)) || null
        },

        getConvenioNombre: (state) => (id) => {
            if (!id) return "Desconocido"
            const convenio = state.convenios.find((convenio) => convenio.id_convenio === Number(id))
            return convenio ? convenio.nombre : "Desconocido"
        },

        getConvenioCodigo: (state) => (id) => {
            if (!id) return "---"
            const convenio = state.convenios.find((convenio) => convenio.id_convenio === Number(id))
            return convenio ? convenio.codigo : "---"
        },
    },

    actions: {
        async fetchConvenios(params = {}) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await conveniosApi.getAll(params)
                const data = response.data

                if (data.success) {
                    const convenios = data.data.convenios || []

                    const conveniosPromises = convenios.map(async (convenio) => {
                        try {
                            const categoriasResponse = await categoriasConvenioApi.getByConvenio(convenio.id_convenio)
                            if (categoriasResponse.data && categoriasResponse.data.success) {
                                convenio.CategoriaConvenios = categoriasResponse.data.data.categorias || []
                            } else {
                                convenio.CategoriaConvenios = []
                            }
                        } catch (error) {
                            console.error(`Error al cargar categorías para convenio ${convenio.id_convenio}:`, error)
                            convenio.CategoriaConvenios = []
                        }
                        return convenio
                    })

                    this.convenios = await Promise.all(conveniosPromises)
                    return this.convenios
                } else {
                    throw new Error(data.message || "Error al cargar convenios")
                }
            } catch (err) {
                console.error("Error al cargar convenios:", err)
                this.error = err.message || "Error al cargar convenios"
                notificationStore.error(this.error, "Error")
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchConvenioById(id) {
            this.loading = true
            this.error = null
            this.currentConvenio = null
            const notificationStore = useNotificationStore()

            try {
                const response = await conveniosApi.getById(id)
                const data = response.data

                if (data.success) {
                    const convenio = data.data.convenio

                    if (!convenio.CategoriaConvenios) {
                        convenio.CategoriaConvenios = []
                    }

                    this.currentConvenio = convenio

                    const index = this.convenios.findIndex((c) => c.id_convenio === Number(id))
                    if (index !== -1) {
                        this.convenios[index] = convenio
                    } else {
                        this.convenios.push(convenio)
                    }

                    return this.currentConvenio
                } else {
                    throw new Error(data.message || "Error al cargar el convenio")
                }
            } catch (err) {
                console.error("Error al cargar el convenio:", err)
                this.error = err.message || "Error al cargar el convenio"
                notificationStore.error(this.error, "Error")
                return null
            } finally {
                this.loading = false
            }
        },

        async createConvenio(convenioData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await conveniosApi.create(convenioData)
                const data = response.data

                if (data.success) {
                    const nuevoConvenio = data.data.convenio

                    if (!nuevoConvenio.CategoriaConvenios) {
                        nuevoConvenio.CategoriaConvenios = []
                    }

                    this.convenios.push(nuevoConvenio)
                    notificationStore.success("Convenio creado correctamente", "Éxito")
                    return nuevoConvenio
                } else {
                    throw new Error(data.message || "Error al crear el convenio")
                }
            } catch (err) {
                console.error("Error al crear el convenio:", err)
                this.error = err.message || "Error al crear el convenio"
                notificationStore.error(this.error, "Error")
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateConvenio(id, convenioData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await conveniosApi.update(id, convenioData)
                const data = response.data

                if (data.success) {
                    const convenioActualizado = data.data.convenio
                    this.currentConvenio = convenioActualizado

                    const index = this.convenios.findIndex((c) => c.id_convenio === Number(id))
                    if (index !== -1) {
                        const categorias = this.convenios[index].CategoriaConvenios || []
                        convenioActualizado.CategoriaConvenios = categorias
                        this.convenios[index] = convenioActualizado
                    }

                    notificationStore.success("Convenio actualizado correctamente", "Éxito")
                    return convenioActualizado
                } else {
                    throw new Error(data.message || "Error al actualizar el convenio")
                }
            } catch (err) {
                console.error("Error al actualizar el convenio:", err)
                this.error = err.message || "Error al actualizar el convenio"
                notificationStore.error(this.error, "Error")
                throw err
            } finally {
                this.loading = false
            }
        },

        async deleteConvenio(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await conveniosApi.delete(id)
                const data = response.data

                if (data.success) {
                    this.convenios = this.convenios.filter((c) => c.id_convenio !== Number(id))

                    if (this.currentConvenio && this.currentConvenio.id_convenio === Number(id)) {
                        this.currentConvenio = null
                    }

                    notificationStore.success("Convenio eliminado correctamente", "Éxito")
                    return true
                } else {
                    throw new Error(data.message || "Error al eliminar el convenio")
                }
            } catch (err) {
                console.error("Error al eliminar el convenio:", err)
                this.error = err.message || "Error al eliminar el convenio"
                notificationStore.error(this.error, "Error")
                throw err
            } finally {
                this.loading = false
            }
        },

        updateCategorias(idConvenio, categorias) {
            const index = this.convenios.findIndex((c) => c.id_convenio === Number(idConvenio))
            if (index !== -1) {
                this.convenios[index].CategoriaConvenios = categorias
            }

            if (this.currentConvenio && this.currentConvenio.id_convenio === Number(idConvenio)) {
                this.currentConvenio.CategoriaConvenios = categorias
            }
        },
    },
})
