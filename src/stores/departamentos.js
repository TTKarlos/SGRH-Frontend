import { defineStore } from "pinia"
import departamentosApi from "../api/departamentos.api"
import { useNotificationStore } from "./notification"

export const useDepartamentosStore = defineStore("departamentos", {
    state: () => ({
        departamentos: [],
        loading: false,
        error: null,
        currentDepartamento: null,
    }),

    getters: {
        getDepartamentosPorCentro: (state) => (idCentro) => {
            if (!idCentro) return state.departamentos

            return state.departamentos.filter((departamento) => departamento.id_centro === idCentro)
        },
    },

    actions: {
        async fetchDepartamentos() {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await departamentosApi.getAll()
                const data = response.data

                if (data.success) {
                    this.departamentos = data.data.departamentos || []
                    return this.departamentos
                } else {
                    throw new Error(data.message || "Error al cargar departamentos")
                }
            } catch (err) {
                console.error("Error al cargar departamentos:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar departamentos"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchDepartamentosByCentro(idCentro) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await departamentosApi.getAll({ id_centro: idCentro })
                const data = response.data

                if (data.success) {
                    return data.data.departamentos || []
                } else {
                    throw new Error(data.message || "Error al cargar departamentos por centro")
                }
            } catch (err) {
                console.error("Error al cargar departamentos por centro:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar departamentos por centro"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchDepartamentoById(id) {
            this.loading = true
            this.error = null
            this.currentDepartamento = null
            const notificationStore = useNotificationStore()

            try {
                const response = await departamentosApi.getById(id)
                const data = response.data

                if (data.success) {
                    this.currentDepartamento = data.data.departamento
                    return this.currentDepartamento
                } else {
                    throw new Error(data.message || "Error al cargar el departamento")
                }
            } catch (err) {
                console.error("Error al cargar el departamento:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar el departamento"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                return null
            } finally {
                this.loading = false
            }
        },

        async createDepartamento(departamentoData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await departamentosApi.create(departamentoData)
                const data = response.data

                if (data.success) {
                    const nuevoDepartamento = data.data.departamento
                    this.departamentos.push(nuevoDepartamento)
                    notificationStore.success("Departamento creado correctamente")
                    return nuevoDepartamento
                } else {
                    throw new Error(data.message || "Error al crear el departamento")
                }
            } catch (err) {
                console.error("Error al crear el departamento:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al crear el departamento"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateDepartamento(id, departamentoData) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await departamentosApi.update(id, departamentoData)
                const data = response.data

                if (data.success) {
                    const departamentoActualizado = data.data.departamento
                    this.currentDepartamento = departamentoActualizado

                    const index = this.departamentos.findIndex((d) => d.id_departamento === Number(id))
                    if (index !== -1) {
                        this.departamentos[index] = departamentoActualizado
                    }

                    notificationStore.success("Departamento actualizado correctamente")
                    return departamentoActualizado
                } else {
                    throw new Error(data.message || "Error al actualizar el departamento")
                }
            } catch (err) {
                console.error("Error al actualizar el departamento:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al actualizar el departamento"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw err
            } finally {
                this.loading = false
            }
        },

        async deleteDepartamento(id) {
            this.loading = true
            this.error = null
            const notificationStore = useNotificationStore()

            try {
                const response = await departamentosApi.delete(id)
                const data = response.data

                if (data.success) {
                    this.departamentos = this.departamentos.filter((d) => d.id_departamento !== Number(id))

                    if (this.currentDepartamento && this.currentDepartamento.id_departamento === Number(id)) {
                        this.currentDepartamento = null
                    }

                    notificationStore.success("Departamento eliminado correctamente")
                    return true
                } else {
                    throw new Error(data.message || "Error al eliminar el departamento")
                }
            } catch (err) {
                console.error("Error al eliminar el departamento:", err)
                const errorMsg = err.response?.data?.message || err.message || "Error al eliminar el departamento"
                this.error = errorMsg
                notificationStore.error(errorMsg)
                throw err
            } finally {
                this.loading = false
            }
        },
    },
})
