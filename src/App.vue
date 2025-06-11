<template>
  <div id="app">
    <loading-spinner
        v-if="isLoading && !forceLoaded"
        :message="loadingMessage"
    />

    <router-view v-else />

    <Notification />


    <!-- Depurador de permisos -->
    <PermissionDebugger v-if="isDevelopment && showDebugger" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import LoadingSpinner from './components/common/LoadingSpinner.vue';
import Notification from './components/common/Notification.vue';
import PermissionDebugger from "./components/debug/PermissionDebugger.vue";

export default {
  name: 'App',
  components: {
    PermissionDebugger,
    LoadingSpinner,
    Notification
  },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const isDevelopment = computed(() => process.env.NODE_ENV === 'development');
    const forceLoaded = ref(false);
    const showDebugger = ref(false);

    const isLoading = computed(() => {
      return authStore.initializing ||
          (authStore.isAuthenticated && !authStore.permissionsLoaded);
    });

    const loadingMessage = computed(() => {
      if (authStore.initializing) return 'Inicializando aplicación...';
      if (authStore.isLoadingPermissions) return 'Cargando permisos de usuario...';
      return 'Verificando autenticación...';
    });

    const toggleDebugger = () => {
      showDebugger.value = !showDebugger.value;
      localStorage.setItem('showPermissionDebugger', showDebugger.value);
    };

    watch(() => authStore.isAuthenticated, (isAuthenticated) => {
      if (isAuthenticated && !authStore.permissionsLoaded && !authStore.isLoadingPermissions) {
        authStore.loadUserRoleAndPermissions().catch(error => {
          authStore.permissionsLoaded = true;
        });
      }
    });

    onMounted(async () => {
      const savedDebuggerState = localStorage.getItem('showPermissionDebugger');
      if (savedDebuggerState !== null) {
        showDebugger.value = savedDebuggerState === 'true';
      }

      const safetyTimeout = setTimeout(() => {
        forceLoaded.value = true;
        authStore.initializing = false;
        authStore.isLoadingPermissions = false;

        if (authStore.isAuthenticated) {
          authStore.permissionsLoaded = true;
        }
      }, 5000);

      try {
        await authStore.initAuth();
        clearTimeout(safetyTimeout);
      } catch (error) {
        forceLoaded.value = true;
        authStore.initializing = false;
      }
    });

    return {
      isLoading,
      loadingMessage,
      forceLoaded,
      isDevelopment,
      showDebugger,
      toggleDebugger
    };
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Estilos para el botón de depurador */
.debug-toggle-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: #1e293b;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.debug-toggle-button:hover {
  background-color: #334155;
}

.debug-toggle-button.active {
  background-color: #E11D48;
}

.debug-toggle-button.active:hover {
  background-color: #BE123C;
}
</style>
