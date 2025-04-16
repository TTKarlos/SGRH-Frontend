import { defineStore } from "pinia";
import authApi from "../api/auth.api";
import rolesApi from "../api/roles.api";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoadingPermissions: false,
        permissionsLoaded: false,
        initializing: true,
        initError: null,
    }),

    getters: {
        getUser: (state) => state.user,
        getToken: (state) => state.token,
        getIsAuthenticated: (state) => state.isAuthenticated,
        isAdmin: (state) => state.user?.id_rol === 1,
    },

    actions: {
        setUser(user) {
            this.user = user;
            this.isAuthenticated = !!user;
        },

        setToken(token) {
            this.token = token;
            localStorage.setItem('token', token);
        },

        clearAuth() {
            this.user = null;
            this.token = null;
            this.isAuthenticated = false;
            this.permissionsLoaded = false;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },

        async login(credentials) {
            try {
                const response = await authApi.login(credentials);

                if (response.data.success) {
                    const userData = response.data.data.user;
                    this.setToken(userData.token);
                    this.setUser(userData);

                    try {
                        await this.loadUserRoleAndPermissions();
                    } catch (error) {
                        this.permissionsLoaded = true;
                    }

                    localStorage.setItem('user', JSON.stringify(this.user));
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                return false;
            }
        },

        async loadUserRoleAndPermissions() {
            if (!this.user || !this.user.id_rol) {
                this.permissionsLoaded = true;
                return false;
            }

            this.isLoadingPermissions = true;

            try {
                const response = await rolesApi.getRoleById(this.user.id_rol);

                if (response.data.success) {
                    const roleData = response.data.data.rol;
                    this.user = {
                        ...this.user,
                        Rol: roleData
                    };

                    localStorage.setItem('user', JSON.stringify(this.user));
                    this.permissionsLoaded = true;
                    return true;
                } else {
                    this.permissionsLoaded = true;
                    return false;
                }
            } catch (error) {
                this.permissionsLoaded = true;
                return false;
            } finally {
                this.isLoadingPermissions = false;
            }
        },

        async checkAuth() {
            if (this.token && this.user) {
                try {
                    await this.getProfile();
                    return this.isAuthenticated;
                } catch (error) {
                    this.clearAuth();
                    return false;
                }
            }

            return this.isAuthenticated;
        },

        async logout() {
            try {
                if (this.token) {
                    await authApi.logout();
                }
                this.clearAuth();
                return true;
            } catch (error) {
                this.clearAuth();
                return false;
            }
        },

        async getProfile() {
            try {
                const response = await authApi.getProfile();

                if (response.data.success) {
                    const userData = response.data.data.user;

                    if (!userData.Rol || !userData.Rol.Permisos) {
                        this.setUser(userData);
                        try {
                            await this.loadUserRoleAndPermissions();
                        } catch (error) {
                            this.permissionsLoaded = true;
                        }
                    } else {
                        this.setUser(userData);
                        this.permissionsLoaded = true;
                    }

                    return this.user;
                } else {
                    this.permissionsLoaded = true;
                    return null;
                }
            } catch (error) {
                this.permissionsLoaded = true;
                return null;
            }
        },

        hasPermission(permiso) {
            if (this.isAdmin) {
                return true;
            }

            if (!this.user || !this.user.Rol || !this.user.Rol.Permisos) {
                return false;
            }

            return this.user.Rol.Permisos.some(
                p => p.nombre === permiso.nombre && p.tipo === permiso.tipo
            );
        },

        async initAuth() {
            this.initializing = true;
            this.initError = null;

            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    try {
                        this.token = storedToken;
                        this.user = JSON.parse(storedUser);
                        this.isAuthenticated = true;

                        if (!this.user.Rol || !this.user.Rol.Permisos) {
                            try {
                                await this.loadUserRoleAndPermissions();
                            } catch (error) {
                                this.permissionsLoaded = true;
                            }
                        } else {
                            this.permissionsLoaded = true;
                        }

                        try {
                            await this.checkAuth();
                        } catch (error) {
                            this.clearAuth();
                        }
                    } catch (e) {
                        this.clearAuth();
                        this.initError = "Error al cargar datos de usuario";
                    }
                } else {
                    this.permissionsLoaded = true;
                }
            } catch (error) {
                this.clearAuth();
                this.initError = "Error al inicializar autenticación";
            } finally {
                this.initializing = false;
            }
        }
    },
});