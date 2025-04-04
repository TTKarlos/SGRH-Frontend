<template>
  <div class="empleados-page">
    <EmpleadosHeader @nuevo-empleado="crearNuevoEmpleado" />

    <div class="card">
      <EmpleadosFiltros
          v-model:search="searchQuery"
          v-model:filters="filters"
          @search="handleSearch"
          @apply-filters="applyFilters"
          @reset-filters="resetFilters"
      />

      <EmpleadosTabla
          :loading="empleadosStore.loading"
          :error="empleadosStore.error"
          :empleados="empleadosStore.empleados"
          :filters="filters"
          @retry="loadEmpleados"
          @reset-filters="resetFilters"
          @view-empleado="goToEmpleadoDetalle"
      />

      <EmpleadosPaginacion
          :pagination="empleadosStore.pagination"
          @change-page="changePage"
      />
    </div>

    <!-- Panel de depuración (opcional) -->
    <div v-if="debug" class="debug-panel">
      <h3>Información de depuración</h3>
      <pre>{{ JSON.stringify(empleadosStore.pagination, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
import { useEmpleadosStore } from '../../stores/empleados';
import { useNotificationStore } from '../../stores/notification';
import EmpleadosHeader from '../../components/empleados/EmpleadosHeader.vue';
import EmpleadosFiltros from '../../components/empleados/EmpleadosFiltros.vue';
import EmpleadosTabla from '../../components/empleados/EmpleadosTabla.vue';
import EmpleadosPaginacion from '../../components/empleados/EmpleadosPaginacion.vue';

export default {
  name: 'Empleados',
  components: {
    EmpleadosHeader,
    EmpleadosFiltros,
    EmpleadosTabla,
    EmpleadosPaginacion
  },
  data() {
    return {
      searchQuery: '',
      searchTimeout: null,
      filters: {
        search: '',
        activo: null,
        id_departamento: '',
        id_centro: ''
      },
      debug: false
    };
  },
  setup() {
    const empleadosStore = useEmpleadosStore();
    const notificationStore = useNotificationStore();

    return {
      empleadosStore,
      notificationStore
    };
  },
  created() {
    this.loadEmpleados();
  },
  methods: {
    loadEmpleados() {
      this.empleadosStore.fetchEmpleados();
    },

    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.filters.search = this.searchQuery;
        this.applyFilters();
      }, 300);
    },

    applyFilters() {
      this.empleadosStore.setFilters({...this.filters});

      let mensaje = 'Filtros aplicados';
      if (this.filters.search) {
        mensaje += `: "${this.filters.search}"`;
      }
      if (this.filters.activo === true) {
        mensaje += ' (Solo activos)';
      } else if (this.filters.activo === false) {
        mensaje += ' (Solo inactivos)';
      }
      this.notificationStore.info(mensaje, 'Filtros');
    },

    resetFilters() {
      this.searchQuery = '';
      this.filters = {
        search: '',
        activo: null,
        id_departamento: '',
        id_centro: ''
      };

      this.empleadosStore.resetFilters();
      this.notificationStore.info('Se han eliminado todos los filtros', 'Filtros');
    },

    changePage(page) {
      console.log('Cambiando a página:', page);
      this.empleadosStore.setPage(page);
    },

    goToEmpleadoDetalle(id) {
      this.$router.push(`/empleados/${id}`);
    },

    crearNuevoEmpleado() {
      this.$router.push('/empleados/nuevo');
    }
  }
}
</script>

<style>
.empleados-page {
  padding: 1.5rem;
}

@media (max-width: 767px) {
  .empleados-page {
    padding: 1rem;
  }
}

.card {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.debug-panel {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.debug-panel h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.debug-panel pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.875rem;
}
</style>

