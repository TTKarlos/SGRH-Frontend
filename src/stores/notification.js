import { defineStore } from "pinia"

export const useNotificationStore = defineStore("notification", {
    state: () => ({
        message: null,
        type: null,
        timeoutId: null,
    }),

    actions: {
        showNotification(message, type) {
            this.message = message
            this.type = type

            if (this.timeoutId) {
                clearTimeout(this.timeoutId)
            }

            this.timeoutId = setTimeout(() => {
                this.clearNotification()
            }, 3000)
        },

        success(message, title = "Éxito") {
            this.showNotification(`${title}: ${message}`, "success")
        },

        error(message, title = "Error") {
            this.showNotification(`${title}: ${message}`, "error")
        },

        info(message, title = "Información") {
            this.showNotification(`${title}: ${message}`, "info")
        },

        warning(message, title = "Advertencia") {
            this.showNotification(`${title}: ${message}`, "warning")
        },

        clearNotification() {
            this.message = null
            this.type = null
        },
    },
})