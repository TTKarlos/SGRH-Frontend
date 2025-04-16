<template>
  <div class="roles-list">
    <div
        v-for="rol in roles"
        :key="rol.id_rol"
        class="role-card"
        :class="{ 'admin-role': isAdminRole(rol) }"
    >
      <div class="role-info">
        <div class="role-header">
          <h3 class="role-name">{{ rol.nombre }}</h3>
          <span v-if="isAdminRole(rol)" class="admin-badge">Admin</span>
        </div>
        <p class="role-description">{{ rol.descripcion }}</p>

        <div class="permissions-preview">
          <h4 class="permissions-title">Permisos ({{ rol.permisos.length }})</h4>
          <div class="permissions-badges">
            <span
                v-for="(permiso, index) in getVisiblePermisos(rol)"
                :key="index"
                class="permission-badge"
            >
              {{ permiso }}
            </span>
            <span
                v-if="rol.permisos.length > 3"
                class="more-badge"
            >
              +{{ rol.permisos.length - 3 }} más
            </span>
          </div>
        </div>
      </div>

      <div class="role-actions">
        <button
            @click="managePermissions(rol)"
            class="btn-permissions"
            title="Gestionar permisos"
            :disabled="isAdminRole(rol) && !isCurrentUserAdmin"
        >
          <Shield size="18" />
          <span class="action-text">Permisos</span>
        </button>
        <button
            @click="editRole(rol)"
            class="btn-edit"
            title="Editar rol"
            :disabled="isAdminRole(rol) && !isCurrentUserAdmin"
        >
          <Edit size="18" />
          <span class="action-text">Editar</span>
        </button>
        <button
            @click="deleteRole(rol)"
            class="btn-delete"
            title="Eliminar rol"
            :disabled="isAdminRole(rol)"
        >
          <Trash2 size="18" />
          <span class="action-text">Eliminar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Shield, Edit, Trash2 } from 'lucide-vue-next';
import authApi from '@/api/auth.api';

export default {
  name: 'RolesList',
  components: {
    Shield,
    Edit,
    Trash2
  },
  props: {
    roles: {
      type: Array,
      required: true
    }
  },
  emits: ['edit', 'delete', 'manage-permissions'],
  data() {
    return {
      permisosMap: {
        1: 'Usuarios Lectura',
        2: 'Usuarios Escritura',
        3: 'Empleados Lectura',
        4: 'Empleados Escritura',
        5: 'Contratos Lectura',
        6: 'Contratos Escritura',
        7: 'Documentos Lectura',
        8: 'Documentos Escritura',
        9: 'Ausencias Lectura',
        10: 'Ausencias Escritura',
        11: 'Notificaciones Lectura',
        12: 'Notificaciones Escritura'
      },
      currentUserRole: null
    };
  },
  computed: {
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

    isAdminRole(rol) {
      return rol.nombre === 'ADMIN';
    },

    getVisiblePermisos(rol) {
      return rol.permisos.slice(0, 3).map(id => this.permisosMap[id] || `Permiso ${id}`);
    },

    editRole(rol) {
      if (this.isAdminRole(rol) && !this.isCurrentUserAdmin) {
        return;
      }
      this.$emit('edit', rol);
    },

    deleteRole(rol) {
      if (this.isAdminRole(rol)) {
        return;
      }
      this.$emit('delete', rol);
    },

    managePermissions(rol) {
      if (this.isAdminRole(rol) && !this.isCurrentUserAdmin) {
        return;
      }
      this.$emit('manage-permissions', rol);
    }
  },
  mounted() {
    this.fetchCurrentUser();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.roles-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  font-family: 'Poppins', sans-serif;
}

.role-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.admin-role {
  border-color: #dc2626;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}

.admin-role:hover {
  border-color: #b91c1c;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.15);
}

.role-info {
  padding: 20px;
  flex: 1;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.role-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.admin-badge {
  background-color: #dc2626;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-description {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.permissions-preview {
  margin-top: 16px;
}

.permissions-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.permissions-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-badge {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.more-badge {
  background-color: #f3f4f6;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-actions {
  display: flex;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.btn-permissions, .btn-edit, .btn-delete {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
}

.btn-permissions {
  border-right: 1px solid #e5e7eb;
  color: #dc2626;
}

.btn-edit {
  border-right: 1px solid #e5e7eb;
  color: #4b5563;
}

.btn-delete {
  color: #dc2626;
}

.btn-permissions:hover:not(:disabled) {
  background-color: #fef2f2;
}

.btn-edit:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.btn-delete:hover:not(:disabled) {
  background-color: #fef2f2;
}

.btn-permissions:disabled, .btn-edit:disabled, .btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-text {
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 640px) {
  .roles-list {
    grid-template-columns: 1fr;
  }

  .action-text {
    display: none;
  }
}
</style>