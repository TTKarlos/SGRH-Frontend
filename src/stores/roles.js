import { defineStore } from 'pinia';
import rolesApi from '../api/roles.api';
import { useNotificationStore } from './notification';

export const useRolesStore = defineStore('roles', {
    state: () => ({
        roles: [],
        currentRol: null,
        miRol: null,
        loading: false,
        error: null,
        filters: {
            search: '',
            order: 'ASC'
        },
        pagination: {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0
        }
    }),

    getters: {
        getRolById: (state) => (id) => {
            return state.roles.find(rol => rol.id_rol === id);
        },

        getRolNombre: (state) => (id) => {
            const rol = state.roles.find(rol => rol.id_rol === id);
            return rol ? rol.nombre : `Rol ${id}`;
        },

        getPermisosAgrupados: (state) => {
            if (!state.currentRol || !state.currentRol.Permisos) return {};

            const grupos = {};
            state.currentRol.Permisos.forEach(permiso => {
                if (!grupos[permiso.nombre]) {
                    grupos[permiso.nombre] = [];
                }
                grupos[permiso.nombre].push(permiso);
            });

            return grupos;
        }
    },

    actions: {
        async fetchRoles(params = {}) {
            this.loading = true;
            this.error = null;

            try {
                const response = await rolesApi.getAllRoles({
                    ...this.filters,
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...params
                });

                if (response.data.success) {
                    this.roles = response.data.data.roles;
                    this.pagination = response.data.data.pagination;
                    return true;
                } else {
                    throw new Error(response.data.message || 'Error al cargar roles');
                }
            } catch (error) {
                this.error = error.message || 'Error al cargar roles';
                const notificationStore = useNotificationStore();
                notificationStore.error(this.error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async fetchRolById(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await rolesApi.getRoleById(id);

                if (response.data.success) {
                    this.currentRol = response.data.data.rol;
                    return response.data.data.rol;
                } else {
                    throw new Error(response.data.message || 'Error al cargar el rol');
                }
            } catch (error) {
                this.error = error.message || `Error al cargar el rol ${id}`;
                const notificationStore = useNotificationStore();
                notificationStore.error(this.error);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async fetchMiRol() {
            this.loading = true;
            this.error = null;

            try {
                const response = await rolesApi.getMiRol();

                if (response.data.success) {
                    this.miRol = response.data.data.rol;
                    return response.data.data.rol;
                } else {
                    throw new Error(response.data.message || 'Error al cargar tu rol');
                }
            } catch (error) {
                this.error = error.message || 'Error al cargar tu rol';
                const notificationStore = useNotificationStore();
                notificationStore.error(this.error);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async createRol(rolData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await rolesApi.createRole(rolData);

                if (response.data.success) {
                    await this.fetchRoles();
                    return response.data.data.rol;
                } else {
                    throw new Error(response.data.message || 'Error al crear el rol');
                }
            } catch (error) {
                this.error = error.message || 'Error al crear el rol';
                const notificationStore = useNotificationStore();
                notificationStore.error(this.error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateRol(id, rolData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await rolesApi.updateRole(id, rolData);

                if (response.data.success) {
                    if (this.currentRol && this.currentRol.id_rol === id) {
                        this.currentRol = response.data.data.rol;
                    }

                    const index = this.roles.findIndex(r => r.id_rol === id);
                    if (index !== -1) {
                        this.roles[index] = response.data.data.rol;
                    }

                    return response.data.data.rol;
                } else {
                    throw new Error(response.data.message || 'Error al actualizar el rol');
                }
            } catch (error) {
                this.error = error.message || `Error al actualizar el rol ${id}`;
                const notificationStore = useNotificationStore();
                notificationStore.error(this.error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteRol(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await rolesApi.deleteRole(id);

                if (response.data.success) {
                    this.roles = this.roles.filter(r => r.id_rol !== id);

                    if (this.currentRol && this.currentRol.id_rol === id) {
                        this.currentRol = null;
                    }

                    return true;
                } else {
                    throw new Error(response.data.message || 'Error al eliminar el rol');
                }
            } catch (error) {
                this.error = error.message || `Error al eliminar el rol ${id}`;
                const notificationStore = useNotificationStore();
                notificationStore.error(this.error);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async updatePermisos(id, permisos) {
            this.loading = true;
            this.error = null;

            try {
                const response = await rolesApi.updateRolePermissions(id, permisos);

                if (response.data.success) {
                    if (this.currentRol && this.currentRol.id_rol === id) {
                        this.currentRol = response.data.data.rol;
                    }

                    const index = this.roles.findIndex(r => r.id_rol === id);
                    if (index !== -1) {
                        this.roles[index] = response.data.data.rol;
                    }

                    return response.data.data.rol;
                } else {
                    throw new Error(response.data.message || 'Error al actualizar permisos del rol');
                }
            } catch (error) {
                this.error = error.message || `Error al actualizar permisos del rol ${id}`;
                const notificationStore = useNotificationStore();
                notificationStore.error(this.error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        updateFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters };
        },

        resetFilters() {
            this.filters = {
                search: '',
                order: 'ASC'
            };
            this.pagination.page = 1;
        },

        setPage(page) {
            this.pagination.page = page;
        }
    }
});