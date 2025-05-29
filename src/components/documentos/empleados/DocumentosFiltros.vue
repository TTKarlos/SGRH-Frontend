<template>
  <div class="filtros-container">
    <div class="toolbar">
      <div class="search-container">
        <Search size="18" class="search-icon" />
        <input
            v-model="filtrosLocales.busqueda"
            type="text"
            placeholder="Buscar documentos..."
            class="search-input"
            @input="emitirCambio"
        />
      </div>

      <div class="filter-container">
        <select
            v-model="filtrosLocales.tipo"
            class="filter-select"
            @change="emitirCambio"
        >
          <option value="">Todos los tipos</option>
          <option value="Contrato">Contrato</option>
          <option value="Nómina">Nómina</option>
          <option value="CV">Currículum</option>
          <option value="DNI/NIE">DNI/NIE</option>
          <option value="Formación">Formación</option>
          <option value="Otro">Otro</option>
        </select>

        <button @click="$emit('toggle-avanzados')" class="btn btn-filter">
          <SlidersHorizontal size="18" class="btn-icon" />
          Filtros
          <ChevronDown v-if="!mostrarAvanzados" size="16" class="ml-1" />
          <ChevronUp v-else size="16" class="ml-1" />
        </button>

        <button @click="toggleVista" class="btn btn-filter" title="Cambiar vista">
          <LayoutGrid v-if="vista === 'list'" size="18" />
          <List v-else size="18" />
        </button>
      </div>

      <PermissionCheck :permiso="{ nombre: 'Documentos', tipo: 'Escritura' }">
        <button @click="$emit('subir-documento')" class="btn btn-primary">
          <Upload size="18" class="btn-icon" />
          Subir documento
        </button>
      </PermissionCheck>
    </div>

    <!-- Filtros avanzados -->
    <div v-if="mostrarAvanzados" class="filtros-avanzados">
      <div class="filtro-grupo">
        <label>Fecha de subida</label>
        <div class="filtro-fecha">
          <div class="fecha-input">
            <label class="fecha-label">Desde</label>
            <input
                v-model="filtrosLocales.fechaDesde"
                type="date"
                class="form-control"
                @change="emitirCambio"
            />
          </div>
          <div class="fecha-input">
            <label class="fecha-label">Hasta</label>
            <input
                v-model="filtrosLocales.fechaHasta"
                type="date"
                class="form-control"
                @change="emitirCambio"
            />
          </div>
        </div>
      </div>

      <div class="filtro-grupo">
        <label>Estado</label>
        <div class="filtro-opciones">
          <label class="checkbox-container">
            <input
                type="checkbox"
                v-model="filtrosLocales.activos"
                @change="emitirCambio"
            />
            <span class="checkbox-label">Activos</span>
          </label>
          <label class="checkbox-container">
            <input
                type="checkbox"
                v-model="filtrosLocales.archivados"
                @change="emitirCambio"
            />
            <span class="checkbox-label">Archivados</span>
          </label>
        </div>
      </div>

      <button @click="limpiarFiltros" class="btn btn-outline">
        <X size="18" class="btn-icon" />
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import {
  Search, SlidersHorizontal, ChevronDown, ChevronUp,
  Upload, X, LayoutGrid, List
} from 'lucide-vue-next'
import PermissionCheck from '../../common/PermissionCheck.vue'

export default {
  name: 'DocumentosFiltros',

  components: {
    Search,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp,
    Upload,
    X,
    LayoutGrid,
    List,
    PermissionCheck
  },

  props: {
    filtros: {
      type: Object,
      required: true
    },
    mostrarAvanzados: {
      type: Boolean,
      default: false
    },
    vista: {
      type: String,
      default: 'grid'
    }
  },

  emits: [
    'actualizar-filtro',
    'limpiar-filtros',
    'toggle-avanzados',
    'subir-documento',
    'cambiar-vista'
  ],

  setup(props, { emit }) {
    const filtrosLocales = ref({ ...props.filtros })

    watch(() => props.filtros, (newVal) => {
      filtrosLocales.value = { ...newVal }
    }, { deep: true })

    const emitirCambio = () => {
      emit('actualizar-filtro', filtrosLocales.value)
    }

    const limpiarFiltros = () => {
      filtrosLocales.value = {
        busqueda: '',
        tipo: '',
        fechaDesde: '',
        fechaHasta: '',
        activos: true,
        archivados: false
      }
      emit('limpiar-filtros')
    }

    const toggleVista = () => {
      emit('cambiar-vista', props.vista === 'grid' ? 'list' : 'grid')
    }

    return {
      filtrosLocales,
      emitirCambio,
      limpiarFiltros,
      toggleVista
    }
  }
}
</script>

<style scoped>
.filtros-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #dc2626;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #dc2626;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
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

.btn-filter {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-filter:hover {
  background-color: #e5e7eb;
}

.btn-outline {
  background-color: transparent;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-outline:hover {
  background-color: #f3f4f6;
}

.ml-1 {
  margin-left: 0.25rem;
}

.filtros-avanzados {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  animation: fadeIn 0.3s ease;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
}

.filtro-grupo label {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.875rem;
}

.filtro-fecha {
  display: flex;
  gap: 0.5rem;
}

.fecha-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fecha-label {
  font-size: 0.75rem;
  color: #6b7280;
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

.filtro-opciones {
  display: flex;
  gap: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #4b5563;
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
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: none;
  }

  .filter-container {
    justify-content: space-between;
  }

  .filtros-avanzados {
    flex-direction: column;
  }

  .filtro-fecha {
    flex-direction: column;
  }
}
</style>