<template>
  <div v-if="loading" class="state-container loading">
    <div class="loading-animation">
      <div class="loading-circle"></div>
      <div class="loading-circle"></div>
      <div class="loading-circle"></div>
    </div>
    <p>Cargando roles...</p>
  </div>

  <div v-else-if="error" class="state-container error">
    <div class="error-icon">
      <AlertTriangle size="48" />
    </div>
    <h3>Error al cargar los roles</h3>
    <p>{{ error }}</p>
    <button @click="retryFetch" class="retry-btn">
      <RefreshCw size="16" class="btn-icon" />
      Reintentar
    </button>
  </div>

  <div v-else-if="empty" class="state-container empty">
    <div class="empty-icon">
      <FolderX size="64" />
    </div>
    <h3>No se encontraron roles</h3>
    <p class="empty-description">Intente con otros criterios de búsqueda o cree un nuevo rol</p>
  </div>
</template>

<script>
import { AlertTriangle, FolderX, RefreshCw } from 'lucide-vue-next';

export default {
  name: 'RolesStates',
  components: {
    AlertTriangle,
    FolderX,
    RefreshCw
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: [String, null],
      default: null
    },
    empty: {
      type: Boolean,
      default: false
    }
  },
  emits: ['retry'],
  methods: {
    retryFetch() {
      this.$emit('retry');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 2rem;
  text-align: center;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.75rem;
  border: 1px solid #e5e7eb;
  font-family: 'Poppins', sans-serif;
}

.state-container h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.state-container p {
  margin: 0.5rem 0;
  color: #6b7280;
  font-size: 1rem;
}

.loading-animation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.loading-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #dc2626;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-circle:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-circle:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
}

.error-icon {
  color: #dc2626;
  margin-bottom: 1rem;
  background-color: rgba(220, 38, 38, 0.1);
  padding: 1.5rem;
  border-radius: 50%;
  border: 2px solid rgba(220, 38, 38, 0.2);
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-description {
  color: #9ca3af !important;
  font-size: 0.875rem !important;
  max-width: 300px;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background-color: #dc2626;
  color: white;
  margin-top: 1.5rem;
}

.retry-btn:hover {
  background-color: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.retry-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.btn-icon {
  margin-right: 0.5rem;
}
</style>