import { defineStore } from 'pinia'
import ausenciaApi from '../api/ausencia.api'
import { useNotificationStore } from './notification'

export const useAusenciasStore = defineStore('ausencias', {
    state: () => ({
        ausencias: [],
        currentAusencia: null,
        loading: false,
        error: null,
        pagination: {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0
        }
    }),

    actions: {
        async fetchAusencias(params = {}) {
            this.loading = true
            this.error = null

            try {
                const response = await ausenciaApi.getAll(params)

                if (response.data.success) {
                    this.ausencias = response.data.data.ausencias
                    this.pagination = response.data.data.pagination
                } else {
                    throw new Error(response.data.message || 'Error al obtener ausencias')
                }
            } catch (error) {
                console.error('Error en fetchAusencias:', error)
                this.error = error.message || 'Error al cargar las ausencias'
            } finally {
                this.loading = false
            }
        },

        async fetchAusenciaById(id) {
            this.loading = true
            this.error = null

            try {
                const response = await ausenciaApi.getById(id)

                if (response.data.success) {
                    this.currentAusencia = response.data.data.ausencia
                    return this.currentAusencia
                } else {
                    throw new Error(response.data.message || 'Error al obtener la ausencia')
                }
            } catch (error) {
                console.error('Error en fetchAusenciaById:', error)
                this.error = error.message || 'Error al cargar la ausencia'
                return null
            } finally {
                this.loading = false
            }
        },

        async fetchAusenciasByEmpleado(idEmpleado, params = {}) {
            this.loading = true
            this.error = null

            try {
                const response = await ausenciaApi.getByEmpleado(idEmpleado, params)

                if (response.data.success) {
                    this.ausencias = response.data.data.ausencias
                    this.pagination = response.data.data.pagination
                    return response.data.data
                } else {
                    throw new Error(response.data.message || 'Error al obtener ausencias del empleado')
                }
            } catch (error) {
                console.error('Error en fetchAusenciasByEmpleado:', error)
                this.error = error.message || 'Error al cargar las ausencias del empleado'
                return null
            } finally {
                this.loading = false
            }
        },

        async createAusencia(ausencia) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await ausenciaApi.create(ausencia)

                if (response.data.success) {
                    notificationStore.success('Ausencia creada correctamente', 'Éxito')
                    return response.data.data.ausencia
                } else {
                    throw new Error(response.data.message || 'Error al crear la ausencia')
                }
            } catch (error) {
                console.error('Error en createAusencia:', error)
                this.error = error.message || 'Error al crear la ausencia'
                notificationStore.error(this.error, 'Error')
                return null
            } finally {
                this.loading = false
            }
        },

        async updateAusencia(id, ausencia) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await ausenciaApi.update(id, ausencia)

                if (response.data.success) {
                    notificationStore.success('Ausencia actualizada correctamente', 'Éxito')
                    return response.data.data.ausencia
                } else {
                    throw new Error(response.data.message || 'Error al actualizar la ausencia')
                }
            } catch (error) {
                console.error('Error en updateAusencia:', error)
                this.error = error.message || 'Error al actualizar la ausencia'
                notificationStore.error(this.error, 'Error')
                return null
            } finally {
                this.loading = false
            }
        },

        async deleteAusencia(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await ausenciaApi.delete(id)

                if (response.data.success) {
                    notificationStore.success('Ausencia eliminada correctamente', 'Éxito')
                    return true
                } else {
                    throw new Error(response.data.message || 'Error al eliminar la ausencia')
                }
            } catch (error) {
                console.error('Error en deleteAusencia:', error)
                this.error = error.message || 'Error al eliminar la ausencia'
                notificationStore.error(this.error, 'Error')
                return false
            } finally {
                this.loading = false
            }
        }
    }
})