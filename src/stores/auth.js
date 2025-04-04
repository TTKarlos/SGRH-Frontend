import { defineStore } from "pinia"
import api, { setAuthToken } from "../api/axios"
import { useNotificationStore } from "./notification"

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(localStorage.getItem("user")) || null,
        token: localStorage.getItem("token") || null,
        loading: false,
        error: null,
        sessionExpiry: localStorage.getItem("sessionExpiry") || null,
    }),

    getters: {
        isAuthenticated: (state) => {
            return !!state.token && !!state.user && state.isSessionValid()
        },
        isAdmin: (state) => state.user && state.user.id_rol === 1,
        userRole: (state) => (state.user ? state.user.id_rol : null),
        hasPermission: (state) => (permiso) => {
            if (state.user && state.user.id_rol === 1) {
                return true
            }

            if (!state.user || !state.user.Rol || !state.user.Rol.Permisos) {
                return false
            }

            return state.user.Rol.Permisos.some((p) => p.nombre === permiso.nombre && p.tipo === permiso.tipo)
        },
        isSessionValid: (state) => () => {
            if (!state.sessionExpiry) return false
            const currentTime = new Date().getTime()
            const expiryTime = Number.parseInt(state.sessionExpiry)
            return !isNaN(expiryTime) && currentTime < expiryTime
        },
    },

    actions: {
        setToken(token) {
            this.token = token
            localStorage.setItem("token", token)
            setAuthToken(token)

            const expiryTime = new Date().getTime() + 60 * 60 * 1000
            this.sessionExpiry = expiryTime.toString()
            localStorage.setItem("sessionExpiry", expiryTime.toString())
        },

        setUser(userData) {
            this.user = userData
            if (userData) {
                localStorage.setItem("user", JSON.stringify(userData))
            } else {
                localStorage.removeItem("user")
            }
        },

        async login(credentials) {
            this.loading = true
            const notificationStore = useNotificationStore()

            try {
                const response = await api.post("/auth/login", credentials)
                const data = response.data

                if (data.success && data.data.user) {
                    this.error = null

                    const userData = data.data.user
                    const userToken = userData.token

                    this.setUser(userData)
                    this.setToken(userToken)

                    if (credentials.remember) {
                        const extendedExpiryTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000
                        this.sessionExpiry = extendedExpiryTime.toString()
                        localStorage.setItem("sessionExpiry", extendedExpiryTime.toString())
                    }

                    notificationStore.success(`Bienvenido/a, ${userData.nombre}`, "Sesión iniciada")

                    return true
                } else {
                    throw new Error(data.message || "Error de autenticación")
                }
            } catch (err) {
                const errorMessage =
                    err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message

                this.error = "Email o contraseña incorrectos"
                notificationStore.error("Email o contraseña incorrectos", "Error de autenticación")
                return false
            } finally {
                this.loading = false
            }
        },

        logout() {
            const notificationStore = useNotificationStore()
            const userName = this.user ? this.user.nombre : ""

            this.clearAuth()

            notificationStore.info(`Hasta pronto, ${userName}`, "Sesión cerrada")
            window.location.href = "/login"
        },

        clearAuth() {
            this.user = null
            this.token = null
            this.sessionExpiry = null
            this.error = null

            localStorage.removeItem("user")
            localStorage.removeItem("token")
            localStorage.removeItem("sessionExpiry")

            sessionStorage.clear()

            setAuthToken(null)
        },

        async getProfile() {
            const notificationStore = useNotificationStore()
            if (!this.token) return null

            if (!this.isSessionValid()) {
                this.clearAuth()
                notificationStore.warning("Su sesión ha expirado. Por favor, inicie sesión nuevamente.", "Sesión expirada")
                return null
            }

            this.loading = true

            try {
                const response = await api.get("/auth/profile")
                const data = response.data

                if (data.success && data.data.user) {
                    const userData = data.data.user
                    this.setUser(userData)
                    this.renewSession()

                    return userData
                } else {
                    this.clearAuth()
                    return null
                }
            } catch (err) {
                console.error("Error al obtener perfil:", err)
                this.clearAuth()
                return null
            } finally {
                this.loading = false
            }
        },

        async checkAuth() {
            if (!this.token) return false

            if (!this.isSessionValid()) {
                this.clearAuth()
                return false
            }

            try {
                const user = await this.getProfile()
                return !!user
            } catch (err) {
                return false
            }
        },

        renewSession() {
            if (!this.token || !this.user) return

            const expiryTime = new Date().getTime() + 60 * 60 * 1000
            this.sessionExpiry = expiryTime.toString()
            localStorage.setItem("sessionExpiry", expiryTime.toString())
        },

        clearError() {
            this.error = null
        },
    },
})

