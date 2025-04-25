<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ value.id_ausencia ? 'Editar' : 'Nueva' }} ausencia</h3>
        <button @click="$emit('close')" class="btn-close">
          <X size="18" />
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="id_tipo_ausencia">Tipo de ausencia <span class="required">*</span></label>
            <select
                id="id_tipo_ausencia"
                v-model="form.id_tipo_ausencia"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.id_tipo_ausencia }"
                required
            >
              <option value="" disabled>Seleccione un tipo de ausencia</option>
              <option
                  v-for="tipo in tiposAusenciaDisponibles"
                  :key="tipo.id_tipo_ausencia"
                  :value="tipo.id_tipo_ausencia"
              >
                {{ tipo.nombre }}
              </option>
            </select>
            <div v-if="validationErrors.id_tipo_ausencia" class="invalid-feedback">
              {{ validationErrors.id_tipo_ausencia }}
            </div>
          </div>

          <div class="form-group">
            <label for="fecha_inicio">Fecha de inicio <span class="required">*</span></label>
            <input
                id="fecha_inicio"
                type="date"
                v-model="form.fecha_inicio"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fecha_inicio }"
                required
            />
            <div v-if="validationErrors.fecha_inicio" class="invalid-feedback">
              {{ validationErrors.fecha_inicio }}
            </div>
          </div>

          <div class="form-group">
            <label for="fecha_fin">Fecha de fin <span class="required">*</span></label>
            <input
                id="fecha_fin"
                type="date"
                v-model="form.fecha_fin"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fecha_fin }"
                required
                :min="form.fecha_inicio"
            />
            <div v-if="validationErrors.fecha_fin" class="invalid-feedback">
              {{ validationErrors.fecha_fin }}
            </div>
            <div v-else-if="form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio" class="invalid-feedback d-block">
              La fecha de fin debe ser posterior a la fecha de inicio
            </div>
          </div>

          <div v-if="form.fecha_inicio && form.fecha_fin && form.fecha_fin >= form.fecha_inicio" class="info-box">
            <Calendar size="18" class="info-icon" />
            <span>Duración: {{ calcularDuracion(form.fecha_inicio, form.fecha_fin) }}</span>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancelar
        </button>
        <button @click="handleSubmit" class="btn btn-primary" :disabled="loading || !isFormValid">
          <Save v-if="!loading" size="18" class="btn-icon" />
          <Loader v-else size="18" class="btn-icon animate-spin" />
          {{ value.id_ausencia ? 'Guardar cambios' : 'Crear ausencia' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { X, Save, Loader, Calendar } from "lucide-vue-next"
import { useTiposAusenciaStore } from "../../../../stores/tiposAusencia"

export default {
  name: "AusenciaModal",

  components: {
    X,
    Save,
    Loader,
    Calendar,
  },

  props: {
    value: {
      type: Object,
      default: () => ({
        id_tipo_ausencia: null,
        fecha_inicio: "",
        fecha_fin: "",
      }),
    },
    tiposAusencia: {
      type: Array,
      default: () => [],
    },
    validationErrors: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["close", "save"],

  data() {
    return {
      form: {
        id_ausencia: this.value.id_ausencia || null,
        id_tipo_ausencia: this.value.id_tipo_ausencia || "",
        fecha_inicio: this.value.fecha_inicio || "",
        fecha_fin: this.value.fecha_fin || "",
      },
      tiposAusenciaStore: useTiposAusenciaStore(),
    }
  },

  computed: {
    isFormValid() {
      return (
          this.form.id_tipo_ausencia &&
          this.form.fecha_inicio &&
          this.form.fecha_fin &&
          this.form.fecha_fin >= this.form.fecha_inicio
      )
    },

    tiposAusenciaDisponibles() {
      if (this.tiposAusencia && this.tiposAusencia.length > 0) {
        return this.tiposAusencia
      }

      if (this.tiposAusenciaStore.tiposAusencia && this.tiposAusenciaStore.tiposAusencia.length > 0) {
        return this.tiposAusenciaStore.tiposAusencia
      }

      return []
    },
  },

  watch: {
    value: {
      handler(newValue) {
        this.form = {
          id_ausencia: newValue.id_ausencia || null,
          id_tipo_ausencia: newValue.id_tipo_ausencia || "",
          fecha_inicio: newValue.fecha_inicio || "",
          fecha_fin: newValue.fecha_fin || "",
        }
      },
      deep: true,
    },
  },

  created() {
    this.loadTiposAusencia()
  },

  methods: {
    async loadTiposAusencia() {
      try {
        await this.tiposAusenciaStore.fetchTiposAusencia()
      } catch (error) {
        console.error("Error al cargar tipos de ausencia:", error)
      }
    },

    handleSubmit() {
      if (!this.isFormValid) return

      this.$emit("save", { ...this.form })
    },

    calcularDuracion(fechaInicio, fechaFin) {
      if (!fechaInicio || !fechaFin) return "-"

      const inicio = new Date(fechaInicio)
      const fin = new Date(fechaFin)

      const diffTime = Math.abs(fin - inicio)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

      return `${diffDays} día${diffDays !== 1 ? "s" : ""}`
    },
  },
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
  max-width: 32rem;
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
  max-height: 60vh;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #dc2626;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
}

.form-control.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.d-block {
  display: block;
}

.info-box {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.info-icon {
  color: #4b5563;
  margin-right: 0.5rem;
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

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.btn-secondary:hover {
  background-color: #e5e7eb;
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