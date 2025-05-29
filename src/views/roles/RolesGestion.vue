<template>
  <DefaultLayout>
    <div class="roles-gestion">
      <div class="roles-header">
        <h1 class="roles-title">Gestión de Roles</h1>
        <button @click="handleCreateRole" class="btn-create">
          <UserPlus size="18" class="btn-icon" />
          Nuevo Rol
        </button>
      </div>

      <RolesFilters
          v-model:search="filters.search"
          @reset="resetFilters"
      />

      <RolesStates
          :loading="loading"
          :error="error"
          :empty="!loading && !error && roles.length === 0"
          @retry="fetchRoles"
      />

      <RolesList
          v-if="!loading && !error && roles.length > 0"
          :roles="filteredRoles"
          @edit="handleEditRole"
          @delete="handleDeleteRole"
          @manage-permissions="handleManagePermissions"
      />

      <RolesModals
          :show-create-modal="showCreateModal"
          :show-edit-modal="showEditModal"
          :show-permisos-modal="showPermisosModal"
          :show-delete-modal="showDeleteModal"
          :rol-form="rolForm"
          :validation-errors="validationErrors"
          :current-rol="currentRol"
          :rol-to-delete="rolToDelete"
          :selected-permisos="selectedPermisos"
          :saving-rol="savingRol"
          :saving-permisos="savingPermisos"
          :deleting-rol="deletingRol"
          :loading-permisos="loadingPermisos"
          :permisos-agrupados="permisosAgrupados"
          v-model:selected-permisos="selectedPermisos"
          @close="closeAllModals"
          @save-rol="saveRol"
          @save-permisos="savePermisos"
          @delete-rol="deleteRol"
      />
    </div>
  </DefaultLayout>
</template>

<script>
import { UserPlus } from 'lucide-vue-next';
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import RolesFilters from '../../components/roles/RolesFilters.vue';
import RolesList from '../../components/roles/RolesList.vue';
import RolesStates from '../../components/roles/RolesStates.vue';
import RolesModals from '../../components/roles/RolesModals.vue';
import rolesApi from '../../api/roles.api';
import permisosApi from '../../api/permisos.api';
import authApi from '../../api/auth.api';

export default {
  name: 'RolesGestion',
  components: {
    UserPlus,
    DefaultLayout,
    RolesFilters,
    RolesList,
    RolesStates,
    RolesModals
  },
  data() {
    return {
      roles: [],
      permisosAgrupados: {},
      currentUserRole: null,
      adminRoles: [],

      loading: false,
      error: null,
      filters: {
        search: ''
      },

      showCreateModal: false,
      showEditModal: false,
      showPermisosModal: false,
      showDeleteModal: false,

      rolForm: { nombre: '', descripcion: '' },
      validationErrors: {},
      currentRol: null,
      rolToDelete: null,
      selectedPermisos: [],

      savingRol: false,
      savingPermisos: false,
      deletingRol: false,
      loadingPermisos: false
    };
  },
  computed: {
    filteredRoles() {
      if (!this.filters.search) return this.roles;

      const searchTerm = this.filters.search.toLowerCase();
      return this.roles.filter(rol =>
          rol.nombre.toLowerCase().includes(searchTerm) ||
          rol.descripcion.toLowerCase().includes(searchTerm)
      );
    },

    isCurrentUserAdmin() {
      return this.currentUserRole && this.currentUserRole.nombre === 'ADMIN';
    }
  },
  methods: {
    async fetchCurrentUser() {
      try {
        const response = await authApi.getProfile();
        if (response.data && response.data.data && response.data.data.usuario) {
          this.currentUserRole = response.data.data.usuario.Rol;
        }
      } catch (err) {
        console.error('Error al obtener perfil de usuario:', err);
      }
    },

    async fetchRoles() {
      this.loading = true;
      this.error = null;

      try {
        const response = await rolesApi.getAllRoles();
        if (response.data && response.data.data && response.data.data.roles) {
          this.roles = response.data.data.roles.map(rol => ({
            ...rol,
            id: rol.id_rol,
            permisos: rol.Permisos ? rol.Permisos.map(p => p.id_permiso) : []
          }));

          this.adminRoles = this.roles.filter(rol =>
              rol.nombre === 'ADMIN' ||
              (rol.Permisos && rol.Permisos.length >= 10)
          );
        } else {
          throw new Error('Formato de respuesta inesperado');
        }
      } catch (err) {
        console.error('Error al cargar roles:', err);
        this.error = 'Error al cargar los roles. Por favor, inténtelo de nuevo.';
      } finally {
        this.loading = false;
      }
    },

    async fetchPermisos() {
      try {
        const response = await permisosApi.getAllPermisos();
        if (response.data && response.data.data && response.data.data.permisos) {
          const permisos = response.data.data.permisos;
          const agrupados = {};

          permisos.forEach(permiso => {
            const modulo = permiso.nombre;
            if (!agrupados[modulo]) {
              agrupados[modulo] = [];
            }
            agrupados[modulo].push({
              id_permiso: permiso.id_permiso,
              nombre: `${permiso.nombre} ${permiso.tipo}`,
              tipo: permiso.tipo,
              descripcion: permiso.descripcion
            });
          });

          this.permisosAgrupados = agrupados;
        } else {
          this.setDefaultPermisos();
        }
      } catch (err) {
        console.error('Error al cargar permisos:', err);
        this.setDefaultPermisos();
      }
    },

    setDefaultPermisos() {
      this.permisosAgrupados = {
        'Usuarios': [
          { id_permiso: 1, nombre: 'Usuarios Lectura', tipo: 'Lectura' },
          { id_permiso: 2, nombre: 'Usuarios Escritura', tipo: 'Escritura' }
        ],
        'Empleados': [
          { id_permiso: 3, nombre: 'Empleados Lectura', tipo: 'Lectura' },
          { id_permiso: 4, nombre: 'Empleados Escritura', tipo: 'Escritura' }
        ],
        'Contratos': [
          { id_permiso: 5, nombre: 'Contratos Lectura', tipo: 'Lectura' },
          { id_permiso: 6, nombre: 'Contratos Escritura', tipo: 'Escritura' }
        ],
        'Documentos': [
          { id_permiso: 7, nombre: 'Documentos Lectura', tipo: 'Lectura' },
          { id_permiso: 8, nombre: 'Documentos Escritura', tipo: 'Escritura' }
        ],
        'Ausencias': [
          { id_permiso: 9, nombre: 'Ausencias Lectura', tipo: 'Lectura' },
          { id_permiso: 10, nombre: 'Ausencias Escritura', tipo: 'Escritura' }
        ],
        'Notificaciones': [
          { id_permiso: 11, nombre: 'Notificaciones Lectura', tipo: 'Lectura' },
          { id_permiso: 12, nombre: 'Notificaciones Escritura', tipo: 'Escritura' }
        ],
        'Master': [
          { id_permiso: 13, nombre: 'Master Escritura', tipo: 'Escritura' },
        ]
      };
    },

    resetFilters() {
      this.filters.search = '';
    },

    closeAllModals() {
      this.showCreateModal = false;
      this.showEditModal = false;
      this.showPermisosModal = false;
      this.showDeleteModal = false;
      this.rolForm = { nombre: '', descripcion: '' };
      this.validationErrors = {};
      this.currentRol = null;
      this.rolToDelete = null;
    },

    handleCreateRole() {
      this.rolForm = { nombre: '', descripcion: '' };
      this.showCreateModal = true;
    },

    handleEditRole(rol) {
      if (this.isAdminRole(rol) && !this.isCurrentUserAdmin) {
        this.$emit('show-notification', {
          type: 'error',
          message: 'No tienes permisos para editar un rol de administrador'
        });
        return;
      }

      this.rolForm = {
        nombre: rol.nombre,
        descripcion: rol.descripcion
      };
      this.currentRol = rol;
      this.showEditModal = true;
    },

    handleDeleteRole(rol) {
      if (this.isAdminRole(rol)) {
        this.$emit('show-notification', {
          type: 'error',
          message: 'No se puede eliminar un rol de administrador'
        });
        return;
      }

      if (this.isLastAdminRole(rol)) {
        this.$emit('show-notification', {
          type: 'error',
          message: 'No se puede eliminar el último rol de administrador'
        });
        return;
      }

      this.rolToDelete = rol;
      this.showDeleteModal = true;
    },

    isAdminRole(rol) {
      return rol.nombre === 'ADMIN';
    },

    isLastAdminRole(rol) {
      return this.isAdminRole(rol) && this.adminRoles.length <= 1;
    },

    async handleManagePermissions(rol) {
      if (this.isAdminRole(rol) && !this.isCurrentUserAdmin) {
        this.$emit('show-notification', {
          type: 'error',
          message: 'No tienes permisos para modificar los permisos de un rol de administrador'
        });
        return;
      }

      this.currentRol = rol;
      this.loadingPermisos = true;
      this.showPermisosModal = true;

      try {
        const response = await rolesApi.getRoleById(rol.id_rol);
        if (response.data && response.data.data && response.data.data.rol) {
          const rolData = response.data.data.rol;
          this.selectedPermisos = rolData.Permisos ? rolData.Permisos.map(p => p.id_permiso) : [];
        } else {
          this.selectedPermisos = rol.permisos || [];
        }
      } catch (err) {
        console.error('Error al cargar permisos del rol:', err);
        this.selectedPermisos = rol.permisos || [];
      } finally {
        this.loadingPermisos = false;
      }
    },

    async saveRol() {
      this.validationErrors = {};

      if (!this.rolForm.nombre) {
        this.validationErrors.nombre = 'El nombre del rol es obligatorio';
        return;
      }

      this.savingRol = true;

      try {
        if (this.showEditModal) {
          await rolesApi.updateRole(this.currentRol.id_rol, this.rolForm);
        } else {
          await rolesApi.createRole(this.rolForm);
        }

        await this.fetchRoles();
        this.closeAllModals();
      } catch (err) {
        console.error('Error al guardar rol:', err);
        if (err.response && err.response.data && err.response.data.errors) {
          this.validationErrors = err.response.data.errors;
        }
      } finally {
        this.savingRol = false;
      }
    },

    async savePermisos() {
      this.savingPermisos = true;

      try {
        await rolesApi.updateRolePermissions(this.currentRol.id_rol, this.selectedPermisos);

        await this.fetchRoles();
        this.closeAllModals();
      } catch (err) {
        console.error('Error al guardar permisos:', err);
      } finally {
        this.savingPermisos = false;
      }
    },

    async deleteRol() {
      this.deletingRol = true;

      try {
        await rolesApi.deleteRole(this.rolToDelete.id_rol);

        await this.fetchRoles();
        this.closeAllModals();
      } catch (err) {
        console.error('Error al eliminar rol:', err);
      } finally {
        this.deletingRol = false;
      }
    }
  },
  async mounted() {
    await this.fetchCurrentUser();
    await this.fetchPermisos();
    await this.fetchRoles();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.roles-gestion {
  padding: 24px;
  background-color: #ffffff;
  min-height: 100%;
  font-family: 'Poppins', sans-serif;
}

.roles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.roles-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  position: relative;
  padding-bottom: 0.5rem;
}

.roles-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #dc2626, #ef4444);
  border-radius: 3px;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Poppins', sans-serif;
}

.btn-create:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-create:active {
  transform: translateY(0);
  box-shadow: none;
}

.btn-icon {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .roles-gestion {
    padding: 16px;
  }

  .roles-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-create {
    width: 100%;
  }
}
</style>