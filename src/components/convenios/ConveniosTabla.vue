<template>
  <div class="convenios-tabla">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando convenios...</p>
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

    <div v-else-if="convenios.length === 0" class="empty-container">
      <div v-if="hasFilters" class="empty-with-filters">
        <div class="empty-icon">
          <FileSearch size="48" />
        </div>
        <h3>No se encontraron resultados</h3>
        <p>No hay convenios que coincidan con los filtros aplicados.</p>
        <button @click="$emit('reset-filters')" class="btn btn-secondary">
          <FilterX size="16" class="btn-icon" />
          Limpiar filtros
        </button>
      </div>
      <div v-else class="empty-no-data">
        <div class="empty-icon">
          <FileX size="48" />
        </div>
        <h3>No hay convenios</h3>
        <p>Aún no se han creado convenios en el sistema.</p>
        <button @click="$emit('add-convenio')" class="btn btn-primary">
          <Plus size="16" class="btn-icon" />
          Crear convenio
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
          <th class="categorias-column">Categorías</th>
          <th class="actions-column">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="convenio in convenios" :key="convenio.id_convenio" class="table-row">
          <td class="codigo-column">{{ convenio.codigo || 'N/A' }}</td>
          <td class="nombre-column">{{ convenio.nombre }}</td>
          <td class="descripcion-column">
            <div class="descripcion-text">{{ convenio.descripcion || 'Sin descripción' }}</div>
          </td>
          <td class="categorias-column">
            <router-link
                :to="{ name: 'categorias-convenio', params: { idConvenio: convenio.id_convenio } }"
                class="btn-categorias"
            >
              <FolderClosed class="btn-icon-folder" size="16" />
              <span>Categorías ({{ getCategoriaCount(convenio) }})</span>
              <ChevronRight class="btn-icon-right" size="14" />
            </router-link>
          </td>
          <td class="actions-column">
            <div class="actions-buttons">
              <button
                  @click="$emit('view-convenio', convenio)"
                  class="btn-icon-only"
                  title="Ver detalles"
              >
                <Eye size="18" />
              </button>
              <button
                  @click="$emit('edit-convenio', convenio)"
                  class="btn-icon-only"
                  title="Editar"
              >
                <Edit size="18" />
              </button>
              <button
                  @click="$emit('delete-convenio', convenio)"
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
  FileX, Plus, Eye, Edit, Trash2, FolderClosed, ChevronRight
} from 'lucide-vue-next';

export default {
  name: 'ConveniosTabla',

  components: {
    AlertTriangle,
    RefreshCw,
    FileSearch,
    FilterX,
    FileX,
    Plus,
    Eye,
    Edit,
    Trash2,
    FolderClosed,
    ChevronRight
  },

  props: {
    convenios: {
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

  emits: ['retry', 'reset-filters', 'view-convenio', 'edit-convenio', 'delete-convenio', 'add-convenio'],

  computed: {
    hasFilters() {
      if (!this.filters) return false;

      return Object.values(this.filters).some(value => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim() !== '';
        return true;
      });
    }
  },

  methods: {
    getCategoriaCount(convenio) {
      if (convenio.CategoriaConvenios && Array.isArray(convenio.CategoriaConvenios)) {
        return convenio.CategoriaConvenios.length;
      }

      if (convenio.categorias_count !== undefined && convenio.categorias_count !== null) {
        return typeof convenio.categorias_count === 'number'
            ? convenio.categorias_count
            : parseInt(convenio.categorias_count, 10) || 0;
      }

      return 0;
    }
  }
};
</script>

<style scoped>
.convenios-tabla {
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
  overflow-x: visible;
  width: 100%;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 0;
  table-layout: fixed;
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

.codigo-column {
  width: 15%;
}

.nombre-column {
  width: 25%;
}

.descripcion-column {
  width: 25%;
}

.categorias-column {
  width: 20%;
}

.descripcion-text {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-column {
  width: 15%;
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

/* Estilos para el botón de categorías */
.btn-categorias {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-categorias:hover {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
}

.btn-icon-folder {
  color: #6b7280;
}

.btn-categorias:hover .btn-icon-folder,
.btn-categorias:hover .btn-icon-right {
  color: white;
}

.btn-icon-right {
  margin-left: auto;
  color: #9ca3af;
  transition: transform 0.2s;
}

.btn-categorias:hover .btn-icon-right {
  transform: translateX(2px);
}

@media (max-width: 768px) {
  .table {
    display: block;
  }

  .table th,
  .table td {
    padding: 0.75rem;
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

  .codigo-column,
  .nombre-column,
  .descripcion-column,
  .categorias-column,
  .actions-column {
    width: 100%;
    text-align: right;
  }

  .actions-buttons {
    justify-content: flex-end;
  }
}
</style>
