import { defineStore } from 'pinia'
import empresasApi from '../api/empresas.api.js'

export const useEmpresasStore = defineStore('empresas', {
    state: () => ({
        empresas: [],
        loading: false,
        error: null
    }),

    getters: {
        getEmpresaById: (state) => (id) => {
            return state.empresas.find(empresa => empresa.id_empresa === parseInt(id))
        }
    },

    actions: {
        async fetchEmpresas() {
            this.loading = true
            this.error = null

            try {
                const response = await empresasApi.getAll()
                this.empresas = response.data.data || []
            } catch (error) {
                console.error('Error en fetchEmpresas:', error)
                this.error = 'Error al cargar las empresas'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchEmpresaById(id) {
            this.loading = true
            this.error = null

            try {
                const response = await empresasApi.getById(id)
                return response.data.data
            } catch (error) {
                console.error('Error en fetchEmpresaById:', error)
                this.error = 'Error al cargar la empresa'
                throw error
            } finally {
                this.loading = false
            }
        },

        async createEmpresa(empresaData) {
            this.loading = true
            this.error = null

            try {
                const response = await empresasApi.create(empresaData)
                const nuevaEmpresa = response.data.data
                this.empresas.push(nuevaEmpresa)
                return nuevaEmpresa
            } catch (error) {
                console.error('Error en createEmpresa:', error)
                this.error = 'Error al crear la empresa'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateEmpresa(id, empresaData) {
            this.loading = true
            this.error = null

            try {
                const response = await empresasApi.update(id, empresaData)
                const empresaActualizada = response.data.data

                const index = this.empresas.findIndex(e => e.id_empresa === parseInt(id))
                if (index !== -1) {
                    this.empresas[index] = empresaActualizada
                }

                return empresaActualizada
            } catch (error) {
                console.error('Error en updateEmpresa:', error)
                this.error = 'Error al actualizar la empresa'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteEmpresa(id) {
            this.loading = true
            this.error = null

            try {
                await empresasApi.delete(id)
                this.empresas = this.empresas.filter(e => e.id_empresa !== parseInt(id))
                return true
            } catch (error) {
                console.error('Error en deleteEmpresa:', error)
                this.error = 'Error al eliminar la empresa'
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})