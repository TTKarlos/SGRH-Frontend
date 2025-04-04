import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
})


export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
        delete api.defaults.headers.common["Authorization"]
    }
}

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        console.error("Error en interceptor de petición:", error)
        return Promise.reject(error)
    },
)


api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        const response = error.response

        if (response && response.status === 401) {
            console.log("Error de autenticación detectado, limpiando sesión...")

            localStorage.removeItem("token")
            localStorage.removeItem("user")
            localStorage.removeItem("sessionExpiry")
            sessionStorage.clear()
            delete api.defaults.headers.common["Authorization"]

            if (window.location.pathname !== "/login") {
                window.location.href = "/login"
            }
        }

        return Promise.reject(error)
    },
)

export default api

