<template>
  <aside class="sidebar">
    <div v-if="authStore.isLoadingPermissions" class="sidebar-loading">
      <div class="spinner"></div>
      <p>Cargando permisos...</p>
    </div>

    <template v-else>
      <div class="sidebar-header">
        <Logo />
      </div>

      <div class="sidebar-user">
        <div class="user-avatar">
          {{ userInitials }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ user?.nombre || 'Usuario' }}</div>
          <div class="user-role">{{ userRoleName }}</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link :to="{ name: 'dashboard' }" class="nav-link">
              <LayoutDashboard class="nav-icon" />
              <span class="nav-text">Dashboard</span>
            </router-link>
          </li>

          <li v-for="route in navigationRoutes" :key="route.name" class="nav-item">
            <template v-if="route.name !== 'dashboard'">
              <template v-if="route.meta?.requiredPermission">
                <router-link
                    v-if="hasPermission(route.meta.requiredPermission)"
                    :to="{ name: route.name }"
                    class="nav-link"
                >
                  <component :is="route.meta.icon" class="nav-icon" />
                  <span class="nav-text">{{ route.meta.title }}</span>
                </router-link>
              </template>

              <router-link
                  v-else
                  :to="{ name: route.name }"
                  class="nav-link"
              >
                <component :is="route.meta.icon" class="nav-icon" />
                <span class="nav-text">{{ route.meta.title }}</span>
              </router-link>
            </template>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="logout-button">
          <LogOut class="logout-icon" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </template>
  </aside>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useRolesStore } from '../../stores/roles'
import Logo from '../../components/common/Logo.vue'
import { LayoutDashboard, Users, UserRound, Shield, LogOut } from 'lucide-vue-next'

export default {
  name: 'Sidebar',
  components: {
    Logo,
    LayoutDashboard,
    Users,
    UserRound,
    Shield,
    LogOut
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const rolesStore = useRolesStore()

    const user = computed(() => authStore.user)

    const userInitials = computed(() => {
      if (!user.value) return ''

      const nombre = user.value.nombre || ''
      const apellidos = user.value.apellidos || ''

      const firstInitial = nombre.charAt(0)
      const lastInitial = apellidos.charAt(0)

      return `${firstInitial}${lastInitial}`.toUpperCase()
    })

    const navigationRoutes = computed(() => {
      return router.options.routes.filter(route => !route.meta?.public && route.meta?.icon)
    })

    const userRoleName = computed(() => {
      if (!user.value) return ''

      if (user.value.Rol?.nombre) {
        return user.value.Rol.nombre
      }

      const rolId = user.value.id_rol
      return rolesStore.getRolNombre(rolId)
    })

    const hasPermission = (permission) => {
      if (authStore.isAdmin) {
        return true
      }

      if (permission.tipo === 'Escritura') {
        return authStore.hasPermission(permission)
      } else if (permission.tipo === 'Lectura') {
        return (
            authStore.hasPermission(permission) ||
            authStore.hasPermission({ ...permission, tipo: 'Escritura' })
        )
      }

      return false
    }

    const logout = () => {
      authStore.logout()
    }

    onMounted(async () => {
      if (authStore.isAuthenticated &&
          (!user.value.Rol || !user.value.Rol.Permisos)) {
        await authStore.loadUserRoleAndPermissions()
      }
    })

    return {
      authStore,
      user,
      userInitials,
      navigationRoutes,
      userRoleName,
      logout,
      hasPermission
    }
  }
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  height: 100vh;
  background-color: #1e293b;
  color: #e2e8f0;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #334155;
}

.sidebar-user {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #334155;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
}

.user-role {
  font-size: 0.875rem;
  color: #94a3b8;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #e2e8f0;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: #334155;
}

.router-link-active {
  background-color: #334155;
  border-left: 3px solid #dc2626;
}

.nav-icon {
  margin-right: 0.75rem;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #334155;
}

.logout-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem;
  background-color: #334155;
  color: #e2e8f0;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background-color: #475569;
}

.logout-icon {
  margin-right: 0.75rem;
}

/* Loading spinner styles */
.sidebar-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(220, 38, 38, 0.2);
  border-radius: 50%;
  border-top-color: #dc2626;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>