import { defineStore } from "pinia"
import categoriasConvenioApi from "../api/categoriasConvenio.api.js"
import { useNotificationStore } from "./notification"

export const useCategoriasConvenioStore = defineStore("categoriasConvenio", {
    state: () => ({
        categorias: [],
        loading: false,
        error: null,
        currentCategoria: null,
    }),

    getters: {
        getCategoriasPorConvenio: (state) => (idConvenio) => {
            if (!idConvenio) return state.categorias

            return state.categorias.filter((categoria) => categoria.id_convenio === Number(idConvenio))
        },
    },

    actions: {
        async fetchCategorias() {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await categoriasConvenioApi.getAll()
                const data = response.data

                if (data.success) {
                    this.categorias = data.data.categorias || []
                    return this.categorias
                } else {
                    throw new Error(data.message || "Error al cargar categorías")
                }
            } catch (err) {
                console.error("Error al cargar categorías:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar categorías"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchCategoriasByConvenio(idConvenio) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await categoriasConvenioApi.getByConvenio(idConvenio)
                const data = response.data

                if (data.success) {
                    const categorias = data.data.categorias || []

                    this.categorias = this.categorias.filter((c) => c.id_convenio !== Number(idConvenio))
                    this.categorias.push(...categorias)

                    return categorias
                } else {
                    throw new Error(data.message || "Error al cargar categorías por convenio")
                }
            } catch (err) {
                console.error("Error al cargar categorías por convenio:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar categorías por convenio"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchCategoriaById(id) {
            this.loading = true
            this.error = null
            this.currentCategoria = null
            const notificationStore = useNotificationStore()

            try {
                const response = await categoriasConvenioApi.getById(id)
                const data = response.data

                if (data.success) {
                    this.currentCategoria = data.data.categoria
                    return this.currentCategoria
                } else {
                    throw new Error(data.message || "Error al cargar la categoría")
                }
            } catch (err) {
                console.error("Error al cargar la categoría:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar la categoría"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return null
            } finally {
                this.loading = false
            }
        },

        async createCategoria(categoriaData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await categoriasConvenioApi.create(categoriaData)
                const data = response.data

                if (data.success) {
                    const nuevaCategoria = data.data.categoria
                    this.categorias.push(nuevaCategoria)
                    notificationStore.success("Categoría creada correctamente")
                    return nuevaCategoria
                } else {
                    throw new Error(data.message || "Error al crear la categoría")
                }
            } catch (err) {
                console.error("Error al crear la categoría:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al crear la categoría"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateCategoria(id, categoriaData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await categoriasConvenioApi.update(id, categoriaData)
                const data = response.data

                if (data.success) {
                    const categoriaActualizada = data.data.categoria
                    this.currentCategoria = categoriaActualizada

                    const index = this.categorias.findIndex((c) => c.id_categoria === Number(id))
                    if (index !== -1) {
                        this.categorias[index] = categoriaActualizada
                    }

                    notificationStore.success("Categoría actualizada correctamente")
                    return categoriaActualizada
                } else {
                    throw new Error(data.message || "Error al actualizar la categoría")
                }
            } catch (err) {
                console.error("Error al actualizar la categoría:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al actualizar la categoría"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw err
            } finally {
                this.loading = false
            }
        },

        async deleteCategoria(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await categoriasConvenioApi.delete(id)
                const data = response.data

                if (data.success) {
                    this.categorias = this.categorias.filter((c) => c.id_categoria !== Number(id))

                    if (this.currentCategoria && this.currentCategoria.id_categoria === Number(id)) {
                        this.currentCategoria = null
                    }

                    notificationStore.success("Categoría eliminada correctamente")
                    return true
                } else {
                    throw new Error(data.message || "Error al eliminar la categoría")
                }
            } catch (err) {
                console.error("Error al eliminar la categoría:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al eliminar la categoría"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw err
            } finally {
                this.loading = false
            }
        },
    },
})
