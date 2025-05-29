<template>
  <div class="unauthorized-page">
    <div class="error-container">
      <div class="error-icon">
        <Shield size="64" />
      </div>
      <h1 class="error-title">Acceso Denegado</h1>
      <p class="error-message">
        No tiene permisos para acceder a esta página.
      </p>
      <div class="error-actions">
        <router-link to="/" class="btn btn-primary">
          Volver al Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { Shield } from 'lucide-vue-next'

export default {
  name: 'Unauthorized',
  components: {
    Shield
  }
}
</script>

<style scoped>
.unauthorized-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
}

.error-container {
  max-width: 500px;
  padding: 2rem;
  text-align: center;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #ef4444;
}

.error-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.error-message {
  color: #64748b;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background-color: #4338ca;
}
</style>