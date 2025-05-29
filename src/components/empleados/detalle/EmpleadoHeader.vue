<template>
  <div class="page-header">
    <div class="header-left">
      <button @click="goBack" class="btn btn-icon btn-ghost">
        <ArrowLeft size="18" />
        <span>Volver</span>
      </button>
      <h1 v-if="empleado">{{ empleado.nombre }} {{ empleado.apellidos }}</h1>
    </div>

    <div class="header-actions" v-if="empleado && canEdit">
      <button
          @click="toggleEmpleadoStatus"
          class="btn btn-status"
          :class="empleado.activo ? 'btn-status-active' : 'btn-status-inactive'"
      >
        <ToggleRight v-if="empleado.activo" size="18" class="btn-icon" />
        <ToggleLeft v-else size="18" class="btn-icon" />
        {{ empleado.activo ? 'Activo' : 'Inactivo' }}
      </button>

      <!-- Botón de Editar (solo visible cuando no estamos en modo edición) -->
      <button v-if="!editMode" @click="$emit('edit')" class="btn btn-primary">
        <Edit size="18" class="btn-icon" />
        Editar Empleado
      </button>

      <!-- Botones de Guardar y Cancelar (solo visibles en modo edición) -->
      <div v-if="editMode" class="edit-actions">
        <button @click="$emit('save')" class="btn btn-success">
          <Save size="18" class="btn-icon" />
          Guardar
        </button>

        <button @click="$emit('cancel')" class="btn btn-secondary">
          <X size="18" class="btn-icon" />
          Cancelar
        </button>
      </div>

      <!-- Botón de Eliminar (siempre visible) -->
      <button @click="$emit('delete')" class="btn btn-danger">
        <Trash2 size="18" class="btn-icon" />
        Eliminar
      </button>
    </div>
  </div>
</template>

<script>
import { ArrowLeft, Edit, Save, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-vue-next'

export default {
  name: 'EmpleadoHeader',

  components: {
    ArrowLeft,
    Edit,
    Save,
    Trash2,
    X,
    ToggleLeft,
    ToggleRight
  },

  props: {
    empleado: {
      type: Object,
      required: true
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    editMode: {
      type: Boolean,
      default: false
    }
  },

  emits: ['edit', 'save', 'cancel', 'delete', 'toggle-status'],

  methods: {
    goBack() {
      this.$router.push('/empleados')
    },

    toggleEmpleadoStatus() {
      this.$emit('toggle-status')
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  position: relative;
  padding-bottom: 0.5rem;
}

.header-left h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #dc2626, #ef4444);
  border-radius: 3px;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
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

.btn-ghost {
  background-color: transparent;
  color: #4b5563;
}

.btn-ghost:hover {
  background-color: #f3f4f6;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-success {
  background-color: #10b981;
  color: white;
  box-shadow: 0 1px 2px rgba(16, 185, 129, 0.1);
}

.btn-success:hover {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.1);
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-danger:hover {
  background-color: #fecaca;
}

.btn-status {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-status-active {
  background-color: #dcfce7;
  color: #166534;
}

.btn-status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .edit-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>