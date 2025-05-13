import { defineStore } from 'pinia'
import conveniosApi from '../api/convenios.api.js'

export const useConveniosStore = defineStore('convenios', {
    state: () => ({
        convenios: [],
        loading: false,
        error: null
    }),

    getters: {
        getConvenioById: (state) => (id) => {
            return state.convenios.find(convenio => convenio.id_convenio === parseInt(id))
        }
    },

    actions: {
        async fetchConvenios() {
            this.loading = true
            this.error = null

            try {
                const response = await conveniosApi.getAll()
                this.convenios = response.data.data || []
            } catch (error) {
                console.error('Error en fetchConvenios:', error)
                this.error = 'Error al cargar los convenios'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchConvenioById(id) {
            this.loading = true
            this.error = null

            try {
                const response = await conveniosApi.getById(id)
                return response.data.data
            } catch (error) {
                console.error('Error en fetchConvenioById:', error)
                this.error = 'Error al cargar el convenio'
                throw error
            } finally {
                this.loading = false
            }
        },

        async createConvenio(convenioData) {
            this.loading = true
            this.error = null

            try {
                const response = await conveniosApi.create(convenioData)
                const nuevoConvenio = response.data.data
                this.convenios.push(nuevoConvenio)
                return nuevoConvenio
            } catch (error) {
                console.error('Error en createConvenio:', error)
                this.error = 'Error al crear el convenio'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateConvenio(id, convenioData) {
            this.loading = true
            this.error = null

            try {
                const response = await conveniosApi.update(id, convenioData)
                const convenioActualizado = response.data.data

                const index = this.convenios.findIndex(c => c.id_convenio === parseInt(id))
                if (index !== -1) {
                    this.convenios[index] = convenioActualizado
                }

                return convenioActualizado
            } catch (error) {
                console.error('Error en updateConvenio:', error)
                this.error = 'Error al actualizar el convenio'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteConvenio(id) {
            this.loading = true
            this.error = null

            try {
                await conveniosApi.delete(id)
                this.convenios = this.convenios.filter(c => c.id_convenio !== parseInt(id))
                return true
            } catch (error) {
                console.error('Error en deleteConvenio:', error)
                this.error = 'Error al eliminar el convenio'
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})