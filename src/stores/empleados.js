import { defineStore } from "pinia";
import api from "../api/axios";
import { useNotificationStore } from "./notification";

export const useEmpleadosStore = defineStore("empleados", {
    state: () => ({
        empleados: [],
        currentEmpleado: null,
        loading: false,
        error: null,
        filters: {
            search: "",
            activo: null,
            id_departamento: "",
            id_centro: "",
        },
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        },
    }),

    getters: {
        getEmpleados: (state) => state.empleados,
        getCurrentEmpleado: (state) => state.currentEmpleado,
        getLoading: (state) => state.loading,
        getError: (state) => state.error,
        getFilters: (state) => state.filters,
        getPagination: (state) => state.pagination,
    },

    actions: {
        async fetchEmpleados(params = {}) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const mergedParams = {
                    ...this.filters,
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...params,
                };

                const response = await api.get("/empleados", { params: mergedParams });
                const data = response.data;

                if (data.success) {
                    this.empleados = data.data.empleados || [];

                    const apiPagination = data.data.pagination || {};
                    this.pagination = {
                        page: apiPagination.page || 1,
                        limit: apiPagination.limit || 10,
                        total: apiPagination.total || 0,
                        totalPages: apiPagination.totalPages || 1,
                    };

                    return this.empleados;
                } else {
                    throw new Error(data.message || "Error al cargar empleados");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar empleados";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return [];
            } finally {
                this.loading = false;
            }
        },

        async fetchEmpleadoById(id) {
            this.loading = true;
            this.error = null;
            this.currentEmpleado = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await api.get(`/empleados/${id}`);
                const data = response.data;

                if (data.success) {
                    this.currentEmpleado = data.data.empleado;
                    return data.data.empleado;
                } else {
                    throw new Error(data.message || "Error al cargar el empleado");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar el empleado";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async createEmpleado(empleadoData) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await api.post("/empleados", empleadoData);
                const data = response.data;

                if (data.success) {
                    notificationStore.success("Empleado creado correctamente");
                    await this.fetchEmpleados();
                    return data.data.empleado;
                } else {
                    throw new Error(data.message || "Error al crear el empleado");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al crear el empleado";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async updateEmpleado(id, empleadoData) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await api.put(`/empleados/${id}`, empleadoData);
                const data = response.data;

                if (data.success) {
                    notificationStore.success("Empleado actualizado correctamente");

                    if (this.currentEmpleado && this.currentEmpleado.id_empleado === id) {
                        this.currentEmpleado = data.data.empleado;
                    }

                    const index = this.empleados.findIndex(e => e.id_empleado === id);
                    if (index !== -1) {
                        this.empleados[index] = data.data.empleado;
                    }

                    return data.data.empleado;
                } else {
                    throw new Error(data.message || "Error al actualizar el empleado");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al actualizar el empleado";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async deleteEmpleado(id) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await api.delete(`/empleados/${id}`);
                const data = response.data;

                if (data.success) {
                    notificationStore.success("Empleado eliminado correctamente");

                    this.empleados = this.empleados.filter(e => e.id_empleado !== id);

                    if (this.currentEmpleado && this.currentEmpleado.id_empleado === id) {
                        this.currentEmpleado = null;
                    }

                    return true;
                } else {
                    throw new Error(data.message || "Error al eliminar el empleado");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al eliminar el empleado";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async changeEmpleadoStatus(id, activo) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await api.patch(`/empleados/${id}/status`, { activo });
                const data = response.data;

                if (data.success) {
                    const statusText = activo ? "activado" : "desactivado";
                    notificationStore.success(`Empleado ${statusText} correctamente`);

                    if (this.currentEmpleado && this.currentEmpleado.id_empleado === id) {
                        this.currentEmpleado = { ...this.currentEmpleado, activo };
                    }

                    const index = this.empleados.findIndex(e => e.id_empleado === id);
                    if (index !== -1) {
                        this.empleados[index] = { ...this.empleados[index], activo };
                    }

                    return true;
                } else {
                    throw new Error(data.message || `Error al ${activo ? "activar" : "desactivar"} el empleado`);
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || `Error al ${activo ? "activar" : "desactivar"} el empleado`;
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return false;
            } finally {
                this.loading = false;
            }
        },

        updateFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters };
            this.pagination.page = 1;
        },

        resetFilters() {
            this.filters = {
                search: "",
                activo: null,
                id_departamento: "",
                id_centro: "",
            };
            this.pagination.page = 1;
        },

        setPage(page) {
            this.pagination.page = page;
        },
    },
});