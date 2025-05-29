<template>
  <div class="empresas-tabla">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando empresas...</p>
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

    <div v-else-if="empresas.length === 0" class="empty-container">
      <div v-if="hasFilters" class="empty-with-filters">
        <div class="empty-icon">
          <FileSearch size="48" />
        </div>
        <h3>No se encontraron resultados</h3>
        <p>No hay empresas que coincidan con los filtros aplicados.</p>
        <button @click="$emit('reset-filters')" class="btn btn-secondary">
          <FilterX size="16" class="btn-icon" />
          Limpiar filtros
        </button>
      </div>
      <div v-else class="empty-no-data">
        <div class="empty-icon">
          <Building size="48" />
        </div>
        <h3>No hay empresas</h3>
        <p>Aún no se han creado empresas en el sistema.</p>
        <button @click="$emit('add-empresa')" class="btn btn-primary">
          <Plus size="16" class="btn-icon" />
          Crear empresa
        </button>
      </div>
    </div>

    <div v-else class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th class="nombre-column">Nombre</th>
          <th class="cif-column">CIF/NIF</th>
          <th class="telefono-column">Teléfono</th>
          <th class="email-column">Email</th>
          <th class="actions-column">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="empresa in empresas" :key="empresa.id_empresa" class="table-row">
          <td class="nombre-column">{{ empresa.nombre }}</td>
          <td class="cif-column">{{ empresa.cif || 'N/A' }}</td>
          <td class="telefono-column">{{ empresa.telefono || 'N/A' }}</td>
          <td class="email-column">
            <div class="email-text">{{ empresa.email || 'N/A' }}</div>
          </td>
          <td class="actions-column">
            <div class="actions-buttons">
              <button
                  @click="$emit('view-empresa', empresa)"
                  class="btn-icon-only"
                  title="Ver detalles"
              >
                <Eye size="18" />
              </button>
              <button
                  @click="$emit('edit-empresa', empresa)"
                  class="btn-icon-only"
                  title="Editar"
              >
                <Edit size="18" />
              </button>
              <button
                  @click="$emit('delete-empresa', empresa)"
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
  Building, Plus, Eye, Edit, Trash2
} from 'lucide-vue-next';

export default {
  name: 'EmpresasTabla',

  components: {
    AlertTriangle,
    RefreshCw,
    FileSearch,
    FilterX,
    Building,
    Plus,
    Eye,
    Edit,
    Trash2
  },

  props: {
    empresas: {
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

  emits: ['retry', 'reset-filters', 'view-empresa', 'edit-empresa', 'delete-empresa', 'add-empresa'],

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
.empresas-tabla {
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

.nombre-column {
  min-width: 200px;
}

.cif-column {
  width: 120px;
}

.telefono-column {
  width: 120px;
}

.email-column {
  min-width: 200px;
}

.email-text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.estado-column {
  width: 100px;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.status-active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background-color: #f3f4f6;
  color: #4b5563;
}

.actions-column {
  width: 150px;
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

.btn-icon-only.btn-warning:hover {
  background-color: #fef3c7;
  color: #d97706;
}

.btn-icon-only.btn-success:hover {
  background-color: #d1fae5;
  color: #059669;
}

@media (max-width: 768px) {
  .table {
    display: block;
  }

  .table th,
  .table td {
    padding: 0.75rem;
  }

  .email-column {
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

  .nombre-column,
  .cif-column,
  .telefono-column,
  .email-column,
  .estado-column,
  .actions-column {
    width: 100%;
    text-align: right;
  }

  .actions-buttons {
    justify-content: flex-end;
  }
}
</style>
