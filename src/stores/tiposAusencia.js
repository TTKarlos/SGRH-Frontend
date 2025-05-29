import { defineStore } from 'pinia'
import tipoAusenciaApi from '../api/tipoAusencia.api'
import { useNotificationStore } from './notification'

export const useTiposAusenciaStore = defineStore('tiposAusencia', {
    state: () => ({
        tiposAusencia: [],
        loading: false,
        error: null
    }),

    getters: {
        getTipoAusenciaById: (state) => (id) => {
            if (!id) return null
            const idNum = parseInt(id)
            return state.tiposAusencia.find(tipo => parseInt(tipo.id_tipo_ausencia) === idNum) || null
        },

        getTipoAusenciaNombre: (state) => (id) => {
            if (!id) return 'Sin especificar'
            const idNum = parseInt(id)
            const tipo = state.tiposAusencia.find(tipo => parseInt(tipo.id_tipo_ausencia) === idNum)
            return tipo ? tipo.nombre : 'Sin especificar'
        }
    },

    actions: {
        async fetchTiposAusencia() {
            const notificationStore = useNotificationStore()

            if (this.tiposAusencia.length > 0) {
                return this.tiposAusencia
            }

            this.loading = true
            this.error = null

            try {
                console.log('Cargando tipos de ausencia desde la API...')
                const response = await tipoAusenciaApi.getAll()

                console.log('Respuesta de la API:', response.data)

                if (response.data && response.data.data && response.data.data.tiposAusencia) {
                    this.tiposAusencia = response.data.data.tiposAusencia
                } else if (response.data && response.data.data) {
                    this.tiposAusencia = Array.isArray(response.data.data) ? response.data.data : []
                } else if (Array.isArray(response.data)) {
                    this.tiposAusencia = response.data
                } else {
                    this.tiposAusencia = []
                }

                console.log('Tipos de ausencia cargados:', this.tiposAusencia)
                return this.tiposAusencia
            } catch (error) {
                console.error('Error al cargar tipos de ausencia:', error)

                const errorMessage = error.response?.data?.message || 'Error al cargar los tipos de ausencia'
                this.error = errorMessage

                notificationStore.error(errorMessage, 'Error')

                return []
            } finally {
                this.loading = false
            }
        },

        async getTipoAusencia(id) {
            if (!id) return null

            const idNum = parseInt(id)
            const tipoExistente = this.getTipoAusenciaById(idNum)
            if (tipoExistente) return tipoExistente

            try {
                const response = await tipoAusenciaApi.getById(idNum)
                let tipoAusencia = null

                if (response.data && response.data.data) {
                    tipoAusencia = response.data.data
                } else if (response.data) {
                    tipoAusencia = response.data
                }

                if (!tipoAusencia) return null

                if (!this.tiposAusencia.some(t => parseInt(t.id_tipo_ausencia) === parseInt(tipoAusencia.id_tipo_ausencia))) {
                    this.tiposAusencia.push(tipoAusencia)
                }

                return tipoAusencia
            } catch (error) {
                console.error(`Error al obtener tipo de ausencia con ID ${id}:`, error)
                return null
            }
        },

        setTiposAusencia(tipos) {
            if (Array.isArray(tipos)) {
                this.tiposAusencia = tipos
            }
        }
    }
})