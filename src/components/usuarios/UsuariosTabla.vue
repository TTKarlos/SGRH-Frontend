<template>
  <div class="card-body">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Cargando usuarios..." />
    </div>

    <div v-else-if="error" class="error-container">
      <AlertCircle size="48" class="error-icon" />
      <h3>Error al cargar usuarios</h3>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="$emit('retry')" class="btn btn-primary">
          <RefreshCw size="16" class="btn-icon" />
          Reintentar
        </button>
        <button @click="$emit('reset-filters')" class="btn btn-outline-secondary">
          <FilterX size="16" class="btn-icon" />
          Limpiar filtros
        </button>
      </div>
    </div>

    <div v-else-if="usuarios.length === 0" class="empty-container">
      <UserX size="48" class="empty-icon" />
      <h3>No se encontraron usuarios</h3>
      <p>Intenta cambiar los filtros de búsqueda</p>
      <button @click="$emit('reset-filters')" class="btn btn-outline-secondary">
        <FilterX size="16" class="btn-icon" />
        Limpiar filtros
      </button>
    </div>

    <div v-else class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th>Usuario</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Último acceso</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="usuario in usuarios"
            :key="usuario.id_usuario"
            @click="$emit('view-usuario', usuario.id_usuario)"
            class="usuario-row"
        >
          <td>
            <div class="user-cell">
              <div class="user-avatar">
                {{ getInitials(usuario.nombre) }}
              </div>
              <span class="user-username">{{ usuario.nombre_usuario }}</span>
            </div>
          </td>
          <td>{{ usuario.nombre }} {{ usuario.apellidos }}</td>
          <td>{{ usuario.email }}</td>
          <td>
              <span class="badge" :class="getRolBadgeClass(usuario.id_rol)">
                {{ getRolLabel(usuario.id_rol) }}
              </span>
          </td>
          <td>
              <span class="badge" :class="usuario.activo ? 'badge-success' : 'badge-danger'">
                {{ usuario.activo ? 'Activo' : 'Inactivo' }}
              </span>
          </td>
          <td>{{ formatDate(usuario.ultimo_acceso) }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {
  AlertCircle,
  RefreshCw,
  FilterX,
  UserX
} from 'lucide-vue-next';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { useRolesStore } from '../../stores/roles';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

export default {
  name: 'UsuariosTabla',
  components: {
    LoadingSpinner,
    AlertCircle,
    RefreshCw,
    FilterX,
    UserX
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    usuarios: {
      type: Array,
      default: () => []
    },
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['retry', 'reset-filters', 'view-usuario'],
  setup() {
    const rolesStore = useRolesStore();
    const { roles } = storeToRefs(rolesStore);

    onMounted(async () => {
      if (roles.value.length === 0) {
        await rolesStore.fetchRoles();
      }
    });

    return {
      roles,
      rolesStore
    };
  },
  methods: {
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },

    getRolLabel(id_rol) {
      const rolNombre = this.rolesStore.getRolNombre(id_rol);
      if (rolNombre !== `Rol ${id_rol}`) {
        return rolNombre;
      }

      const roles = {
        1: 'Administrador',
        2: 'Gerente',
        3: 'RRHH',
        4: 'Usuario'
      };
      return roles[id_rol] || `Rol ${id_rol}`;
    },

    getRolBadgeClass(id_rol) {
      const classes = {
        1: 'badge-primary',   // Administrador
        2: 'badge-warning',   // Gerente
        3: 'badge-info',      // RRHH
        4: 'badge-secondary'  // Usuario
      };
      return classes[id_rol] || 'badge-secondary';
    },

    formatDate(dateString) {
      if (!dateString) return 'Nunca';

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';

      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.card-body {
  padding: 0;
  font-family: 'Poppins', sans-serif;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.error-icon,
.empty-icon {
  color: #dc2626;
  margin-bottom: 1rem;
}

.empty-icon {
  color: #9ca3af;
}

.error-container h3,
.empty-container h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.error-container p,
.empty-container p {
  margin: 0 0 1.5rem;
  color: #6b7280;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #b91c1c;
}

.btn-outline-secondary {
  background-color: transparent;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.btn-outline-secondary:hover {
  background-color: #f3f4f6;
}

.btn-icon {
  flex-shrink: 0;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.table th {
  font-weight: 600;
  color: #374151;
  background-color: #f9fafb;
}

.usuario-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.usuario-row:hover {
  background-color: #fef2f2;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.user-username {
  font-weight: 500;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-success {
  background-color: #ecfdf5;
  color: #059669;
}

.badge-danger {
  background-color: #fef2f2;
  color: #dc2626;
}

.badge-primary {
  background-color: #fef2f2;
  color: #dc2626;
}

.badge-warning {
  background-color: #fffbeb;
  color: #d97706;
}

.badge-info {
  background-color: #f0f9ff;
  color: #0284c7;
}

.badge-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

@media (max-width: 767px) {
  .table th,
  .table td {
    padding: 0.75rem;
  }
}
</style>