import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"
import "./assets/css/main.css"

const app = createApp(App)

app.use(createPinia())

app.use(router)

import { useAuthStore } from "./stores/auth"
import { useNotificationStore } from "./stores/notification"

const pinia = createPinia()
const authStore = useAuthStore(pinia)
const notificationStore = useNotificationStore(pinia)

window.addEventListener("beforeunload", (event) => {
    if (authStore.isAuthenticated) {
        event.preventDefault()
    }
})

app.directive("permission", {
    mounted(el, binding) {
        const { value } = binding

        if (!value || !value.nombre || !value.tipo) {
            console.warn("v-permission requiere un objeto con nombre y tipo")
            return
        }

        if (authStore.isAdmin) {
            return
        }

        if (!authStore.hasPermission(value)) {
            el.style.display = "none"
        }
    },
})

app.mount("#app")

