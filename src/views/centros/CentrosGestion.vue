<template>
  <DefaultLayout>
    <div class="centros-page">
      <div class="page-header">
        <h1 class="page-title">Gestión de Centros</h1>
        <div class="page-actions">
          <permission-check :permiso="{ nombre: 'Master', tipo: 'Escritura' }">
            <button @click="showCreateModal" class="btn-primary">
              <PlusCircle class="btn-icon-primary" size="18" />
              Nuevo Centro
            </button>
          </permission-check>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="loading-container">
            <loading-spinner message="Cargando centros..." />
          </div>
          <div v-else-if="error" class="error-message">
            {{ error }}
          </div>
          <div v-else-if="centros.length === 0" class="empty-state">
            <Building2 size="48" class="empty-icon" />
            <h3>No hay centros registrados</h3>
            <p>Comienza creando un nuevo centro</p>
          </div>
          <div v-else class="table-container">
            <table class="data-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Zona</th>
                <th>Departamentos</th>
                <th>Acciones</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="centro in centros" :key="centro.id_centro">
                <td>{{ centro.id_centro }}</td>
                <td>{{ centro.nombre }}</td>
                <td>{{ centro.direccion || 'N/A' }}</td>
                <td>{{ centro.telefono || 'N/A' }}</td>
                <td>{{ centro.email || 'N/A' }}</td>
                <td>{{ centro.Zona?.nombre || 'N/A' }}</td>
                <td>
                  <router-link
                      :to="{ name: 'departamentos', params: { idCentro: centro.id_centro } }"
                      class="btn-departamentos"
                  >
                    <FolderClosed class="btn-icon-folder" size="16" />
                    <span>Departamentos ({{ centro.Departamentos?.length || 0 }})</span>
                    <ChevronRight class="btn-icon-right" size="14" />
                  </router-link>
                </td>
                <td>
                  <div class="action-buttons">
                    <permission-check :permiso="{ nombre: 'Master', tipo: 'Escritura' }">
                      <button @click="editCentro(centro)" class="btn-icon-only" title="Editar">
                        <Edit size="16" />
                      </button>
                      <button @click="confirmDelete(centro)" class="btn-icon btn-danger" title="Eliminar">
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

      <!-- Modal para crear/editar centro -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Editar Centro' : 'Nuevo Centro' }}</h2>
            <button @click="closeModal" class="modal-close">
              <X size="18" />
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCentro" class="form">
              <div class="form-group">
                <label for="nombre" class="form-label">Nombre</label>
                <input
                    id="nombre"
                    v-model="centroForm.nombre"
                    type="text"
                    class="form-input"
                    required
                />
              </div>
              <div class="form-group">
                <label for="direccion" class="form-label">Dirección</label>
                <input
                    id="direccion"
                    v-model="centroForm.direccion"
                    type="text"
                    class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="telefono" class="form-label">Teléfono</label>
                <input
                    id="telefono"
                    v-model="centroForm.telefono"
                    type="text"
                    class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input
                    id="email"
                    v-model="centroForm.email"
                    type="email"
                    class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="id_zona" class="form-label">Zona</label>
                <select
                    id="id_zona"
                    v-model="centroForm.id_zona"
                    class="form-input"
                >
                  <option value="">Seleccione una zona</option>
                  <option v-for="zona in zonas" :key="zona.id_zona" :value="zona.id_zona">
                    {{ zona.nombre }}
                  </option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn-secondary">Cancelar</button>
            <button @click="saveCentro" class="btn-primary" :disabled="saving">
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
            <p>¿Está seguro que desea eliminar el centro <strong>{{ centroToDelete?.nombre }}</strong>?</p>
            <p class="text-danger">Esta acción no se puede deshacer y eliminará todos los departamentos asociados.</p>
          </div>
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn-secondary">Cancelar</button>
            <button @click="deleteCentro" class="btn-danger" :disabled="deleting">
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
import { useCentrosStore } from '../../stores/centros';
import { useZonasStore } from '../../stores/zonas';
import { useNotificationStore } from '../../stores/notification';
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import PermissionCheck from '../../components/common/PermissionCheck.vue';
import LoadingSpinner from '../../components/common/LoadingSpinner.vue';
import { PlusCircle, Edit, Trash2, Building2, X, FolderClosed, ChevronRight } from 'lucide-vue-next';

export default {
  name: 'CentrosGestion',
  components: {
    DefaultLayout,
    PermissionCheck,
    LoadingSpinner,
    PlusCircle,
    Edit,
    Trash2,
    Building2,
    X,
    FolderClosed,
    ChevronRight
  },
  data() {
    return {
      loading: false,
      loadingZonas: false,
      error: null,
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      saving: false,
      deleting: false,
      centroToDelete: null,
      centroForm: {
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        id_zona: ''
      },
      zonas: []
    };
  },
  computed: {
    ...mapState(useCentrosStore, ['centros'])
  },
  methods: {
    ...mapActions(useCentrosStore, ['fetchCentros', 'createCentro', 'updateCentro', 'deleteCentro']),
    ...mapActions(useZonasStore, ['fetchZonas']),

    async loadCentros() {
      this.loading = true;
      this.error = null;

      try {
        await this.fetchCentros();
      } catch (err) {
        this.error = 'Error al cargar los centros. Por favor, intente nuevamente.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async loadZonas() {
      this.loadingZonas = true;

      try {
        this.zonas = await this.fetchZonas();
      } catch (err) {
        console.error('Error al cargar las zonas:', err);
      } finally {
        this.loadingZonas = false;
      }
    },

    showCreateModal() {
      this.isEditing = false;
      this.centroForm = {
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        id_zona: ''
      };
      this.showModal = true;
    },

    editCentro(centro) {
      this.isEditing = true;
      this.centroForm = {
        id_centro: centro.id_centro,
        nombre: centro.nombre,
        direccion: centro.direccion || '',
        telefono: centro.telefono || '',
        email: centro.email || '',
        id_zona: centro.id_zona || ''
      };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async saveCentro() {
      const notificationStore = useNotificationStore();

      if (!this.centroForm.nombre) {
        notificationStore.error(
            'El nombre del centro es obligatorio',
            'Error de validación'
        );
        return;
      }

      this.saving = true;

      try {
        if (this.isEditing) {
          await this.updateCentro(this.centroForm.id_centro, this.centroForm);
          notificationStore.success(
              `¡Centro "${this.centroForm.nombre}" actualizado correctamente!`,
              "Centro actualizado"
          );
        } else {
          const nuevoCentro = await this.createCentro(this.centroForm);
          notificationStore.success(
              `¡Centro "${nuevoCentro.nombre}" creado correctamente!`,
              "Centro creado"
          );
        }
        this.closeModal();
        await this.loadCentros();
      } catch (err) {
        notificationStore.error(
            err.message || 'Error al guardar el centro. Por favor, intente nuevamente.',
            "Error al guardar"
        );
      } finally {
        this.saving = false;
      }
    },

    confirmDelete(centro) {
      this.centroToDelete = centro;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.centroToDelete = null;
    },

    async deleteCentro() {
      const notificationStore = useNotificationStore();

      if (!this.centroToDelete) return;

      this.deleting = true;

      try {
        await this.deleteCentro(this.centroToDelete.id_centro);
        notificationStore.success(
            `Centro "${this.centroToDelete.nombre}" eliminado correctamente`,
            "Centro eliminado"
        );
        this.closeDeleteModal();
        await this.loadCentros();
      } catch (err) {
        notificationStore.error(
            err.message || 'Error al eliminar el centro. Por favor, intente nuevamente.',
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
  mounted() {
    this.loadCentros();
    this.loadZonas();
  },
  beforeUnmount() {
    this.closeModals();
  }
};
</script>

<style scoped>
.centros-page {
  padding: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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

/* Estilos para el botón de departamentos */
.btn-departamentos {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-departamentos:hover {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
}

.btn-icon-folder {
  color: #6b7280;
}

.btn-departamentos:hover .btn-icon-folder,
.btn-departamentos:hover .btn-icon-right {
  color: white;
}

.btn-icon-right {
  margin-left: auto;
  color: #9ca3af;
  transition: transform 0.2s;
}

.btn-departamentos:hover .btn-icon-right {
  transform: translateX(2px);
}

.btn-link {
  color: #dc2626;
  text-decoration: none;
  font-weight: 500;
}

.btn-link:hover {
  text-decoration: underline;
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
  .centros-page {
    padding: 1rem;
  }
}
</style>