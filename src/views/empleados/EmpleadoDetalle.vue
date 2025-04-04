<template>
  <div class="empleado-detalle">
    <div v-if="empleadosStore.loading" class="loading-container">
      <loading-spinner message="Cargando información del empleado..." />
    </div>

    <div v-else-if="empleadosStore.error" class="error-container">
      <p class="error-message">{{ empleadosStore.error }}</p>
      <button @click="loadEmpleado" class="btn btn-primary">Reintentar</button>
    </div>

    <div v-else-if="!empleado" class="empty-container">
      <p>No se encontró el empleado solicitado.</p>
      <router-link to="/empleados" class="btn btn-primary">Volver a la lista</router-link>
    </div>

    <div v-else class="ficha-empleado">
      <!-- Cabecera -->
      <div class="ficha-header">
        <div class="header-left">
          <div class="back-button" @click="goBack">
            <ArrowLeft size="18" />
          </div>
          <div>
            <h1 class="ficha-title">{{ empleado.nombre }} {{ empleado.apellidos }}</h1>
            <p class="ficha-subtitle">{{ empleado.puesto_actual || 'Sin puesto asignado' }}</p>
          </div>
        </div>
        <div class="ficha-actions">
          <span class="status-badge" :class="empleado.activo ? 'status-active' : 'status-inactive'">
            {{ empleado.activo ? 'Activo' : 'Inactivo' }}
          </span>
          <permission-check :permiso="{ nombre: 'Empleados', tipo: 'Escritura' }">
            <button class="btn btn-outline-secondary" @click="editMode = !editMode">
              <Edit size="16" class="btn-icon" />
              {{ editMode ? 'Cancelar' : 'Editar' }}
            </button>
            <button v-if="editMode" class="btn btn-primary" @click="saveEmpleado">
              <Save size="16" class="btn-icon" />
              Guardar
            </button>
            <button v-else class="btn btn-danger" @click="showDeleteModal = true">
              <Trash2 size="16" class="btn-icon" />
              Eliminar
            </button>
          </permission-check>
        </div>
      </div>

      <!-- Pestañas de navegación -->
      <div class="ficha-tabs">
        <button
            class="tab-button"
            :class="{ 'active': activeTab === 'personal' }"
            @click="activeTab = 'personal'"
        >
          <User class="tab-icon" size="18" />
          <span class="tab-text">Información Personal</span>
        </button>
        <button
            class="tab-button"
            :class="{ 'active': activeTab === 'laboral' }"
            @click="activeTab = 'laboral'"
        >
          <Briefcase class="tab-icon" size="18" />
          <span class="tab-text">Información Laboral</span>
        </button>
        <permission-check :permiso="{ nombre: 'Contratos', tipo: 'Lectura' }">
          <button
              class="tab-button"
              :class="{ 'active': activeTab === 'contratos' }"
              @click="activeTab = 'contratos'"
          >
            <FileText class="tab-icon" size="18" />
            <span class="tab-text">Contratos</span>
          </button>
        </permission-check>
        <permission-check :permiso="{ nombre: 'Documentos', tipo: 'Lectura' }">
          <button
              class="tab-button"
              :class="{ 'active': activeTab === 'documentos' }"
              @click="activeTab = 'documentos'"
          >
            <FolderOpen class="tab-icon" size="18" />
            <span class="tab-text">Documentos</span>
          </button>
        </permission-check>
        <permission-check :permiso="{ nombre: 'Ausencias', tipo: 'Lectura' }">
          <button
              class="tab-button"
              :class="{ 'active': activeTab === 'ausencias' }"
              @click="activeTab = 'ausencias'"
          >
            <Calendar class="tab-icon" size="18" />
            <span class="tab-text">Ausencias</span>
          </button>
        </permission-check>
      </div>

      <!-- Contenido de las pestañas -->
      <div class="tab-content">
        <!-- Información Personal -->
        <div v-if="activeTab === 'personal'" class="tab-panel">
          <div class="panel-header">
            <h2>Información Personal</h2>
            <p class="panel-subtitle">Datos personales del empleado</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" id="nombre" v-model="empleado.nombre" class="form-control" :disabled="!editMode" />
            </div>

            <div class="form-group">
              <label for="apellidos">Apellidos</label>
              <input type="text" id="apellidos" v-model="empleado.apellidos" class="form-control" :disabled="!editMode" />
            </div>

            <div class="form-group">
              <label for="dni">DNI/NIE</label>
              <input type="text" id="dni" v-model="empleado.dni_nie" class="form-control" :disabled="!editMode" />
            </div>

            <div class="form-group">
              <label for="fecha_nacimiento">Fecha de Nacimiento</label>
              <input type="date" id="fecha_nacimiento" v-model="empleado.fecha_nacimiento" class="form-control" :disabled="!editMode" />
            </div>

            <div class="form-group">
              <label for="direccion">Dirección</label>
              <input type="text" id="direccion" v-model="empleado.direccion" class="form-control" :disabled="!editMode" />
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input type="text" id="telefono" v-model="empleado.telefono" class="form-control" :disabled="!editMode" />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="empleado.email" class="form-control" :disabled="!editMode" />
            </div>

            <div class="form-group">
              <label for="estado_civil">Estado Civil</label>
              <select id="estado_civil" v-model="empleado.estado_civil" class="form-control" :disabled="!editMode">
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Viudo/a">Viudo/a</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Información Laboral -->
        <div v-if="activeTab === 'laboral'" class="tab-panel">
          <div class="panel-header">
            <h2>Información Laboral</h2>
            <p class="panel-subtitle">Datos laborales del empleado</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="departamento">Departamento</label>
              <select id="departamento" v-model="empleado.id_departamento" class="form-control" :disabled="!editMode">
                <option value="">Seleccione un departamento</option>
                <!-- Aquí irían las opciones de departamentos -->
                <option value="1">Tecnología</option>
                <option value="2">Recursos Humanos</option>
                <option value="3">Contabilidad</option>
              </select>
            </div>

            <div class="form-group">
              <label for="centro">Centro</label>
              <select id="centro" v-model="empleado.id_centro" class="form-control" :disabled="!editMode">
                <option value="">Seleccione un centro</option>
                <!-- Aquí irían las opciones de centros -->
                <option value="1">Madrid</option>
                <option value="2">Barcelona</option>
                <option value="3">Valencia</option>
              </select>
            </div>

            <div class="form-group">
              <label for="puesto">Puesto Actual</label>
              <input type="text" id="puesto" v-model="empleado.puesto_actual" class="form-control" :disabled="!editMode" />
            </div>

            <div class="form-group">
              <label for="fecha_incorporacion">Fecha de Incorporación</label>
              <input type="date" id="fecha_incorporacion" v-model="empleado.fecha_incorporacion" class="form-control" :disabled="!editMode" />
            </div>
          </div>
        </div>

        <!-- Contratos -->
        <div v-if="activeTab === 'contratos'" class="tab-panel">
          <div class="panel-header">
            <h2>Contratos</h2>
            <p class="panel-subtitle">Historial de contratos del empleado</p>
          </div>

          <div class="empty-state">
            <FileText size="48" class="empty-icon" />
            <h3>No hay contratos registrados</h3>
            <p>Este empleado no tiene contratos registrados en el sistema.</p>
            <permission-check :permiso="{ nombre: 'Contratos', tipo: 'Escritura' }">
              <button class="btn btn-primary">
                <Plus size="16" class="btn-icon" />
                Añadir Contrato
              </button>
            </permission-check>
          </div>
        </div>

        <!-- Documentos -->
        <div v-if="activeTab === 'documentos'" class="tab-panel">
          <div class="panel-header">
            <h2>Documentos</h2>
            <p class="panel-subtitle">Documentos asociados al empleado</p>
          </div>

          <div class="empty-state">
            <FolderOpen size="48" class="empty-icon" />
            <h3>No hay documentos registrados</h3>
            <p>Este empleado no tiene documentos registrados en el sistema.</p>
            <permission-check :permiso="{ nombre: 'Documentos', tipo: 'Escritura' }">
              <button class="btn btn-primary">
                <Upload size="16" class="btn-icon" />
                Subir Documento
              </button>
            </permission-check>
          </div>
        </div>

        <!-- Ausencias -->
        <div v-if="activeTab === 'ausencias'" class="tab-panel">
          <div class="panel-header">
            <h2>Ausencias</h2>
            <p class="panel-subtitle">Registro de ausencias del empleado</p>
          </div>

          <div class="empty-state">
            <Calendar size="48" class="empty-icon" />
            <h3>No hay ausencias registradas</h3>
            <p>Este empleado no tiene ausencias registradas en el sistema.</p>
            <permission-check :permiso="{ nombre: 'Ausencias', tipo: 'Escritura' }">
              <button class="btn btn-primary">
                <Plus size="16" class="btn-icon" />
                Registrar Ausencia
              </button>
            </permission-check>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <X size="18" />
          </button>
        </div>
        <div class="modal-body">
          <AlertTriangle size="48" class="modal-icon warning" />
          <p class="modal-message">
            ¿Está seguro que desea eliminar al empleado <strong>{{ empleado.nombre }} {{ empleado.apellidos }}</strong>?
          </p>
          <p class="modal-warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" @click="showDeleteModal = false">
            Cancelar
          </button>
          <button class="btn btn-danger" @click="deleteEmpleado">
            <Trash2 size="16" class="btn-icon" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useEmpleadosStore } from '../../stores/empleados';
import { useAuthStore } from '../../stores/auth';
import { useNotificationStore } from '../../stores/notification';
import LoadingSpinner from '../../components/common/LoadingSpinner.vue';
import PermissionCheck from '../../components/common/PermissionCheck.vue';
import {
  User, Briefcase, FileText, FolderOpen, Calendar, Edit, Trash2,
  ArrowLeft, X, AlertTriangle, Plus, Upload, Save
} from 'lucide-vue-next';

export default {
  name: 'EmpleadoDetalle',

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
    Save
  },

  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },

  setup() {
    const empleadosStore = useEmpleadosStore();
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();
    const activeTab = ref('personal');
    const showDeleteModal = ref(false);
    const editMode = ref(false);

    return {
      empleadosStore,
      authStore,
      notificationStore,
      activeTab,
      showDeleteModal,
      editMode
    };
  },

  computed: {
    empleado() {
      return this.empleadosStore.currentEmpleado;
    },

    canEdit() {
      return this.authStore.hasPermission({ nombre: 'Empleados', tipo: 'Escritura' });
    }
  },

  created() {
    this.loadEmpleado();
  },

  methods: {
    loadEmpleado() {
      if (!this.id) {
        this.$router.push('/empleados');
        return;
      }

      this.empleadosStore.fetchEmpleadoById(this.id);
    },

    formatDate(dateString) {
      if (!dateString) return 'No especificada';

      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    goBack() {
      this.$router.push('/empleados');
    },

    async saveEmpleado() {
      try {
        const updatedEmpleado = await this.empleadosStore.updateEmpleado(this.id, this.empleado);

        if (updatedEmpleado) {
          this.editMode = false;
          this.notificationStore.success(
              `Los datos de ${updatedEmpleado.nombre} ${updatedEmpleado.apellidos} han sido actualizados correctamente.`,
              'Empleado actualizado'
          );
        }
      } catch (error) {
        this.notificationStore.error(
            'Ha ocurrido un error al guardar los cambios. Por favor, inténtelo de nuevo.',
            'Error al actualizar'
        );
      }
    },

    async deleteEmpleado() {
      try {
        const success = await this.empleadosStore.deleteEmpleado(this.id);

        if (success) {
          this.showDeleteModal = false;
          this.notificationStore.success(
              'El empleado ha sido eliminado correctamente.',
              'Empleado eliminado'
          );
          this.$router.push('/empleados');
        } else {
          this.notificationStore.error(
              'Ha ocurrido un error al eliminar el empleado. Por favor, inténtelo de nuevo.',
              'Error al eliminar'
          );
        }
      } catch (error) {
        this.notificationStore.error(
            'Ha ocurrido un error al eliminar el empleado. Por favor, inténtelo de nuevo.',
            'Error al eliminar'
        );
      }
    }
  }
}
</script>

<style>
.empleado-detalle {
  padding: 1.5rem;
}

.ficha-empleado {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.ficha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: #f3f4f6;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #e5e7eb;
}

.ficha-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.ficha-subtitle {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.ficha-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
}

.btn-primary:hover {
  background-color: #3a56d4;
}

.btn-outline-secondary {
  background-color: transparent;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.btn-outline-secondary:hover {
  background-color: #f3f4f6;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-icon {
  margin-right: 0.5rem;
}

.ficha-tabs {
  display: flex;
  padding: 0 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  overflow-x: auto;
  flex-wrap: nowrap;
}

.tab-button {
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.tab-button:hover {
  color: #4b5563;
}

.tab-button.active {
  color: #4361ee;
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #4361ee;
}

.tab-icon {
  margin-right: 0.25rem;
}

.tab-content {
  padding: 2rem;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

.panel-header {
  margin-bottom: 1.5rem;
}

.panel-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #111827;
}

.panel-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
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
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.form-control:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-container,
.error-container,
.empty-container {
  padding: 3rem 2rem;
  text-align: center;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.error-message {
  color: #991b1b;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

/* Modal de confirmación */
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
}

.modal-container {
  background-color: #fff;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.modal-icon {
  margin-bottom: 1.5rem;
}

.modal-icon.warning {
  color: #f59e0b;
}

.modal-message {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #4b5563;
}

.modal-warning {
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-footer {
  padding: 1.25rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Media queries para responsividad */
@media (max-width: 991px) {
  .form-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 767px) {
  .empleado-detalle {
    padding: 1rem;
  }

  .ficha-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem;
  }

  .header-left {
    width: 100%;
  }

  .ficha-actions {
    width: 100%;
    justify-content: flex-start;
    margin-top: 1rem;
  }

  .tab-content {
    padding: 1.5rem;
  }
}

@media (max-width: 575px) {
  .tab-text {
    display: none;
  }

  .tab-button {
    padding: 1rem 0.75rem;
    justify-content: center;
  }

  .tab-icon {
    margin-right: 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-container {
    width: 95%;
  }
}
</style>

