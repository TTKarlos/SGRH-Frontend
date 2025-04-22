<template>
  <div class="card-header">
    <div class="filtros-documentos">
      <div class="search-group">
        <Search size="16" class="search-icon" />
        <input
            :value="searchQuery"
            @input="updateSearchQuery($event)"
            type="text"
            class="form-control search-input"
            placeholder="Buscar documentos..."
        />
      </div>

      <div class="filter-select-group">
        <FileType size="16" class="select-icon" />
        <select
            :value="filters.tipo_documento"
            @change="updateFilter('tipo_documento', $event.target.value)"
            class="form-control select-filter"
        >
          <option value="">Todos los tipos</option>
          <option v-for="tipo in tiposDocumento" :key="tipo" :value="tipo">
            {{ tipo }}
          </option>
        </select>
      </div>

      <div class="filter-date-group">
        <Calendar size="16" class="select-icon" />
        <input
            type="date"
            :value="filters.fecha_desde"
            @change="updateFilter('fecha_desde', $event.target.value)"
            class="form-control date-input"
            placeholder="Fecha desde"
        />
      </div>

      <div class="filter-date-group">
        <Calendar size="16" class="select-icon" />
        <input
            type="date"
            :value="filters.fecha_hasta"
            @change="updateFilter('fecha_hasta', $event.target.value)"
            class="form-control date-input"
            placeholder="Fecha hasta"
        />
      </div>

      <button @click="$emit('reset-filters')" class="btn btn-outline-secondary btn-reset" title="Limpiar filtros">
        <RefreshCw size="16" />
      </button>
    </div>
  </div>
</template>

<script>
import { Search, FileType, Calendar, RefreshCw } from 'lucide-vue-next';

export default {
  name: 'DocumentosFiltros',

  components: {
    Search,
    FileType,
    Calendar,
    RefreshCw
  },

  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    filters: {
      type: Object,
      required: true
    },
    tiposDocumento: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:searchQuery', 'update:filters', 'search', 'apply-filters', 'reset-filters'],

  methods: {
    updateSearchQuery(event) {
      this.$emit('update:searchQuery', event.target.value);
      this.$emit('search');
    },

    updateFilter(key, value) {
      const updatedFilters = { ...this.filters, [key]: value };
      this.$emit('update:filters', updatedFilters);
      this.$emit('apply-filters');
    }
  }
};
</script>

<style scoped>
.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.filtros-documentos {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.search-group {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  width: 100%;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.filter-select-group, .filter-date-group {
  position: relative;
  min-width: 180px;
}

.select-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 1;
}

.select-filter, .date-input {
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  width: 100%;
  font-size: 0.95rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.select-filter {
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

.select-filter:focus, .date-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.btn-reset {
  padding: 0.625rem;
  height: 40px;
  width: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 1px solid #d1d5db;
  color: #4b5563;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background-color: #f3f4f6;
  color: #dc2626;
  border-color: #dc2626;
}

@media (max-width: 768px) {
  .filtros-documentos {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>