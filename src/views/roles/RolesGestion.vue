<template>
  <div class="roles-gestion-page">
    <div class="page-header">
      <h1>Gestión de Roles y Permisos</h1>
      <div class="header-actions" v-if="canManageRoles">
        <button @click="showCreateModal = true" class="btn btn-primary">
          <PlusCircle size="18" class="btn-icon" />
          Nuevo Rol
        </button>
      </div>
    </div>

    <div class="filters-container">
      <div class="search-container">
        <input
            v-model="search"
            type="text"
            placeholder="Buscar roles..."
            class="search-input"
            @input="handleSearchChange"
        />
        <Search size="18" class="search-icon" />
      </div>
      <div class="order-container">
        <label>Ordenar:</label>
        <select v-model="order" @change="handleOrderChange" class="order-select">
          <option value="ASC">Ascendente</option>
          <option value="DESC">Descendente</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Cargando roles..." />
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <AlertTriangle size="24" />
        <p>{{ error }}</p>
      </div>
      <button @click="loadRoles" class="btn btn-primary">
        Reintentar
      </button>
    </div>

    <div v-else-if="roles.length === 0" class="empty-container">
      <div class="empty-message">
        <FolderX size="48" />
        <p>No se encontraron roles</p>
      </div>
    </div>

    <div v-else class="roles-grid">
      <div v-for="rol in roles" :key="rol.id_rol" class="rol-card">
        <div class="rol-card-header">
          <h2>{{ rol.nombre }}</h2>
          <div class="rol-actions" v-if="canManageRoles">
            <button @click="editRol(rol)" class="btn-icon-only" title="Editar rol">
              <Edit size="18" />
            </button>
            <button
                @click="confirmDeleteRol(rol)"
                class="btn-icon-only"
                title="Eliminar rol"
                :disabled="rol.nombre === 'ADMIN'"
            >
              <Trash2 size="18" />
            </button>
          </div>
        </div>
        <div class="rol-card-body">
          <p class="rol-description">{{ rol.descripcion || 'Sin descripción' }}</p>
          <div class="rol-permisos">
            <h3>Permisos</h3>
            <div v-if="rol.Permisos && rol.Permisos.length > 0" class="permisos-list">
              <div v-for="permiso in rol.Permisos" :key="permiso.id_permiso" class="permiso-badge">
                <span>{{ permiso.nombre }}</span>
                <span class="permiso-tipo" :class="permiso.tipo === 'Lectura' ? 'tipo-lectura' : 'tipo-escritura'">
                  {{ permiso.tipo }}
                </span>
              </div>
            </div>
            <p v-else class="no-permisos">Este rol no tiene permisos asignados</p>
          </div>
          <button
              v-if="canManageRoles && rol.nombre !== 'ADMIN'"
              @click="editPermisos(rol)"
              class="btn btn-secondary btn-sm"
          >
            <Shield size="16" class="btn-icon" />
            Gestionar Permisos
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar rol -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ showEditModal ? 'Editar Rol' : 'Nuevo Rol' }}</h3>
          <button @click="closeModals" class="btn-close">
            <X size="18" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="nombre">Nombre del Rol</label>
            <input
                id="nombre"
                v-model="rolForm.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': validationErrors.nombre }"
                placeholder="Nombre del rol"
            />
            <div v-if="validationErrors.nombre" class="invalid-feedback">
              {{ validationErrors.nombre }}
            </div>
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea
                id="descripcion"
                v-model="rolForm.descripcion"
                class="form-control"
                placeholder="Descripción del rol"
                rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="saveRol" class="btn btn-primary" :disabled="savingRol">
            <Loader v-if="savingRol" size="16" class="btn-icon spinner" />
            <Save v-else size="16" class="btn-icon" />
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para gestionar permisos -->
    <div v-if="showPermisosModal" class="modal-overlay">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3>Gestionar Permisos: {{ currentRol?.nombre }}</h3>
          <button @click="closeModals" class="btn-close">
            <X size="18" />
          </button>
        </div>
        <div class="modal-body">
          <div v-if="loadingPermisos" class="loading-container">
            <LoadingSpinner message="Cargando permisos..." />
          </div>
          <div v-else>
            <div class="permisos-grupos">
              <div v-for="(permisos, nombre) in permisosAgrupados" :key="nombre" class="permiso-grupo">
                <h4>{{ nombre }}</h4>
                <div class="permisos-opciones">
                  <div v-for="permiso in permisos" :key="permiso.id_permiso" class="permiso-opcion">
                    <label class="checkbox-container">
                      <input
                          type="checkbox"
                          :value="permiso.id_permiso"
                          v-model="selectedPermisos"
                      />
                      <span class="checkmark"></span>
                      <span class="permiso-tipo" :class="permiso.tipo === 'Lectura' ? 'tipo-lectura' : 'tipo-escritura'">
                        {{ permiso.tipo }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="savePermisos" class="btn btn-primary" :disabled="savingPermisos">
            <Loader v-if="savingPermisos" size="16" class="btn-icon spinner" />
            <Save v-else size="16" class="btn-icon" />
            Guardar Permisos
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button @click="showDeleteModal = false" class="btn-close">
            <X size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p>¿Está seguro de que desea eliminar el rol <strong>{{ rolToDelete?.nombre }}</strong>?</p>
          <p class="text-danger">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="deleteRol" class="btn btn-danger" :disabled="deletingRol">
            <Loader v-if="deletingRol" size="16" class="btn-icon spinner" />
            <Trash2 v-else size="16" class="btn-icon" />
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Componente de notificación -->
    <Notification />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRolesStore } from '../../stores/roles';
import { usePermisosStore } from '../../stores/permisos';
import { useAuthStore } from '../../stores/auth';
import { useNotificationStore } from '../../stores/notification';
import LoadingSpinner from '../../components/common/LoadingSpinner.vue';
import Notification from '../../components/common/Notification.vue';
import {
  PlusCircle, Edit, Trash2, Search, AlertTriangle, FolderX,
  Shield, Save, X, Loader
} from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import debounce from 'lodash/debounce';

export default {
  name: 'RolesGestion',
  components: {
    LoadingSpinner,
    Notification,
    PlusCircle, Edit, Trash2, Search, AlertTriangle, FolderX,
    Shield, Save, X, Loader
  },
  setup() {
    const rolesStore = useRolesStore();
    const permisosStore = usePermisosStore();
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    const { roles, loading, error } = storeToRefs(rolesStore);
    const { permisos, loading: loadingPermisos } = storeToRefs(permisosStore);

    const search = ref('');
    const order = ref('ASC');
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const showPermisosModal = ref(false);
    const showDeleteModal = ref(false);
    const rolForm = ref({ nombre: '', descripcion: '' });
    const validationErrors = ref({});
    const currentRol = ref(null);
    const rolToDelete = ref(null);
    const selectedPermisos = ref([]);
    const savingRol = ref(false);
    const savingPermisos = ref(false);
    const deletingRol = ref(false);

    const canManageRoles = computed(() => {
      return authStore.isAdmin || authStore.hasPermission({ nombre: 'Usuarios', tipo: 'Escritura' });
    });

    const permisosAgrupados = computed(() => {
      return permisosStore.getPermisosAgrupados;
    });

    const loadRoles = async () => {
      await rolesStore.fetchRoles({
        search: search.value,
        order: order.value
      });
    };

    const loadPermisos = async () => {
      await permisosStore.fetchPermisos();
    };

    const handleSearchChange = debounce(() => {
      rolesStore.setFilters({ search: search.value });
      loadRoles();
    }, 300);

    const handleOrderChange = () => {
      rolesStore.setFilters({ order: order.value });
      loadRoles();
    };

    const editRol = (rol) => {
      currentRol.value = rol;
      rolForm.value = {
        nombre: rol.nombre,
        descripcion: rol.descripcion || ''
      };
      showEditModal.value = true;
    };

    const editPermisos = async (rol) => {
      currentRol.value = rol;

      if (permisos.value.length === 0) {
        await loadPermisos();
      }

      selectedPermisos.value = rol.Permisos ? rol.Permisos.map(p => p.id_permiso) : [];

      showPermisosModal.value = true;
    };

    const confirmDeleteRol = (rol) => {
      rolToDelete.value = rol;
      showDeleteModal.value = true;
    };

    const saveRol = async () => {
      validationErrors.value = {};

      if (!rolForm.value.nombre) {
        validationErrors.value.nombre = 'El nombre del rol es requerido';
        return;
      }

      savingRol.value = true;

      try {
        let result;

        if (showEditModal.value) {
          result = await rolesStore.updateRol(currentRol.value.id_rol, rolForm.value);

          if (result) {
            notificationStore.success(
                `Rol ${result.nombre} actualizado exitosamente`,
                'Rol actualizado'
            );
            closeModals();
          }
        } else {
          result = await rolesStore.createRol(rolForm.value);

          if (result) {
            notificationStore.success(
                `Rol ${result.nombre} creado exitosamente`,
                'Rol creado'
            );
            closeModals();
          }
        }
      } catch (error) {
        notificationStore.error(
            error.message || 'Ha ocurrido un error al guardar el rol',
            'Error'
        );
      } finally {
        savingRol.value = false;
      }
    };

    const savePermisos = async () => {
      if (!currentRol.value) return;

      savingPermisos.value = true;

      try {
        const result = await rolesStore.updatePermisos(
            currentRol.value.id_rol,
            selectedPermisos.value
        );

        if (result) {
          notificationStore.success(
              `Permisos del rol ${result.nombre} actualizados exitosamente`,
              'Permisos actualizados'
          );
          closeModals();
        }
      } catch (error) {
        notificationStore.error(
            error.message || 'Ha ocurrido un error al guardar los permisos',
            'Error'
        );
      } finally {
        savingPermisos.value = false;
      }
    };

    const deleteRol = async () => {
      if (!rolToDelete.value) return;

      deletingRol.value = true;

      try {
        const success = await rolesStore.deleteRol(rolToDelete.value.id_rol);

        if (success) {
          notificationStore.success(
              `Rol ${rolToDelete.value.nombre} eliminado exitosamente`,
              'Rol eliminado'
          );
          showDeleteModal.value = false;
        }
      } catch (error) {
        notificationStore.error(
            error.message || 'Ha ocurrido un error al eliminar el rol',
            'Error'
        );
      } finally {
        deletingRol.value = false;
      }
    };

    const closeModals = () => {
      showCreateModal.value = false;
      showEditModal.value = false;
      showPermisosModal.value = false;
      currentRol.value = null;
      rolForm.value = { nombre: '', descripcion: '' };
      validationErrors.value = {};
      selectedPermisos.value = [];
    };

    onMounted(async () => {
      await loadRoles();
    });

    watch([search, order], ([newSearch, newOrder], [oldSearch, oldOrder]) => {
      if (newOrder !== oldOrder) {
        handleOrderChange();
      }
    });

    return {
      roles,
      loading,
      error,
      permisos,
      loadingPermisos,
      permisosAgrupados,
      search,
      order,
      showCreateModal,
      showEditModal,
      showPermisosModal,
      showDeleteModal,
      rolForm,
      validationErrors,
      currentRol,
      rolToDelete,
      selectedPermisos,
      savingRol,
      savingPermisos,
      deletingRol,
      canManageRoles,
      loadRoles,
      handleSearchChange,
      handleOrderChange,
      editRol,
      editPermisos,
      confirmDeleteRol,
      saveRol,
      savePermisos,
      deleteRol,
      closeModals
    };
  }
}
</script>

<style scoped>
.roles-gestion-page {
  padding: 1.5rem;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.95rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.order-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.order-select {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.95rem;
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
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.error-message,
.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ef4444;
  margin-bottom: 1.5rem;
}

.empty-message {
  color: #6b7280;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.rol-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.rol-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.rol-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.rol-card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.rol-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  background-color: transparent;
  color: #6b7280;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-icon-only:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-icon-only:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rol-card-body {
  padding: 1.25rem;
}

.rol-description {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #6b7280;
}

.rol-permisos h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #374151;
}

.permisos-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.permiso-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.permiso-tipo {
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 500;
}

.tipo-lectura {
  background-color: #dbeafe;
  color: #1e40af;
}

.tipo-escritura {
  background-color: #fef3c7;
  color: #92400e;
}

.no-permisos {
  color: #9ca3af;
  font-style: italic;
  margin-bottom: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  margin-right: 0.5rem;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3a56d4;
}

.btn-secondary {
  background-color: #9ca3af;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #6b7280;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.modal-lg {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.btn-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  background-color: white;
}

.form-control:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.form-control.is-invalid {
  border-color: #ef4444;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.text-danger {
  color: #ef4444;
  font-weight: 500;
}

.spinner {
  animation: spin 1s linear infinite;
}

.permisos-grupos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.permiso-grupo {
  background-color: #f9fafb;
  border-radius: 0.375rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.permiso-grupo h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.permisos-opciones {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.permiso-opcion {
  display: flex;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 28px;
  cursor: pointer;
  font-size: 0.875rem;
  user-select: none;
  width: 100%;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: #eee;
  border-radius: 3px;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #ccc;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #4361ee;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .roles-gestion-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filters-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-container {
    max-width: 100%;
    width: 100%;
  }

  .roles-grid {
    grid-template-columns: 1fr;
  }

  .permisos-grupos {
    grid-template-columns: 1fr;
  }
}
</style>