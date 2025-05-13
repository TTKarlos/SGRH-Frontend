import { defineStore } from 'pinia'
import categoriasConvenioApi from '../api/categoriasConvenio.api.js'

export const useCategoriasConvenioStore = defineStore('categoriasConvenio', {
    state: () => ({
        categorias: [],
        categoriasByConvenio: {},
        loading: false,
        error: null
    }),

    getters: {
        getCategoriaById: (state) => (id) => {
            return state.categorias.find(categoria => categoria.id_categoria === parseInt(id))
        },

        getCategoriasByConvenioId: (state) => (idConvenio) => {
            if (!idConvenio) return []
            return state.categoriasByConvenio[idConvenio] || []
        }
    },

    actions: {
        async fetchCategorias() {
            this.loading = true
            this.error = null

            try {
                const response = await categoriasConvenioApi.getAll()
                this.categorias = response.data.data || []
            } catch (error) {
                console.error('Error en fetchCategorias:', error)
                this.error = 'Error al cargar las categorías'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchCategoriaById(id) {
            this.loading = true
            this.error = null

            try {
                const response = await categoriasConvenioApi.getById(id)
                return response.data.data
            } catch (error) {
                console.error('Error en fetchCategoriaById:', error)
                this.error = 'Error al cargar la categoría'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchCategoriasByConvenio(idConvenio) {
            if (!idConvenio) return []

            this.loading = true
            this.error = null

            try {
                const response = await categoriasConvenioApi.getByConvenio(idConvenio)
                const categorias = response.data.data || []
                this.categoriasByConvenio[idConvenio] = categorias
                return categorias
            } catch (error) {
                console.error('Error en fetchCategoriasByConvenio:', error)
                this.error = 'Error al cargar las categorías del convenio'
                throw error
            } finally {
                this.loading = false
            }
        },

        async createCategoria(categoriaData) {
            this.loading = true
            this.error = null

            try {
                const response = await categoriasConvenioApi.create(categoriaData)
                const nuevaCategoria = response.data.data
                this.categorias.push(nuevaCategoria)

                if (nuevaCategoria.id_convenio && this.categoriasByConvenio[nuevaCategoria.id_convenio]) {
                    this.categoriasByConvenio[nuevaCategoria.id_convenio].push(nuevaCategoria)
                }

                return nuevaCategoria
            } catch (error) {
                console.error('Error en createCategoria:', error)
                this.error = 'Error al crear la categoría'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateCategoria(id, categoriaData) {
            this.loading = true
            this.error = null

            try {
                const response = await categoriasConvenioApi.update(id, categoriaData)
                const categoriaActualizada = response.data.data

                const index = this.categorias.findIndex(c => c.id_categoria === parseInt(id))
                if (index !== -1) {
                    this.categorias[index] = categoriaActualizada
                }

                if (categoriaActualizada.id_convenio) {
                    const convenioId = categoriaActualizada.id_convenio
                    if (this.categoriasByConvenio[convenioId]) {
                        const indexInConvenio = this.categoriasByConvenio[convenioId].findIndex(
                            c => c.id_categoria === parseInt(id)
                        )
                        if (indexInConvenio !== -1) {
                            this.categoriasByConvenio[convenioId][indexInConvenio] = categoriaActualizada
                        }
                    }
                }

                return categoriaActualizada
            } catch (error) {
                console.error('Error en updateCategoria:', error)
                this.error = 'Error al actualizar la categoría'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteCategoria(id) {
            this.loading = true
            this.error = null

            try {
                const categoriaToDelete = this.getCategoriaById(id)
                await categoriasConvenioApi.delete(id)

                this.categorias = this.categorias.filter(c => c.id_categoria !== parseInt(id))

                if (categoriaToDelete && categoriaToDelete.id_convenio) {
                    const convenioId = categoriaToDelete.id_convenio
                    if (this.categoriasByConvenio[convenioId]) {
                        this.categoriasByConvenio[convenioId] = this.categoriasByConvenio[convenioId].filter(
                            c => c.id_categoria !== parseInt(id)
                        )
                    }
                }

                return true
            } catch (error) {
                console.error('Error en deleteCategoria:', error)
                this.error = 'Error al eliminar la categoría'
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})