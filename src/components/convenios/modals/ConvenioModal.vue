<template>
  <div class="modal-backdrop">
    <div class="modal-container">
      <div class="modal-header">
        <h3 v-if="!isEdit">Nuevo convenio</h3>
        <h3 v-else-if="viewMode">Detalles del convenio</h3>
        <h3 v-else>Editar convenio</h3>
        <button @click="$emit('close')" class="btn-close">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group" v-if="isEdit">
            <label for="id_convenio">ID</label>
            <input
                type="text"
                id="id_convenio"
                v-model="form.id_convenio"
                disabled
                class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input
                type="text"
                id="nombre"
                v-model="form.nombre"
                :disabled="viewMode"
                class="form-control"
                placeholder="Nombre del convenio"
                maxlength="100"
            />
            <div v-if="validationErrors.nombre" class="error-message">
              {{ validationErrors.nombre }}
            </div>
          </div>

          <div class="form-group">
            <label for="codigo">Código</label>
            <input
                type="text"
                id="codigo"
                v-model="form.codigo"
                :disabled="viewMode"
                class="form-control"
                placeholder="Ej: CCOD-2023"
                maxlength="20"
            />
            <div v-if="validationErrors.codigo" class="error-message">
              {{ validationErrors.codigo }}
            </div>
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea
                id="descripcion"
                v-model="form.descripcion"
                :disabled="viewMode"
                class="form-control"
                placeholder="Descripción del convenio"
                rows="3"
                maxlength="255"
            ></textarea>
            <div v-if="validationErrors.descripcion" class="error-message">
              {{ validationErrors.descripcion }}
            </div>
          </div>

          <div class="modal-footer">
            <button
                type="button"
                @click="$emit('close')"
                class="btn btn-secondary"
            >
              {{ viewMode ? 'Cerrar' : 'Cancelar' }}
            </button>

            <button
                v-if="!viewMode"
                type="submit"
                class="btn btn-primary"
                :disabled="!isFormValid || loading"
            >
              <Loader v-if="loading" size="16" class="spinner" />
              <Save v-else size="16" class="btn-icon" />
              {{ isEdit ? 'Actualizar' : 'Guardar' }}
            </button>

            <button
                v-if="viewMode && canEdit"
                type="button"
                @click="$emit('edit')"
                class="btn btn-primary"
            >
              <Edit size="16" class="btn-icon" />
              Editar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { X, Save, Edit, Loader } from 'lucide-vue-next';
import { usePermission } from '../../../composables/usePermission';

export default {
  name: 'ConvenioModal',

  components: {
    X,
    Save,
    Edit,
    Loader
  },

  props: {
    convenio: {
      type: Object,
      default: () => ({
        nombre: '',
        codigo: '',
        descripcion: ''
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    viewMode: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'save', 'edit'],

  data() {
    return {
      form: {
        id_convenio: this.convenio.id_convenio || null,
        nombre: this.convenio.nombre || '',
        codigo: this.convenio.codigo || '',
        descripcion: this.convenio.descripcion || ''
      },
      validationErrors: {}
    };
  },

  computed: {
    isFormValid() {
      return this.form.nombre.trim() !== '' &&
          Object.keys(this.validationErrors).length === 0;
    },

    canEdit() {
      const { canWrite } = usePermission();
      return canWrite('Convenios') || canWrite('Master');
    }
  },

  watch: {
    convenio: {
      handler(newValue) {
        this.form = {
          id_convenio: newValue.id_convenio || null,
          nombre: newValue.nombre || '',
          codigo: newValue.codigo || '',
          descripcion: newValue.descripcion || ''
        };

        console.log('Convenio actualizado en modal:', newValue);
        console.log('Formulario actualizado:', this.form);
      },
      deep: true,
      immediate: true
    },

    'form.nombre': function(newValue) {
      this.validateNombre(newValue);
    }
  },

  methods: {
    validateNombre(value) {
      if (!value.trim()) {
        this.validationErrors.nombre = 'El nombre es obligatorio';
      } else if (value.length < 3) {
        this.validationErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      } else {
        delete this.validationErrors.nombre;
      }
    },

    handleSubmit() {
      this.validateNombre(this.form.nombre);

      if (!this.isFormValid) return;

      console.log('Enviando formulario:', this.form);

      const formData = { ...this.form };

      console.log('Datos finales a enviar:', formData);

      this.$emit('save', formData);
    }
  }
};
</script>

<style scoped>
.modal-backdrop {
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
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-close {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-control:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
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

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
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
</style>
