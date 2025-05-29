<template>
  <div>
    <div v-if="loading" class="loading-container">
      <loading-spinner message="Cargando empleados..." />
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="$emit('retry')" class="btn btn-primary">Reintentar</button>
    </div>

    <div v-else-if="empleados.length === 0" class="empty-container">
      <div class="empty-state">
        <FileSearch size="48" class="empty-icon" />
        <h3>No se encontraron empleados</h3>
        <p>No hay empleados que coincidan con los criterios de búsqueda.</p>
        <button @click="$emit('reset-filters')" class="btn btn-primary">
          <RefreshCw size="16" class="btn-icon" />
          Limpiar filtros
        </button>
      </div>
    </div>

    <div v-else class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellidos</th>
          <th>DNI/NIE</th>
          <th>Departamento</th>
          <th>Centro</th>
          <th>Estado</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="empleado in empleados"
            :key="empleado.id_empleado"
            class="empleado-row"
            @click="$emit('view-empleado', empleado.id_empleado)"
        >
          <td data-label="ID">{{ empleado.id_empleado }}</td>
          <td data-label="Nombre">{{ empleado.nombre }}</td>
          <td data-label="Apellidos">{{ empleado.apellidos }}</td>
          <td data-label="DNI/NIE">{{ empleado.dni_nie }}</td>
          <td data-label="Departamento">{{ empleado.Departamento ? empleado.Departamento.nombre : '-' }}</td>
          <td data-label="Centro">{{ empleado.Centro ? empleado.Centro.nombre : '-' }}</td>
          <td data-label="Estado">
              <span
                  class="status-badge"
                  :class="empleado.activo ? 'status-active' : 'status-inactive'"
              >
                <Circle size="8" class="status-icon" />
                {{ empleado.activo ? 'Activo' : 'Inactivo' }}
              </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { FileSearch, RefreshCw, Circle } from 'lucide-vue-next';

export default {
  name: 'EmpleadosTabla',
  components: {
    LoadingSpinner,
    FileSearch,
    RefreshCw,
    Circle
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    empleados: {
      type: Array,
      default: () => []
    },
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['retry', 'reset-filters', 'view-empleado']
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
}

.btn-primary:hover {
  background-color: #b91c1c;
}

.btn-icon {
  margin-right: 0.5rem;
}

.table-responsive {
  overflow-x: auto;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Poppins', sans-serif;
}

.table th,
.table td {
  padding: 0.875rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid #f1f1f1;
}

.table th {
  font-weight: 600;
  color: #4b5563;
  background-color: #f9fafb;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.empleado-row {
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.empleado-row:hover {
  background-color: #fef2f2;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-icon {
  flex-shrink: 0;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.loading-container,
.error-container {
  padding: 3rem;
  text-align: center;
}

.empty-container {
  padding: 3rem 1.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.empty-icon {
  color: #dc2626;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.error-message {
  color: #991b1b;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

@media (max-width: 575px) {
  .table {
    border: 0;
  }

  .table thead {
    display: none;
  }

  .table tr {
    margin-bottom: 1rem;
    display: block;
    border: 1px solid #f1f1f1;
    border-radius: 0.5rem;
  }

  .table td {
    display: block;
    text-align: right;
    padding: 0.75rem 1rem;
    position: relative;
    border-bottom: 1px solid #f1f1f1;
  }

  .table td:last-child {
    border-bottom: 0;
  }

  .table td::before {
    content: attr(data-label);
    position: absolute;
    left: 1rem;
    font-weight: 600;
    color: #4b5563;
  }
}
</style>