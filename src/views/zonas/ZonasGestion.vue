<template>
  <DefaultLayout>
    <div class="zonas-page">
      <div class="page-header">
        <h1 class="page-title">Gestión de Zonas</h1>
        <div class="page-actions">
          <permission-check :permiso="{ nombre: 'Master', tipo: 'Escritura' }">
            <button @click="showCreateModal" class="btn-primary">
              <PlusCircle class="btn-icon-primary" size="18" />
              Nueva Zona
            </button>
          </permission-check>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="loading-container">
            <loading-spinner message="Cargando zonas..." />
          </div>
          <div v-else-if="error" class="error-message">
            {{ error }}
          </div>
          <div v-else-if="zonas.length === 0" class="empty-state">
            <MapPin size="48" class="empty-icon" />
            <h3>No hay zonas registradas</h3>
            <p>Comienza creando una nueva zona</p>
          </div>
          <div v-else class="table-container">
            <table class="data-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Centros</th>
                <th>Acciones</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="zona in zonas" :key="zona.id_zona">
                <td>{{ zona.id_zona }}</td>
                <td>{{ zona.nombre }}</td>
                <td>{{ zona.descripcion || 'N/A' }}</td>
                <td>
                  <span class="badge">{{ zona.Centros ? zona.Centros.length : 0 }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <permission-check :permiso="{ nombre: 'Master', tipo: 'Escritura' }">
                      <button @click="editZona(zona)" class="btn-icon-only" title="Editar">
                        <Edit size="16" />
                      </button>
                      <button @click="confirmDelete(zona)" class="btn-icon btn-danger" title="Eliminar">
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

      <!-- Modal para crear/editar zona -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Editar Zona' : 'Nueva Zona' }}</h2>
            <button @click="closeModal" class="modal-close">
              <X size="18" />
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveZona" class="form">
              <div class="form-group">
                <label for="nombre" class="form-label">Nombre</label>
                <input
                    id="nombre"
                    v-model="zonaForm.nombre"
                    type="text"
                    class="form-input"
                    required
                />
              </div>
              <div class="form-group">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea
                    id="descripcion"
                    v-model="zonaForm.descripcion"
                    class="form-textarea"
                    rows="3"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn-secondary">Cancelar</button>
            <button @click="saveZona" class="btn-primary" :disabled="saving">
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
            <p>¿Está seguro que desea eliminar la zona <strong>{{ zonaToDelete?.nombre }}</strong>?</p>
            <p class="text-danger">Esta acción no se puede deshacer.</p>
            <p v-if="zonaToDelete?.Centros && zonaToDelete.Centros.length > 0" class="text-danger">
              <strong>Advertencia:</strong> Esta zona tiene centros asociados. No podrá eliminarla hasta que reasigne o elimine estos centros.
            </p>
          </div>
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn-secondary">Cancelar</button>
            <button
                @click="deleteZona"
                class="btn-danger"
                :disabled="deleting || (zonaToDelete?.Centros && zonaToDelete.Centros.length > 0)"
            >
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
import { useZonasStore } from '../../stores/zonas';
import { useNotificationStore } from '../../stores/notification';
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import PermissionCheck from '../../components/common/PermissionCheck.vue';
import LoadingSpinner from '../../components/common/LoadingSpinner.vue';
import { PlusCircle, Edit, Trash2, MapPin, X } from 'lucide-vue-next';

export default {
  name: 'ZonasGestion',
  components: {
    DefaultLayout,
    PermissionCheck,
    LoadingSpinner,
    PlusCircle,
    Edit,
    Trash2,
    MapPin,
    X
  },
  data() {
    return {
      loading: false,
      error: null,
      showModal: false,
      showDeleteModal: false,
      isEditing: false,
      saving: false,
      deleting: false,
      zonaToDelete: null,
      zonaForm: {
        nombre: '',
        descripcion: ''
      }
    };
  },
  computed: {
    ...mapState(useZonasStore, ['zonas'])
  },
  methods: {
    ...mapActions(useZonasStore, ['fetchZonas', 'createZona', 'updateZona', 'deleteZona']),

    async loadZonas() {
      this.loading = true;
      this.error = null;

      try {
        await this.fetchZonas();
      } catch (err) {
        this.error = 'Error al cargar las zonas. Por favor, intente nuevamente.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    showCreateModal() {
      this.isEditing = false;
      this.zonaForm = {
        nombre: '',
        descripcion: ''
      };
      this.showModal = true;
    },

    editZona(zona) {
      this.isEditing = true;
      this.zonaForm = { ...zona };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async saveZona() {
      const notificationStore = useNotificationStore();

      if (!this.zonaForm.nombre) {
        notificationStore.error(
            'El nombre de la zona es obligatorio',
            'Error de validación'
        );
        return;
      }

      this.saving = true;

      try {
        if (this.isEditing) {
          await this.updateZona(this.zonaForm.id_zona, this.zonaForm);
          notificationStore.success(
              `¡Zona "${this.zonaForm.nombre}" actualizada correctamente!`,
              "Zona actualizada"
          );
        } else {
          const nuevaZona = await this.createZona(this.zonaForm);
          notificationStore.success(
              `¡Zona "${nuevaZona.nombre}" creada correctamente!`,
              "Zona creada"
          );
        }
        this.closeModal();
        await this.loadZonas();
      } catch (err) {
        notificationStore.error(
            err.message || 'Error al guardar la zona. Por favor, intente nuevamente.',
            "Error al guardar"
        );
      } finally {
        this.saving = false;
      }
    },

    confirmDelete(zona) {
      this.zonaToDelete = zona;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.zonaToDelete = null;
    },

    async deleteZona() {
      const notificationStore = useNotificationStore();

      if (!this.zonaToDelete) return;

      this.deleting = true;

      try {
        await this.deleteZona(this.zonaToDelete.id_zona);
        notificationStore.success(
            `Zona "${this.zonaToDelete.nombre}" eliminada correctamente`,
            "Zona eliminada"
        );
        this.closeDeleteModal();
        await this.loadZonas();
      } catch (err) {
        notificationStore.error(
            err.message || 'Error al eliminar la zona. Por favor, intente nuevamente.',
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
    this.loadZonas();
  },
  beforeUnmount() {
    this.closeModals();
  }
};
</script>

<style scoped>
.zonas-page {
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

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #4b5563;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
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
  .zonas-page {
    padding: 1rem;
  }
}
</style>