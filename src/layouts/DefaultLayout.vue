<template>
  <div class="app-layout">
    <!-- Mostrar spinner mientras se cargan los permisos -->
    <loading-spinner
        v-if="authStore.isAuthenticated && !authStore.permissionsLoaded"
        message="Cargando permisos de usuario..."
    />

    <template v-else>
      <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-header">
          <div class="logo">
            <svg class="logo-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="3" fill="#dc2626" />
              <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="logo-text">SGRH</span>
          </div>
          <button class="sidebar-close" @click="closeSidebar">
            <X size="18" />
          </button>
        </div>

        <div class="user-profile">
          <div class="user-avatar">
            <span class="avatar-text">{{ userInitials }}</span>
          </div>
          <div class="user-info">
            <h3 class="user-name">{{ userName }}</h3>
            <p class="user-role">{{ userRole }}</p>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <span class="nav-section-title">Principal</span>
            <router-link to="/dashboard" class="nav-item" @click="closeSidebarOnMobile">
              <Home class="nav-icon" size="18" />
              <span class="nav-text">Dashboard</span>
            </router-link>

            <router-link
                v-if="hasPermission({nombre: 'Empleados', tipo: 'Lectura'})"
                to="/empleados"
                class="nav-item"
                @click="closeSidebarOnMobile"
            >
              <Users class="nav-icon" size="18" />
              <span class="nav-text">Empleados</span>
            </router-link>
          </div>

          <!-- Título de categoría condicionado por permisos -->
          <div class="nav-section" v-if="hasPermission({nombre: 'Usuarios', tipo: 'Lectura'}) ||
                                      hasPermission({nombre: 'Usuarios', tipo: 'Escritura'})">
            <span class="nav-section-title">Sistema</span>

            <router-link
                v-if="hasPermission({nombre: 'Usuarios', tipo: 'Lectura'})"
                to="/usuarios"
                class="nav-item"
                @click="closeSidebarOnMobile"
            >
              <UserCog class="nav-icon" size="18" />
              <span class="nav-text">Usuarios</span>
            </router-link>

            <router-link
                v-if="hasPermission({nombre: 'Usuarios', tipo: 'Escritura'})"
                to="/roles"
                class="nav-item"
                @click="closeSidebarOnMobile"
            >
              <Shield class="nav-icon" size="18" />
              <span class="nav-text">Roles</span>
            </router-link>
          </div>
        </nav>

        <div class="sidebar-footer">
          <button @click="logout" class="logout-button">
            <LogOut class="logout-icon" size="18" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div class="main-wrapper">
        <main class="main-content">
          <slot></slot>
        </main>
      </div>

      <div v-if="sidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import {
  Home,
  Users,
  UserCog,
  Shield,
  LogOut,
  Menu,
  X,
  Search
} from 'lucide-vue-next';

export default {
  name: 'DefaultLayout',
  components: {
    LoadingSpinner,
    Home,
    Users,
    UserCog,
    Shield,
    LogOut,
    Menu,
    X,
    Search
  },
  setup() {
    const authStore = useAuthStore();
    const route = useRoute();
    const router = useRouter();
    const sidebarOpen = ref(false);

    const currentRouteName = computed(() => {
      const routeNames = {
        dashboard: 'Dashboard',
        empleados: 'Empleados',
        'empleado-nuevo': 'Nuevo Empleado',
        'empleado-detalle': 'Detalle de Empleado',
        usuarios: 'Usuarios',
        'usuario-nuevo': 'Nuevo Usuario',
        'usuario-detalle': 'Detalle de Usuario',
        roles: 'Roles',
        unauthorized: 'Acceso Denegado',
        'not-found': 'Página No Encontrada'
      };

      return routeNames[route.name] || 'Dashboard';
    });

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value;
    };

    const closeSidebar = () => {
      sidebarOpen.value = false;
    };

    const closeSidebarOnMobile = () => {
      if (window.innerWidth < 1024) {
        closeSidebar();
      }
    };

    const logout = () => {
      authStore.logout();
      router.push('/login');
    };

    const hasPermission = (permission) => {
      if (authStore.isAdmin) {
        return true;
      }

      if (permission.tipo === 'Escritura') {
        return authStore.hasPermission(permission);
      } else if (permission.tipo === 'Lectura') {
        return (
            authStore.hasPermission(permission) ||
            authStore.hasPermission({ ...permission, tipo: 'Escritura' })
        );
      }

      return false;
    };

    onMounted(async () => {
      if (authStore.isAuthenticated &&
          (!authStore.user?.Rol || !authStore.user?.Rol?.Permisos) &&
          !authStore.isLoadingPermissions) {
        try {
          await authStore.loadUserRoleAndPermissions();
        } catch (error) {
          authStore.permissionsLoaded = true;
        }
      }
    });

    return {
      authStore,
      sidebarOpen,
      currentRouteName,
      toggleSidebar,
      closeSidebar,
      closeSidebarOnMobile,
      hasPermission,
      logout
    };
  },
  computed: {
    userName() {
      return this.authStore.user && this.authStore.user.nombre ? this.authStore.user.nombre : '';
    },

    userInitials() {
      if (!this.authStore.user) return '';

      const nombre = this.authStore.user.nombre || '';
      const apellidos = this.authStore.user.apellidos || '';

      if (!nombre && !apellidos) return '';

      const inicialNombre = nombre.charAt(0);
      const inicialApellido = apellidos.charAt(0);

      return (inicialNombre + inicialApellido).toUpperCase();
    },

    userRole() {
      if (!this.authStore.user || !this.authStore.user.Rol) return '';

      return this.authStore.user.Rol.nombre || '';
    }
  }
}
</script>

<style>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
}

.sidebar {
  width: 260px;
  background-color: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 50;
  transition: transform 0.3s ease;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.sidebar-close {
  display: none;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
}

.user-profile {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background-color: #dc2626;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.sidebar-nav {
  flex: 1;
  padding: 1.25rem 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-section-title {
  display: block;
  padding: 0 1.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  color: #4b5563;
  text-decoration: none;
  position: relative;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.nav-item.router-link-active {
  background-color: #f3f4f6;
  color: #dc2626;
  font-weight: 500;
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: #dc2626;
}

.nav-icon {
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 1.25rem;
  border-top: 1px solid #e5e7eb;
}

.logout-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.625rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background-color: #e5e7eb;
}

.logout-icon {
  margin-right: 0.75rem;
}

.main-wrapper {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left 0.3s ease;
}

.main-header {
  height: 64px;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-left {
  display: flex;
  align-items: center;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  margin-right: 1rem;
  padding: 0.25rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb-item {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container {
  position: relative;
  width: 240px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #dc2626;
  background-color: #fff;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  min-width: 0;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 45;
}

@media (max-width: 1023px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .sidebar-close {
    display: block;
  }

  .main-wrapper {
    margin-left: 0;
  }

  .menu-toggle {
    display: block;
  }

  .sidebar-overlay {
    display: block;
  }
}

@media (max-width: 767px) {
  .search-container {
    display: none;
  }

  .main-header {
    padding: 0 1rem;
  }
}

@media (max-width: 639px) {
  .breadcrumb {
    display: none;
  }
}
</style>