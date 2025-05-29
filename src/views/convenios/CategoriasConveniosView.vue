<template>
  <DefaultLayout>
    <div class="categorias-page">
      <div class="page-header">
        <div class="page-header-left">
          <button @click="goBack" class="btn-back">
            <ArrowLeft size="18" />
          </button>
          <h1 class="page-title">
            Categorías de {{ currentConvenio ? currentConvenio.nombre : 'Convenio' }}
          </h1>
        </div>
        <div class="page-actions">
          <permission-check :permiso="{ nombre: 'Master', tipo: 'Escritura' }">
            <button @click="showCreateModal" class="btn-primary" :disabled="loading">
              <PlusCircle size="18" class="btn-icon-primary" />
              Nueva Categoría
            </button>
          </permission-check>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="loading-container">
            <loading-spinner message="Cargando categorías..." />
          </div>
          <div v-else-if="error" class="error-message">
            <div class="error-details">
              <AlertTriangle size="24" class="error-icon" />
              <p>{{ error }}</p>
              <button @click="loadData" class="btn-retry">
                <RefreshCw size="16" class="btn-icon" />
                Reintentar
              </button>
            </div>
          </div>
          <div v-else-if="!currentConvenio" class="error-message">
            <div class="error-details">
              <AlertTriangle size="24" class="error-icon" />
              <p>Convenio no encontrado</p>
              <button @click="goBack" class="btn-secondary">
                Volver a convenios
              </button>
            </div>
          </div>
          <div v-else-if="categorias.length === 0" class="empty-state">
            <FolderClosed size="48" class="empty-icon" />
            <h3>No hay categorías registradas en este convenio</h3>
            <p>Comienza creando una nueva categoría</p>
            <button @click="showCreateModal" class="btn-primary mt-4" :disabled="loading">
              <PlusCircle size="18" class="btn-icon-primary" />
              Nueva Categoría
            </button>
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
              <tr v-for="categoria in categorias" :key="categoria.id_categoria">
                <td>{{ categoria.id_categoria }}</td>
                <td>{{ categoria.nombre }}</td>
                <td>{{ categoria.descripcion || 'N/A' }}</td>
                <td>
                  <div class="action-buttons">
                    <permission-check :permiso="{ nombre: 'Master', tipo: 'Escritura' }">
                      <button @click="editCategoria(categoria)" class="btn-icon-only" title="Editar" :disabled="loading">
                        <Edit size="16" />
                      </button>
                      <button @click="confirmDelete(categoria)" class="btn-icon btn-danger" title="Eliminar" :disabled="loading">
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

      <!-- Modal para crear/editar categoría -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
            <button @click="closeModal" class="modal-close">
              <X size="18" />
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCategoria" class="form">
              <div class="form-group">
                <label for="nombre" class="form-label">Nombre</label>
                <input
                    id="nombre"
                    v-model="categoriaForm.nombre"
                    type="text"
                    class="form-input"
                    required
                />
              </div>
              <div class="form-group">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea
                    id="descripcion"
                    v-model="categoriaForm.descripcion"
                    class="form-textarea"
                    rows="3"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn-secondary">Cancelar</button>
            <button @click="saveCategoria" class="btn-primary" :disabled="saving">
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
            <p>¿Está seguro que desea eliminar la categoría <strong>{{ categoriaToDelete?.nombre }}</strong>?</p>
            <p class="text-danger">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn-secondary">Cancelar</button>
            <button @click="deleteCategoria" class="btn-danger" :disabled="deleting">
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
import { useCategoriasConvenioStore } from '../../stores/categoriasConvenio';
import { useConveniosStore } from '../../stores/convenios';
import { useNotificationStore } from '../../stores/notification';
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import PermissionCheck from '../../components/common/PermissionCheck.vue';
import LoadingSpinner from '../../components/common/LoadingSpinner.vue';
import {
  PlusCircle, Edit, Trash2, FolderClosed, ArrowLeft, X,
  AlertTriangle, RefreshCw, WifiOff
} from 'lucide-vue-next';

export default {
  name: 'CategoriasConveniosView',
  components: {
    DefaultLayout,
    PermissionCheck,
    LoadingSpinner,
    PlusCircle,
    Edit,
    Trash2,
    FolderClosed,
    ArrowLeft,
    X,
    AlertTriangle,
    RefreshCw,
    WifiOff
  },
  props: {
    idConvenio: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      categorias: [],
      loading: false,
      error: null,
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      saving: false,
      deleting: false,
      categoriaToDelete: null,
      categoriaForm: {
        nombre: '',
        descripcion: '',
        id_convenio: null
      },
      conveniosStore: null,
      categoriasStore: null,
      notificationStore: null,
      isServerAvailable: true
    };
  },
  computed: {
    convenioId() {
      return Number(this.idConvenio);
    },
    currentConvenio() {
      return this.conveniosStore?.getConvenioById(this.convenioId) || null;
    }
  },
  created() {
    this.conveniosStore = useConveniosStore();
    this.categoriasStore = useCategoriasConvenioStore();
    this.notificationStore = useNotificationStore();
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = null;

      try {
        if (!this.currentConvenio) {
          await this.conveniosStore.fetchConvenioById(this.convenioId);
        }

        this.categorias = await this.categoriasStore.fetchCategoriasByConvenio(this.convenioId);

        this.conveniosStore.updateCategorias(this.convenioId, this.categorias);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        this.error = err.message || 'Error al cargar los datos. Por favor, intente nuevamente.';
        this.notificationStore.error(this.error, 'Error');
      } finally {
        this.loading = false;
      }
    },

    goBack() {
      this.$router.push('/convenios');
    },

    showCreateModal() {
      if (this.loading) return;

      this.isEditing = false;
      this.categoriaForm = {
        nombre: '',
        descripcion: '',
        id_convenio: this.convenioId
      };
      this.showModal = true;
    },

    editCategoria(categoria) {
      if (this.loading) return;

      this.isEditing = true;
      this.categoriaForm = { ...categoria };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async saveCategoria() {
      const notificationStore = useNotificationStore();
      const conveniosStore = useConveniosStore();

      if (!this.isServerAvailable) {
        notificationStore.error(
            'No se pueden guardar categorías mientras el servidor no esté disponible',
            'Error de conexión'
        );
        return;
      }

      if (!this.categoriaForm.nombre) {
        notificationStore.error(
            'El nombre de la categoría es obligatorio',
            'Error de validación'
        );
        return;
      }

      this.saving = true;

      try {
        if (this.isEditing) {
          await this.categoriasStore.updateCategoria(
              this.categoriaForm.id_categoria,
              this.categoriaForm
          );
          notificationStore.success(
              `¡Categoría "${this.categoriaForm.nombre}" actualizada correctamente!`,
              "Categoría actualizada"
          );
        } else {
          const nuevaCategoria = await this.categoriasStore.createCategoria(this.categoriaForm);
          notificationStore.success(
              `¡Categoría "${nuevaCategoria.nombre}" creada correctamente!`,
              "Categoría creada"
          );
        }
        this.closeModal();

        await this.loadData();

        await conveniosStore.fetchConvenioById(this.convenioId);
      } catch (err) {
        console.error('Error al guardar la categoría:', err);

        let errorMessage = 'Error al guardar la categoría';

        if (err.code === 'ERR_NETWORK') {
          this.isServerAvailable = false;
          errorMessage = 'No se pudo establecer conexión con el servidor';
        } else if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        notificationStore.error(
            errorMessage,
            "Error al guardar"
        );
      } finally {
        this.saving = false;
      }
    },

    confirmDelete(categoria) {
      if (this.loading) return;

      this.categoriaToDelete = categoria;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.categoriaToDelete = null;
    },

    async deleteCategoria() {
      const notificationStore = useNotificationStore();
      const conveniosStore = useConveniosStore();

      if (!this.isServerAvailable) {
        notificationStore.error(
            'No se pueden eliminar categorías mientras el servidor no esté disponible',
            'Error de conexión'
        );
        return;
      }

      if (!this.categoriaToDelete) return;

      this.deleting = true;

      try {
        await this.categoriasStore.deleteCategoria(this.categoriaToDelete.id_categoria);
        notificationStore.success(
            `Categoría "${this.categoriaToDelete.nombre}" eliminada correctamente`,
            "Categoría eliminada"
        );
        this.closeDeleteModal();

        await this.loadData();

        await conveniosStore.fetchConvenioById(this.convenioId);
      } catch (err) {
        console.error('Error al eliminar la categoría:', err);

        let errorMessage = 'Error al eliminar la categoría';

        if (err.code === 'ERR_NETWORK') {
          this.isServerAvailable = false;
          errorMessage = 'No se pudo establecer conexión con el servidor';
        } else if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        notificationStore.error(
            errorMessage,
            "Error al eliminar"
        );
      } finally {
        this.deleting = false;
      }
    },

    closeModals() {
      this.closeModal();
      this.closeDeleteModal();
    }
  },
  beforeUnmount() {
    this.closeModals();
  }
};
</script>

<style scoped>
.categorias-page {
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
  padding: 2rem;
  text-align: center;
}

.error-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.btn-retry:hover {
  background-color: #e5e7eb;
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

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.btn-icon-only:hover:not(:disabled) {
  background-color: #f3f4f6;
  color: #111827;
}

.btn-icon-only:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.btn-icon:hover:not(:disabled) {
  background-color: #f3f4f6;
  color: #111827;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon.btn-danger {
  color: #ef4444;
  background-color: transparent;
  width: 2rem;
  height: 2rem;
  padding: 0;
}

.btn-icon.btn-danger:hover:not(:disabled) {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-icon.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon-only.btn-danger:hover:not(:disabled) {
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

.mt-4 {
  margin-top: 1rem;
}

@media (max-width: 767px) {
  .categorias-page {
    padding: 1rem;
  }
}
</style>
