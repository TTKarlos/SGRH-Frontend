<template>
  <div class="tab-panel">
    <div class="card">
      <div class="card-header">
        <h2>Información Laboral</h2>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Puesto Actual</label>
            <input
                v-if="editMode"
                v-model="empleado.puesto_actual"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.puesto_actual }"
            />
            <div v-if="editMode && validationErrors.puesto_actual" class="invalid-feedback">
              {{ validationErrors.puesto_actual }}
            </div>
            <div v-else class="form-value">{{ empleado.puesto_actual || 'No especificado' }}</div>
          </div>

          <div class="form-group">
            <label>Centro</label>
            <select
                v-if="editMode"
                v-model="empleado.id_centro"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.id_centro }"
                @change="handleCentroChange"
            >
              <option :value="null">Sin centro</option>
              <option v-for="centro in centros"
                      :key="centro.id_centro"
                      :value="centro.id_centro">
                {{ centro.nombre }}
              </option>
            </select>
            <div v-if="editMode && validationErrors.id_centro" class="invalid-feedback">
              {{ validationErrors.id_centro }}
            </div>
            <div v-else class="form-value">
              {{ empleado.Centro ? empleado.Centro.nombre : 'No asignado' }}
            </div>
          </div>

          <div class="form-group">
            <label>Departamento</label>
            <select
                v-if="editMode"
                v-model="empleado.id_departamento"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.id_departamento }"
            >
              <option :value="null">Sin departamento</option>
              <option v-for="departamento in departamentosFiltrados"
                      :key="departamento.id_departamento"
                      :value="departamento.id_departamento">
                {{ departamento.nombre }}
              </option>
            </select>
            <div v-if="editMode && validationErrors.id_departamento" class="invalid-feedback">
              {{ validationErrors.id_departamento }}
            </div>
            <div v-else class="form-value">
              {{ empleado.Departamento ? empleado.Departamento.nombre : 'No asignado' }}
            </div>
          </div>

          <div class="form-group">
            <label>Fecha de Incorporación</label>
            <input
                v-if="editMode"
                v-model="empleado.fecha_incorporacion"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fecha_incorporacion }"
            />
            <div v-if="editMode && validationErrors.fecha_incorporacion" class="invalid-feedback">
              {{ validationErrors.fecha_incorporacion }}
            </div>
            <div v-else class="form-value">{{ formatDate(empleado.fecha_incorporacion) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InformacionLaboralTab',
  
  props: {
    empleado: {
      type: Object,
      required: true
    },
    editMode: {
      type: Boolean,
      default: false
    },
    validationErrors: {
      type: Object,
      default: () => ({})
    },
    centros: {
      type: Array,
      default: () => []
    },
    departamentos: {
      type: Array,
      default: () => []
    },
    selectedCentroId: {
      type: [Number, null],
      default: null
    }
  },
  
  emits: ['centro-change'],
  
  computed: {
    departamentosFiltrados() {
      if (!this.selectedCentroId) {
        return this.departamentos
      }

      return this.departamentos.filter(
        departamento => departamento.id_centro === this.selectedCentroId
      )
    }
  },
  
  methods: {
    formatDate(dateString) {
      if (!dateString) return "No especificada"

      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    },
    
    handleCentroChange() {
      this.$emit('centro-change', this.empleado.id_centro)
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

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.card-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.form-value {
  padding: 0.5rem 0;
  color: #111827;
  font-weight: 500;
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
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>