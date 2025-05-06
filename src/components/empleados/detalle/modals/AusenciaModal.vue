<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEditing ? 'Editar ausencia' : 'Nueva ausencia' }}</h3>
        <button @click="$emit('close')" class="btn-close">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="id_tipo_ausencia">Tipo de ausencia *</label>
            <select
                id="id_tipo_ausencia"
                v-model="localValue.id_tipo_ausencia"
                :disabled="loading"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.id_tipo_ausencia || errores.id_tipo_ausencia }"
                required
            >
              <option value="" disabled>Seleccione un tipo de ausencia</option>
              <option
                  v-for="tipo in tiposAusencia"
                  :key="tipo.id_tipo_ausencia"
                  :value="tipo.id_tipo_ausencia"
              >
                {{ tipo.nombre }}
              </option>
            </select>
            <div v-if="validationErrors.id_tipo_ausencia" class="invalid-feedback">
              {{ validationErrors.id_tipo_ausencia }}
            </div>
            <div v-if="errores.id_tipo_ausencia" class="invalid-feedback">
              {{ errores.id_tipo_ausencia }}
            </div>
          </div>

          <div class="form-group">
            <label for="fecha_inicio">Fecha de inicio *</label>
            <input
                id="fecha_inicio"
                type="date"
                v-model="localValue.fecha_inicio"
                :disabled="loading"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fecha_inicio || errores.fecha_inicio }"
                required
                @change="actualizarFechaFin"
            />
            <div v-if="validationErrors.fecha_inicio" class="invalid-feedback">
              {{ validationErrors.fecha_inicio }}
            </div>
            <div v-if="errores.fecha_inicio" class="invalid-feedback">
              {{ errores.fecha_inicio }}
            </div>
          </div>

          <div class="form-group">
            <div class="fecha-header">
              <label for="fecha_fin">Fecha de fin *</label>
              <div class="toggle-container">
                <span class="toggle-label">En curso</span>
                <button
                    type="button"
                    @click="toggleEnCurso"
                    class="toggle-button"
                    :class="{ 'active': enCurso }"
                    title="Marcar como ausencia en curso"
                >
                  <span class="toggle-slider"></span>
                </button>
              </div>
            </div>
            <input
                id="fecha_fin"
                type="date"
                v-model="localValue.fecha_fin"
                :disabled="loading || enCurso"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fecha_fin || errores.fecha_fin }"
                :min="localValue.fecha_inicio"
                required
            />
            <div v-if="validationErrors.fecha_fin" class="invalid-feedback">
              {{ validationErrors.fecha_fin }}
            </div>
            <div v-if="errores.fecha_fin" class="invalid-feedback">
              {{ errores.fecha_fin }}
            </div>
            <small v-if="enCurso" class="form-text text-info">
              Se utilizará la fecha de hoy ({{ fechaHoy }}) como fecha de fin para indicar que la ausencia está en curso
            </small>
            <small v-else class="form-text text-muted">
              Debe especificar la fecha de finalización de la ausencia
            </small>
          </div>

          <div v-if="validationErrors.general || errores.general" class="alert alert-danger">
            {{ validationErrors.general || errores.general }}
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
  name: 'AusenciaModal',
  components: {
    X,
    LoadingSpinner
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    id_empleado: {
      type: [Number, String],
      required: true
    },
    tiposAusencia: {
      type: Array,
      default: () => []
    },
    ausenciasExistentes: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    validationErrors: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'save', 'validation-error'],
  data() {
    return {
      localValue: {
        id_ausencia: null,
        id_empleado: null,
        id_tipo_ausencia: '',
        fecha_inicio: '',
        fecha_fin: ''
      },
      enCurso: true,
      errores: {
        id_tipo_ausencia: '',
        fecha_inicio: '',
        fecha_fin: '',
        general: ''
      }
    };
  },
  computed: {
    isEditing() {
      return !!this.localValue.id_ausencia;
    },

    isFormValid() {
      return (
          this.localValue.id_empleado &&
          this.localValue.id_tipo_ausencia &&
          this.localValue.fecha_inicio &&
          this.localValue.fecha_fin &&
          this.validarFechas()
      );
    },

    fechaHoy() {
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.localValue = {
          ...newValue,
          id_empleado: newValue.id_empleado || this.id_empleado
        };

        if (newValue.id_ausencia && newValue.fecha_fin) {
          this.enCurso = false;
        } else {
          this.enCurso = true;
          this.localValue.fecha_fin = this.fechaHoy;
        }

        this.limpiarErrores();
      },
      immediate: true,
      deep: true
    },

    id_empleado: {
      handler(newValue) {
        if (newValue) {
          const idEmpleado = typeof newValue === 'string'
              ? parseInt(newValue, 10)
              : newValue;

          this.localValue.id_empleado = idEmpleado;
        }
      },
      immediate: true
    },

    enCurso: {
      handler(newValue) {
        if (newValue) {
          this.localValue.fecha_fin = this.fechaHoy;
          this.errores.fecha_fin = '';
        }
      }
    },

    'localValue.fecha_inicio': {
      handler(newValue) {
        if (newValue) {
          this.actualizarFechaFin();
        }
      }
    }
  },
  created() {
    if (this.enCurso && !this.localValue.fecha_fin) {
      this.localValue.fecha_fin = this.fechaHoy;
    }
  },
  methods: {
    limpiarErrores() {
      this.errores = {
        id_tipo_ausencia: '',
        fecha_inicio: '',
        fecha_fin: '',
        general: ''
      };
    },

    toggleEnCurso() {
      this.enCurso = !this.enCurso;

      if (this.enCurso) {
        this.localValue.fecha_fin = this.fechaHoy;
      } else if (this.localValue.fecha_inicio) {
        const inicio = new Date(this.localValue.fecha_inicio);
        const fin = new Date(this.localValue.fecha_fin);

        if (inicio > fin) {
          this.localValue.fecha_fin = this.localValue.fecha_inicio;
        }
      }
    },

    actualizarFechaFin() {
      if (this.localValue.fecha_inicio && !this.enCurso) {
        const inicio = new Date(this.localValue.fecha_inicio);

        if (!this.localValue.fecha_fin || new Date(this.localValue.fecha_fin) < inicio) {
          this.localValue.fecha_fin = this.localValue.fecha_inicio;
        }
      }

      this.validarFechas();
    },

    validarFechas() {
      if (!this.localValue.fecha_inicio || !this.localValue.fecha_fin) {
        return false;
      }

      const inicio = new Date(this.localValue.fecha_inicio);
      const fin = new Date(this.localValue.fecha_fin);

      if (fin < inicio) {
        this.errores.fecha_fin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
        return false;
      }

      this.errores.fecha_fin = '';
      return true;
    },

    validarFormulario() {
      this.limpiarErrores();

      let esValido = true;

      if (!this.localValue.id_empleado) {
        this.errores.general = 'No se puede guardar la ausencia sin ID de empleado';
        esValido = false;
      }

      if (!this.localValue.id_tipo_ausencia) {
        this.errores.id_tipo_ausencia = 'Debe seleccionar un tipo de ausencia';
        esValido = false;
      }

      if (!this.localValue.fecha_inicio) {
        this.errores.fecha_inicio = 'La fecha de inicio es obligatoria';
        esValido = false;
      }

      if (!this.localValue.fecha_fin) {
        this.errores.fecha_fin = 'La fecha de fin es obligatoria';
        esValido = false;
      }

      if (this.localValue.fecha_inicio && this.localValue.fecha_fin) {
        if (!this.validarFechas()) {
          esValido = false;
        }
      }

      if (esValido && this.ausenciasExistentes && this.ausenciasExistentes.length > 0) {
        const solapamiento = this.verificarSolapamiento();
        if (solapamiento) {
          this.errores.general = `Esta ausencia se solapa con otra ausencia existente (${solapamiento.fechaInicio} - ${solapamiento.fechaFin || 'En curso'})`;
          esValido = false;
        }
      }

      return esValido;
    },

    handleSubmit() {
      if (!this.validarFormulario()) {
        this.$emit('validation-error', {
          type: 'general',
          message: this.errores.general || 'Por favor, corrija los errores en el formulario'
        });
        return;
      }

      const ausenciaData = {
        ...this.localValue,
        id_empleado: typeof this.localValue.id_empleado === 'string'
            ? parseInt(this.localValue.id_empleado, 10)
            : this.localValue.id_empleado
      };

      this.$emit('save', ausenciaData);
    },

    verificarSolapamiento() {
      const nuevaInicio = new Date(this.localValue.fecha_inicio);
      const nuevaFin = new Date(this.localValue.fecha_fin);

      for (const ausencia of this.ausenciasExistentes) {
        if (this.localValue.id_ausencia && ausencia.id_ausencia === this.localValue.id_ausencia) {
          continue;
        }

        const existenteInicio = new Date(ausencia.fecha_inicio);
        const existenteFin = ausencia.fecha_fin ? new Date(ausencia.fecha_fin) : new Date();

        if (
            (nuevaInicio <= existenteFin && nuevaFin >= existenteInicio) ||
            (existenteInicio <= nuevaFin && existenteFin >= nuevaInicio)
        ) {
          return {
            id: ausencia.id_ausencia,
            fechaInicio: this.formatDate(ausencia.fecha_inicio),
            fechaFin: ausencia.fecha_fin ? this.formatDate(ausencia.fecha_fin) : 'En curso'
          };
        }
      }

      return null;
    },

    formatDate(dateString) {
      if (!dateString) return '-';

      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
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

.fecha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.toggle-button {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  background-color: #e5e7eb;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-button.active {
  background-color: #dc2626;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-button.active .toggle-slider {
  transform: translateX(20px);
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

.text-info {
  color: #0891b2;
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
</style>