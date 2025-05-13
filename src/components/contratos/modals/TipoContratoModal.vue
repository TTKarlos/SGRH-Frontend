<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEdit ? 'Editar' : 'Nuevo' }} Tipo de Contrato</h3>
        <button @click="$emit('close')" class="btn-close">
          <X />
        </button>
      </div>
      <div class="modal-body">
        <div v-if="viewMode" class="view-details">
          <div class="detail-item">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">{{ form.nombre }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Descripción:</span>
            <span class="detail-value">{{ form.descripcion || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Duración:</span>
            <span class="detail-value">{{ form.duracion || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Estado:</span>
            <span class="detail-value status-badge" :class="form.activo ? 'status-active' : 'status-inactive'">
              <Circle size="8" class="status-icon" />
              {{ form.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
        <form v-else @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label for="nombre" class="form-label">Nombre <span class="required">*</span></label>
            <input
                type="text"
                id="nombre"
                v-model="form.nombre"
                class="form-control"
                :class="{ 'is-invalid': errors.nombre }"
                placeholder="Nombre del tipo de contrato"
                required
            />
            <div v-if="errors.nombre" class="invalid-feedback">{{ errors.nombre }}</div>
          </div>

          <div class="form-group">
            <label for="descripcion" class="form-label">Descripción</label>
            <textarea
                id="descripcion"
                v-model="form.descripcion"
                class="form-control"
                :class="{ 'is-invalid': errors.descripcion }"
                placeholder="Descripción del tipo de contrato"
                rows="3"
            ></textarea>
            <div v-if="errors.descripcion" class="invalid-feedback">{{ errors.descripcion }}</div>
          </div>

          <div class="form-group">
            <label for="duracion" class="form-label">Duración <span class="required">*</span></label>
            <select
                id="duracion"
                v-model="form.duracion"
                class="form-control"
                :class="{ 'is-invalid': errors.duracion }"
                required
            >
              <option value="">Seleccione una duración</option>
              <option value="Indefinido">Indefinido</option>
              <option value="Temporal">Temporal</option>
              <option value="Prácticas">Prácticas</option>
            </select>
            <div v-if="errors.duracion" class="invalid-feedback">{{ errors.duracion }}</div>
          </div>

          <div class="form-group">
            <div class="form-check">
              <input
                  type="checkbox"
                  id="activo"
                  v-model="form.activo"
                  class="form-check-input"
              />
              <label for="activo" class="form-check-label">Activo</label>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          <X class="btn-icon" />
          <span>Cancelar</span>
        </button>

        <template v-if="viewMode">
          <button @click="toggleViewMode" class="btn btn-primary">
            <Edit class="btn-icon" />
            <span>Editar</span>
          </button>

          <button
              v-if="isEdit"
              @click="toggleStatus"
              :class="form.activo ? 'btn-danger' : 'btn-success'"
              class="btn"
          >
            <span v-if="form.activo">
              <ToggleLeft class="btn-icon" />
              <span>Desactivar</span>
            </span>
            <span v-else>
              <ToggleRight class="btn-icon" />
              <span>Activar</span>
            </span>
          </button>
        </template>

        <button v-else @click="handleSubmit" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="btn-content">
            <Loader class="spinner" />
            <span>Guardando...</span>
          </span>
          <span v-else class="btn-content">
            <Save class="btn-icon" />
            <span>Guardar</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { X, Save, Loader, Edit, ToggleLeft, ToggleRight, Circle } from 'lucide-vue-next';

export default {
  name: 'TipoContratoModal',
  components: {
    X,
    Save,
    Loader,
    Edit,
    ToggleLeft,
    ToggleRight,
    Circle
  },
  props: {
    tipo: {
      type: Object,
      default: () => ({
        nombre: '',
        descripcion: '',
        duracion: '',
        activo: true
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    viewMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save', 'toggle-status'],
  setup(props, { emit }) {
    const form = reactive({
      nombre: '',
      descripcion: '',
      duracion: '',
      activo: true
    });

    const errors = reactive({
      nombre: '',
      descripcion: '',
      duracion: ''
    });

    const isSubmitting = ref(false);
    const viewMode = ref(props.viewMode);

    const validateForm = () => {
      let isValid = true;

      Object.keys(errors).forEach(key => {
        errors[key] = '';
      });

      if (!form.nombre.trim()) {
        errors.nombre = 'El nombre es obligatorio';
        isValid = false;
      }

      if (!form.duracion) {
        errors.duracion = 'La duración es obligatoria';
        isValid = false;
      }

      return isValid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      isSubmitting.value = true;

      try {
        const tipoToSave = {
          ...form
        };

        if (props.isEdit) {
          tipoToSave.id_tipo_contrato = props.tipo.id_tipo_contrato;
        }

        emit('save', tipoToSave);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    const toggleViewMode = () => {
      viewMode.value = !viewMode.value;
    };

    const toggleStatus = () => {
      emit('toggle-status', {
        ...form,
        id_tipo_contrato: props.tipo.id_tipo_contrato,
        activo: !form.activo
      });
    };

    onMounted(() => {
      if (props.tipo) {
        Object.keys(form).forEach(key => {
          if (props.tipo[key] !== undefined) {
            form[key] = props.tipo[key];
          }
        });
      }
    });

    return {
      form,
      errors,
      isSubmitting,
      viewMode,
      handleSubmit,
      toggleViewMode,
      toggleStatus
    };
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(4px);
  font-family: 'Poppins', sans-serif;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close:hover {
  color: #dc2626;
  background-color: #fef2f2;
}

.modal-body {
  padding: 1.5rem;
}

.view-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
}

.detail-value {
  font-size: 1rem;
  color: #111827;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.status-icon {
  flex-shrink: 0;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.required {
  color: #dc2626;
}

.form-control {
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
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
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-check-input {
  width: 1rem;
  height: 1rem;
}

.form-check-label {
  font-size: 0.95rem;
  color: #4b5563;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-danger {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn-danger:hover:not(:disabled) {
  background-color: #fecaca;
  transform: translateY(-1px);
}

.btn-success {
  background-color: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.btn-success:hover:not(:disabled) {
  background-color: #bbf7d0;
  transform: translateY(-1px);
}

.btn-icon {
  width: 1.125rem;
  height: 1.125rem;
  margin-right: 0.5rem;
}

.spinner {
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
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 575px) {
  .modal-content {
    max-width: 95%;
  }
}
</style>