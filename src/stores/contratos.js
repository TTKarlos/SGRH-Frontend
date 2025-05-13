import { defineStore } from 'pinia'
import contratosApi from '../api/contratos.api.js'
import { useNotificationStore } from './notification'

export const useContratosStore = defineStore('contratos', {
    state: () => ({
        contratos: [],
        currentContrato: null,
        loading: false,
        error: null,
        pagination: null,
        empleadoInfo: null,
        estadisticas: null,
        notificationStore: useNotificationStore()
    }),

    getters: {
        getContratoById: (state) => (id) => {
            return state.contratos.find(contrato => contrato.id_contrato === parseInt(id))
        },

        hasContratoVigente: (state) => {
            return state.estadisticas?.vigente || false
        },

        contratoVigente: (state) => {
            return state.estadisticas?.contratoVigente || null
        }
    },

    actions: {
        async fetchContratos(params = {}) {
            this.loading = true
            this.error = null

            try {
                const response = await contratosApi.getAll(params)

                const { contratos, pagination } = response.data.data

                this.contratos = contratos || []
                this.pagination = pagination || null

                return this.contratos
            } catch (error) {
                console.error('Error en fetchContratos:', error)
                this.error = 'Error al cargar los contratos'
                this.notificationStore.error('Error al cargar los contratos', 'Error')
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchContratoById(id) {
            this.loading = true
            this.error = null

            try {
                const response = await contratosApi.getById(id)

                const { contrato } = response.data.data

                this.currentContrato = contrato
                return this.currentContrato
            } catch (error) {
                console.error('Error en fetchContratoById:', error)
                this.error = 'Error al cargar el contrato'
                this.notificationStore.error('Error al cargar el contrato', 'Error')
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchContratosByEmpleado(idEmpleado, params = {}) {
            this.loading = true
            this.error = null

            try {
                const response = await contratosApi.getByEmpleado(idEmpleado, params)

                const { contratos, pagination, empleado, estadisticas } = response.data.data

                this.contratos = contratos || []
                this.pagination = pagination || null
                this.empleadoInfo = empleado || null
                this.estadisticas = estadisticas || null

                return this.contratos
            } catch (error) {
                console.error('Error en fetchContratosByEmpleado:', error)
                this.error = 'Error al cargar los contratos del empleado'
                this.notificationStore.error('Error al cargar los contratos del empleado', 'Error')
                throw error
            } finally {
                this.loading = false
            }
        },

        async createContrato(contratoData) {
            this.loading = true
            this.error = null

            try {
                const response = await contratosApi.create(contratoData)

                const { contrato } = response.data.data

                this.contratos.unshift(contrato)

                if (contrato.fecha_fin === null || new Date(contrato.fecha_fin) >= new Date()) {
                    if (this.estadisticas) {
                        this.estadisticas.vigente = true
                        this.estadisticas.contratoVigente = contrato
                    }
                }

                this.notificationStore.success('Contrato creado correctamente', 'Éxito')
                return contrato
            } catch (error) {
                console.error('Error en createContrato:', error)
                this.error = 'Error al crear el contrato'
                this.notificationStore.error('Error al crear el contrato', 'Error')
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateContrato(id, contratoData) {
            this.loading = true
            this.error = null

            try {
                const response = await contratosApi.update(id, contratoData)

                const { contrato } = response.data.data

                const index = this.contratos.findIndex(c => c.id_contrato === parseInt(id))
                if (index !== -1) {
                    this.contratos[index] = contrato
                }

                if (this.currentContrato && this.currentContrato.id_contrato === parseInt(id)) {
                    this.currentContrato = contrato
                }

                if (this.estadisticas && this.estadisticas.contratoVigente?.id_contrato === parseInt(id)) {
                    const esVigente = contrato.fecha_fin === null || new Date(contrato.fecha_fin) >= new Date()
                    this.estadisticas.vigente = esVigente
                    this.estadisticas.contratoVigente = esVigente ? contrato : null
                }

                this.notificationStore.success('Contrato actualizado correctamente', 'Éxito')
                return contrato
            } catch (error) {
                console.error('Error en updateContrato:', error)
                this.error = 'Error al actualizar el contrato'
                this.notificationStore.error('Error al actualizar el contrato', 'Error')
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteContrato(id) {
            this.loading = true
            this.error = null

            try {
                await contratosApi.delete(id)

                this.contratos = this.contratos.filter(c => c.id_contrato !== parseInt(id))

                if (this.currentContrato && this.currentContrato.id_contrato === parseInt(id)) {
                    this.currentContrato = null
                }

                if (this.estadisticas && this.estadisticas.contratoVigente?.id_contrato === parseInt(id)) {
                    this.estadisticas.vigente = false
                    this.estadisticas.contratoVigente = null
                }

                this.notificationStore.success('Contrato eliminado correctamente', 'Éxito')
                return true
            } catch (error) {
                console.error('Error en deleteContrato:', error)
                this.error = 'Error al eliminar el contrato'
                this.notificationStore.error('Error al eliminar el contrato', 'Error')
                throw error
            } finally {
                this.loading = false
            }
        },

        async downloadContrato(id) {
            try {
                const response = await contratosApi.download(id)

                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement('a')
                link.href = url

                const contentDisposition = response.headers['content-disposition']
                let filename = 'contrato.pdf'

                if (contentDisposition) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
                    const matches = filenameRegex.exec(contentDisposition)
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '')
                    }
                }

                link.setAttribute('download', filename)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                return true
            } catch (error) {
                console.error('Error en downloadContrato:', error)
                this.notificationStore.error('Error al descargar el contrato', 'Error')
                throw error
            }
        },

        async previewContrato(id) {
            try {
                const response = await contratosApi.preview(id)

                const blob = new Blob([response.data], { type: response.headers['content-type'] })
                const url = window.URL.createObjectURL(blob)

                window.open(url, '_blank')

                return url
            } catch (error) {
                console.error('Error en previewContrato:', error)
                this.notificationStore.error('Error al previsualizar el contrato', 'Error')
                throw error
            }
        },

        resetState() {
            this.contratos = []
            this.currentContrato = null
            this.loading = false
            this.error = null
            this.pagination = null
            this.empleadoInfo = null
            this.estadisticas = null
        }
    }
})