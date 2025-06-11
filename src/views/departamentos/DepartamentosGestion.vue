<template>
  <DefaultLayout>
    <div class="departamentos-page">
      <div class="page-header">
        <div class="page-header-left">
          <button @click="goBack" class="btn-back">
            <ArrowLeft size="18" />
          </button>
          <h1 class="page-title">
            Departamentos de {{ currentCentro ? currentCentro.nombre : 'Centro' }}
          </h1>
        </div>
        <div class="page-actions">
          <permission-check :permiso="{ nombre: 'Master', tipo: 'Escritura' }">
            <button @click="showCreateModal" class="btn-primary">
              <PlusCircle size="18" class="btn-icon-primary" />
              Nuevo Departamento
            </button>
          </permission-check>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div v-if="loadingCentro || loadingDepartamentos" class="loading-container">
            <loading-spinner :message="loadingCentro ? 'Cargando centro...' : 'Cargando departamentos...'" />
          </div>
          <div v-else-if="error" class="error-message">
            {{ error }}
          </div>
          <div v-else-if="!currentCentro" class="error-message">
            Centro no encontrado
          </div>
          <div v-else-if="departamentos.length === 0" class="empty-state">
            <FolderClosed size="48" class="empty-icon" />
            <h3>No hay departamentos registrados en este centro</h3>
            <p>Comienza creando un nuevo departamento</p>
          </div>
          <div v-else class="table-container">
            <table class="data-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="departamento in departamentos" :key="departamento.id_departamento">
                <td>{{ departamento.id_departamento }}</td>
                <td>{{ departamento.nombre }}</td>
                <td>{{ departamento.descripcion || 'N/A' }}</td>
                <td>
                  <div class="action-buttons">
                    <permission-check :permiso="{ nombre: 'Master', tipo: 'Escritura' }">
                      <button @click="editDepartamento(departamento)" class="btn-icon-only" title="Editar">
                        <Edit size="16" />
                      </button>
                      <button @click="confirmDelete(departamento)" class="btn-icon btn-danger" title="Eliminar">
                        <Trash2 size="16" />
                      </button>
                    </permission-check>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal para crear/editar departamento -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Editar Departamento' : 'Nuevo Departamento' }}</h2>
            <button @click="closeModal" class="modal-close">
              <X size="18" />
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveDepartamento" class="form">
              <div class="form-group">
                <label for="nombre" class="form-label">Nombre</label>
                <input
                    id="nombre"
                    v-model="departamentoForm.nombre"
                    type="text"
                    class="form-input"
                    required
                />
              </div>
              <div class="form-group">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea
                    id="descripcion"
                    v-model="departamentoForm.descripcion"
                    class="form-textarea"
                    rows="3"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn-secondary">Cancelar</button>
            <button @click="saveDepartamento" class="btn-primary" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación para eliminar -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Confirmar eliminación</h2>
            <button @click="closeDeleteModal" class="modal-close">
              <X size="18" />
            </button>
          </div>
          <div class="modal-body">
            <p>¿Está seguro que desea eliminar el departamento <strong>{{ departamentoToDelete?.nombre || 'seleccionado' }}</strong>?</p>
            <p class="text-danger">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn-secondary">Cancelar</button>
            <button @click="handleDeleteDepartamento" class="btn-danger" :disabled="deleting">
              {{ deleting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useDepartamentosStore } from '../../stores/departamentos';
import { useCentrosStore } from '../../stores/centros';
import { useNotificationStore } from '../../stores/notification';
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import PermissionCheck from '../../components/common/PermissionCheck.vue';
import LoadingSpinner from '../../components/common/LoadingSpinner.vue';
import { PlusCircle, Edit, Trash2, FolderClosed, ArrowLeft, X } from 'lucide-vue-next';

export default {
  name: 'DepartamentosGestion',
  components: {
    DefaultLayout,
    PermissionCheck,
    LoadingSpinner,
    PlusCircle,
    Edit,
    Trash2,
    FolderClosed,
    ArrowLeft,
    X
  },
  props: {
    idCentro: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      departamentos: [],
      loadingCentro: false,
      loadingDepartamentos: false,
      error: null,
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      saving: false,
      deleting: false,
      departamentoToDelete: null,
      departamentoForm: {
        nombre: '',
        descripcion: '',
        id_centro: null
      }
    };
  },
  computed: {
    ...mapState(useCentrosStore, ['currentCentro']),
    centroId() {
      return Number(this.idCentro);
    }
  },
  methods: {
    ...mapActions(useCentrosStore, ['fetchCentroById']),
    ...mapActions(useDepartamentosStore, ['fetchDepartamentosByCentro', 'createDepartamento', 'updateDepartamento', 'deleteDepartamento']),

    async loadCentro() {
      if (!this.centroId) return;

      this.loadingCentro = true;
      this.error = null;

      try {
        await this.fetchCentroById(this.centroId);
        if (!this.currentCentro) {
          this.error = 'Centro no encontrado';
        }
      } catch (err) {
        this.error = 'Error al cargar el centro. Por favor, intente nuevamente.';
        console.error(err);
      } finally {
        this.loadingCentro = false;
      }
    },

    async loadDepartamentos() {
      if (!this.centroId) return;

      this.loadingDepartamentos = true;
      this.error = null;

      try {
        this.departamentos = await this.fetchDepartamentosByCentro(this.centroId);
      } catch (err) {
        this.error = 'Error al cargar los departamentos. Por favor, intente nuevamente.';
        console.error(err);
      } finally {
        this.loadingDepartamentos = false;
      }
    },

    goBack() {
      this.$router.push('/centros');
    },

    showCreateModal() {
      this.isEditing = false;
      this.departamentoForm = {
        nombre: '',
        descripcion: '',
        id_centro: this.centroId
      };
      this.showModal = true;
    },

    editDepartamento(departamento) {
      this.isEditing = true;
      this.departamentoForm = { ...departamento };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async saveDepartamento() {
      const notificationStore = useNotificationStore();

      if (!this.departamentoForm.nombre) {
        notificationStore.error(
            'El nombre del departamento es obligatorio',
            'Error de validación'
        );
        return;
      }

      this.saving = true;

      try {
        if (this.isEditing) {
          await this.updateDepartamento(
              this.departamentoForm.id_departamento,
              this.departamentoForm
          );
          notificationStore.success(
              `¡Departamento "${this.departamentoForm.nombre}" actualizado correctamente!`,
              "Departamento actualizado"
          );
        } else {
          const nuevoDepartamento = await this.createDepartamento(this.departamentoForm);
          notificationStore.success(
              `¡Departamento "${nuevoDepartamento.nombre}" creado correctamente!`,
              "Departamento creado"
          );
        }
        this.closeModal();
        await this.loadDepartamentos();
      } catch (err) {
      } finally {
        this.saving = false;
      }
    },

    confirmDelete(departamento) {
      this.departamentoToDelete = departamento;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.departamentoToDelete = null;
    },

    async handleDeleteDepartamento() {
      const notificationStore = useNotificationStore();

      if (!this.departamentoToDelete) return;

      this.deleting = true;

      try {
        await this.deleteDepartamento(this.departamentoToDelete.id_departamento);
        notificationStore.success(
            `Departamento "${this.departamentoToDelete.nombre}" eliminado correctamente`,
            "Departamento eliminado"
        );
        this.closeDeleteModal();
        await this.loadDepartamentos();
      } catch (err) {
      } finally {
        this.deleting = false;
      }
    },

    closeModals() {
      this.closeModal();
      this.closeDeleteModal();
    }
  },
  mounted() {
    this.loadCentro();
    this.loadDepartamentos();
  },
  beforeUnmount() {
    this.closeModals();
  }
};
</script>

<style scoped>
.departamentos-page {
  padding: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-back:hover {
  background-color: #e5e7eb;
  color: #111827;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 0.5rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #f1f1f1;
}

.card-body {
  padding: 1.5rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.error-message {
  color: #dc2626;
  padding: 1rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #b91c1c;
}

.btn-icon-primary {
  margin-right: 0.25rem;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-icon-only {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: #6b7280;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-icon-only:hover {
  background-color: #f3f4f6;
  color: #111827;
}

/* Estilos específicos para btn-icon */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: #6b7280;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.btn-icon.btn-danger {
  color: #ef4444;
  background-color: transparent;
  width: 2rem;
  height: 2rem;
  padding: 0;
}

.btn-icon.btn-danger:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-icon-only.btn-danger:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 1px #dc2626;
}

.text-danger {
  color: #dc2626;
}

/* Estilos para el modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
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
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 767px) {
  .departamentos-page {
    padding: 1rem;
  }
}
</style>
