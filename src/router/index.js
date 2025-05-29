import { createRouter, createWebHistory } from "vue-router"
import { setupPermissionGuard } from "./guards/permissionGuard"

import Dashboard from "../views/dashboard/Dashboard.vue"
import Login from "../views/auth/Login.vue"
import Usuarios from "../views/usuarios/Usuarios.vue"
import UsuarioNuevo from "../views/usuarios/UsuarioNuevo.vue"
import UsuarioDetalle from "../views/usuarios/UsuarioDetalle.vue"
import Empleados from "../views/empleados/Empleados.vue"
import EmpleadoNuevo from "../views/empleados/EmpleadoNuevo.vue"
import EmpleadoDetalle from "../views/empleados/EmpleadoDetalle.vue"
import RolesGestion from "../views/roles/RolesGestion.vue"
import CentrosGestion from "../views/centros/CentrosGestion.vue"
import DepartamentosGestion from "../views/departamentos/DepartamentosGestion.vue"
import ZonasGestion from "../views/zonas/ZonasGestion.vue"
import TiposContratoView from "../views/contratos/TiposContratoView.vue"
import EmpresasView from "../views/empresas/EmpresasView.vue"
import ConveniosView from "../views/convenios/ConveniosView.vue"
import CategoriasConveniosView from "../views/convenios/CategoriasConveniosView.vue"
import Unauthorized from "../views/errors/Unauthorized.vue"
import NotFound from "../views/errors/NotFound.vue"

const routes = [
    {
        path: "/",
        redirect: "/dashboard",
    },
    {
        path: "/dashboard",
        name: "dashboard",
        component: Dashboard,
        meta: {
            title: "Dashboard",
            icon: "LayoutDashboard",
        },
    },
    {
        path: "/login",
        name: "login",
        component: Login,
        meta: {
            public: true,
            title: "Login",
        },
    },
    {
        path: "/usuarios",
        name: "usuarios",
        component: Usuarios,
        meta: {
            title: "Usuarios",
            icon: "Users",
            requiredPermission: { nombre: "Usuarios", tipo: "Lectura" },
        },
    },
    {
        path: "/usuarios/nuevo",
        name: "usuario-nuevo",
        component: UsuarioNuevo,
        meta: {
            title: "Nuevo Usuario",
            requiredPermission: { nombre: "Usuarios", tipo: "Escritura" },
        },
    },
    {
        path: "/usuarios/:id",
        name: "usuario-detalle",
        component: UsuarioDetalle,
        props: true,
        meta: {
            title: "Detalle de Usuario",
            requiredPermission: { nombre: "Usuarios", tipo: "Lectura" },
        },
    },
    {
        path: "/empleados",
        name: "empleados",
        component: Empleados,
        meta: {
            title: "Empleados",
            icon: "UserRound",
            requiredPermission: { nombre: "Empleados", tipo: "Lectura" },
        },
    },
    {
        path: "/empleados/nuevo",
        name: "empleado-nuevo",
        component: EmpleadoNuevo,
        meta: {
            title: "Nuevo Empleado",
            requiredPermission: { nombre: "Empleados", tipo: "Escritura" },
        },
    },
    {
        path: "/empleados/:id",
        name: "empleado-detalle",
        component: EmpleadoDetalle,
        props: true,
        meta: {
            title: "Detalle de Empleado",
            requiredPermission: { nombre: "Empleados", tipo: "Lectura" },
        },
    },
    {
        path: "/roles",
        name: "roles",
        component: RolesGestion,
        meta: {
            title: "Gestión de Roles",
            icon: "Shield",
            requiredPermission: { nombre: "Usuarios", tipo: "Escritura" },
        },
    },
    {
        path: "/centros",
        name: "centros",
        component: CentrosGestion,
        meta: {
            title: "Centros",
            icon: "Building2",
            requiredPermission: { nombre: "Master", tipo: "Escritura" },
        },
    },
    {
        path: "/centros/:idCentro/departamentos",
        name: "departamentos",
        component: DepartamentosGestion,
        props: true,
        meta: {
            title: "Departamentos por Centro",
            requiredPermission: { nombre: "Master", tipo: "Escritura" },
        },
    },
    {
        path: "/zonas",
        name: "zonas",
        component: ZonasGestion,
        meta: {
            requiresAuth: true,
            requiredPermission: { nombre: "Master", tipo: "Escritura" },
            title: "Gestión de Zonas",
        },
    },
    {
        path: "/tipos-contrato",
        name: "tipos-contrato",
        component: TiposContratoView,
        meta: {
            title: "Tipos de Contrato",
            icon: "FileText",
            requiredPermission: { nombre: "Master", tipo: "Escritura" },
        },
    },
    {
        path: "/empresas",
        name: "empresas",
        component: EmpresasView,
        meta: {
            title: "Empresas",
            icon: "Building",
            requiredPermission: { nombre: "Master", tipo: "Escritura" },
        },
    },
    {
        path: "/convenios",
        name: "convenios",
        component: ConveniosView,
        meta: {
            title: "Convenios Colectivos",
            icon: "FileContract",
            requiredPermission: { nombre: "Master", tipo: "Escritura" },
        },
    },
    {
        path: "/convenios/:idConvenio/categorias",
        name: "categorias-convenio",
        component: CategoriasConveniosView,
        props: true,
        meta: {
            title: "Categorías de Convenio",
            requiredPermission: { nombre: "Master", tipo: "Escritura" },
        },
    },
    {
        path: "/unauthorized",
        name: "unauthorized",
        component: Unauthorized,
        meta: {
            title: "Acceso Denegado",
            requiresAuth: true,
        },
    },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: NotFound,
        meta: {
            title: "Página No Encontrada",
            public: true,
        },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

setupPermissionGuard(router)

export default router
