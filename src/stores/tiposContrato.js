import { defineStore } from 'pinia'
import tiposContratoApi from '../api/tiposContrato.api.js'

export const useTiposContratoStore = defineStore('tiposContrato', {
    state: () => ({
        tiposContrato: [],
        loading: false,
        error: null
    }),

    getters: {
        getTipoContratoById: (state) => (id) => {
            return state.tiposContrato.find(tipo => tipo.id_tipo_contrato === parseInt(id))
        }
    },

    actions: {
        async fetchTiposContrato() {
            this.loading = true
            this.error = null

            try {
                const response = await tiposContratoApi.getAll()
                this.tiposContrato = response.data.data || []
            } catch (error) {
                console.error('Error en fetchTiposContrato:', error)
                this.error = 'Error al cargar los tipos de contrato'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchTipoContratoById(id) {
            this.loading = true
            this.error = null

            try {
                const response = await tiposContratoApi.getById(id)
                return response.data.data
            } catch (error) {
                console.error('Error en fetchTipoContratoById:', error)
                this.error = 'Error al cargar el tipo de contrato'
                throw error
            } finally {
                this.loading = false
            }
        },

        async createTipoContrato(tipoContratoData) {
            this.loading = true
            this.error = null

            try {
                const response = await tiposContratoApi.create(tipoContratoData)
                const nuevoTipoContrato = response.data.data
                this.tiposContrato.push(nuevoTipoContrato)
                return nuevoTipoContrato
            } catch (error) {
                console.error('Error en createTipoContrato:', error)
                this.error = 'Error al crear el tipo de contrato'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateTipoContrato(id, tipoContratoData) {
            this.loading = true
            this.error = null

            try {
                const response = await tiposContratoApi.update(id, tipoContratoData)
                const tipoContratoActualizado = response.data.data

                const index = this.tiposContrato.findIndex(t => t.id_tipo_contrato === parseInt(id))
                if (index !== -1) {
                    this.tiposContrato[index] = tipoContratoActualizado
                }

                return tipoContratoActualizado
            } catch (error) {
                console.error('Error en updateTipoContrato:', error)
                this.error = 'Error al actualizar el tipo de contrato'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteTipoContrato(id) {
            this.loading = true
            this.error = null

            try {
                await tiposContratoApi.delete(id)
                this.tiposContrato = this.tiposContrato.filter(t => t.id_tipo_contrato !== parseInt(id))
                return true
            } catch (error) {
                console.error('Error en deleteTipoContrato:', error)
                this.error = 'Error al eliminar el tipo de contrato'
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})