import { defineStore } from "pinia";
import api from "../api/axios";
import { useNotificationStore } from "./notification";

export const useZonasStore = defineStore("zonas", {
    state: () => ({
        zonas: [],
        currentZona: null,
        loading: false,
        error: null,
        filters: {
            search: "",
        },
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
        },
    }),

    getters: {
        getZonas: (state) => state.zonas,
        getCurrentZona: (state) => state.currentZona,
        getLoading: (state) => state.loading,
        getError: (state) => state.error,
        getFilters: (state) => state.filters,
        getPagination: (state) => state.pagination,
    },

    actions: {
        async fetchZonas(params = {}) {
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

                const response = await api.get("/zonas", { params: mergedParams });
                const data = response.data;

                if (data.success) {
                    this.zonas = data.data.zonas || [];

                    const apiPagination = data.data.pagination || {};
                    this.pagination = {
                        page: apiPagination.page || 1,
                        limit: apiPagination.limit || 10,
                        total: apiPagination.total || 0,
                        totalPages: apiPagination.totalPages || 1,
                    };

                    return this.zonas;
                } else {
                    throw new Error(data.message || "Error al cargar zonas");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar zonas";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return [];
            } finally {
                this.loading = false;
            }
        },

        async fetchZonaById(id) {
            this.loading = true;
            this.error = null;
            this.currentZona = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await api.get(`/zonas/${id}`);
                const data = response.data;

                if (data.success) {
                    this.currentZona = data.data.zona;
                    return data.data.zona;
                } else {
                    throw new Error(data.message || "Error al cargar la zona");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar la zona";
                this.error = errorMsg;
                notificationStore.error(errorMsg);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async createZona(zonaData) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await api.post("/zonas", zonaData);
                const data = response.data;

                if (data.success) {
                    notificationStore.success(
                        `¡Zona "${zonaData.nombre}" creada correctamente!`,
                        "Zona creada"
                    );
                    await this.fetchZonas();
                    return data.data.zona;
                } else {
                    throw new Error(data.message || "Error al crear la zona");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al crear la zona";
                this.error = errorMsg;
                notificationStore.error(errorMsg, "Error al crear");
                return null;
            } finally {
                this.loading = false;
            }
        },

        async updateZona(id, zonaData) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await api.put(`/zonas/${id}`, zonaData);
                const data = response.data;

                if (data.success) {
                    notificationStore.success(
                        `¡Zona "${zonaData.nombre}" actualizada correctamente!`,
                        "Zona actualizada"
                    );

                    if (this.currentZona && this.currentZona.id_zona === id) {
                        this.currentZona = data.data.zona;
                    }

                    const index = this.zonas.findIndex(z => z.id_zona === id);
                    if (index !== -1) {
                        this.zonas[index] = data.data.zona;
                    }

                    return data.data.zona;
                } else {
                    throw new Error(data.message || "Error al actualizar la zona");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al actualizar la zona";
                this.error = errorMsg;
                notificationStore.error(errorMsg, "Error al actualizar");
                return null;
            } finally {
                this.loading = false;
            }
        },

        async deleteZona(id) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const response = await api.delete(`/zonas/${id}`);
                const data = response.data;

                if (data.success) {
                    const zonaEliminada = this.zonas.find(z => z.id_zona === id);
                    const nombreZona = zonaEliminada ? zonaEliminada.nombre : "Zona";

                    notificationStore.success(
                        `¡${nombreZona} eliminada correctamente!`,
                        "Zona eliminada"
                    );

                    this.zonas = this.zonas.filter(z => z.id_zona !== id);

                    if (this.currentZona && this.currentZona.id_zona === id) {
                        this.currentZona = null;
                    }

                    return true;
                } else {
                    throw new Error(data.message || "Error al eliminar la zona");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al eliminar la zona";
                this.error = errorMsg;
                notificationStore.error(errorMsg, "Error al eliminar");
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
            };
            this.pagination.page = 1;
        },

        setPage(page) {
            this.pagination.page = page;
        },
    },
});