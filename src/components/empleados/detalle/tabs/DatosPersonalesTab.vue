<template>
  <div class="tab-panel">
    <div class="card">
      <div class="card-header">
        <h2>Datos Personales</h2>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>Nombre</label>
            <input
                v-if="editMode"
                v-model="empleado.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.nombre }"
            />
            <div v-if="editMode && validationErrors.nombre" class="invalid-feedback">
              {{ validationErrors.nombre }}
            </div>
            <div v-else class="form-value">{{ empleado.nombre }}</div>
          </div>

          <div class="form-group">
            <label>Apellidos</label>
            <input
                v-if="editMode"
                v-model="empleado.apellidos"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.apellidos }"
            />
            <div v-if="editMode && validationErrors.apellidos" class="invalid-feedback">
              {{ validationErrors.apellidos }}
            </div>
            <div v-else class="form-value">{{ empleado.apellidos }}</div>
          </div>

          <div class="form-group">
            <label>DNI/NIE</label>
            <input
                v-if="editMode"
                v-model="empleado.dni_nie"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.dni_nie }"
            />
            <div v-if="editMode && validationErrors.dni_nie" class="invalid-feedback">
              {{ validationErrors.dni_nie }}
            </div>
            <div v-else class="form-value">{{ empleado.dni_nie }}</div>
          </div>

          <div class="form-group">
            <label>Fecha de Nacimiento</label>
            <input
                v-if="editMode"
                v-model="empleado.fecha_nacimiento"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.fecha_nacimiento }"
            />
            <div v-if="editMode && validationErrors.fecha_nacimiento" class="invalid-feedback">
              {{ validationErrors.fecha_nacimiento }}
            </div>
            <div v-else class="form-value">{{ formatDate(empleado.fecha_nacimiento) }}</div>
          </div>

          <div class="form-group">
            <label>Estado Civil</label>
            <select
                v-if="editMode"
                v-model="empleado.estado_civil"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.estado_civil }"
            >
              <option value="">Seleccionar...</option>
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Viudo/a">Viudo/a</option>
              <option value="Otro">Otro</option>
            </select>
            <div v-if="editMode && validationErrors.estado_civil" class="invalid-feedback">
              {{ validationErrors.estado_civil }}
            </div>
            <div v-else class="form-value">{{ empleado.estado_civil || 'No especificado' }}</div>
          </div>

          <div class="form-group">
            <label>Dirección</label>
            <textarea
                v-if="editMode"
                v-model="empleado.direccion"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.direccion }"
            ></textarea>
            <div v-if="editMode && validationErrors.direccion" class="invalid-feedback">
              {{ validationErrors.direccion }}
            </div>
            <div v-else class="form-value">{{ empleado.direccion || 'No especificada' }}</div>
          </div>

          <div class="form-group">
            <label>Teléfono</label>
            <input
                v-if="editMode"
                v-model="empleado.telefono"
                type="tel"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.telefono }"
            />
            <div v-if="editMode && validationErrors.telefono" class="invalid-feedback">
              {{ validationErrors.telefono }}
            </div>
            <div v-else class="form-value">{{ empleado.telefono || 'No especificado' }}</div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
                v-if="editMode"
                v-model="empleado.email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.email }"
            />
            <div v-if="editMode && validationErrors.email" class="invalid-feedback">
              {{ validationErrors.email }}
            </div>
            <div v-else class="form-value">{{ empleado.email || 'No especificado' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DatosPersonalesTab',

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