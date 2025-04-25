<template>
  <div class="tab-panel">
    <div class="card">
      <div class="card-header">
        <div class="card-header-content">
          <h2>Formación del Empleado</h2>
          <button v-if="canEdit" @click="$emit('add-formacion')" class="btn btn-primary">
            <Plus size="18" class="btn-icon" />
            Nueva Formación
          </button>
        </div>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading-container">
          <Loader size="32" class="animate-spin" />
          <p>Cargando formaciones...</p>
        </div>
        <div v-else-if="error" class="error-container">
          <div class="error-message">
            <AlertTriangle size="24" />
            <p>{{ error }}</p>
          </div>
          <button @click="$emit('reload')" class="btn btn-primary">
            Reintentar
          </button>
        </div>
        <div v-else-if="formaciones.length === 0" class="empty-state">
          <GraduationCap size="48" class="empty-icon" />
          <h3>Sin formaciones registradas</h3>
          <p>Este empleado no tiene formaciones registradas.</p>
        </div>
        <div v-else class="formaciones-list">
          <div v-for="formacion in formaciones" :key="formacion.id_formacion" class="formacion-item">
            <div class="formacion-header">
              <div class="formacion-title">
                <h3>{{ formacion.nombre }}</h3>
                <span class="formacion-badge" :class="formacion.es_interna ? 'badge-success' : 'badge-info'">
                  {{ formacion.es_interna ? 'Interna' : 'Externa' }}
                </span>
              </div>
              <div class="formacion-actions" v-if="canEdit">
                <button @click="$emit('edit-formacion', formacion)" class="btn-icon-only" title="Editar">
                  <Edit size="16" />
                </button>
                <button @click="$emit('delete-formacion', formacion)" class="btn-icon-only" title="Eliminar">
                  <Trash2 size="16" />
                </button>
              </div>
            </div>
            <div class="formacion-dates">
              <div class="formacion-date">
                <Calendar size="14" />
                <span>Inicio: {{ formatDate(formacion.fecha_inicio) }}</span>
              </div>
              <div class="formacion-date" v-if="formacion.fecha_fin">
                <Calendar size="14" />
                <span>Fin: {{ formatDate(formacion.fecha_fin) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { GraduationCap, Plus, Edit, Trash2, Calendar, Loader, AlertTriangle } from 'lucide-vue-next'

export default {
  name: 'FormacionTab',
  
  components: {
    GraduationCap,
    Plus,
    Edit,
    Trash2,
    Calendar,
    Loader,
    AlertTriangle
  },
  
  props: {
    formaciones: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    canEdit: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['add-formacion', 'edit-formacion', 'delete-formacion', 'reload'],
  
  methods: {
    formatDate(dateString) {
      if (!dateString) return "No especificada"

      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }
  }
}
</script>

<style scoped>
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.card-body {
  padding: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-icon {
  margin-right: 0.5rem;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-primary:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 200px;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.error-message svg {
  color: #dc2626;
  margin-bottom: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  color: #dc2626;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.formaciones-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.formacion-item {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.formacion-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.formacion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.formacion-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.formacion-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.formacion-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-success {
  background-color: #dcfce7;
  color: #166534;
}

.badge-info {
  background-color: #e0f2fe;
  color: #0369a1;
}

.formacion-actions {
  display: flex;
  gap: 0.5rem;
}

.formacion-dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.formacion-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.btn-icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  background-color: transparent;
  color: #4b5563;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-only:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .card-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>