import { defineStore } from 'pinia';
import usuariosApi from '../api/usuarios.api';
import { useNotificationStore } from './notification';

export const useUsuariosStore = defineStore('usuarios', {
    state: () => ({
        usuarios: [],
        currentUsuario: null,
        loading: false,
        error: null,
        pagination: {
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 0
        },
        filters: {
            search: '',
            activo: null,
            id_rol: ''
        }
    }),

    actions: {
        async fetchUsuarios(params = {}) {
            this.loading = true;
            this.error = null;
            const notificationStore = useNotificationStore();

            try {
                const mergedParams = {
                    ...this.filters,
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    ...params
                };

                if (mergedParams.id_rol) {
                    mergedParams.id_rol = Number(mergedParams.id_rol);
                }

                if (mergedParams.search && typeof mergedParams.search === 'string') {
                    mergedParams.search = mergedParams.search.trim();
                }

                Object.keys(mergedParams).forEach(key => {
                    if (mergedParams[key] === '' || mergedParams[key] === null || mergedParams[key] === undefined) {
                        delete mergedParams[key];
                    }
                });

                console.log('Enviando parámetros a la API:', mergedParams);
                const response = await usuariosApi.getAll(mergedParams);

                if (response.data.success) {
                    this.usuarios = response.data.data.usuarios;
                    this.pagination = response.data.data.pagination;
                } else {
                    this.error = response.data.message;
                    notificationStore.error(this.error, 'Error al cargar usuarios');
                }

                return response.data.success;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar usuarios';
                notificationStore.error(this.error, 'Error');
                return false;
            } finally {
                this.loading = false;
            }
        },

        async fetchUsuarioById(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await usuariosApi.getById(id);

                if (response.data.success) {
                    this.currentUsuario = response.data.data.usuario;
                    return this.currentUsuario;
                } else {
                    this.error = response.data.message;
                    return null;
                }
            } catch (error) {
                this.error = error.response?.data?.message || `Error al cargar el usuario ${id}`;
                return null;
            } finally {
                this.loading = false;
            }
        },

        async createUsuario(usuarioData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await usuariosApi.create(usuarioData);

                if (response.data.success) {
                    return response.data.data.usuario;
                } else {
                    this.error = response.data.message;
                    return null;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear el usuario';
                return null;
            } finally {
                this.loading = false;
            }
        },

        async updateUsuario(id, usuarioData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await usuariosApi.update(id, usuarioData);

                if (response.data.success) {
                    if (this.currentUsuario && this.currentUsuario.id_usuario === id) {
                        this.currentUsuario = response.data.data.usuario;
                    }

                    const index = this.usuarios.findIndex(u => u.id_usuario === id);
                    if (index !== -1) {
                        this.usuarios[index] = response.data.data.usuario;
                    }

                    return response.data.data.usuario;
                } else {
                    this.error = response.data.message;
                    return null;
                }
            } catch (error) {
                this.error = error.response?.data?.message || `Error al actualizar el usuario ${id}`;
                return null;
            } finally {
                this.loading = false;
            }
        },

        async deleteUsuario(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await usuariosApi.delete(id);

                if (response.data.success) {
                    this.usuarios = this.usuarios.filter(u => u.id_usuario !== id);

                    if (this.currentUsuario && this.currentUsuario.id_usuario === id) {
                        this.currentUsuario = null;
                    }

                    return true;
                } else {
                    this.error = response.data.message;
                    return false;
                }
            } catch (error) {
                this.error = error.response?.data?.message || `Error al eliminar el usuario ${id}`;
                return false;
            } finally {
                this.loading = false;
            }
        },

        async changeUsuarioStatus(id, activo) {
            this.loading = true;
            this.error = null;

            try {
                const response = await usuariosApi.changeStatus(id, activo);

                if (response.data.success) {
                    if (this.currentUsuario && this.currentUsuario.id_usuario === id) {
                        this.currentUsuario.activo = activo;
                    }

                    const index = this.usuarios.findIndex(u => u.id_usuario === id);
                    if (index !== -1) {
                        this.usuarios[index].activo = activo;
                    }

                    return true;
                } else {
                    this.error = response.data.message;
                    return false;
                }
            } catch (error) {
                this.error = error.response?.data?.message || `Error al cambiar el estado del usuario ${id}`;
                return false;
            } finally {
                this.loading = false;
            }
        },

        async resetPassword(id, newPassword) {
            this.loading = true;
            this.error = null;

            try {
                const response = await usuariosApi.resetPassword(id, { newPassword });

                if (response.data.success) {
                    return true;
                } else {
                    this.error = response.data.message;
                    return false;
                }
            } catch (error) {
                this.error = error.response?.data?.message || `Error al restablecer la contraseña del usuario ${id}`;
                throw error;
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
                activo: null,
                id_rol: ''
            };
            this.pagination.page = 1;
        },

        setPage(page) {
            this.pagination.page = page;
        }
    }
});