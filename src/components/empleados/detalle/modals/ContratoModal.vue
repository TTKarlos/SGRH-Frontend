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
        <form @submit.prevent="handleSubmit" ref="contratoForm">
          <!-- Tipo de contrato -->
          <div class="form-group">
            <label>Tipo de contrato <span class="required">*</span></label>
            <select
                v-model="formData.id_tipo_contrato"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.id_tipo_contrato }"
                required
            >
              <option value="">Seleccione un tipo de contrato</option>
              <option
                  v-for="tipo in tiposContrato"
                  :key="tipo.id_tipo_contrato"
                  :value="Number(tipo.id_tipo_contrato)"
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
                required
            >
              <option value="">Seleccione una empresa</option>
              <option
                  v-for="empresa in empresas"
                  :key="empresa.id_empresa"
                  :value="Number(empresa.id_empresa)"
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
                  required
              />
              <div v-if="validationErrors.fecha_inicio" class="invalid-feedback">
                {{ validationErrors.fecha_inicio }}
              </div>
            </div>

            <div class="form-group form-group-half">
              <div class="fecha-fin-header">
                <label>Fecha de fin</label>
                <div class="toggle-switch">
                  <input
                      type="checkbox"
                      id="toggle-fecha-fin"
                      v-model="hasFechaFin"
                      @change="toggleFechaFin"
                  />
                  <label for="toggle-fecha-fin" class="toggle-label">
                    {{ hasFechaFin ? 'Definido' : 'Indefinido' }}
                  </label>
                </div>
              </div>
              <input
                  type="date"
                  v-model="formData.fecha_fin"
                  class="form-control"
                  :class="{ 'is-invalid': validationErrors.fecha_fin }"
                  :disabled="!hasFechaFin"
              />
              <div class="form-text" v-if="!hasFechaFin">Contrato indefinido</div>
              <div v-if="validationErrors.fecha_fin" class="invalid-feedback">
                {{ validationErrors.fecha_fin }}
              </div>
            </div>
          </div>

          <!-- Fin periodo de prueba -->
          <div class="form-group">
            <div class="fecha-fin-header">
              <label>Fin de período de prueba</label>
              <div class="toggle-switch">
                <input
                    type="checkbox"
                    id="toggle-periodo-prueba"
                    v-model="hasPeriodoPrueba"
                    @change="togglePeriodoPrueba"
                />
                <label for="toggle-periodo-prueba" class="toggle-label">
                  {{ hasPeriodoPrueba ? 'Activado' : 'Sin período' }}
                </label>
              </div>
            </div>
            <input
                type="date"
                v-model="formData.fin_periodo_prueba"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fin_periodo_prueba }"
                :disabled="!hasPeriodoPrueba"
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
                  :value="Number(convenio.id_convenio)"
              >
                {{ convenio.nombre }}
              </option>
            </select>
            <div v-if="validationErrors.id_convenio" class="invalid-feedback">
              {{ validationErrors.id_convenio }}
            </div>
          </div>

          <!-- Categoría -->
          <div class="form-group" v-if="formData.id_convenio">
            <label>Categoría profesional</label>
            <select
                v-model="formData.id_categoria"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.id_categoria }"
                :disabled="!categorias.length"
            >
              <option :value="null">Sin categoría</option>
              <option
                  v-for="categoria in categorias"
                  :key="categoria.id_categoria"
                  :value="Number(categoria.id_categoria)"
              >
                {{ categoria.nombre }}
              </option>
            </select>
            <div v-if="!categorias.length" class="form-text">
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
                    :class="{ 'is-invalid': validationErrors.archivo }"
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
              Formatos permitidos: PDF, DOC, DOCX, JPG, JPEG, PNG (máx. 10MB)
            </div>
            <div v-if="validationErrors.archivo" class="invalid-feedback">
              {{ validationErrors.archivo }}
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
                placeholder="Observaciones adicionales sobre el contrato..."
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
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" @click="$emit('close')" class="btn btn-secondary" :disabled="loading">
          Cancelar
        </button>
        <button
            type="button"
            @click="handleSubmit"
            class="btn btn-primary"
            :disabled="loading || !isFormValid"
        >
          <Loader v-if="loading" size="18" class="btn-icon animate-spin" />
          <Save v-else size="18" class="btn-icon" />
          {{ isEditing ? 'Actualizar' : 'Guardar' }}
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
        id_empleado: null,
        id_tipo_contrato: '',
        id_empresa: '',
        id_convenio: null,
        id_categoria: null,
        fecha_inicio: '',
        fecha_fin: '',
        fin_periodo_prueba: '',
        observaciones: '',
        nombre_original: ''
      },
      selectedFile: null,
      hasFechaFin: false,
      hasPeriodoPrueba: false
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
          this.formData.fecha_inicio &&
          this.formData.id_empleado &&
          (!this.hasFechaFin || (this.hasFechaFin && this.formData.fecha_fin)) &&
          (!this.hasPeriodoPrueba || (this.hasPeriodoPrueba && this.formData.fin_periodo_prueba))
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

  watch: {
    idEmpleado: {
      handler(newValue) {
        if (newValue) {
          this.formData.id_empleado = Number(newValue);
        }
      },
      immediate: true
    },

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

  created() {
    this.formData.id_empleado = Number(this.idEmpleado);
    if (this.contrato) {
      this.initializeFormData();
    }
  },

  methods: {
    initializeFormData() {
      if (!this.contrato) return;

      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          return new Date(dateString).toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      this.formData = {
        id_contrato: Number(this.contrato.id_contrato) || null,
        id_empleado: Number(this.idEmpleado),
        id_tipo_contrato: Number(this.contrato.id_tipo_contrato) || '',
        id_empresa: Number(this.contrato.id_empresa) || '',
        id_convenio: this.contrato.id_convenio ? Number(this.contrato.id_convenio) : null,
        id_categoria: this.contrato.id_categoria ? Number(this.contrato.id_categoria) : null,
        fecha_inicio: formatDateForInput(this.contrato.fecha_inicio),
        fecha_fin: formatDateForInput(this.contrato.fecha_fin),
        fin_periodo_prueba: formatDateForInput(this.contrato.fin_periodo_prueba),
        observaciones: this.contrato.observaciones || '',
        nombre_original: this.contrato.nombre_original || ''
      };

      this.hasFechaFin = !!this.formData.fecha_fin;
      this.hasPeriodoPrueba = !!this.formData.fin_periodo_prueba;

      if (this.formData.id_convenio) {
        this.$nextTick(() => {
          this.$emit('convenio-change', this.formData.id_convenio);
        });
      }
    },

    resetForm() {
      this.formData = {
        id_contrato: null,
        id_empleado: Number(this.idEmpleado),
        id_tipo_contrato: '',
        id_empresa: '',
        id_convenio: null,
        id_categoria: null,
        fecha_inicio: '',
        fecha_fin: '',
        fin_periodo_prueba: '',
        observaciones: '',
        nombre_original: ''
      };
      this.selectedFile = null;
      this.hasFechaFin = false;
      this.hasPeriodoPrueba = false;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    toggleFechaFin() {
      if (!this.hasFechaFin) {
        this.formData.fecha_fin = '';
      } else if (!this.formData.fecha_fin && this.formData.fecha_inicio) {
        const fechaInicio = new Date(this.formData.fecha_inicio);
        if (!isNaN(fechaInicio.getTime())) {
          const fechaFin = new Date(fechaInicio);
          fechaFin.setFullYear(fechaFin.getFullYear() + 1);
          this.formData.fecha_fin = fechaFin.toISOString().split('T')[0];
        }
      }
    },

    togglePeriodoPrueba() {
      if (!this.hasPeriodoPrueba) {
        this.formData.fin_periodo_prueba = '';
      } else if (!this.formData.fin_periodo_prueba && this.formData.fecha_inicio) {
        const fechaInicio = new Date(this.formData.fecha_inicio);
        if (!isNaN(fechaInicio.getTime())) {
          const fechaFinPrueba = new Date(fechaInicio);
          fechaFinPrueba.setMonth(fechaFinPrueba.getMonth() + 3);
          this.formData.fin_periodo_prueba = fechaFinPrueba.toISOString().split('T')[0];
        }
      }
    },

    handleSubmit() {
      console.log('handleSubmit called');
      console.log('Form data:', this.formData);
      console.log('Is form valid:', this.isFormValid);

      if (!this.validateForm()) {
        console.log('Validation failed');
        return;
      }

      const formData = this.buildFormData();
      console.log('Emitting save event with formData');
      this.$emit('save', formData);
    },

    validateForm() {
      const errors = {};

      if (!this.formData.id_empleado) {
        errors.id_empleado = 'El ID del empleado es requerido';
      }

      if (!this.formData.id_tipo_contrato) {
        errors.id_tipo_contrato = 'El tipo de contrato es obligatorio';
      }

      if (!this.formData.id_empresa) {
        errors.id_empresa = 'La empresa es obligatoria';
      }

      if (!this.formData.fecha_inicio) {
        errors.fecha_inicio = 'La fecha de inicio es obligatoria';
      }

      if (this.hasFechaFin && !this.formData.fecha_fin) {
        errors.fecha_fin = 'La fecha de fin es obligatoria cuando el contrato no es indefinido';
      }

      if (this.hasPeriodoPrueba && !this.formData.fin_periodo_prueba) {
        errors.fin_periodo_prueba = 'La fecha de fin del periodo de prueba es obligatoria cuando está activado';
      }

      if (this.formData.fecha_fin && this.formData.fecha_inicio) {
        const inicio = new Date(this.formData.fecha_inicio);
        const fin = new Date(this.formData.fecha_fin);

        if (fin < inicio) {
          errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
      }

      if (this.formData.fin_periodo_prueba && this.formData.fecha_inicio) {
        const inicio = new Date(this.formData.fecha_inicio);
        const finPrueba = new Date(this.formData.fin_periodo_prueba);

        if (finPrueba < inicio) {
          errors.fin_periodo_prueba = 'El fin del periodo de prueba debe ser posterior a la fecha de inicio';
        }
      }

      if (this.formData.fin_periodo_prueba && this.formData.fecha_fin) {
        const finPrueba = new Date(this.formData.fin_periodo_prueba);
        const fin = new Date(this.formData.fecha_fin);

        if (finPrueba > fin) {
          errors.fin_periodo_prueba = 'El fin del periodo de prueba debe ser anterior a la fecha de fin del contrato';
        }
      }

      if (this.formData.observaciones && this.formData.observaciones.length > 1000) {
        errors.observaciones = 'Las observaciones no pueden exceder los 1000 caracteres';
      }

      if (Object.keys(errors).length > 0) {
        console.log('Validation errors:', errors);
        Object.entries(errors).forEach(([type, message]) => {
          this.$emit('validation-error', { type, message });
        });
        return false;
      }

      return true;
    },

    buildFormData() {
      const formData = new FormData();

      formData.append('id_empleado', String(this.formData.id_empleado));
      formData.append('id_tipo_contrato', String(this.formData.id_tipo_contrato));
      formData.append('id_empresa', String(this.formData.id_empresa));
      formData.append('fecha_inicio', this.formData.fecha_inicio);

      if (this.formData.id_contrato) {
        formData.append('id_contrato', String(this.formData.id_contrato));
      }

      if (this.formData.id_convenio !== null && this.formData.id_convenio !== '') {
        formData.append('id_convenio', String(this.formData.id_convenio));
      }

      if (this.formData.id_categoria !== null && this.formData.id_categoria !== '') {
        formData.append('id_categoria', String(this.formData.id_categoria));
      }

      if (this.hasFechaFin && this.formData.fecha_fin) {
        formData.append('fecha_fin', this.formData.fecha_fin);
      }

      if (this.hasPeriodoPrueba && this.formData.fin_periodo_prueba) {
        formData.append('fin_periodo_prueba', this.formData.fin_periodo_prueba);
      }

      if (this.formData.observaciones?.trim()) {
        formData.append('observaciones', this.formData.observaciones.trim());
      }

      if (this.selectedFile) {
        formData.append('archivo', this.selectedFile);
      }

      console.log('FormData built successfully');
      return formData;
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
          type: 'archivo',
          message: 'Formato de archivo no válido. Use PDF, DOC, DOCX, JPG o PNG'
        });
        this.clearSelectedFile();
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.$emit('validation-error', {
          type: 'archivo',
          message: 'El archivo es demasiado grande. Tamaño máximo: 10MB'
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

.form-control:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
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

/* Toggle switch styles */
.fecha-fin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-switch {
  position: relative;
  display: inline-block;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 9999px;
  background-color: #f3f4f6;
  color: #6b7280;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  min-width: 80px;
  text-align: center;
}

input:checked + .toggle-label {
  background-color: #dcfce7;
  color: #166534;
  border-color: #86efac;
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
