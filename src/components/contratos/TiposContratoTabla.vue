<template>
  <div>
    <div v-if="loading" class="loading-container">
      <loading-spinner message="Cargando tipos de contrato..." />
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="$emit('retry')" class="btn btn-primary">Reintentar</button>
    </div>

    <div v-else-if="tiposContrato.length === 0" class="empty-container">
      <div class="empty-state">
        <FileSearch size="48" class="empty-icon" />
        <h3>No se encontraron tipos de contrato</h3>
        <p>No hay tipos de contrato que coincidan con los criterios de búsqueda.</p>
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
          <th>Descripción</th>
          <th>Duración</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="tipo in tiposContrato"
            :key="tipo.id_tipo_contrato"
            class="tipo-row"
            @click="$emit('view-tipo', tipo)"
        >
          <td data-label="ID">{{ tipo.id_tipo_contrato }}</td>
          <td data-label="Nombre">{{ tipo.nombre }}</td>
          <td data-label="Descripción">{{ tipo.descripcion || '-' }}</td>
          <td data-label="Duración">{{ tipo.duracion || '-' }}</td>
          <td data-label="Estado">
              <span
                  class="status-badge"
                  :class="tipo.activo ? 'status-active' : 'status-inactive'"
              >
                <Circle size="8" class="status-icon" />
                {{ tipo.activo ? 'Activo' : 'Inactivo' }}
              </span>
          </td>
          <td data-label="Acciones">
            <div class="action-buttons" @click.stop>
              <button
                  @click="$emit('delete-tipo', tipo)"
                  class="btn-action btn-delete"
                  title="Eliminar"
              >
                <Trash2 size="16" />
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { FileSearch, RefreshCw, Circle, Trash2 } from 'lucide-vue-next';

export default {
  name: 'TiposContratoTabla',
  components: {
    LoadingSpinner,
    FileSearch,
    RefreshCw,
    Circle,
    Trash2
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
    tiposContrato: {
      type: Array,
      default: () => []
    },
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['retry', 'reset-filters', 'view-tipo', 'delete-tipo']
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

.tipo-row {
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.tipo-row:hover {
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background-color: white;
}

.btn-delete {
  color: #dc2626;
}

.btn-delete:hover {
  background-color: #fef2f2;
  color: #b91c1c;
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