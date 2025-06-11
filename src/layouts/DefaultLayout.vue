<template>
  <div class="app-layout">
    <loading-spinner
        v-if="authStore.isAuthenticated && !authStore.permissionsLoaded"
        message="Cargando permisos de usuario..."
    />

    <template v-else>
      <!-- Mobile Header - Always visible on mobile -->
      <header class="mobile-header">
        <div class="mobile-header-content">
          <button class="mobile-menu-btn" @click="toggleSidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div class="mobile-logo">
            <img src="../assets/images/logo.png" alt="Logo Empresa" class="mobile-company-logo" />
          </div>
          <div class="mobile-user-avatar">
            <span class="mobile-avatar-text">{{ userInitials }}</span>
          </div>
        </div>
      </header>

      <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
        <div class="sidebar-header">
          <div class="logo-container">
            <img src="../assets/images/logo.png" alt="Logo Empresa" class="company-logo" />
          </div>
          <button class="sidebar-close" @click="closeSidebar">
            <X size="20" />
          </button>
        </div>

        <div class="user-profile">
          <div class="user-avatar-container">
            <div class="user-avatar">
              <span class="avatar-text">{{ userInitials }}</span>
              <div class="avatar-status"></div>
            </div>
          </div>
          <div class="user-info">
            <h3 class="user-name">{{ userName }}</h3>
            <p class="user-role">{{ userRole }}</p>
            <div class="user-status">
              <span class="status-dot"></span>
              <span class="status-text">En línea</span>
            </div>
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

          <div class="nav-section" v-if="hasPermission({nombre: 'Master', tipo: 'Escritura'})">
            <span class="nav-section-title">Contratos</span>

            <router-link
                to="/tipos-contrato"
                class="nav-item"
                @click="closeSidebarOnMobile"
            >
              <FileText class="nav-icon" size="18" />
              <span class="nav-text">Tipos de Contrato</span>
            </router-link>

            <router-link
                to="/empresas"
                class="nav-item"
                @click="closeSidebarOnMobile"
            >
              <Building2 class="nav-icon" size="18" />
              <span class="nav-text">Empresas</span>
            </router-link>

            <router-link
                to="/convenios"
                class="nav-item"
                @click="closeSidebarOnMobile"
            >
              <FileText class="nav-icon" size="18" />
              <span class="nav-text">Convenios</span>
            </router-link>
          </div>

          <div class="nav-section" v-if="hasPermission({nombre: 'Master', tipo: 'Escritura'})">
            <span class="nav-section-title">Administración</span>

            <router-link
                v-if="hasPermission({nombre: 'Informes', tipo: 'Lectura'})"
                to="/informes"
                class="nav-item"
                @click="closeSidebarOnMobile"
            >
              <FileBarChart class="nav-icon" size="18" />
              <span class="nav-text">Informes</span>
            </router-link>

            <router-link
                v-if="hasPermission({nombre: 'Master', tipo: 'Escritura'})"
                to="/centros"
                class="nav-item"
                @click="closeSidebarOnMobile"
            >
              <Building2 class="nav-icon" size="18" />
              <span class="nav-text">Centros</span>
            </router-link>

            <router-link
                v-if="hasPermission({nombre: 'Master', tipo: 'Escritura'})"
                to="/zonas"
                class="nav-item"
                @click="closeSidebarOnMobile"
            >
              <MapPin class="nav-icon" size="18" />
              <span class="nav-text">Zonas</span>
            </router-link>
          </div>

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

      <div class="main-wrapper" :class="{ 'main-pushed': sidebarOpen && isMobile }">
        <main class="main-content">
          <slot></slot>
        </main>
      </div>

      <div v-if="sidebarOpen && isMobile" class="sidebar-overlay" @click="closeSidebar"></div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { X } from 'lucide-vue-next';
import { Home, Users, FileText, Building2, FileBarChart, MapPin, UserCog, Shield, LogOut } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  components: {
    X,
    Home,
    Users,
    FileText,
    Building2,
    FileBarChart,
    MapPin,
    UserCog,
    Shield,
    LogOut,
    LoadingSpinner,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const pageTitle = computed(() => route.meta.title || 'Dashboard');
    const sidebarOpen = ref(window.innerWidth >= 1024);
    const isMobile = ref(window.innerWidth < 1024);

    const handleResize = () => {
      const width = window.innerWidth;
      isMobile.value = width < 1024;

      if (width >= 1024) {
        sidebarOpen.value = true;
      } else if (!isMobile.value) {
        sidebarOpen.value = false;
      }
    };

    onMounted(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });

    watch(
        () => route.path,
        () => {
          if (isMobile.value) {
            sidebarOpen.value = false;
          }
        }
    );

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value;
    };

    const openSidebar = () => {
      sidebarOpen.value = true;
    };

    const closeSidebar = () => {
      if (isMobile.value) {
        sidebarOpen.value = false;
      }
    };

    const closeSidebarOnMobile = () => {
      if (isMobile.value) {
        sidebarOpen.value = false;
      }
    };

    const logout = () => {
      authStore.logout();
      router.push('/login');
    };

    const hasPermission = (permission) => {
      return authStore.hasPermission(permission);
    };

    const userName = computed(() => {
      if (!authStore.user) return '';
      const nombre = authStore.user.nombre || '';
      const apellidos = authStore.user.apellidos || '';
      return `${nombre} ${apellidos}`.trim();
    });

    const userRole = computed(() => {
      if (!authStore.user || !authStore.user.Rol) return '';
      return authStore.user.Rol.nombre || '';
    });

    const userInitials = computed(() => {
      if (!authStore.user) return '';

      const nombre = authStore.user.nombre || '';
      const apellidos = authStore.user.apellidos || '';

      if (!nombre && !apellidos) return '';

      const inicialNombre = nombre.charAt(0);
      const inicialApellido = apellidos.charAt(0);

      return (inicialNombre + inicialApellido).toUpperCase();
    });

    return {
      pageTitle,
      userName,
      userRole,
      userInitials,
      sidebarOpen,
      isMobile,
      toggleSidebar,
      openSidebar,
      closeSidebar,
      closeSidebarOnMobile,
      logout,
      authStore,
      hasPermission,
    };
  },
};
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
  position: relative;
}

/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  z-index: 40;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.mobile-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 100%;
}

.mobile-menu-btn {
  background: none;
  border: none;
  color: #4b5563;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.mobile-logo {
  flex: 1;
  display: flex;
  justify-content: center;
}

.mobile-company-logo {
  height: 32px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
}

.mobile-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.mobile-avatar-text {
  font-size: 0.75rem;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 50;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  height: 80px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.company-logo {
  height: auto;
  width: 85%;
  max-height: 60px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  transition: transform 0.3s ease;
}

.company-logo:hover {
  transform: scale(1.05);
}

.sidebar-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  z-index: 5;
}

.sidebar-close:hover {
  transform: rotate(90deg);
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.user-profile {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  position: relative;
}

.user-profile::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(220, 38, 38, 0.2), transparent);
}

.user-avatar-container {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 3px 6px rgba(220, 38, 38, 0.2);
  border: 2px solid white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.25);
}

.avatar-status {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 2px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  margin: 0 0 4px 0;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.status-dot {
  width: 5px;
  height: 5px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 0.625rem;
  color: #10b981;
  font-weight: 500;
}

.sidebar-nav {
  flex: 1;
  padding: 1.25rem 0;
  overflow-y: auto;
  /* Ocultar scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

/* Ocultar scrollbar en WebKit browsers (Chrome, Safari, Edge) */
.sidebar-nav::-webkit-scrollbar {
  display: none;
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
  position: relative;
  padding-left: 1.5rem;
}

.nav-section-title::before {
  content: '';
  position: absolute;
  left: 1.25rem;
  top: 50%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: #dc2626;
  transform: translateY(-50%);
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  color: #4b5563;
  text-decoration: none;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0.375rem;
  margin: 0 0.5rem;
  touch-action: manipulation;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #111827;
  transform: translateX(3px);
}

.nav-item.router-link-active {
  background-color: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: #dc2626;
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.5);
}

.nav-item.router-link-active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at left center, rgba(220, 38, 38, 0.15), transparent 70%);
  pointer-events: none;
}

.nav-icon {
  margin-right: 0.75rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
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
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  touch-action: manipulation;
}

.logout-button:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.logout-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(220, 38, 38, 0.3);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.logout-button:hover::after {
  animation: ripple 1s ease-out;
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

.main-pushed {
  margin-left: 0;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  min-width: 0;
}

.sidebar-overlay {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 45;
  backdrop-filter: blur(2px);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .sidebar {
    width: 280px;
  }

  .main-wrapper {
    margin-left: 280px;
  }

  .main-content {
    padding: 2rem;
  }

  .company-logo {
    max-height: 70px;
  }
}

/* Desktop (1024px - 1439px) */
@media (min-width: 1024px) and (max-width: 1439px) {
  .sidebar {
    width: 260px;
  }

  .main-wrapper {
    margin-left: 260px;
  }
}

/* Tablet and Mobile (< 1024px) */
@media (max-width: 1023px) {
  .mobile-header {
    display: block;
  }

  .sidebar {
    transform: translateX(-100%);
    width: 280px;
    z-index: 60;
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .sidebar-close {
    display: block;
  }

  .main-wrapper {
    margin-left: 0;
    padding-top: 60px;
  }

  .main-content {
    padding: 1.25rem;
  }

  .nav-item {
    padding: 0.75rem 1.25rem;
    margin: 0.125rem 0.5rem;
  }

  .nav-icon {
    margin-right: 1rem;
  }
}

/* Mobile Landscape (480px - 767px) */
@media (max-width: 767px) {
  .mobile-header {
    height: 56px;
  }

  .main-wrapper {
    padding-top: 56px;
  }

  .main-content {
    padding: 1rem;
  }

  .sidebar {
    width: 85%;
    max-width: 320px;
  }

  .sidebar-header {
    height: 70px;
    padding: 1rem;
  }

  .company-logo {
    max-height: 50px;
  }

  .user-profile {
    padding: 1rem;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }

  .user-name {
    font-size: 0.8rem;
  }

  .user-role {
    font-size: 0.7rem;
  }

  .nav-item {
    padding: 0.75rem 1rem;
    margin: 0.125rem 0.375rem;
  }

  .nav-section-title {
    padding-left: 1.25rem;
    font-size: 0.7rem;
  }

  .logout-button {
    padding: 0.75rem;
    font-size: 0.8rem;
  }
}

/* Mobile Portrait (320px - 479px) */
@media (max-width: 479px) {
  .mobile-header {
    height: 52px;
  }

  .mobile-header-content {
    padding: 0 0.5rem;
  }

  .mobile-company-logo {
    height: 28px;
    max-width: 100px;
  }

  .mobile-user-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.7rem;
  }

  .main-wrapper {
    padding-top: 52px;
  }

  .main-content {
    padding: 0.75rem;
  }

  .sidebar {
    width: 85%;
  }

  .sidebar-header {
    height: 60px;
    padding: 0.75rem;
  }

  .company-logo {
    max-height: 40px;
    width: 90%;
  }

  .user-profile {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }

  .avatar-status {
    width: 8px;
    height: 8px;
  }

  .user-name {
    font-size: 0.75rem;
  }

  .user-role {
    font-size: 0.65rem;
  }

  .status-text {
    font-size: 0.6rem;
  }

  .sidebar-nav {
    padding: 1rem 0;
  }

  .nav-item {
    padding: 0.625rem 0.75rem;
    margin: 0.125rem 0.25rem;
    font-size: 0.875rem;
  }

  .nav-icon {
    margin-right: 0.625rem;
  }

  .nav-section {
    margin-bottom: 1.25rem;
  }

  .nav-section-title {
    padding: 0 0.75rem;
    padding-left: 1rem;
    font-size: 0.65rem;
    margin-bottom: 0.375rem;
  }

  .sidebar-footer {
    padding: 0.75rem;
  }

  .logout-button {
    padding: 0.625rem;
    font-size: 0.75rem;
  }

  .logout-icon {
    margin-right: 0.5rem;
  }
}

/* Extra Small Mobile (< 320px) */
@media (max-width: 319px) {
  .mobile-header {
    height: 48px;
  }

  .mobile-company-logo {
    height: 24px;
    max-width: 80px;
  }

  .mobile-user-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.65rem;
  }

  .main-wrapper {
    padding-top: 48px;
  }

  .main-content {
    padding: 0.5rem;
  }

  .sidebar-header {
    height: 56px;
    padding: 0.5rem;
  }

  .company-logo {
    max-height: 36px;
  }

  .user-profile {
    padding: 0.5rem;
  }

  .nav-item {
    padding: 0.5rem;
    margin: 0.125rem;
    font-size: 0.8rem;
  }

  .nav-section-title {
    font-size: 0.6rem;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .nav-item:hover {
    transform: none;
  }

  .nav-item:active {
    background-color: #f3f4f6;
    transform: scale(0.98);
  }

  .logout-button:hover {
    background-color: #f3f4f6;
  }

  .logout-button:active {
    background-color: #fee2e2;
    transform: scale(0.98);
  }

  .mobile-menu-btn:active {
    background: rgba(220, 38, 38, 0.1);
    transform: scale(0.95);
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .company-logo,
  .mobile-company-logo {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* Landscape orientation on mobile */
@media (max-width: 767px) and (orientation: landscape) {
  .sidebar {
    width: 280px;
  }

  .mobile-header {
    height: 48px;
  }

  .main-wrapper {
    padding-top: 48px;
  }

  .sidebar-header {
    height: 60px;
  }

  .user-profile {
    padding: 0.75rem;
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .nav-item,
  .logout-button,
  .mobile-menu-btn,
  .company-logo,
  .user-avatar {
    transition: none;
  }

  .status-dot {
    animation: none;
  }

  .logout-button::after {
    animation: none;
  }
}
</style>
