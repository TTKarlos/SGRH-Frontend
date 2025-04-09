<template>
  <div class="usuarios-page">
    <UsuariosHeader @nuevo-usuario="crearNuevoUsuario" />

    <div class="card">
      <UsuariosFiltros
          v-model:search="searchQuery"
          v-model:filters="filters"
          @search="handleSearch"
          @apply-filters="applyFilters"
          @reset-filters="resetFilters"
      />

      <UsuariosTabla
          :loading="usuariosStore.loading"
          :error="usuariosStore.error"
          :usuarios="usuariosStore.usuarios"
          :filters="filters"
          @retry="loadUsuarios"
          @reset-filters="resetFilters"
          @view-usuario="goToUsuarioDetalle"
      />

      <UsuariosPaginacion
          :pagination="usuariosStore.pagination"
          @change-page="changePage"
      />
    </div>
  </div>
</template>

<script>
import { useUsuariosStore } from '../../stores/usuarios';
import { useNotificationStore } from '../../stores/notification';
import UsuariosHeader from '../../components/usuarios/UsuariosHeader.vue';
import UsuariosFiltros from '../../components/usuarios/UsuariosFiltros.vue';
import UsuariosTabla from '../../components/usuarios/UsuariosTabla.vue';
import UsuariosPaginacion from '../../components/usuarios/UsuariosPaginacion.vue';

export default {
  name: 'Usuarios',
  components: {
    UsuariosHeader,
    UsuariosFiltros,
    UsuariosTabla,
    UsuariosPaginacion
  },
  data() {
    return {
      searchQuery: '',
      searchTimeout: null,
      filters: {
        search: '',
        activo: null,
        id_rol: ''
      }
    };
  },
  setup() {
    const usuariosStore = useUsuariosStore();
    const notificationStore = useNotificationStore();

    return {
      usuariosStore,
      notificationStore
    };
  },
  created() {
    this.loadUsuarios();
  },
  methods: {
    loadUsuarios() {
      this.usuariosStore.fetchUsuarios();
    },

    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.filters.search = this.searchQuery;
        this.applyFilters();
      }, 300);
    },

    applyFilters() {
      this.usuariosStore.setFilters({...this.filters});
      this.usuariosStore.setPage(1);

      let mensaje = 'Filtros aplicados';
      if (this.filters.search) {
        mensaje += `: "${this.filters.search}"`;
      }
      if (this.filters.activo === true) {
        mensaje += ' (Solo activos)';
      } else if (this.filters.activo === false) {
        mensaje += ' (Solo inactivos)';
      }
      if (this.filters.id_rol) {
        const rolStore = this.usuariosStore.getRolNombre ? this.usuariosStore.getRolNombre(this.filters.id_rol) : null;
        const rolName = rolStore || `Rol ${this.filters.id_rol}`;
        mensaje += ` (${rolName})`;
      }
      this.notificationStore.info(mensaje, 'Filtros');
    },

    resetFilters() {
      this.searchQuery = '';
      this.filters = {
        search: '',
        activo: null,
        id_rol: ''
      };

      this.usuariosStore.resetFilters();
      this.notificationStore.info('Se han eliminado todos los filtros', 'Filtros');
    },

    changePage(page) {
      this.usuariosStore.setPage(page);
      this.loadUsuarios();
    },

    goToUsuarioDetalle(id) {
      this.$router.push(`/usuarios/${id}`);
    },

    crearNuevoUsuario() {
      this.$router.push('/usuarios/nuevo');
    }
  }
}
</script>

<style scoped>
.usuarios-page {
  padding: 1.5rem;
}

.card {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

@media (max-width: 767px) {
  .usuarios-page {
    padding: 1rem;
  }
}
</style>