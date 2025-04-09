<template>
  <div class="usuario-detalle-page">
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn btn-icon btn-ghost">
          <ArrowLeft size="18" />
          <span>Volver</span>
        </button>
        <h1 v-if="usuario">{{ usuario.nombre }} {{ usuario.apellidos }}</h1>
      </div>

      <div class="header-actions" v-if="usuario && canEdit">
        <button
            @click="toggleUsuarioStatus"
            class="btn btn-status"
            :class="usuario.activo ? 'btn-status-active' : 'btn-status-inactive'"
            :disabled="loading || isLastAdmin"
            :title="isLastAdmin ? 'No se puede desactivar el último administrador del sistema' : ''"
        >
          <ToggleRight v-if="usuario.activo" size="18" class="btn-icon" />
          <ToggleLeft v-else size="18" class="btn-icon" />
          {{ usuario.activo ? 'Activo' : 'Inactivo' }}
        </button>

        <button v-if="!editMode" @click="editMode = true" class="btn btn-primary">
          <Edit size="18" class="btn-icon" />
          Editar
        </button>

        <button v-if="editMode" @click="saveUsuario" class="btn btn-success">
          <Save size="18" class="btn-icon" />
          Guardar
        </button>

        <button v-if="editMode" @click="cancelEdit" class="btn btn-secondary">
          <X size="18" class="btn-icon" />
          Cancelar
        </button>
      </div>
    </div>

    <div v-if="loading && !usuario" class="loading-container">
      <LoadingSpinner message="Cargando usuario..." />
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <AlertTriangle size="24" />
        <p>{{ error }}</p>
      </div>
      <button @click="loadUsuario" class="btn btn-primary">Reintentar</button>
    </div>

    <div v-else-if="!usuario" class="error-container">
      <div class="error-message">
        <AlertTriangle size="24" />
        <p>No se encontró el usuario solicitado.</p>
      </div>
      <button @click="goBack" class="btn btn-primary">Volver a la lista</button>
    </div>

    <div v-else class="usuario-content">
      <div class="tabs">
        <button
            class="tab-button"
            :class="{ active: activeTab === 'personal' }"
            @click="activeTab = 'personal'"
        >
          <User size="18" class="tab-icon" />
          Datos Personales
        </button>
        <button
            class="tab-button"
            :class="{ active: activeTab === 'cuenta' }"
            @click="activeTab = 'cuenta'"
        >
          <Shield size="18" class="tab-icon" />
          Información de Cuenta
        </button>
        <button
            class="tab-button"
            :class="{ active: activeTab === 'seguridad' }"
            @click="activeTab = 'seguridad'"
        >
          <Lock size="18" class="tab-icon" />
          Seguridad
        </button>
      </div>

      <div class="tab-content">
        <!-- Datos Personales -->
        <div v-if="activeTab === 'personal'" class="tab-panel">
          <div class="card">
            <div class="card-header">
              <h2>Datos Personales</h2>
            </div>
            <div class="card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre</label>
                  <input
                      v-if="editMode"
                      v-model="usuario.nombre"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.nombre }"
                  />
                  <div v-if="editMode && validationErrors.nombre" class="invalid-feedback">
                    {{ validationErrors.nombre }}
                  </div>
                  <div v-else class="form-value">{{ usuario.nombre }}</div>
                </div>

                <div class="form-group">
                  <label>Apellidos</label>
                  <input
                      v-if="editMode"
                      v-model="usuario.apellidos"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.apellidos }"
                  />
                  <div v-if="editMode && validationErrors.apellidos" class="invalid-feedback">
                    {{ validationErrors.apellidos }}
                  </div>
                  <div v-else class="form-value">{{ usuario.apellidos }}</div>
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <input
                      v-if="editMode"
                      v-model="usuario.email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.email }"
                  />
                  <div v-if="editMode && validationErrors.email" class="invalid-feedback">
                    {{ validationErrors.email }}
                  </div>
                  <div v-else class="form-value">{{ usuario.email }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información de Cuenta -->
        <div v-if="activeTab === 'cuenta'" class="tab-panel">
          <div class="card">
            <div class="card-header">
              <h2>Información de Cuenta</h2>
            </div>
            <div class="card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre de usuario</label>
                  <input
                      v-if="editMode"
                      v-model="usuario.nombre_usuario"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.nombre_usuario }"
                  />
                  <div v-if="editMode && validationErrors.nombre_usuario" class="invalid-feedback">
                    {{ validationErrors.nombre_usuario }}
                  </div>
                  <div v-else class="form-value">{{ usuario.nombre_usuario }}</div>
                </div>

                <div class="form-group">
                  <label>Rol</label>
                  <select
                      v-if="editMode"
                      v-model="usuario.id_rol"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.id_rol }"
                  >
                    <option v-for="rol in roles" :key="rol.id_rol" :value="rol.id_rol">
                      {{ rol.nombre }}
                    </option>
                  </select>
                  <div v-if="editMode && validationErrors.id_rol" class="invalid-feedback">
                    {{ validationErrors.id_rol }}
                  </div>
                  <div v-else class="form-value">
                    <span class="badge" :class="getRolBadgeClass(usuario.id_rol)">
                      {{ getRolLabel(usuario.id_rol) }}
                    </span>
                  </div>
                </div>

                <div class="form-group">
                  <label>Estado</label>
                  <div v-if="editMode" class="toggle-container">
                    <label class="toggle">
                      <input
                          v-model="usuario.activo"
                          type="checkbox"
                          :disabled="isLastAdmin"
                      />
                      <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">{{ usuario.activo ? 'Activo' : 'Inactivo' }}</span>
                    <div v-if="isLastAdmin" class="warning-text">
                      No se puede desactivar el último administrador del sistema
                    </div>
                  </div>
                  <div v-else class="form-value">
                    <span class="badge" :class="usuario.activo ? 'badge-success' : 'badge-danger'">
                      {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>

                <div class="form-group">
                  <label>Último acceso</label>
                  <div class="form-value">{{ formatDate(usuario.ultimo_acceso) || 'Nunca' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seguridad -->
        <div v-if="activeTab === 'seguridad'" class="tab-panel">
          <div class="card">
            <div class="card-header">
              <h2>Seguridad</h2>
            </div>
            <div class="card-body">
              <div class="security-section">
                <h3>Cambiar contraseña</h3>
                <p class="section-description">
                  Establece una nueva contraseña para este usuario. La contraseña debe tener al menos 8 caracteres y no puede ser igual a la actual.
                </p>

                <div class="form-group">
                  <label for="newPassword">Nueva contraseña</label>
                  <div class="password-input-group">
                    <input
                        id="newPassword"
                        v-model="passwordData.newPassword"
                        :type="showPassword ? 'text' : 'password'"
                        class="form-control"
                        :class="{ 'is-invalid': passwordErrors.newPassword }"
                        placeholder="Nueva contraseña"
                    />
                    <button
                        type="button"
                        class="password-toggle"
                        @click="showPassword = !showPassword"
                    >
                      <Eye v-if="!showPassword" size="16" />
                      <EyeOff v-else size="16" />
                    </button>
                  </div>
                  <div v-if="passwordErrors.newPassword" class="invalid-feedback">
                    {{ passwordErrors.newPassword }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="confirmPassword">Confirmar contraseña</label>
                  <div class="password-input-group">
                    <input
                        id="confirmPassword"
                        v-model="passwordData.confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        class="form-control"
                        :class="{ 'is-invalid': passwordErrors.confirmPassword }"
                        placeholder="Confirmar contraseña"
                    />
                    <button
                        type="button"
                        class="password-toggle"
                        @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <Eye v-if="!showConfirmPassword" size="16" />
                      <EyeOff v-else size="16" />
                    </button>
                  </div>
                  <div v-if="passwordErrors.confirmPassword" class="invalid-feedback">
                    {{ passwordErrors.confirmPassword }}
                  </div>
                </div>

                <div class="form-actions">
                  <button
                      @click="changePassword"
                      class="btn btn-primary"
                      :disabled="passwordLoading"
                  >
                    <Loader v-if="passwordLoading" size="16" class="btn-icon spinner" />
                    <Key v-else size="16" class="btn-icon" />
                    Cambiar contraseña
                  </button>
                </div>
              </div>
            </div>
          </div>
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
          <p>¿Está seguro de que desea eliminar a <strong>{{ usuario.nombre }} {{ usuario.apellidos }}</strong>?</p>
          <p class="text-danger">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="deleteUsuario" class="btn btn-danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <Notification />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUsuariosStore } from '../../stores/usuarios';
import { useRolesStore } from '../../stores/roles';
import { useAuthStore } from '../../stores/auth';
import { useNotificationStore } from '../../stores/notification';
import { validateUpdateUser } from '../../validation/usuarioSchema';
import LoadingSpinner from '../../components/common/LoadingSpinner.vue';
import Notification from '../../components/common/Notification.vue';
import {
  User, Shield, Lock, Edit, Save, Trash2, ArrowLeft, X, AlertTriangle,
  Key, Eye, EyeOff, Loader, ToggleLeft, ToggleRight
} from 'lucide-vue-next';
import { storeToRefs } from 'pinia';

export default {
  name: 'UsuarioDetalle',
  components: {
    LoadingSpinner, Notification,
    User, Shield, Lock, Edit, Save, Trash2, ArrowLeft, X, AlertTriangle,
    Key, Eye, EyeOff, Loader, ToggleLeft, ToggleRight
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const usuariosStore = useUsuariosStore();
    const rolesStore = useRolesStore();
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    const { roles } = storeToRefs(rolesStore);
    const usuario = ref(null);
    const originalUsuario = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const activeTab = ref('personal');
    const editMode = ref(false);
    const validationErrors = ref({});
    const showDeleteModal = ref(false);

    const passwordData = ref({ newPassword: '', confirmPassword: '' });
    const passwordErrors = ref({});
    const passwordLoading = ref(false);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    const canEdit = computed(() =>
        authStore.hasPermission({ nombre: 'Usuarios', tipo: 'Escritura' })
    );

    const isLastAdmin = computed(() => {
      if (!usuario.value) return false;
      return usuario.value.id_rol === 1 &&
          usuario.value.activo &&
          usuario.value.es_ultimo_admin === true;
    });

    const loadUsuario = async () => {
      loading.value = true;
      error.value = null;
      try {
        const id = route.params.id;
        const data = await usuariosStore.fetchUsuarioById(id);
        usuario.value = data;
        if (data) {
          originalUsuario.value = JSON.parse(JSON.stringify(data));
        } else {
          error.value = 'No se pudo cargar la información del usuario';
        }
      } catch (err) {
        error.value = err.message || 'Error al cargar el usuario';
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      if (roles.value.length === 0) {
        await rolesStore.fetchRoles();
      }
      loadUsuario();
    });

    return {
      usuario, originalUsuario, loading, error, activeTab, editMode,
      validationErrors, showDeleteModal, passwordData, passwordErrors,
      passwordLoading, showPassword, showConfirmPassword, canEdit,
      isLastAdmin, usuariosStore, rolesStore, authStore, notificationStore,
      loadUsuario, roles
    };
  },
  methods: {
    goBack() {
      this.$router.push('/usuarios');
    },

    getRolLabel(id_rol) {
      const rolNombre = this.rolesStore.getRolNombre(id_rol);
      if (rolNombre !== `Rol ${id_rol}`) return rolNombre;

      const roles = {
        1: 'Administrador', 2: 'Gerente', 3: 'RRHH', 4: 'Usuario'
      };
      return roles[id_rol] || `Rol ${id_rol}`;
    },

    getRolBadgeClass(id_rol) {
      const classes = {
        1: 'badge-primary', 2: 'badge-warning',
        3: 'badge-info', 4: 'badge-secondary'
      };
      return classes[id_rol] || 'badge-secondary';
    },

    formatDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    },

    cancelEdit() {
      if (this.originalUsuario) {
        this.usuario = JSON.parse(JSON.stringify(this.originalUsuario));
      }
      this.editMode = false;
      this.validationErrors = {};
    },

    async saveUsuario() {
      try {
        const { isValid, errors } = await validateUpdateUser(this.usuario);
        if (!isValid) {
          this.validationErrors = errors;
          this.notificationStore.error(Object.values(errors)[0], 'Error de validación');
          return;
        }

        this.validationErrors = {};
        this.loading = true;
        const updatedUsuario = await this.usuariosStore.updateUsuario(this.usuario.id_usuario, this.usuario);
        if (updatedUsuario) {
          this.originalUsuario = JSON.parse(JSON.stringify(updatedUsuario));
          this.editMode = false;
          this.notificationStore.success(
              `Usuario ${this.usuario.nombre} ${this.usuario.apellidos} editado exitosamente`,
              'Usuario actualizado'
          );
        }
      } catch (error) {
        this.notificationStore.error(
            error.response?.data?.message || error.message || 'Ha ocurrido un error al guardar los cambios',
            'Error'
        );
      } finally {
        this.loading = false;
      }
    },

    async toggleUsuarioStatus() {
      try {
        const newStatus = !this.usuario.activo;
        this.loading = true;
        const success = await this.usuariosStore.changeUsuarioStatus(this.usuario.id_usuario, newStatus);

        if (success) {
          this.usuario.activo = newStatus;
          this.originalUsuario = JSON.parse(JSON.stringify(this.usuario));
          this.notificationStore.success(
              `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`,
              `Usuario ${newStatus ? 'activado' : 'desactivado'}`
          );
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || '';

        if (errorMessage.includes('último administrador') ||
            errorMessage.includes('ultimo administrador') ||
            errorMessage.includes('administrador activo')) {
          this.notificationStore.error(
              'No se puede desactivar el último administrador del sistema',
              'Error'
          );
        } else {
          this.notificationStore.error('No se pudo desactivar el usuario', 'Error');
        }
      } finally {
        this.loading = false;
      }
    },

    async changePassword() {
      this.passwordErrors = {};

      try {
        this.passwordLoading = true;
        const success = await this.usuariosStore.resetPassword(
            this.usuario.id_usuario,
            this.passwordData.newPassword
        );

        if (success) {
          this.notificationStore.success(
              `Contraseña cambiada exitosamente`,
              'Contraseña actualizada'
          );
          this.passwordData.newPassword = '';
          this.passwordData.confirmPassword = '';
        } else {
          this.notificationStore.error('No se pudo cambiar la contraseña', 'Error');
        }
      } catch (error) {
        const statusCode = error.response?.status;

        if (statusCode === 400) {
          this.passwordErrors.newPassword = 'La nueva contraseña no puede ser igual a la actual';
          this.notificationStore.error(
              'La nueva contraseña no puede ser igual a la actual',
              'Error'
          );
        } else {
          this.notificationStore.error(
              'Error del servidor. Por favor, inténtelo de nuevo más tarde',
              'Error del servidor'
          );
        }
      } finally {
        this.passwordLoading = false;
      }
    },

    async deleteUsuario() {
      try {
        this.loading = true;
        const success = await this.usuariosStore.deleteUsuario(this.usuario.id_usuario);
        if (success) {
          this.showDeleteModal = false;
          this.notificationStore.success('Usuario eliminado correctamente', 'Usuario eliminado');
          this.$router.push('/usuarios');
        } else {
          this.notificationStore.error('No se pudo eliminar el usuario', 'Error');
        }
      } catch (error) {
        if (error.response?.data?.message?.includes('último administrador')) {
          this.notificationStore.error(
              'No se puede eliminar el último administrador del sistema',
              'Error'
          );
        } else {
          this.notificationStore.error(
              'Error del servidor. Por favor, inténtelo de nuevo más tarde',
              'Error del servidor'
          );
        }
      } finally {
        this.loading = false;
        this.showDeleteModal = false;
      }
    }
  }
}
</script>

<style scoped>
.usuario-detalle-page {
  padding: 1.5rem;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  margin-right: 0.5rem;
}

.btn-ghost {
  background-color: transparent;
  color: #4b5563;
}

.btn-ghost:hover:not(:disabled) {
  background-color: #f3f4f6;
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

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #059669;
}

.btn-status {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-status:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-status-active {
  background-color: #dcfce7;
  color: #166534;
}

.btn-status-active:hover:not(:disabled) {
  background-color: #bbf7d0;
}

.btn-status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn-status-inactive:hover:not(:disabled) {
  background-color: #fecaca;
}

.loading-container,
.error-container {
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

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ef4444;
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.tab-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button:hover {
  color: #4b5563;
  background-color: #f9fafb;
}

.tab-button.active {
  color: #4361ee;
  border-bottom-color: #4361ee;
}

.tab-icon {
  margin-right: 0.5rem;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.card-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
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

.form-value {
  padding: 0.625rem 0;
  color: #111827;
}

.security-section {
  margin-bottom: 2rem;
}

.security-section h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.section-description {
  margin-bottom: 1.5rem;
  color: #6b7280;
}

.password-input-group {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
}

.form-actions {
  margin-top: 1.5rem;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: .4s;
  border-radius: 1.5rem;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 1.25rem;
  width: 1.25rem;
  left: 0.125rem;
  bottom: 0.125rem;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #4361ee;
}

input:checked + .toggle-slider:before {
  transform: translateX(1.5rem);
}

.toggle-label {
  font-size: 0.875rem;
  color: #374151;
}

.warning-text {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
  width: 100%;
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
  background-color: #eff6ff;
  color: #2563eb;
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

.text-danger {
  color: #ef4444;
  font-weight: 500;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 767px) {
  .usuario-detalle-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  .tab-button {
    padding: 0.625rem 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>