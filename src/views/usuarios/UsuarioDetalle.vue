<template>
  <DefaultLayout>
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

          <button @click="showDeleteModal = true" class="btn btn-danger">
            <Trash2 size="18" class="btn-icon" />
            Eliminar
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
                    <label>Rol</label>
                    <select
                        v-if="editMode"
                        v-model="usuario.id_rol"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.id_rol }"
                        :disabled="isLastAdmin || isCurrentUser"
                    >
                      <option v-for="rol in roles" :key="rol.id_rol" :value="rol.id_rol">
                        {{ rol.nombre }}
                      </option>
                    </select>
                    <div v-if="editMode && isCurrentUser" class="info-feedback">
                      No puedes cambiar tu propio rol por razones de seguridad.
                    </div>
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
                    <div class="form-value">
                    <span class="badge" :class="usuario.activo ? 'badge-success' : 'badge-danger'">
                      {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Fecha de Creación</label>
                    <div class="form-value">{{ formatDate(usuario.created_at) }}</div>
                  </div>

                  <div class="form-group">
                    <label>Última Actualización</label>
                    <div class="form-value">{{ formatDate(usuario.updated_at) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Seguridad -->
          <div v-if="activeTab === 'seguridad'" class="tab-panel">
            <div class="card">
              <div class="card-header">
                <h2>Cambiar Contraseña</h2>
              </div>
              <div class="card-body">
                <div class="form-grid">
                  <div class="form-group">
                    <PasswordInput
                        id="newPassword"
                        v-model="passwordData.newPassword"
                        label="Nueva Contraseña"
                        placeholder="Ingrese la nueva contraseña"
                        :error="passwordErrors.newPassword"
                    />
                  </div>

                  <div class="form-group">
                    <PasswordInput
                        id="confirmPassword"
                        v-model="passwordData.confirmPassword"
                        label="Confirmar Contraseña"
                        placeholder="Confirme la nueva contraseña"
                        :error="passwordErrors.confirmPassword"
                    />
                  </div>
                </div>

                <div class="form-actions">
                  <button @click="changePassword" class="btn btn-primary" :disabled="passwordLoading">
                    <Key v-if="!passwordLoading" size="18" class="btn-icon" />
                    <Loader v-else size="18" class="btn-icon animate-spin" />
                    Cambiar Contraseña
                  </button>
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
            <div v-if="isLastAdmin" class="alert alert-warning">
              <AlertTriangle size="18" />
              <span>No se puede eliminar el último administrador del sistema.</span>
            </div>
            <div v-if="isCurrentUser" class="alert alert-warning">
              <AlertTriangle size="18" />
              <span>No puedes eliminar tu propia cuenta de usuario.</span>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" class="btn btn-secondary">
              Cancelar
            </button>
            <button @click="deleteUsuario" class="btn btn-danger" :disabled="loading || isLastAdmin || isCurrentUser">
              <Trash2 v-if="!loading" size="18" class="btn-icon" />
              <Loader v-else size="18" class="btn-icon animate-spin" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script>
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useUsuariosStore } from "../../stores/usuarios"
import { useRolesStore } from "../../stores/roles"
import { useAuthStore } from "../../stores/auth"
import { useNotificationStore } from "../../stores/notification"
import { validateUpdateUser } from "../../validation/usuarioSchema"
import DefaultLayout from "../../layouts/DefaultLayout.vue"
import LoadingSpinner from "../../components/common/LoadingSpinner.vue"
import PasswordInput from "../../components/auth/PasswordInput.vue"
import {
  User,
  Shield,
  Lock,
  Edit,
  Save,
  Trash2,
  ArrowLeft,
  X,
  AlertTriangle,
  Key,
  Loader,
  ToggleLeft,
  ToggleRight,
} from "lucide-vue-next"
import { storeToRefs } from "pinia"

export default {
  name: "UsuarioDetalle",
  components: {
    DefaultLayout,
    LoadingSpinner,
    PasswordInput,
    User,
    Shield,
    Lock,
    Edit,
    Save,
    Trash2,
    ArrowLeft,
    X,
    AlertTriangle,
    Key,
    Loader,
    ToggleLeft,
    ToggleRight,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const usuariosStore = useUsuariosStore()
    const rolesStore = useRolesStore()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()

    const { roles } = storeToRefs(rolesStore)
    const usuario = ref(null)
    const originalUsuario = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const activeTab = ref("personal")
    const editMode = ref(false)
    const validationErrors = ref({})
    const showDeleteModal = ref(false)

    const passwordData = ref({ newPassword: "", confirmPassword: "" })
    const passwordErrors = ref({})
    const passwordLoading = ref(false)

    const canEdit = computed(() => authStore.hasPermission({ nombre: "Usuarios", tipo: "Escritura" }))

    const isLastAdmin = computed(() => {
      if (!usuario.value) return false
      return usuario.value.id_rol === 1 && usuario.value.activo && usuario.value.es_ultimo_admin === true
    })

    const isCurrentUser = computed(() => {
      if (!usuario.value || !authStore.user) return false
      return usuario.value.id_usuario === authStore.user.id_usuario
    })

    const loadUsuario = async () => {
      loading.value = true
      error.value = null
      try {
        const id = route.params.id
        const data = await usuariosStore.fetchUsuarioById(id)
        usuario.value = data
        if (data) {
          originalUsuario.value = JSON.parse(JSON.stringify(data))
        } else {
          error.value = "No se pudo cargar la información del usuario"
        }
      } catch (err) {
        error.value = err.message || "Error al cargar el usuario"
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      if (roles.value.length === 0) {
        await rolesStore.fetchRoles()
      }
      loadUsuario()
    })

    return {
      usuario,
      originalUsuario,
      loading,
      error,
      activeTab,
      editMode,
      validationErrors,
      showDeleteModal,
      passwordData,
      passwordErrors,
      passwordLoading,
      canEdit,
      isLastAdmin,
      isCurrentUser,
      usuariosStore,
      rolesStore,
      authStore,
      notificationStore,
      loadUsuario,
      roles,
    }
  },
  methods: {
    goBack() {
      this.$router.push("/usuarios")
    },

    getRolLabel(id_rol) {
      const rolNombre = this.rolesStore.getRolNombre(id_rol)
      if (rolNombre !== `Rol ${id_rol}`) return rolNombre

      const roles = {
        1: "Administrador",
        2: "Gerente",
        3: "RRHH",
        4: "Usuario",
      }
      return roles[id_rol] || `Rol ${id_rol}`
    },

    getRolBadgeClass(id_rol) {
      const classes = {
        1: "badge-primary",
        2: "badge-warning",
        3: "badge-info",
        4: "badge-secondary",
      }
      return classes[id_rol] || "badge-secondary"
    },

    formatDate(dateString) {
      if (!dateString) return null
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Fecha inválida"
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    },

    cancelEdit() {
      if (this.originalUsuario) {
        this.usuario = JSON.parse(JSON.stringify(this.originalUsuario))
      }
      this.editMode = false
      this.validationErrors = {}
    },

    async saveUsuario() {
      try {
        if (this.isCurrentUser && this.usuario.id_rol !== this.originalUsuario.id_rol) {
          this.usuario.id_rol = this.originalUsuario.id_rol
          this.notificationStore.warning("No puedes cambiar tu propio rol por razones de seguridad", "Acción no permitida")
        }

        const { isValid, errors } = await validateUpdateUser(this.usuario)
        if (!isValid) {
          this.validationErrors = errors
          this.notificationStore.error(Object.values(errors)[0], "Error de validación")
          return
        }

        this.validationErrors = {}
        this.loading = true
        const updatedUsuario = await this.usuariosStore.updateUsuario(this.usuario.id_usuario, this.usuario)
        if (updatedUsuario) {
          this.originalUsuario = JSON.parse(JSON.stringify(updatedUsuario))
          this.editMode = false
          this.notificationStore.success(
              `Usuario ${this.usuario.nombre} ${this.usuario.apellidos} editado exitosamente`,
              "Usuario actualizado",
          )
        }
      } catch (error) {
        this.notificationStore.error(
            error.response?.data?.message || error.message || "Ha ocurrido un error al guardar los cambios",
            "Error",
        )
      } finally {
        this.loading = false
      }
    },

    async toggleUsuarioStatus() {
      if (this.isCurrentUser) {
        this.notificationStore.warning("No puedes cambiar el estado de tu propia cuenta", "Acción no permitida")
        return
      }

      try {
        const newStatus = !this.usuario.activo
        this.loading = true
        const success = await this.usuariosStore.changeUsuarioStatus(this.usuario.id_usuario, newStatus)

        if (success) {
          this.usuario.activo = newStatus
          this.originalUsuario = JSON.parse(JSON.stringify(this.usuario))
          this.notificationStore.success(
              `Usuario ${newStatus ? "activado" : "desactivado"} correctamente`,
              `Usuario ${newStatus ? "activado" : "desactivado"}`,
          )
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || ""

        if (
            errorMessage.includes("último administrador") ||
            errorMessage.includes("ultimo administrador") ||
            errorMessage.includes("administrador activo")
        ) {
          this.notificationStore.error("No se puede desactivar el último administrador del sistema", "Error")
        } else {
          this.notificationStore.error("No se pudo desactivar el usuario", "Error")
        }
      } finally {
        this.loading = false
      }
    },

    async changePassword() {
      this.passwordErrors = {};

      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        this.passwordErrors.confirmPassword = "Las contraseñas no coinciden";
        this.notificationStore.error("Las contraseñas no coinciden", "Error");
        return;
      }

      if (this.passwordData.newPassword.length < 8) {
        this.passwordErrors.newPassword = "La contraseña debe tener al menos 8 caracteres";
        this.notificationStore.error("La contraseña debe tener al menos 8 caracteres", "Error");
        return;
      }

      try {
        this.passwordLoading = true;
        const success = await this.usuariosStore.resetPassword(this.usuario.id_usuario, this.passwordData.newPassword);

        if (success) {
          this.notificationStore.success(`Contraseña cambiada exitosamente`, "Contraseña actualizada");
          this.passwordData.newPassword = "";
          this.passwordData.confirmPassword = "";
        } else {
          this.notificationStore.error("No se pudo cambiar la contraseña", "Error");
        }
      } catch (error) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message || '';

        if (statusCode === 400) {
          if (errorMessage.includes('misma contraseña') || errorMessage.includes('same password')) {
            this.passwordErrors.newPassword = "La nueva contraseña no puede ser igual a la actual";
            this.notificationStore.warning(
                "Por seguridad, debes elegir una contraseña diferente a la actual",
                "Contraseña sin cambios"
            );
          } else {
            this.passwordErrors.newPassword = "La nueva contraseña no cumple con los requisitos de seguridad";
          }
        } else {
          this.notificationStore.error(
              "Error del servidor. Por favor, inténtelo de nuevo más tarde",
              "Error del servidor",
          );
        }
      } finally {
        this.passwordLoading = false;
      }
    },

    async deleteUsuario() {
      if (this.isCurrentUser) {
        this.notificationStore.warning("No puedes eliminar tu propia cuenta de usuario", "Acción no permitida")
        this.showDeleteModal = false
        return
      }

      try {
        this.loading = true
        const success = await this.usuariosStore.deleteUsuario(this.usuario.id_usuario)
        if (success) {
          this.showDeleteModal = false
          this.notificationStore.success("Usuario eliminado correctamente", "Usuario eliminado")
          this.$router.push("/usuarios")
        } else {
          this.notificationStore.error("No se pudo eliminar el usuario", "Error")
        }
      } catch (error) {
        if (error.response?.data?.message?.includes("último administrador")) {
          this.notificationStore.error("No se puede eliminar el último administrador del sistema", "Error")
        } else {
          this.notificationStore.error(
              "Error del servidor. Por favor, inténtelo de nuevo más tarde",
              "Error del servidor",
          )
        }
      } finally {
        this.loading = false
        this.showDeleteModal = false
      }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.usuario-detalle-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  position: relative;
  padding-bottom: 0.5rem;
}

.header-left h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #dc2626, #ef4444);
  border-radius: 3px;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-button:hover {
  color: #dc2626;
}

.tab-button.active {
  color: #dc2626;
  border-bottom-color: #dc2626;
}

.tab-icon {
  opacity: 0.7;
}

.tab-button.active .tab-icon {
  opacity: 1;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9fafb;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.875rem;
}

.form-control {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #dc2626;
  outline: none;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-control.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.info-feedback {
  color: #0284c7;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-value {
  padding: 0.5rem 0;
  color: #111827;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 1.5rem;
  gap: 0.75rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-primary {
  background-color: #fef2f2;
  color: #dc2626;
}

.badge-success {
  background-color: #ecfdf5;
  color: #059669;
}

.badge-danger {
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

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-success {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-success:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-danger:hover {
  background-color: #fecaca;
}

.btn-ghost {
  background-color: transparent;
  color: #4b5563;
}

.btn-ghost:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.btn-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-status-active {
  background-color: #ecfdf5;
  color: #059669;
}

.btn-status-inactive {
  background-color: #fef2f2;
  color: #dc2626;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  color: #dc2626;
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
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.text-danger {
  color: #dc2626;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
}

.alert-warning {
  background-color: #fffbeb;
  color: #d97706;
}

.animate-spin {
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

@media (max-width: 767px) {
  .usuario-detalle-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .tab-button {
    padding: 0.5rem 1rem;
  }
}
</style>