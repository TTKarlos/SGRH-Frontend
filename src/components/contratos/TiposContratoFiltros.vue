<template>
  <div class="card-header">
    <div class="filters">
      <div class="filter-group search-group">
        <Search size="16" class="search-icon" />
        <input
            type="text"
            :value="search"
            @input="$emit('update:search', $event.target.value); $emit('search')"
            class="form-control search-input"
            placeholder="Buscar por nombre o descripción..."
        />
      </div>

      <div class="filter-buttons">
        <div class="filter-tabs">
          <button
              class="filter-tab"
              :class="{ active: filters.activo === null }"
              @click="setFilterActivo(null)"
          >
            <FileText size="16" class="tab-icon" />
            <span>Todos</span>
          </button>

          <button
              class="filter-tab"
              :class="{ active: filters.activo === true }"
              @click="setFilterActivo(true)"
          >
            <FileCheck size="16" class="tab-icon" />
            <span>Activos</span>
          </button>

          <button
              class="filter-tab"
              :class="{ active: filters.activo === false }"
              @click="setFilterActivo(false)"
          >
            <FileX size="16" class="tab-icon" />
            <span>Inactivos</span>
          </button>
        </div>

        <div class="filter-selects">
          <div class="filter-select-group">
            <Clock size="16" class="select-icon" />
            <select
                :value="filters.duracion"
                @change="updateFilter('duracion', $event.target.value)"
                class="form-control select-filter"
            >
              <option value="">Todas las duraciones</option>
              <option value="Indefinido">Indefinido</option>
              <option value="Temporal">Temporal</option>
              <option value="Prácticas">Prácticas</option>
            </select>
          </div>

          <button @click="$emit('reset-filters')" class="btn btn-outline-secondary btn-reset" title="Limpiar todos los filtros">
            <RefreshCw size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Search,
  RefreshCw,
  FileX,
  FileCheck,
  FileText,
  Clock
} from 'lucide-vue-next';

export default {
  name: 'TiposContratoFiltros',
  components: {
    Search,
    RefreshCw,
    FileX,
    FileCheck,
    FileText,
    Clock
  },
  props: {
    search: {
      type: String,
      default: ''
    },
    filters: {
      type: Object,
      required: true
    }
  },
  emits: [
    'update:search',
    'update:filters',
    'search',
    'apply-filters',
    'reset-filters'
  ],
  methods: {
    setFilterActivo(value) {
      const newFilters = { ...this.filters, activo: value };
      this.$emit('update:filters', newFilters);
      this.$emit('apply-filters');
    },

    updateFilter(key, value) {
      const newFilters = { ...this.filters, [key]: value };
      this.$emit('update:filters', newFilters);
      this.$emit('apply-filters');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #f1f1f1;
  font-family: 'Poppins', sans-serif;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: #f9fafb;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.filter-tab.active {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
}

.tab-icon {
  flex-shrink: 0;
}

.filter-selects {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select-group {
  position: relative;
  min-width: 200px;
}

.select-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 1;
}

.filter-group {
  flex: 1;
  min-width: 180px;
}

.search-group {
  position: relative;
  width: 100%;
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
  border: 1px solid #e5e7eb;
  width: 100%;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #fca5a5;
  box-shadow: 0 0 0 3px rgba(252, 165, 165, 0.2);
}

.select-filter {
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  width: 100%;
  font-size: 0.95rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

.select-filter:focus {
  outline: none;
  border-color: #fca5a5;
  box-shadow: 0 0 0 3px rgba(252, 165, 165, 0.2);
}

.btn-outline-secondary {
  background-color: transparent;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.btn-outline-secondary:hover {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.btn-reset {
  padding: 0.625rem;
  height: 40px;
  width: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

@media (max-width: 991px) {
  .filter-select-group {
    min-width: 180px;
  }
}

@media (max-width: 767px) {
  .filter-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-tabs {
    justify-content: space-between;
  }

  .filter-tab {
    flex: 1;
    justify-content: center;
  }

  .filter-selects {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select-group {
    width: 100%;
  }

  .btn-reset {
    width: 100%;
    height: 40px;
  }
}
</style>