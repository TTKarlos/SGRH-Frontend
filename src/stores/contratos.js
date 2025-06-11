import { defineStore } from "pinia"
import ContratosAPI from "../api/contratos.api"
import { useNotificationStore } from "./notification"

export const useContratosStore = defineStore("contratos", {
    state: () => ({
        contratos: [],
        contratoActual: null,
        loading: false,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        },
        empleadoInfo: null,
        estadisticas: null,
        contratosProximosAVencer: [],
    }),

    getters: {
        contratosVigentes: (state) => {
            const today = new Date()
            return state.contratos.filter((contrato) => contrato.fecha_fin === null || new Date(contrato.fecha_fin) >= today)
        },

        contratosFinalizados: (state) => {
            const today = new Date()
            return state.contratos.filter((contrato) => contrato.fecha_fin !== null && new Date(contrato.fecha_fin) < today)
        },

        getContratoById: (state) => (id) => {
            return state.contratos.find((contrato) => contrato.id_contrato === Number(id))
        },

        hasContratoVigente: (state) => {
            return state.estadisticas?.vigente || false
        },

        contratoVigente: (state) => {
            return state.estadisticas?.contratoVigente || null
        },
    },

    actions: {
        async fetchContratos(params = {}) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await ContratosAPI.getAll(params)

                if (response.data?.success) {
                    const { contratos, pagination } = response.data.data
                    this.contratos = contratos || []
                    this.pagination = pagination || this._getDefaultPagination()
                    return this.contratos
                } else {
                    throw new Error(response.data?.message || "Error al cargar contratos")
                }
            } catch (error) {
                const errorMsg = this._getErrorMessage(error, "Error al cargar contratos")
                this.error = errorMsg
                notificationStore.error(errorMsg, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchContratosByEmpleado(idEmpleado, params = {}) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await ContratosAPI.getByEmpleado(idEmpleado, params)

                if (response.data?.success) {
                    const { contratos, pagination, empleado, estadisticas } = response.data.data
                    this.contratos = contratos || []
                    this.pagination = pagination || this._getDefaultPagination()
                    this.empleadoInfo = empleado || null
                    this.estadisticas = estadisticas || null
                    return this.contratos
                } else {
                    throw new Error(response.data?.message || "Error al cargar contratos del empleado")
                }
            } catch (error) {
                const errorMsg = this._getErrorMessage(error, "Error al cargar contratos del empleado")
                this.error = errorMsg
                notificationStore.error(errorMsg, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchContrato(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await ContratosAPI.getById(id)

                if (response.data?.success) {
                    this.contratoActual = response.data.data.contrato
                    return this.contratoActual
                } else {
                    throw new Error(response.data?.message || "Error al cargar contrato")
                }
            } catch (error) {
                const errorMsg = this._getErrorMessage(error, "Error al cargar contrato")
                this.error = errorMsg
                notificationStore.error(errorMsg, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        async createContrato(contratoData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                if (!contratoData.get("id_empleado")) {
                    throw new Error("El ID del empleado es requerido")
                }

                const response = await ContratosAPI.create(contratoData)

                if (response.data?.success) {
                    const contrato = response.data.data.contrato
                    if (contrato) {
                        this.contratos.unshift(contrato)
                        this._updateEstadisticas(contrato)
                        notificationStore.success("Contrato creado correctamente", "Éxito")
                        return contrato
                    } else {
                        notificationStore.success("Contrato creado correctamente", "Éxito")
                        return { id_contrato: response.data.data.id || null }
                    }
                } else {
                    throw new Error(response.data?.message || "Error al crear contrato")
                }
            } catch (error) {
                const errorMsg = this._getErrorMessage(error, "Error al crear contrato")
                this.error = errorMsg
                notificationStore.error(errorMsg, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateContrato(id, contratoData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                if (!contratoData.get("id_empleado")) {
                    throw new Error("El ID del empleado es requerido")
                }

                const response = await ContratosAPI.update(id, contratoData)

                if (response.data?.success) {
                    const contrato = response.data.data.contrato
                    if (contrato) {
                        this._updateContratoInList(id, contrato)
                        this._updateEstadisticas(contrato)
                        notificationStore.success("Contrato actualizado correctamente", "Éxito")
                        return contrato
                    } else {
                        notificationStore.success("Contrato actualizado correctamente", "Éxito")
                        return { id_contrato: id }
                    }
                } else {
                    throw new Error(response.data?.message || "Error al actualizar contrato")
                }
            } catch (error) {
                const errorMsg = this._getErrorMessage(error, "Error al actualizar contrato")
                this.error = errorMsg
                notificationStore.error(errorMsg, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteContrato(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await ContratosAPI.delete(id)

                if (response.data?.success) {
                    this._removeContratoFromList(id)
                    notificationStore.success("Contrato eliminado correctamente", "Éxito")
                    return true
                } else {
                    throw new Error(response.data?.message || "Error al eliminar contrato")
                }
            } catch (error) {
                const errorMsg = this._getErrorMessage(error, "Error al eliminar contrato")
                this.error = errorMsg
                notificationStore.error(errorMsg, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        async downloadContrato(id) {
            const notificationStore = useNotificationStore()
            try {
                const response = await ContratosAPI.download(id)
                this._downloadFile(response)
                return true
            } catch (error) {
                const errorMsg = this._getErrorMessage(error, "Error al descargar el archivo del contrato")
                notificationStore.error(errorMsg, "Error")
                throw error
            }
        },

        async previewContrato(id) {
            const notificationStore = useNotificationStore()
            try {
                const response = await ContratosAPI.preview(id)
                const blob = new Blob([response.data], { type: response.headers["content-type"] })
                const url = window.URL.createObjectURL(blob)

                const newWindow = window.open(url, "_blank")
                if (newWindow) {
                    newWindow.addEventListener("beforeunload", () => {
                        window.URL.revokeObjectURL(url)
                    })
                }
                return url
            } catch (error) {
                const errorMsg = this._getErrorMessage(error, "Error al previsualizar el archivo del contrato")
                notificationStore.error(errorMsg, "Error")
                throw error
            }
        },

        async fetchContratosProximosAVencer(params = {}) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await ContratosAPI.getProximosAVencer(params)

                if (response.data?.success) {
                    const { contratos, pagination, estadisticas } = response.data.data
                    this.contratosProximosAVencer = contratos || []
                    this.pagination = pagination || this._getDefaultPagination()
                    return { contratos: this.contratosProximosAVencer, estadisticas }
                } else {
                    throw new Error(response.data?.message || "Error al cargar contratos próximos a vencer")
                }
            } catch (error) {
                const errorMsg = this._getErrorMessage(error, "Error al cargar contratos próximos a vencer")
                this.error = errorMsg
                notificationStore.error(errorMsg, "Error")
                throw error
            } finally {
                this.loading = false
            }
        },

        resetState() {
            this.contratos = []
            this.contratoActual = null
            this.loading = false
            this.error = null
            this.pagination = this._getDefaultPagination()
            this.empleadoInfo = null
            this.estadisticas = null
            this.contratosProximosAVencer = []
        },

        _getDefaultPagination() {
            return {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            }
        },

        _getErrorMessage(error, defaultMessage) {
            return error.response?.data?.message || error.message || defaultMessage
        },

        _updateContratoInList(id, contrato) {
            const index = this.contratos.findIndex((c) => c.id_contrato === Number(id))
            if (index !== -1) {
                this.contratos[index] = contrato
            }

            if (this.contratoActual?.id_contrato === Number(id)) {
                this.contratoActual = contrato
            }
        },

        _removeContratoFromList(id) {
            this.contratos = this.contratos.filter((c) => c.id_contrato !== Number(id))

            if (this.contratoActual?.id_contrato === Number(id)) {
                this.contratoActual = null
            }

            if (this.estadisticas?.contratoVigente?.id_contrato === Number(id)) {
                this.estadisticas.vigente = false
                this.estadisticas.contratoVigente = null
            }
        },

        _updateEstadisticas(contrato) {
            if (!contrato) return

            const esVigente = contrato.fecha_fin === null || new Date(contrato.fecha_fin) >= new Date()

            if (this.estadisticas) {
                if (esVigente) {
                    this.estadisticas.vigente = true
                    this.estadisticas.contratoVigente = contrato
                } else if (this.estadisticas.contratoVigente?.id_contrato === contrato.id_contrato) {
                    this.estadisticas.vigente = false
                    this.estadisticas.contratoVigente = null
                }
            }
        },

        _downloadFile(response) {
            const blob = new Blob([response.data])
            const url = window.URL.createObjectURL(blob)

            const contentDisposition = response.headers["content-disposition"]
            let filename = "contrato.pdf"

            if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
                const matches = filenameRegex.exec(contentDisposition)
                if (matches?.[1]) {
                    filename = matches[1].replace(/['"]/g, "")
                }
            }

            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", filename)
            document.body.appendChild(link)
            link.click()

            setTimeout(() => {
                window.URL.revokeObjectURL(url)
                document.body.removeChild(link)
            }, 100)
        },
    },
})
