import { defineStore } from "pinia"
import departamentosApi from "../api/departamentos.api"

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

            return state.departamentos.filter(
                departamento => departamento.id_centro === idCentro
            )
        }
    },

    actions: {
        async fetchDepartamentos() {
            this.loading = true
            this.error = null

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
                this.error = err.message || "Error al cargar departamentos"
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchDepartamentosByCentro(idCentro) {
            this.loading = true
            this.error = null

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
                this.error = err.message || "Error al cargar departamentos por centro"
                return []
            } finally {
                this.loading = false
            }
        },

        async fetchDepartamentoById(id) {
            this.loading = true
            this.error = null
            this.currentDepartamento = null

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
                this.error = err.message || "Error al cargar el departamento"
                return null
            } finally {
                this.loading = false
            }
        },

        async createDepartamento(departamentoData) {
            this.loading = true
            this.error = null

            try {
                const response = await departamentosApi.create(departamentoData)
                const data = response.data

                if (data.success) {
                    await this.fetchDepartamentos()
                    return data.data.departamento
                } else {
                    throw new Error(data.message || "Error al crear el departamento")
                }
            } catch (err) {
                console.error("Error al crear el departamento:", err)
                this.error = err.message || "Error al crear el departamento"
                return null
            } finally {
                this.loading = false
            }
        },

        async updateDepartamento(id, departamentoData) {
            this.loading = true
            this.error = null

            try {
                const response = await departamentosApi.update(id, departamentoData)
                const data = response.data

                if (data.success) {
                    this.currentDepartamento = data.data.departamento

                    const index = this.departamentos.findIndex(d => d.id_departamento === Number(id))
                    if (index !== -1) {
                        this.departamentos[index] = data.data.departamento
                    }

                    return this.currentDepartamento
                } else {
                    throw new Error(data.message || "Error al actualizar el departamento")
                }
            } catch (err) {
                console.error("Error al actualizar el departamento:", err)
                this.error = err.message || "Error al actualizar el departamento"
                return null
            } finally {
                this.loading = false
            }
        },

        async deleteDepartamento(id) {
            this.loading = true
            this.error = null

            try {
                const response = await departamentosApi.delete(id)
                const data = response.data

                if (data.success) {
                    this.departamentos = this.departamentos.filter(
                        d => d.id_departamento !== Number(id)
                    )

                    if (this.currentDepartamento && this.currentDepartamento.id_departamento === Number(id)) {
                        this.currentDepartamento = null
                    }

                    return true
                } else {
                    throw new Error(data.message || "Error al eliminar el departamento")
                }
            } catch (err) {
                console.error("Error al eliminar el departamento:", err)
                this.error = err.message || "Error al eliminar el departamento"
                return false
            } finally {
                this.loading = false
            }
        }
    }
})