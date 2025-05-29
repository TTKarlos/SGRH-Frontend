<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ isEditing ? 'Editar Contrato' : 'Nuevo Contrato' }}</h3>
        <button @click="$emit('close')" class="btn-close">
          <X size="18" />
        </button>
      </div>
      <div class="modal-body">
        <!-- Tipo de contrato -->
        <div class="form-group">
          <label>Tipo de contrato <span class="required">*</span></label>
          <select
              v-model="formData.id_tipo_contrato"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.id_tipo_contrato }"
          >
            <option value="">Seleccione un tipo de contrato</option>
            <option
                v-for="tipo in tiposContrato"
                :key="tipo.id_tipo_contrato"
                :value="tipo.id_tipo_contrato"
            >
              {{ tipo.nombre }}
            </option>
          </select>
          <div v-if="validationErrors.id_tipo_contrato" class="invalid-feedback">
            {{ validationErrors.id_tipo_contrato }}
          </div>
        </div>

        <!-- Empresa -->
        <div class="form-group">
          <label>Empresa <span class="required">*</span></label>
          <select
              v-model="formData.id_empresa"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.id_empresa }"
          >
            <option value="">Seleccione una empresa</option>
            <option
                v-for="empresa in empresas"
                :key="empresa.id_empresa"
                :value="empresa.id_empresa"
            >
              {{ empresa.nombre }}
            </option>
          </select>
          <div v-if="validationErrors.id_empresa" class="invalid-feedback">
            {{ validationErrors.id_empresa }}
          </div>
        </div>

        <!-- Fechas -->
        <div class="form-row">
          <div class="form-group form-group-half">
            <label>Fecha de inicio <span class="required">*</span></label>
            <input
                type="date"
                v-model="formData.fecha_inicio"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fecha_inicio }"
            />
            <div v-if="validationErrors.fecha_inicio" class="invalid-feedback">
              {{ validationErrors.fecha_inicio }}
            </div>
          </div>

          <div class="form-group form-group-half">
            <label>Fecha de fin</label>
            <input
                type="date"
                v-model="formData.fecha_fin"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fecha_fin }"
            />
            <div class="form-text">Dejar en blanco si es indefinido</div>
            <div v-if="validationErrors.fecha_fin" class="invalid-feedback">
              {{ validationErrors.fecha_fin }}
            </div>
          </div>
        </div>

        <!-- Fin periodo de prueba -->
        <div class="form-group">
          <label>Fin de período de prueba</label>
          <input
              type="date"
              v-model="formData.fin_periodo_prueba"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.fin_periodo_prueba }"
          />
          <div v-if="validationErrors.fin_periodo_prueba" class="invalid-feedback">
            {{ validationErrors.fin_periodo_prueba }}
          </div>
        </div>

        <!-- Convenio -->
        <div class="form-group">
          <label>Convenio colectivo</label>
          <select
              v-model="formData.id_convenio"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.id_convenio }"
              @change="handleConvenioChange"
          >
            <option :value="null">Sin convenio</option>
            <option
                v-for="convenio in convenios"
                :key="convenio.id_convenio"
                :value="convenio.id_convenio"
            >
              {{ convenio.nombre }}
            </option>
          </select>
          <div v-if="validationErrors.id_convenio" class="invalid-feedback">
            {{ validationErrors.id_convenio }}
          </div>
        </div>

        <!-- Categoría (solo si hay convenio seleccionado) -->
        <div class="form-group" v-if="formData.id_convenio">
          <label>Categoría profesional</label>
          <select
              v-model="formData.id_categoria"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.id_categoria }"
              :disabled="categorias.length === 0"
          >
            <option :value="null">Sin categoría</option>
            <option
                v-for="categoria in categorias"
                :key="categoria.id_categoria"
                :value="categoria.id_categoria"
            >
              {{ categoria.nombre }}
            </option>
          </select>
          <div v-if="categorias.length === 0" class="form-text">
            No hay categorías disponibles para el convenio seleccionado
          </div>
          <div v-if="validationErrors.id_categoria" class="invalid-feedback">
            {{ validationErrors.id_categoria }}
          </div>
        </div>

        <!-- Archivo del contrato -->
        <div class="form-group">
          <label>Documento de contrato</label>
          <div class="file-input-wrapper">
            <div class="file-input-button">
              <input
                  ref="fileInput"
                  type="file"
                  @change="handleFileChange"
                  class="file-input"
                  :class="{ 'is-invalid': validationErrors.file }"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <div class="file-button">
                <FileIcon size="16" class="file-icon" />
                Seleccionar archivo
              </div>
            </div>
            <div v-if="selectedFile || (isEditing && formData.nombre_original)" class="selected-file">
              <span class="file-name">{{ selectedFileName }}</span>
              <button type="button" @click="clearSelectedFile" class="btn-clear-file">
                <X size="16" />
              </button>
            </div>
          </div>
          <div class="form-text">
            Formatos permitidos: PDF, DOC, DOCX, JPG, JPEG, PNG
          </div>
          <div v-if="validationErrors.file" class="invalid-feedback">
            {{ validationErrors.file }}
          </div>
        </div>

        <!-- Observaciones -->
        <div class="form-group">
          <label>Observaciones</label>
          <textarea
              v-model="formData.observaciones"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.observaciones }"
              rows="3"
          ></textarea>
          <div v-if="validationErrors.observaciones" class="invalid-feedback">
            {{ validationErrors.observaciones }}
          </div>
        </div>

        <!-- Error general -->
        <div v-if="validationErrors.general" class="alert-error">
          <AlertTriangle size="16" class="alert-icon" />
          {{ validationErrors.general }}
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancelar
        </button>
        <button @click="handleSubmit" class="btn btn-primary" :disabled="loading || !isFormValid">
          <Loader v-if="loading" size="18" class="btn-icon animate-spin" />
          <Save v-else size="18" class="btn-icon" />
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { X, Save, Loader, FileIcon, AlertTriangle } from 'lucide-vue-next';

export default {
  name: 'ContratoModal',

  components: {
    X,
    Save,
    Loader,
    FileIcon,
    AlertTriangle
  },

  props: {
    contrato: {
      type: Object,
      default: () => null
    },
    idEmpleado: {
      type: [Number, String],
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    validationErrors: {
      type: Object,
      default: () => ({})
    },
    tiposContrato: {
      type: Array,
      default: () => []
    },
    empresas: {
      type: Array,
      default: () => []
    },
    convenios: {
      type: Array,
      default: () => []
    },
    categorias: {
      type: Array,
      default: () => []
    }
  },

  emits: ['close', 'save', 'validation-error', 'convenio-change'],

  data() {
    return {
      formData: {
        id_contrato: null,
        id_empleado: this.idEmpleado,
        id_tipo_contrato: '',
        id_empresa: '',
        id_convenio: null,
        id_categoria: null,
        fecha_inicio: '',
        fecha_fin: '',
        fin_periodo_prueba: '',
        observaciones: ''
      },
      selectedFile: null
    };
  },

  computed: {
    isEditing() {
      return !!this.formData.id_contrato;
    },

    isFormValid() {
      return (
          this.formData.id_tipo_contrato &&
          this.formData.id_empresa &&
          this.formData.fecha_inicio
      );
    },

    selectedFileName() {
      if (this.selectedFile) {
        return this.selectedFile.name;
      } else if (this.isEditing && this.formData.nombre_original) {
        return this.formData.nombre_original;
      }
      return '';
    }
  },

  created() {
    if (this.contrato) {
      this.initializeFormData();
    }
  },

  watch: {
    contrato: {
      handler(newValue) {
        if (newValue) {
          this.initializeFormData();
        } else {
          this.resetForm();
        }
      },
      immediate: true
    }
  },

  methods: {
    initializeFormData() {
      if (!this.contrato) return;

      this.formData = {
        id_contrato: this.contrato.id_contrato || null,
        id_empleado: this.idEmpleado,
        id_tipo_contrato: this.contrato.id_tipo_contrato || '',
        id_empresa: this.contrato.id_empresa || '',
        id_convenio: this.contrato.id_convenio || null,
        id_categoria: this.contrato.id_categoria || null,
        fecha_inicio: this.contrato.fecha_inicio || '',
        fecha_fin: this.contrato.fecha_fin || '',
        fin_periodo_prueba: this.contrato.fin_periodo_prueba || '',
        observaciones: this.contrato.observaciones || '',
        nombre_original: this.contrato.nombre_original || ''
      };

      if (this.formData.id_convenio) {
        this.$nextTick(() => {
          this.$emit('convenio-change', this.formData.id_convenio);
        });
      }
    },

    resetForm() {
      this.formData = {
        id_contrato: null,
        id_empleado: this.idEmpleado,
        id_tipo_contrato: '',
        id_empresa: '',
        id_convenio: null,
        id_categoria: null,
        fecha_inicio: '',
        fecha_fin: '',
        fin_periodo_prueba: '',
        observaciones: ''
      };
      this.selectedFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    handleSubmit() {
      if (!this.formData.id_tipo_contrato) {
        this.$emit('validation-error', {
          type: 'id_tipo_contrato',
          message: 'El tipo de contrato es obligatorio'
        });
        return;
      }

      if (!this.formData.id_empresa) {
        this.$emit('validation-error', {
          type: 'id_empresa',
          message: 'La empresa es obligatoria'
        });
        return;
      }

      if (!this.formData.fecha_inicio) {
        this.$emit('validation-error', {
          type: 'fecha_inicio',
          message: 'La fecha de inicio es obligatoria'
        });
        return;
      }

      if (this.formData.fecha_fin && this.formData.fecha_inicio) {
        const inicio = new Date(this.formData.fecha_inicio);
        const fin = new Date(this.formData.fecha_fin);

        if (fin < inicio) {
          this.$emit('validation-error', {
            type: 'fecha_fin',
            message: 'La fecha de fin debe ser posterior a la fecha de inicio'
          });
          return;
        }
      }

      if (this.formData.fin_periodo_prueba && this.formData.fecha_inicio) {
        const inicio = new Date(this.formData.fecha_inicio);
        const finPrueba = new Date(this.formData.fin_periodo_prueba);

        if (finPrueba < inicio) {
          this.$emit('validation-error', {
            type: 'fin_periodo_prueba',
            message: 'El fin del periodo de prueba debe ser posterior a la fecha de inicio'
          });
          return;
        }
      }

      const formData = new FormData();

      Object.keys(this.formData).forEach(key => {
        if (this.formData[key] !== null && this.formData[key] !== undefined) {
          formData.append(key, this.formData[key]);
        }
      });

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.$emit('save', formData);
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];

      if (!allowedTypes.includes(file.type)) {
        this.$emit('validation-error', {
          type: 'file',
          message: 'Formato de archivo no válido. Por favor, use PDF, DOC, DOCX, JPG o PNG'
        });
        this.clearSelectedFile();
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.$emit('validation-error', {
          type: 'file',
          message: 'El archivo es demasiado grande. El tamaño máximo es 10MB'
        });
        this.clearSelectedFile();
        return;
      }

      this.selectedFile = file;
    },

    clearSelectedFile() {
      this.selectedFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    handleConvenioChange() {
      this.$emit('convenio-change', this.formData.id_convenio);

      if (this.formData.id_categoria) {
        this.formData.id_categoria = null;
      }
    }
  }
};
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
  max-width: 32rem;
  max-height: 90vh;
  overflow-y: auto;
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
  display: flex;
  align-items: center;
  justify-content: center;
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

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.form-group-half {
  flex: 1;
}

.form-group label {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.875rem;
}

.required {
  color: #dc2626;
}

.form-control {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #111827;
  transition: all 0.2s ease;
  font-size: 0.875rem;
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
  font-size: 0.75rem;
}

.form-text {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.file-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-input-button {
  position: relative;
  overflow: hidden;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #4b5563;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-button:hover {
  background-color: #e5e7eb;
}

.file-icon {
  color: #6b7280;
}

.selected-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.file-name {
  font-size: 0.875rem;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.btn-clear-file {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear-file:hover {
  color: #dc2626;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  color: #b91c1c;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.alert-icon {
  flex-shrink: 0;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>