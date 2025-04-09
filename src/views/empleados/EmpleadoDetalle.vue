<template>
  <div class="empleado-detalle">
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn btn-icon btn-ghost">
          <ArrowLeft size="18" />
          <span>Volver</span>
        </button>
        <h1 v-if="empleado">{{ empleado.nombre }} {{ empleado.apellidos }}</h1>
      </div>

      <div class="header-actions" v-if="empleado && canEdit">

        <button
            @click="toggleEmpleadoStatus"
            class="btn btn-status"
            :class="empleado.activo ? 'btn-status-active' : 'btn-status-inactive'"
        >
          <ToggleRight v-if="empleado.activo" size="18" class="btn-icon" />
          <ToggleLeft v-else size="18" class="btn-icon" />
          {{ empleado.activo ? 'Activo' : 'Inactivo' }}
        </button>

        <button v-if="!editMode" @click="editMode = true" class="btn btn-primary">
          <Edit size="18" class="btn-icon" />
          Editar
        </button>

        <button v-if="editMode" @click="saveEmpleado" class="btn btn-success">
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

    <div v-if="empleadosStore.loading" class="loading-container">
      <LoadingSpinner message="Cargando datos del empleado..." />
    </div>

    <div v-else-if="empleadosStore.error" class="error-container">
      <div class="error-message">
        <AlertTriangle size="24" />
        <p>{{ empleadosStore.error }}</p>
      </div>
      <button @click="loadEmpleado" class="btn btn-primary">
        Reintentar
      </button>
    </div>

    <div v-else-if="!empleado" class="error-container">
      <div class="error-message">
        <AlertTriangle size="24" />
        <p>No se encontró el empleado solicitado.</p>
      </div>
      <button @click="goBack" class="btn btn-primary">
        Volver a la lista
      </button>
    </div>

    <div v-else class="empleado-content">

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
            :class="{ active: activeTab === 'laboral' }"
            @click="activeTab = 'laboral'"
        >
          <Briefcase size="18" class="tab-icon" />
          Información Laboral
        </button>
        <button
            class="tab-button"
            :class="{ active: activeTab === 'documentos' }"
            @click="activeTab = 'documentos'"
        >
          <FileText size="18" class="tab-icon" />
          Documentos
        </button>
        <button
            class="tab-button"
            :class="{ active: activeTab === 'historial' }"
            @click="activeTab = 'historial'"
        >
          <FolderOpen size="18" class="tab-icon" />
          Historial
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
                      v-model="empleado.nombre"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.nombre }"
                  />
                  <div v-if="editMode && validationErrors.nombre" class="invalid-feedback">
                    {{ validationErrors.nombre }}
                  </div>
                  <div v-else class="form-value">{{ empleado.nombre }}</div>
                </div>

                <div class="form-group">
                  <label>Apellidos</label>
                  <input
                      v-if="editMode"
                      v-model="empleado.apellidos"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.apellidos }"
                  />
                  <div v-if="editMode && validationErrors.apellidos" class="invalid-feedback">
                    {{ validationErrors.apellidos }}
                  </div>
                  <div v-else class="form-value">{{ empleado.apellidos }}</div>
                </div>

                <div class="form-group">
                  <label>DNI/NIE</label>
                  <input
                      v-if="editMode"
                      v-model="empleado.dni_nie"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.dni_nie }"
                  />
                  <div v-if="editMode && validationErrors.dni_nie" class="invalid-feedback">
                    {{ validationErrors.dni_nie }}
                  </div>
                  <div v-else class="form-value">{{ empleado.dni_nie }}</div>
                </div>

                <div class="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input
                      v-if="editMode"
                      v-model="empleado.fecha_nacimiento"
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.fecha_nacimiento }"
                  />
                  <div v-if="editMode && validationErrors.fecha_nacimiento" class="invalid-feedback">
                    {{ validationErrors.fecha_nacimiento }}
                  </div>
                  <div v-else class="form-value">{{ formatDate(empleado.fecha_nacimiento) }}</div>
                </div>

                <div class="form-group">
                  <label>Estado Civil</label>
                  <select
                      v-if="editMode"
                      v-model="empleado.estado_civil"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.estado_civil }"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Soltero/a">Soltero/a</option>
                    <option value="Casado/a">Casado/a</option>
                    <option value="Divorciado/a">Divorciado/a</option>
                    <option value="Viudo/a">Viudo/a</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <div v-if="editMode && validationErrors.estado_civil" class="invalid-feedback">
                    {{ validationErrors.estado_civil }}
                  </div>
                  <div v-else class="form-value">{{ empleado.estado_civil || 'No especificado' }}</div>
                </div>

                <div class="form-group">
                  <label>Dirección</label>
                  <textarea
                      v-if="editMode"
                      v-model="empleado.direccion"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.direccion }"
                  ></textarea>
                  <div v-if="editMode && validationErrors.direccion" class="invalid-feedback">
                    {{ validationErrors.direccion }}
                  </div>
                  <div v-else class="form-value">{{ empleado.direccion || 'No especificada' }}</div>
                </div>

                <div class="form-group">
                  <label>Teléfono</label>
                  <input
                      v-if="editMode"
                      v-model="empleado.telefono"
                      type="tel"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.telefono }"
                  />
                  <div v-if="editMode && validationErrors.telefono" class="invalid-feedback">
                    {{ validationErrors.telefono }}
                  </div>
                  <div v-else class="form-value">{{ empleado.telefono || 'No especificado' }}</div>
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <input
                      v-if="editMode"
                      v-model="empleado.email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.email }"
                  />
                  <div v-if="editMode && validationErrors.email" class="invalid-feedback">
                    {{ validationErrors.email }}
                  </div>
                  <div v-else class="form-value">{{ empleado.email || 'No especificado' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información Laboral -->
        <div v-if="activeTab === 'laboral'" class="tab-panel">
          <div class="card">
            <div class="card-header">
              <h2>Información Laboral</h2>
            </div>
            <div class="card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label>Puesto Actual</label>
                  <input
                      v-if="editMode"
                      v-model="empleado.puesto_actual"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.puesto_actual }"
                  />
                  <div v-if="editMode && validationErrors.puesto_actual" class="invalid-feedback">
                    {{ validationErrors.puesto_actual }}
                  </div>
                  <div v-else class="form-value">{{ empleado.puesto_actual || 'No especificado' }}</div>
                </div>

                <div class="form-group">
                  <label>Centro</label>
                  <select
                      v-if="editMode"
                      v-model="empleado.id_centro"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.id_centro }"
                      @change="handleCentroChange"
                  >
                    <option :value="null">Sin centro</option>
                    <option v-for="centro in centrosStore.centros"
                            :key="centro.id_centro"
                            :value="centro.id_centro">
                      {{ centro.nombre }}
                    </option>
                  </select>
                  <div v-if="editMode && validationErrors.id_centro" class="invalid-feedback">
                    {{ validationErrors.id_centro }}
                  </div>
                  <div v-else class="form-value">
                    {{ empleado.Centro ? empleado.Centro.nombre : 'No asignado' }}
                  </div>
                </div>

                <div class="form-group">
                  <label>Departamento</label>
                  <select
                      v-if="editMode"
                      v-model="empleado.id_departamento"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.id_departamento }"
                  >
                    <option :value="null">Sin departamento</option>
                    <option v-for="departamento in departamentosFiltrados"
                            :key="departamento.id_departamento"
                            :value="departamento.id_departamento">
                      {{ departamento.nombre }}
                    </option>
                  </select>
                  <div v-if="editMode && validationErrors.id_departamento" class="invalid-feedback">
                    {{ validationErrors.id_departamento }}
                  </div>
                  <div v-else class="form-value">
                    {{ empleado.Departamento ? empleado.Departamento.nombre : 'No asignado' }}
                  </div>
                </div>

                <div class="form-group">
                  <label>Fecha de Incorporación</label>
                  <input
                      v-if="editMode"
                      v-model="empleado.fecha_incorporacion"
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': validationErrors.fecha_incorporacion }"
                  />
                  <div v-if="editMode && validationErrors.fecha_incorporacion" class="invalid-feedback">
                    {{ validationErrors.fecha_incorporacion }}
                  </div>
                  <div v-else class="form-value">{{ formatDate(empleado.fecha_incorporacion) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Documentos -->
        <div v-if="activeTab === 'documentos'" class="tab-panel">
          <div class="card">
            <div class="card-header">
              <h2>Documentos</h2>
              <PermissionCheck :permiso="{ nombre: 'Empleados', tipo: 'Escritura' }">
                <button class="btn btn-primary">
                  <Plus size="18" class="btn-icon" />
                  Añadir Documento
                </button>
              </PermissionCheck>
            </div>
            <div class="card-body">
              <div class="empty-state">
                <FileText size="48" class="empty-icon" />
                <h3>No hay documentos</h3>
                <p>No se han subido documentos para este empleado.</p>
                <PermissionCheck :permiso="{ nombre: 'Empleados', tipo: 'Escritura' }">
                  <button class="btn btn-primary">
                    <Upload size="18" class="btn-icon" />
                    Subir Documento
                  </button>
                </PermissionCheck>
              </div>
            </div>
          </div>
        </div>

        <!-- Historial -->
        <div v-if="activeTab === 'historial'" class="tab-panel">
          <div class="card">
            <div class="card-header">
              <h2>Historial</h2>
            </div>
            <div class="card-body">
              <div class="empty-state">
                <Calendar size="48" class="empty-icon" />
                <h3>No hay registros</h3>
                <p>No hay registros de actividad para este empleado.</p>
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
          <p>¿Está seguro de que desea eliminar a <strong>{{ empleado.nombre }} {{ empleado.apellidos }}</strong>?</p>
          <p class="text-danger">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="deleteEmpleado" class="btn btn-danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue"
import { useEmpleadosStore } from "../../stores/empleados"
import { useAuthStore } from "../../stores/auth"
import { useNotificationStore } from "../../stores/notification"
import { useDepartamentosStore } from "../../stores/departamentos"
import { useCentrosStore } from "../../stores/centros"
import { validateEmpleado } from "../../validation/empleadoSchema"
import LoadingSpinner from "../../components/common/LoadingSpinner.vue"
import PermissionCheck from "../../components/common/PermissionCheck.vue"
import {
  User,
  Briefcase,
  FileText,
  FolderOpen,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  X,
  AlertTriangle,
  Plus,
  Upload,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-vue-next"

export default {
  name: "EmpleadoDetalle",

  components: {
    LoadingSpinner,
    PermissionCheck,
    User,
    Briefcase,
    FileText,
    FolderOpen,
    Calendar,
    Edit,
    Trash2,
    ArrowLeft,
    X,
    AlertTriangle,
    Plus,
    Upload,
    Save,
    ToggleLeft,
    ToggleRight,
  },

  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },

  setup() {
    const empleadosStore = useEmpleadosStore()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    const departamentosStore = useDepartamentosStore()
    const centrosStore = useCentrosStore()
    const activeTab = ref("personal")
    const showDeleteModal = ref(false)
    const editMode = ref(false)
    const validationErrors = ref({})
    const originalEmpleado = ref(null)
    const selectedCentroId = ref(null)

    const departamentosFiltrados = computed(() => {
      if (!selectedCentroId.value) {
        return departamentosStore.departamentos
      }

      return departamentosStore.departamentos.filter(
          departamento => departamento.id_centro === selectedCentroId.value
      )
    })

    return {
      empleadosStore,
      authStore,
      notificationStore,
      departamentosStore,
      centrosStore,
      activeTab,
      showDeleteModal,
      editMode,
      validationErrors,
      originalEmpleado,
      selectedCentroId,
      departamentosFiltrados
    }
  },

  computed: {
    empleado() {
      return this.empleadosStore.currentEmpleado
    },

    canEdit() {
      return this.authStore.hasPermission({ nombre: "Empleados", tipo: "Escritura" })
    },
  },

  created() {
    this.loadEmpleado()
    this.loadDepartamentosYCentros()
  },

  methods: {
    loadDepartamentosYCentros() {
      this.departamentosStore.fetchDepartamentos()
      this.centrosStore.fetchCentros()
    },

    loadEmpleado() {
      if (!this.id) {
        this.$router.push("/empleados")
        return
      }

      this.empleadosStore.fetchEmpleadoById(this.id).then(() => {
        if (this.empleado) {
          this.originalEmpleado = JSON.parse(JSON.stringify(this.empleado))

          this.selectedCentroId = this.empleado.id_centro
        }
      })
    },

    handleCentroChange() {
      this.selectedCentroId = this.empleado.id_centro

      if (this.empleado.id_departamento) {
        const departamentoActual = this.departamentosStore.departamentos.find(
            d => d.id_departamento === this.empleado.id_departamento
        )

        if (departamentoActual && departamentoActual.id_centro !== this.selectedCentroId) {
          this.empleado.id_departamento = null
        }
      }
    },

    formatDate(dateString) {
      if (!dateString) return "No especificada"

      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    },

    goBack() {
      this.$router.push("/empleados")
    },

    cancelEdit() {
      if (this.originalEmpleado) {
        this.empleadosStore.currentEmpleado = JSON.parse(JSON.stringify(this.originalEmpleado))
        this.selectedCentroId = this.empleado.id_centro
      }
      this.editMode = false
      this.validationErrors = {}
    },

    async saveEmpleado() {
      try {
        console.log("Datos a validar:", this.empleado)

        const { isValid, errors } = await validateEmpleado(this.empleado)

        if (!isValid) {
          this.validationErrors = errors

          const firstError = Object.values(errors)[0]
          this.notificationStore.error(
              firstError,
              "Error de validación"
          )
          return
        }

        this.validationErrors = {}

        const updatedEmpleado = await this.empleadosStore.updateEmpleado(this.id, this.empleado)

        if (updatedEmpleado) {
          this.originalEmpleado = JSON.parse(JSON.stringify(updatedEmpleado))
          this.editMode = false
          this.notificationStore.success(
              `¡Empleado modificado correctamente! Los datos de ${updatedEmpleado.nombre} ${updatedEmpleado.apellidos} han sido actualizados.`,
              "Empleado actualizado"
          )
        }
      } catch (error) {
        console.error("Error al guardar empleado:", error)
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al guardar los cambios. Por favor, inténtelo de nuevo.",
            "Error al actualizar"
        )
      }
    },

    async deleteEmpleado() {
      try {
        const success = await this.empleadosStore.deleteEmpleado(this.id)

        if (success) {
          this.showDeleteModal = false
          this.notificationStore.success("El empleado ha sido eliminado correctamente.", "Empleado eliminado")
          this.$router.push("/empleados")
        } else {
          this.notificationStore.error(
              "Ha ocurrido un error al eliminar el empleado. Por favor, inténtelo de nuevo.",
              "Error al eliminar"
          )
        }
      } catch (error) {
        console.error("Error al eliminar empleado:", error)
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al eliminar el empleado. Por favor, inténtelo de nuevo.",
            "Error al eliminar"
        )
      }
    },

    async toggleEmpleadoStatus() {
      try {
        const newStatus = !this.empleado.activo
        console.log(`Componente: Cambiando estado a ${newStatus ? 'activo' : 'inactivo'}`)

        const success = await this.empleadosStore.changeEmpleadoStatus(this.id, newStatus)

        if (success) {
          this.originalEmpleado = JSON.parse(JSON.stringify(this.empleado))
          this.notificationStore.success(
              `El empleado ha sido ${newStatus ? "activado" : "desactivado"} correctamente.`,
              `Empleado ${newStatus ? "activado" : "desactivado"}`
          )
        } else {
          this.notificationStore.error(
              `Ha ocurrido un error al ${newStatus ? "activar" : "desactivar"} el empleado. Por favor, inténtelo de nuevo.`,
              "Error al cambiar estado"
          )
        }
      } catch (error) {
        console.error("Error en toggleEmpleadoStatus:", error)
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al cambiar el estado del empleado. Por favor, inténtelo de nuevo.",
            "Error al cambiar estado"
        )
      }
    },
  },
}
</script>

<style scoped>
.empleado-detalle {
  padding: 1.5rem;
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

.btn-icon {
  margin-right: 0.5rem;
}

.btn-ghost {
  background-color: transparent;
  color: #4b5563;
}

.btn-ghost:hover {
  background-color: #f3f4f6;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
}

.btn-primary:hover {
  background-color: #3a56d4;
}

.btn-secondary {
  background-color: #9ca3af;
  color: white;
}

.btn-secondary:hover {
  background-color: #6b7280;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover {
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

.btn-status-active {
  background-color: #dcfce7;
  color: #166534;
}

.btn-status-active:hover {
  background-color: #bbf7d0;
}

.btn-status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn-status-inactive:hover {
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
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ef4444;
  margin-bottom: 1.5rem;
}

.empleado-content {
  position: relative;
}

.empleado-status {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 1;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
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

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

.form-value {
  padding: 0.625rem 0;
  color: #111827;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 767px) {
  .empleado-detalle {
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