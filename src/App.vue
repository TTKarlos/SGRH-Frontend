<template>
  <div id="app">
    <loading-spinner v-if="isLoading" message="Verificando autenticación..." />
    <router-view v-else />
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth';
import LoadingSpinner from './components/common/LoadingSpinner.vue';

export default {
  name: 'App',

  components: {
    LoadingSpinner
  },

  data() {
    return {
      isLoading: true
    };
  },

  setup() {
    const authStore = useAuthStore();

    return {
      authStore
    };
  },

  created() {
    this.checkAuthentication();
  },

  methods: {
    async checkAuthentication() {
      this.isLoading = true;

      try {
        console.log('Verificando autenticación...');

        if (this.authStore.token) {
          console.log('Token encontrado, verificando validez...');


          const user = await this.authStore.getProfile();

          if (!user) {
            console.log('Token inválido o expirado, redirigiendo a login');
            this.authStore.clearAuth();
            this.$router.push('/login');
          } else if (this.$route.path === '/login') {
            console.log('Usuario autenticado en login, redirigiendo a dashboard');
            this.$router.push('/dashboard');
          }
        } else if (this.$route.path !== '/login') {
          console.log('No hay token, redirigiendo a login');
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        this.authStore.clearAuth();
        this.$router.push('/login');
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style>
/* Estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background-color: #f8f9fa;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Utilidades */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.text-center {
  text-align: center;
}

.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 3rem; }

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mb-5 { margin-bottom: 3rem; }

/* Formularios */
.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Botones */
.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
  border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  cursor: pointer;
}

.btn:focus, .btn:hover {
  text-decoration: none;
}

.btn-primary {
  color: #fff;
  background-color: #4361ee;
  border-color: #4361ee;
}

.btn-primary:hover {
  color: #fff;
  background-color: #3a56d4;
  border-color: #3a56d4;
}

.btn-secondary {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  color: #fff;
  background-color: #5a6268;
  border-color: #545b62;
}

.btn-success {
  color: #fff;
  background-color: #198754;
  border-color: #198754;
}

.btn-success:hover {
  color: #fff;
  background-color: #157347;
  border-color: #146c43;
}

.btn-danger {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  color: #fff;
  background-color: #bb2d3b;
  border-color: #b02a37;
}
</style>

