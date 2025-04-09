import { defineStore } from 'pinia';
import permisosApi from '../api/permisos.api';

export const usePermisosStore = defineStore('permisos', {
    state: () => ({
        permisos: [],
        loading: false,
        error: null,
        filters: {
            search: '',
            order: 'ASC'
        }
    }),

    getters: {
        getPermisoById: (state) => (id) => {
            return state.permisos.find(permiso => permiso.id_permiso === Number(id));
        },

        getPermisosByTipo: (state) => (tipo) => {
            return state.permisos.filter(permiso => permiso.tipo === tipo);
        },

        getPermisosByNombre: (state) => (nombre) => {
            return state.permisos.filter(permiso => permiso.nombre === nombre);
        },

        getPermisosAgrupados: (state) => {
            const grupos = {};

            state.permisos.forEach(permiso => {
                if (!grupos[permiso.nombre]) {
                    grupos[permiso.nombre] = [];
                }
                grupos[permiso.nombre].push(permiso);
            });

            return grupos;
        }
    },

    actions: {
        async fetchPermisos(params = {}) {
            this.loading = true;
            this.error = null;

            try {
                const mergedParams = {
                    ...this.filters,
                    ...params
                };

                const response = await permisosApi.getAllPermisos(mergedParams);

                if (response.data.success) {
                    this.permisos = response.data.data.permisos;
                } else {
                    this.error = response.data.message;
                }

                return response.data.success;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar permisos';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async fetchPermisoById(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await permisosApi.getPermisoById(id);

                if (response.data.success) {
                    const index = this.permisos.findIndex(p => p.id_permiso === Number(id));
                    if (index !== -1) {
                        this.permisos[index] = response.data.data.permiso;
                    } else {
                        this.permisos.push(response.data.data.permiso);
                    }

                    return response.data.data.permiso;
                } else {
                    this.error = response.data.message;
                    return null;
                }
            } catch (error) {
                this.error = error.response?.data?.message || `Error al cargar el permiso ${id}`;
                return null;
            } finally {
                this.loading = false;
            }
        },

        setFilters(filters) {
            this.filters = { ...this.filters, ...filters };
        },

        resetFilters() {
            this.filters = {
                search: '',
                order: 'ASC'
            };
        }
    }
});