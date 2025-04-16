<template>
  <div id="app">
    <loading-spinner
        v-if="isLoading && !forceLoaded"
        :message="loadingMessage"
    />

    <router-view v-else />


    <Notification />
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

    const isLoading = computed(() => {
      return authStore.initializing ||
          (authStore.isAuthenticated && !authStore.permissionsLoaded);
    });

    const loadingMessage = computed(() => {
      if (authStore.initializing) return 'Inicializando aplicación...';
      if (authStore.isLoadingPermissions) return 'Cargando permisos de usuario...';
      return 'Verificando autenticación...';
    });

    watch(() => authStore.isAuthenticated, (isAuthenticated) => {
      if (isAuthenticated && !authStore.permissionsLoaded && !authStore.isLoadingPermissions) {
        authStore.loadUserRoleAndPermissions().catch(error => {
          authStore.permissionsLoaded = true;
        });
      }
    });

    onMounted(async () => {
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
      forceLoaded
    };
  }
}
</script>