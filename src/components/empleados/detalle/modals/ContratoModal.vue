<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEditing ? 'Editar contrato' : 'Nuevo contrato' }}</h3>
        <button @click="$emit('close')" class="btn-close">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Tipo de contrato -->
          <div class="form-group">
            <label for="id_tipo_contrato">Tipo de contrato *</label>
            <select
                id="id_tipo_contrato"
                v-model="localValue.id_tipo_contrato"
                :disabled="loading"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.id_tipo_contrato }"
                required
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
            <label for="id_empresa">Empresa *</label>
            <select
                id="id_empresa"
                v-model="localValue.id_empresa"
                :disabled="loading"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.id_empresa }"
                required
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

          <!-- Fecha de inicio -->
          <div class="form-group">
            <label for="fecha_inicio">Fecha de inicio *</label>
            <input
                id="fecha_inicio"
                type="date"
                v-model="localValue.fecha_inicio"
                :disabled="loading"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fecha_inicio }"
                required
            />
            <div v-if="validationErrors.fecha_inicio" class="invalid-feedback">
              {{ validationErrors.fecha_inicio }}
            </div>
          </div>

          <!-- Fecha de fin -->
          <div class="form-group">
            <label for="fecha_fin">Fecha de fin</label>
            <div class="campo-con-nota">
              <input
                  id="fecha_fin"
                  type="date"
                  v-model="localValue.fecha_fin"
                  :disabled="loading"
                  class="form-control"
                  :class="{ 'is-invalid': validationErrors.fecha_fin }"
              />
              <div class="form-text">
                Dejar en blanco si es un contrato indefinido
              </div>
            </div>
            <div v-if="validationErrors.fecha_fin" class="invalid-feedback">
              {{ validationErrors.fecha_fin }}
            </div>
          </div>

          <!-- Fin periodo de prueba -->
          <div class="form-group">
            <label for="fin_periodo_prueba">Fin de período de prueba</label>
            <input
                id="fin_periodo_prueba"
                type="date"
                v-model="localValue.fin_periodo_prueba"
                :disabled="loading"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fin_periodo_prueba }"
            />
            <div v-if="validationErrors.fin_periodo_prueba" class="invalid-feedback">
              {{ validationErrors.fin_periodo_prueba }}
            </div>
          </div>

          <!-- Convenio -->
          <div class="form-group">
            <label for="id_convenio">Convenio colectivo</label>
            <select
                id="id_convenio"
                v-model="localValue.id_convenio"
                :disabled="loading"
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
          <div class="form-group" v-if="localValue.id_convenio">
            <label for="id_categoria">Categoría profesional</label>
            <select
                id="id_categoria"
                v-model="localValue.id_categoria"
                :disabled="loading || categorias.length === 0"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.id_categoria }"
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
            <div v-if="categorias.length === 0" class="form-text text-muted">
              No hay categorías disponibles para el convenio seleccionado
            </div>
            <div v-if="validationErrors.id_categoria" class="invalid-feedback">
              {{ validationErrors.id_categoria }}
            </div>
          </div>

          <!-- Archivo del contrato -->
          <div class="form-group">
            <label for="contrato_file">Documento de contrato</label>
            <div class="file-input-container">
              <input
                  ref="fileInput"
                  id="contrato_file"
                  type="file"
                  @change="handleFileChange"
                  :disabled="loading"
                  class="form-control-file"
                  :class="{ 'is-invalid': validationErrors.file }"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <div class="selected-file" v-if="selectedFile || (isEditing && localValue.nombre_original)">
                <span>{{ selectedFileName }}</span>
                <button
                    type="button"
                    @click="clearSelectedFile"
                    class="btn-clear-file"
                >
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
            <label for="observaciones">Observaciones</label>
            <textarea
                id="observaciones"
                v-model="localValue.observaciones"
                :disabled="loading"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.observaciones }"
                rows="3"
            ></textarea>
            <div v-if="validationErrors.observaciones" class="invalid-feedback">
              {{ validationErrors.observaciones }}
            </div>
          </div>

          <!-- Error general -->
          <div v-if="validationErrors.general" class="alert alert-danger">
            {{ validationErrors.general }}
          </div>

          <div class="modal-footer">
            <button
                type="button"
                @click="$emit('close')"
                class="btn btn-secondary"
                :disabled="loading"
            >
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
              <span v-if="loading">
                <LoadingSpinner size="small" />
                Guardando...
              </span>
              <span v-else>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { X } from 'lucide-vue-next';
import LoadingSpinner from '../../../common/LoadingSpinner.vue';

export default {
  name: 'ContratoModal',
  components: {
    X,
    LoadingSpinner
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
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
      localValue: {
        id_contrato: null,
        id_empleado: null,
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
      return !!this.localValue.id_contrato;
    },

    isFormValid() {
      return (
          this.localValue.id_tipo_contrato &&
          this.localValue.id_empresa &&
          this.localValue.fecha_inicio
      );
    },

    selectedFileName() {
      if (this.selectedFile) {
        return this.selectedFile.name;
      } else if (this.isEditing && this.localValue.nombre_original) {
        return this.localValue.nombre_original;
      }
      return '';
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.localValue = { ...newValue };
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleSubmit() {
      if (!this.localValue.id_tipo_contrato) {
        this.$emit('validation-error', {
          type: 'id_tipo_contrato',
          message: 'El tipo de contrato es obligatorio'
        });
        return;
      }

      if (!this.localValue.id_empresa) {
        this.$emit('validation-error', {
          type: 'id_empresa',
          message: 'La empresa es obligatoria'
        });
        return;
      }

      if (!this.localValue.fecha_inicio) {
        this.$emit('validation-error', {
          type: 'fecha_inicio',
          message: 'La fecha de inicio es obligatoria'
        });
        return;
      }

      if (this.localValue.fecha_fin && this.localValue.fecha_inicio) {
        const inicio = new Date(this.localValue.fecha_inicio);
        const fin = new Date(this.localValue.fecha_fin);

        if (fin < inicio) {
          this.$emit('validation-error', {
            type: 'fecha_fin',
            message: 'La fecha de fin debe ser posterior a la fecha de inicio'
          });
          return;
        }
      }

      if (this.localValue.fin_periodo_prueba && this.localValue.fecha_inicio) {
        const inicio = new Date(this.localValue.fecha_inicio);
        const finPrueba = new Date(this.localValue.fin_periodo_prueba);

        if (finPrueba < inicio) {
          this.$emit('validation-error', {
            type: 'fin_periodo_prueba',
            message: 'El fin del periodo de prueba debe ser posterior a la fecha de inicio'
          });
          return;
        }
      }

      const formData = new FormData();

      Object.keys(this.localValue).forEach(key => {
        if (this.localValue[key] !== null && this.localValue[key] !== undefined) {
          formData.append(key, this.localValue[key]);
        }
      });

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.$emit('save', formData);
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
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
      }
    },

    clearSelectedFile() {
      this.selectedFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    handleConvenioChange() {
      this.$emit('convenio-change', this.localValue.id_convenio);

      if (this.localValue.id_categoria) {
        this.localValue.id_categoria = null;
      }
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

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: #374151;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #111827;
  background-color: white;
  background-clip: padding-box;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #dc2626;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(220, 38, 38, 0.25);
}

.form-control:disabled {
  background-color: #f3f4f6;
  opacity: 1;
}

.form-control-file {
  display: block;
  width: 100%;
}

.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.text-muted {
  color: #6b7280;
}

.campo-con-nota {
  display: flex;
  flex-direction: column;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
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

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.alert {
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
}

.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}

.file-input-container {
  margin-bottom: 0.5rem;
}

.selected-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.5rem;
  margin-top: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
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
</style>