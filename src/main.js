import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupPermissionGuard } from './router/guards/permissionGuard'
import { vPermission } from './directives/permission'
import './assets/css/main.css'

const pinia = createPinia()

const app = createApp(App)

app.use(pinia)

setupPermissionGuard(router)

app.use(router)

app.directive('permission', vPermission)

app.mount('#app')
