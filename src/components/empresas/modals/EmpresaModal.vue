<template>
  <div class="modal-backdrop">
    <div class="modal-container">
      <div class="modal-header">
        <h3 v-if="!isEdit">Nueva empresa</h3>
        <h3 v-else-if="viewMode">Detalles de la empresa</h3>
        <h3 v-else>Editar empresa</h3>
        <button @click="$emit('close')" class="btn-close">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group" v-if="isEdit">
            <label for="id_empresa">ID</label>
            <input
                type="text"
                id="id_empresa"
                v-model="form.id_empresa"
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
                placeholder="Nombre de la empresa"
                maxlength="100"
            />
            <div v-if="validationErrors.nombre" class="error-message">
              {{ validationErrors.nombre }}
            </div>
          </div>

          <div class="form-group">
            <label for="cif">CIF/NIF *</label>
            <input
                type="text"
                id="cif"
                v-model="form.cif"
                :disabled="viewMode"
                class="form-control"
                placeholder="Ej: A12345678"
                maxlength="9"
            />
            <div v-if="validationErrors.cif" class="error-message">
              {{ validationErrors.cif }}
            </div>
          </div>

          <div class="form-group">
            <label for="direccion">Dirección</label>
            <textarea
                id="direccion"
                v-model="form.direccion"
                :disabled="viewMode"
                class="form-control"
                placeholder="Dirección completa de la empresa"
                rows="2"
                maxlength="255"
            ></textarea>
            <div v-if="validationErrors.direccion" class="error-message">
              {{ validationErrors.direccion }}
            </div>
          </div>

          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input
                type="tel"
                id="telefono"
                v-model="form.telefono"
                :disabled="viewMode"
                class="form-control"
                placeholder="Ej: 912345678"
                maxlength="15"
            />
            <div v-if="validationErrors.telefono" class="error-message">
              {{ validationErrors.telefono }}
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
                type="email"
                id="email"
                v-model="form.email"
                :disabled="viewMode"
                class="form-control"
                placeholder="Ej: contacto@empresa.com"
                maxlength="100"
            />
            <div v-if="validationErrors.email" class="error-message">
              {{ validationErrors.email }}
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
  name: 'EmpresaModal',

  components: {
    X,
    Save,
    Edit,
    Loader
  },

  props: {
    empresa: {
      type: Object,
      default: () => ({
        nombre: '',
        cif: '',
        direccion: '',
        telefono: '',
        email: '',
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
        id_empresa: this.empresa.id_empresa || null,
        nombre: this.empresa.nombre || '',
        cif: this.empresa.cif || '',
        direccion: this.empresa.direccion || '',
        telefono: this.empresa.telefono || '',
        email: this.empresa.email || '',
        activo: this.empresa.activo !== undefined ? this.empresa.activo : true
      },
      validationErrors: {}
    };
  },

  computed: {
    isFormValid() {
      return this.form.nombre.trim() !== '' &&
          this.form.cif.trim() !== '' &&
          Object.keys(this.validationErrors).length === 0;
    },

    canEdit() {
      const { canWrite } = usePermission();
      return canWrite('Empresas') || canWrite('Master');
    }
  },

  watch: {
    empresa: {
      handler(newValue) {
        this.form = {
          id_empresa: newValue.id_empresa || null,
          nombre: newValue.nombre || '',
          cif: newValue.cif || '',
          direccion: newValue.direccion || '',
          telefono: newValue.telefono || '',
          email: newValue.email || '',
          activo: newValue.activo !== undefined ? newValue.activo : true
        };

        console.log('Empresa actualizada en modal:', newValue);
        console.log('Formulario actualizado:', this.form);
      },
      deep: true,
      immediate: true
    },

    'form.nombre': function(newValue) {
      this.validateNombre(newValue);
    },

    'form.cif': function(newValue) {
      this.validateCif(newValue);
    },

    'form.email': function(newValue) {
      this.validateEmail(newValue);
    },

    'form.telefono': function(newValue) {
      this.validateTelefono(newValue);
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

    validateCif(value) {
      if (!value.trim()) {
        this.validationErrors.cif = 'El CIF/NIF es obligatorio';
      } else if (!/^[A-Z0-9]{9}$/i.test(value.trim())) {
        this.validationErrors.cif = 'El CIF/NIF debe tener 9 caracteres alfanuméricos';
      } else {
        delete this.validationErrors.cif;
      }
    },

    validateEmail(value) {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        this.validationErrors.email = 'El email no es válido';
      } else {
        delete this.validationErrors.email;
      }
    },

    validateTelefono(value) {
      if (value && !/^\d{9}$/.test(value.replace(/\s/g, ''))) {
        this.validationErrors.telefono = 'El teléfono debe tener 9 dígitos';
      } else {
        delete this.validationErrors.telefono;
      }
    },

    handleSubmit() {
      this.validateNombre(this.form.nombre);
      this.validateCif(this.form.cif);
      this.validateEmail(this.form.email);
      this.validateTelefono(this.form.telefono);

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
