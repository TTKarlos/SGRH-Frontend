import { defineStore } from 'pinia'
import formacionEmpleadoApi from '../api/formacionEmpleado.api'
import { useNotificationStore } from './notification'

export const useFormacionEmpleadosStore = defineStore('formacionEmpleados', {
    state: () => ({
        formaciones: [],
        currentFormacion: null,
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
        async fetchFormaciones(params = {}) {
            this.loading = true
            this.error = null

            try {
                const response = await formacionEmpleadoApi.getAll(params)

                if (response.data.success) {
                    this.formaciones = response.data.data.formaciones
                    this.pagination = response.data.data.pagination
                } else {
                    throw new Error(response.data.message || 'Error al obtener formaciones')
                }
            } catch (error) {
                console.error('Error en fetchFormaciones:', error)
                this.error = error.message || 'Error al cargar las formaciones'
            } finally {
                this.loading = false
            }
        },

        async fetchFormacionById(id) {
            this.loading = true
            this.error = null

            try {
                const response = await formacionEmpleadoApi.getById(id)

                if (response.data.success) {
                    this.currentFormacion = response.data.data.formacion
                    return this.currentFormacion
                } else {
                    throw new Error(response.data.message || 'Error al obtener la formación')
                }
            } catch (error) {
                console.error('Error en fetchFormacionById:', error)
                this.error = error.message || 'Error al cargar la formación'
                return null
            } finally {
                this.loading = false
            }
        },

        async fetchFormacionesByEmpleado(idEmpleado, params = {}) {
            this.loading = true
            this.error = null

            try {
                const response = await formacionEmpleadoApi.getByEmpleado(idEmpleado, params)

                if (response.data.success) {
                    this.formaciones = response.data.data.formaciones
                    this.pagination = response.data.data.pagination
                    return response.data.data
                } else {
                    throw new Error(response.data.message || 'Error al obtener formaciones del empleado')
                }
            } catch (error) {
                console.error('Error en fetchFormacionesByEmpleado:', error)
                this.error = error.message || 'Error al cargar las formaciones del empleado'
                return null
            } finally {
                this.loading = false
            }
        },

        async createFormacion(formacion) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await formacionEmpleadoApi.create(formacion)

                if (response.data.success) {
                    notificationStore.success('Formación creada correctamente', 'Éxito')
                    return response.data.data.formacion
                } else {
                    throw new Error(response.data.message || 'Error al crear la formación')
                }
            } catch (error) {
                console.error('Error en createFormacion:', error)
                this.error = error.message || 'Error al crear la formación'
                notificationStore.error(this.error, 'Error')
                return null
            } finally {
                this.loading = false
            }
        },

        async updateFormacion(id, formacion) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await formacionEmpleadoApi.update(id, formacion)

                if (response.data.success) {
                    notificationStore.success('Formación actualizada correctamente', 'Éxito')
                    return response.data.data.formacion
                } else {
                    throw new Error(response.data.message || 'Error al actualizar la formación')
                }
            } catch (error) {
                console.error('Error en updateFormacion:', error)
                this.error = error.message || 'Error al actualizar la formación'
                notificationStore.error(this.error, 'Error')
                return null
            } finally {
                this.loading = false
            }
        },

        async deleteFormacion(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await formacionEmpleadoApi.delete(id)

                if (response.data.success) {
                    notificationStore.success('Formación eliminada correctamente', 'Éxito')
                    return true
                } else {
                    throw new Error(response.data.message || 'Error al eliminar la formación')
                }
            } catch (error) {
                console.error('Error en deleteFormacion:', error)
                this.error = error.message || 'Error al eliminar la formación'
                notificationStore.error(this.error, 'Error')
                return false
            } finally {
                this.loading = false
            }
        }
    }
})