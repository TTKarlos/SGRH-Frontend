<template>
  <DefaultLayout>
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
    </div>
  </DefaultLayout>
</template>

<script>
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import { useEmpleadosStore } from '../../stores/empleados';
import { useNotificationStore } from '../../stores/notification';
import EmpleadosHeader from '../../components/empleados/EmpleadosHeader.vue';
import EmpleadosFiltros from '../../components/empleados/EmpleadosFiltros.vue';
import EmpleadosTabla from '../../components/empleados/EmpleadosTabla.vue';
import EmpleadosPaginacion from '../../components/empleados/EmpleadosPaginacion.vue';

export default {
  name: 'Empleados',
  components: {
    DefaultLayout,
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
      }
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
      this.empleadosStore.filters = {...this.filters};

      this.empleadosStore.pagination.page = 1;

      this.empleadosStore.fetchEmpleados();

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

      this.empleadosStore.filters = {...this.filters};

      this.empleadosStore.pagination.page = 1;

      this.empleadosStore.fetchEmpleados();

      this.notificationStore.info('Se han eliminado todos los filtros', 'Filtros');
    },

    changePage(page) {
      this.empleadosStore.pagination.page = parseInt(page);
      this.empleadosStore.fetchEmpleados();
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.empleados-page {
  padding: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

.card {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #f1f1f1;
}

@media (max-width: 767px) {
  .empleados-page {
    padding: 1rem;
  }
}
</style>