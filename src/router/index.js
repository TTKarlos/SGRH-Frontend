import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import Dashboard from "../views/dashboard/Dashboard.vue";
import Login from "../views/auth/Login.vue";
import Empleados from "../views/empleados/Empleados.vue";
import EmpleadoDetalle from "../views/empleados/EmpleadoDetalle.vue";
import EmpleadoNuevo from "../views/empleados/EmpleadoNuevo.vue";
import Usuarios from "../views/usuarios/Usuarios.vue"
import UsuarioDetalle from "../views/usuarios/UsuarioDetalle.vue"
import UsuarioNuevo from "../views/usuarios/UsuarioNuevo.vue"


const routes = [
    {
        path: "/",
        redirect: "/dashboard",
        component: DefaultLayout,
        children: [
            { path: "/dashboard", name: "dashboard", component: Dashboard },
            {
                path: "empleados",
                name: "empleados",
                component: Empleados,
                meta: {
                    permissions: [{ nombre: "Empleados", tipo: "Lectura" }],
                },
            },
            {
                path: "empleados/nuevo",
                name: "empleado-nuevo",
                component: EmpleadoNuevo,
                meta: {
                    permissions: [{ nombre: "Empleados", tipo: "Escritura" }],
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
            {
                path: "usuarios",
                name: "usuarios",
                component: Usuarios,
                meta: {
                    permissions: [{ nombre: "Usuarios", tipo: "Lectura" }],
                },
            },
            {
                path: "usuarios/nuevo",
                name: "usuario-nuevo",
                component: UsuarioNuevo,
                meta: {
                    permissions: [{ nombre: "Usuarios", tipo: "Escritura" }],
                },
            },
            {
                path: "usuarios/:id",
                name: "usuario-detalle",
                component: UsuarioDetalle,
                props: true,
                meta: {
                    permissions: [{ nombre: "Usuarios", tipo: "Lectura" }],
                },
            },
            {
                path: '/roles',
                name: 'RolesGestion',
                component: () => import('../views/roles/RolesGestion.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Gestión de Roles y Permisos'
                }
            }

        ],
    },
    {
        path: "/auth",
        redirect: "/login",
        name: "auth",
        component: AuthLayout,
        meta: { isGuest: true },
        children: [
            {
                path: "/login",
                name: "login",
                component: Login,
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;