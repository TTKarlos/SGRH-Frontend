import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "../stores/auth"

// Layouts
import DefaultLayout from "../layouts/DefaultLayout.vue"
import AuthLayout from "../layouts/AuthLayout.vue"

// Vistas
import Login from "../views/auth/Login.vue"
import Dashboard from "../views/dashboard/Dashboard.vue"
import Empleados from "../views/empleados/Empleados.vue"
import EmpleadoDetalle from "../views/empleados/EmpleadoDetalle.vue"

const routes = [
    {
        path: "/",
        redirect: "/login",
    },
    {
        path: "/",
        component: DefaultLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: "dashboard",
                name: "dashboard",
                component: Dashboard,
            },
            {
                path: "empleados",
                name: "empleados",
                component: Empleados,
                meta: {
                    permissions: [{ nombre: "Empleados", tipo: "Lectura" }],
                },
            },
            {
                path: "empleados/:id",
                name: "empleado-detalle",
                component: EmpleadoDetalle,
                props: true,
                meta: {
                    permissions: [{ nombre: "Empleados", tipo: "Lectura" }],
                },
            },
        ],
    },
    {
        path: "/",
        component: AuthLayout,
        children: [
            {
                path: "login",
                name: "login",
                component: Login,
            },
        ],
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/login",
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (requiresAuth && !isAuthenticated) {
        window.location.href = '/login';
        return;
    }

    if (to.name === 'login' && isAuthenticated) {
        next({ name: 'dashboard' });
        return;
    }

    if (isAuthenticated && to.meta.permissions) {
        if (authStore.isAdmin) {
            next();
            return;
        }

        const hasRequiredPermissions = to.meta.permissions.some(permission => {
            return authStore.hasPermission(permission);
        });

        if (!hasRequiredPermissions) {
            next({ name: 'dashboard' });
            return;
        }
    }

    if (!isAuthenticated && to.name !== 'login') {
        window.location.href = '/login';
        return;
    }

    next();
});

export default router
