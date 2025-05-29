<template>
  <div class="tipos-contrato-tabla">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando tipos de contrato...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <AlertTriangle size="24" />
      </div>
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="btn btn-primary">
        <RefreshCw size="16" class="btn-icon" />
        Reintentar
      </button>
    </div>

    <div v-else-if="tiposContrato.length === 0" class="empty-container">
      <div v-if="hasFilters" class="empty-with-filters">
        <div class="empty-icon">
          <FileSearch size="48" />
        </div>
        <h3>No se encontraron resultados</h3>
        <p>No hay tipos de contrato que coincidan con los filtros aplicados.</p>
        <button @click="$emit('reset-filters')" class="btn btn-secondary">
          <FilterX size="16" class="btn-icon" />
          Limpiar filtros
        </button>
      </div>
      <div v-else class="empty-no-data">
        <div class="empty-icon">
          <FileX size="48" />
        </div>
        <h3>No hay tipos de contrato</h3>
        <p>Aún no se han creado tipos de contrato en el sistema.</p>
        <button @click="$emit('add-tipo')" class="btn btn-primary">
          <Plus size="16" class="btn-icon" />
          Crear tipo de contrato
        </button>
      </div>
    </div>

    <div v-else class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th class="codigo-column">Código</th>
          <th class="nombre-column">Nombre</th>
          <th class="descripcion-column">Descripción</th>
          <th class="actions-column">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="tipo in tiposContrato" :key="tipo.id_tipo_contrato" class="table-row">
          <td class="codigo-column">{{ tipo.codigo }}</td>
          <td class="nombre-column">{{ tipo.nombre }}</td>
          <td class="descripcion-column">
            <div class="descripcion-text">{{ tipo.descripcion || 'Sin descripción' }}</div>
          </td>
          <td class="actions-column">
            <div class="actions-buttons">
              <button
                  @click="$emit('edit-tipo', tipo)"
                  class="btn-icon-only"
                  title="Editar"
              >
                <Edit size="18" />
              </button>
              <button
                  @click="$emit('copy-tipo', tipo)"
                  class="btn-icon-only"
                  title="Duplicar"
              >
                <Copy size="18" />
              </button>
              <button
                  @click="$emit('delete-tipo', tipo)"
                  class="btn-icon-only btn-danger"
                  title="Eliminar"
              >
                <Trash2 size="18" />
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
import {
  AlertTriangle, RefreshCw, FileSearch, FilterX,
  FileX, Plus, Edit, Copy, Trash2
} from 'lucide-vue-next';

export default {
  name: 'TiposContratoTabla',

  components: {
    AlertTriangle,
    RefreshCw,
    FileSearch,
    FilterX,
    FileX,
    Plus,
    Edit,
    Copy,
    Trash2
  },

  props: {
    tiposContrato: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    filters: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['retry', 'reset-filters', 'view-tipo', 'edit-tipo', 'copy-tipo', 'delete-tipo', 'add-tipo'],

  computed: {
    hasFilters() {
      if (!this.filters) return false;

      return Object.values(this.filters).some(value => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim() !== '';
        return true;
      });
    }
  }
};
</script>

<style scoped>
.tipos-contrato-tabla {
  width: 100%;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(220, 38, 38, 0.1);
  border-left-color: #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  margin-bottom: 1rem;
  color: #dc2626;
}

.empty-with-filters .empty-icon {
  color: #9ca3af;
}

.empty-no-data .empty-icon {
  color: #d1d5db;
}

.empty-container h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
}

.empty-container p {
  color: #6b7280;
  margin-bottom: 1.5rem;
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

.btn-primary:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.table-responsive {
  overflow-x: auto;
  width: 100%;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 0;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  vertical-align: middle;
}

.table th {
  font-weight: 600;
  color: #374151;
  background-color: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #e5e7eb;
}

.table td {
  border-bottom: 1px solid #e5e7eb;
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #f9fafb;
}

.id-column {
  width: 60px;
  text-align: center;
}

.codigo-column {
  width: 100px;
  font-family: monospace;
  font-weight: 600;
}

.nombre-column {
  min-width: 200px;
}

.descripcion-column {
  min-width: 300px;
}

.descripcion-text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-column {
  width: 120px;
  text-align: right;
}

.actions-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
}

.btn-icon-only {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  background-color: transparent;
  color: #4b5563;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-only:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.btn-icon-only.btn-danger:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

@media (max-width: 768px) {
  .table {
    display: block;
  }

  .table th,
  .table td {
    padding: 0.75rem;
  }

  .descripcion-column {
    max-width: 150px;
  }

  .actions-buttons {
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .table thead {
    display: none;
  }

  .table tbody {
    display: block;
  }

  .table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .table td {
    display: flex;
    padding: 0.75rem;
    text-align: right;
    border-bottom: 1px solid #e5e7eb;
  }

  .table td:last-child {
    border-bottom: none;
  }

  .table td::before {
    content: attr(data-label);
    font-weight: 600;
    margin-right: auto;
    color: #374151;
  }

  .id-column,
  .codigo-column,
  .nombre-column,
  .descripcion-column,
  .actions-column {
    width: 100%;
    text-align: right;
  }

  .actions-buttons {
    justify-content: flex-end;
  }
}
</style>
