<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ formacion.id_formacion ? 'Editar Formación' : 'Nueva Formación' }}</h3>
        <button @click="$emit('close')" class="btn-close">
          <X size="18" />
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nombre de la Formación *</label>
          <input
              v-model="formacion.nombre"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.nombre }"
          />
          <div v-if="validationErrors.nombre" class="invalid-feedback">
            {{ validationErrors.nombre }}
          </div>
        </div>

        <div class="form-group">
          <label>Tipo de Formación</label>
          <div class="toggle-container">
            <label class="toggle">
              <input type="checkbox" v-model="formacion.es_interna">
              <span class="toggle-slider"></span>
            </label>
            <span>{{ formacion.es_interna ? 'Interna' : 'Externa' }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Fecha de Inicio *</label>
          <input
              v-model="formacion.fecha_inicio"
              type="date"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.fecha_inicio }"
          />
          <div v-if="validationErrors.fecha_inicio" class="invalid-feedback">
            {{ validationErrors.fecha_inicio }}
          </div>
        </div>

        <div class="form-group">
          <label>Fecha de Fin</label>
          <input
              v-model="formacion.fecha_fin"
              type="date"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.fecha_fin }"
          />
          <div v-if="validationErrors.fecha_fin" class="invalid-feedback">
            {{ validationErrors.fecha_fin }}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancelar
        </button>
        <button @click="$emit('save', formacion)" class="btn btn-primary" :disabled="loading">
          <Loader v-if="loading" size="18" class="btn-icon animate-spin" />
          <Save v-else size="18" class="btn-icon" />
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { X, Save, Loader } from 'lucide-vue-next'

export default {
  name: 'FormacionModal',
  
  components: {
    X,
    Save,
    Loader
  },
  
  props: {
    value: {
      type: Object,
      default: () => ({
        nombre: '',
        es_interna: false,
        fecha_inicio: '',
        fecha_fin: ''
      })
    },
    validationErrors: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['close', 'save'],
  
  data() {
    return {
      formacion: { ...this.value }
    }
  },
  
  watch: {
    value: {
      handler(newValue) {
        this.formacion = { ...newValue }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(2px);
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 28rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.875rem;
}

.form-control {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #111827;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #fca5a5;
  box-shadow: 0 0 0 3px rgba(252, 165, 165, 0.2);
}

.form-control.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  color: #dc2626;
  font-size: 0.875rem;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #dc2626;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
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
</style>