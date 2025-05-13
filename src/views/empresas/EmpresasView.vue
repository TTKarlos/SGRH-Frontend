<template>
  <DefaultLayout>
    <div class="empresas-view">
      <!-- Header -->
      <div class="page-header">
        <div class="header-title">
          <h1>Empresas</h1>
          <p class="description">Gestión de empresas del sistema</p>
        </div>
        <div class="header-actions">
          <button @click="openModal()" class="btn btn-primary" :disabled="loading">
            <i class="lucide-plus"></i>
            Nueva Empresa
          </button>
          <button @click="refreshData" class="btn btn-outline" :disabled="loading">
            <i class="lucide-refresh-cw"></i>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card">
        <div class="card-body filter-section">
          <div class="filter-grid">
            <div class="form-group">
              <label>Buscar</label>
              <div class="search-input">
                <input
                    type="text"
                    v-model="filtros.search"
                    placeholder="Buscar por nombre, CIF o email..."
                    class="form-control"
                />
                <i class="lucide-search search-icon"></i>
              </div>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="filtros.activo" class="form-control">
                <option :value="null">Todos</option>
                <option :value="true">Activas</option>
                <option :value="false">Inactivas</option>
              </select>
            </div>
          </div>
          <div class="filter-actions">
            <button @click="aplicarFiltros" class="btn btn-primary" :disabled="loading">
              <i class="lucide-search icon-sm"></i>
              Filtrar
            </button>
            <button @click="limpiarFiltros" class="btn btn-outline" :disabled="loading">
              <i class="lucide-x icon-sm"></i>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de datos -->
      <div class="card">
        <div class="card-body">
          <div class="table-container">
            <table class="data-table">
              <thead>
              <tr>
                <th>Nombre</th>
                <th>CIF/NIF</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
              </thead>
              <tbody v-if="!loading && empresas.length > 0">
              <tr v-for="empresa in empresas" :key="empresa.id_empresa">
                <td>{{ empresa.nombre }}</td>
                <td>{{ empresa.cif || 'N/A' }}</td>
                <td>{{ empresa.telefono || 'N/A' }}</td>
                <td>{{ empresa.email || 'N/A' }}</td>
                <td>
                    <span
                        :class="[
                        'status-badge',
                        empresa.activo ? 'status-active' : 'status-inactive'
                      ]"
                    >
                      {{ empresa.activo ? 'Activa' : 'Inactiva' }}
                    </span>
                </td>
                <td class="text-center">
                  <div class="action-buttons-inline">
                    <button @click="viewEmpresa(empresa)" class="btn-icon btn-info">
                      <i class="lucide-eye icon-sm"></i>
                    </button>
                    <button @click="editEmpresa(empresa)" class="btn-icon btn-warning">
                      <i class="lucide-edit icon-sm"></i>
                    </button>
                    <button @click="toggleEstado(empresa)" class="btn-icon" :class="empresa.activo ? 'btn-danger' : 'btn-success'">
                      <i class="lucide-power icon-sm"></i>
                    </button>
                    <button @click="confirmDelete(empresa)" class="btn-icon btn-danger">
                      <i class="lucide-trash icon-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
              <tbody v-else-if="loading">
              <tr>
                <td colspan="6" class="loading-state">
                  <div class="loading-indicator">
                    <i class="lucide-loader loading-spinner"></i>
                  </div>
                  <p class="loading-text">Cargando empresas...</p>
                </td>
              </tr>
              </tbody>
              <tbody v-else>
              <tr>
                <td colspan="6" class="empty-state">
                  <i class="lucide-building empty-icon"></i>
                  <p class="empty-text">No se encontraron empresas</p>
                  <button @click="openModal()" class="btn btn-primary mt-4">
                    <i class="lucide-plus icon-sm"></i>
                    Crear Empresa
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <div class="pagination-info">
          Mostrando {{ pagination.page }} de {{ pagination.totalPages }} páginas
          ({{ pagination.totalItems }} registros)
        </div>
        <div class="pagination-controls">
          <button
              @click="cambiarPagina(1)"
              class="btn btn-outline btn-sm"
              :disabled="pagination.page <= 1 || loading"
          >
            <i class="lucide-chevrons-left icon-sm"></i>
          </button>
          <button
              @click="cambiarPagina(pagination.page - 1)"
              class="btn btn-outline btn-sm"
              :disabled="pagination.page <= 1 || loading"
          >
            <i class="lucide-chevron-left icon-sm"></i>
          </button>
          <span class="pagination-current">{{ pagination.page }}</span>
          <button
              @click="cambiarPagina(pagination.page + 1)"
              class="btn btn-outline btn-sm"
              :disabled="pagination.page >= pagination.totalPages || loading"
          >
            <i class="lucide-chevron-right icon-sm"></i>
          </button>
          <button
              @click="cambiarPagina(pagination.totalPages)"
              class="btn btn-outline btn-sm"
              :disabled="pagination.page >= pagination.totalPages || loading"
          >
            <i class="lucide-chevrons-right icon-sm"></i>
          </button>
        </div>
      </div>

      <!-- Modal de Empresa -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Editar empresa' : 'Nueva empresa' }}</h3>
            <button @click="closeModal" class="btn-close">
              <i class="lucide-x"></i>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="saveEmpresa">
              <!-- Nombre -->
              <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                    id="nombre"
                    v-model="empresaForm.nombre"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.nombre }"
                    required
                />
                <div v-if="validationErrors.nombre" class="invalid-feedback">
                  {{ validationErrors.nombre }}
                </div>
              </div>

              <!-- CIF/NIF -->
              <div class="form-group">
                <label for="cif">CIF/NIF *</label>
                <input
                    id="cif"
                    v-model="empresaForm.cif"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.cif }"
                    required
                />
                <div v-if="validationErrors.cif" class="invalid-feedback">
                  {{ validationErrors.cif }}
                </div>
              </div>

              <!-- Dirección -->
              <div class="form-group">
                <label for="direccion">Dirección</label>
                <textarea
                    id="direccion"
                    v-model="empresaForm.direccion"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.direccion }"
                    rows="2"
                ></textarea>
                <div v-if="validationErrors.direccion" class="invalid-feedback">
                  {{ validationErrors.direccion }}
                </div>
              </div>

              <!-- Teléfono -->
              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input
                    id="telefono"
                    v-model="empresaForm.telefono"
                    type="tel"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.telefono }"
                />
                <div v-if="validationErrors.telefono" class="invalid-feedback">
                  {{ validationErrors.telefono }}
                </div>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label for="email">Email</label>
                <input
                    id="email"
                    v-model="empresaForm.email"
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.email }"
                />
                <div v-if="validationErrors.email" class="invalid-feedback">
                  {{ validationErrors.email }}
                </div>
              </div>

              <!-- Estado -->
              <div class="form-group">
                <label for="activo">Estado</label>
                <div class="toggle-switch">
                  <input
                      type="checkbox"
                      id="activo"
                      v-model="empresaForm.activo"
                      class="toggle-input"
                  />
                  <label for="activo" class="toggle-label"></label>
                  <span class="toggle-text">{{ empresaForm.activo ? 'Activa' : 'Inactiva' }}</span>
                </div>
              </div>

              <!-- Error general -->
              <div v-if="validationErrors.general" class="alert alert-danger">
                {{ validationErrors.general }}
              </div>

              <div class="modal-footer">
                <button
                    type="button"
                    @click="closeModal"
                    class="btn btn-secondary"
                    :disabled="saving"
                >
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="saving || !isFormValid">
                  <span v-if="saving">
                    <i class="lucide-loader icon-sm spinner"></i>
                    Guardando...
                  </span>
                  <span v-else>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de Visualización de Empresa -->
      <div v-if="showViewModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detalles de la Empresa</h3>
            <button @click="closeViewModal" class="btn-close">
              <i class="lucide-x"></i>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="empresaSeleccionada" class="detail-content">
              <div class="detail-section">
                <h4 class="section-subtitle">Información General</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <h5 class="detail-label">Nombre</h5>
                    <p class="detail-value">{{ empresaSeleccionada.nombre }}</p>
                  </div>
                  <div class="detail-item">
                    <h5 class="detail-label">CIF/NIF</h5>
                    <p class="detail-value">{{ empresaSeleccionada.cif || 'N/A' }}</p>
                  </div>
                  <div class="detail-item">
                    <h5 class="detail-label">Estado</h5>
                    <p class="detail-value">
                      <span
                          :class="[
                          'status-badge',
                          empresaSeleccionada.activo ? 'status-active' : 'status-inactive'
                        ]"
                      >
                        {{ empresaSeleccionada.activo ? 'Activa' : 'Inactiva' }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-subtitle">Contacto</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <h5 class="detail-label">Dirección</h5>
                    <p class="detail-value">{{ empresaSeleccionada.direccion || 'N/A' }}</p>
                  </div>
                  <div class="detail-item">
                    <h5 class="detail-label">Teléfono</h5>
                    <p class="detail-value">{{ empresaSeleccionada.telefono || 'N/A' }}</p>
                  </div>
                  <div class="detail-item">
                    <h5 class="detail-label">Email</h5>
                    <p class="detail-value">{{ empresaSeleccionada.email || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <div v-if="empresaStats" class="detail-section">
                <h4 class="section-subtitle">Estadísticas</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">{{ empresaStats.totalEmpleados || 0 }}</div>
                    <div class="stat-label">Empleados</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ empresaStats.totalContratos || 0 }}</div>
                    <div class="stat-label">Contratos</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ empresaStats.contratosActivos || 0 }}</div>
                    <div class="stat-label">Contratos Activos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="editEmpresa(empresaSeleccionada)" class="btn btn-warning">
              <i class="lucide-edit icon-sm"></i>
              Editar
            </button>
            <button @click="closeViewModal" class="btn btn-outline">
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmación -->
      <div v-if="showConfirmDialog" class="modal-overlay">
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h3>{{ confirmAction === 'delete' ? 'Eliminar empresa' : 'Cambiar estado' }}</h3>
            <button @click="closeConfirmDialog" class="btn-close">
              <i class="lucide-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <p v-if="confirmAction === 'delete'">
              ¿Está seguro de que desea eliminar la empresa <strong>{{ empresaSeleccionada?.nombre }}</strong>?
              <br>
              Esta acción no se puede deshacer.
            </p>
            <p v-else-if="confirmAction === 'toggle'">
              ¿Está seguro de que desea {{ empresaSeleccionada?.activo ? 'desactivar' : 'activar' }} la empresa <strong>{{ empresaSeleccionada?.nombre }}</strong>?
            </p>
          </div>
          <div class="modal-footer">
            <button @click="closeConfirmDialog" class="btn btn-secondary">
              Cancelar
            </button>
            <button
                v-if="confirmAction === 'delete'"
                @click="deleteEmpresa"
                class="btn btn-danger"
                :disabled="processing"
            >
              <span v-if="processing">
                <i class="lucide-loader icon-sm spinner"></i>
                Eliminando...
              </span>
              <span v-else>Eliminar</span>
            </button>
            <button
                v-else-if="confirmAction === 'toggle'"
                @click="confirmToggleEstado"
                class="btn"
                :class="empresaSeleccionada?.activo ? 'btn-danger' : 'btn-success'"
                :disabled="processing"
            >
              <span v-if="processing">
                <i class="lucide-loader icon-sm spinner"></i>
                Procesando...
              </span>
              <span v-else>{{ empresaSeleccionada?.activo ? 'Desactivar' : 'Activar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script>
import DefaultLayout from '@/layouts/DefaultLayout.vue';

export default {
  name: 'EmpresasView',

  components: {
    DefaultLayout
  },

  data() {
    return {
      empresas: [],
      loading: false,
      showModal: false,
      showViewModal: false,
      showConfirmDialog: false,
      empresaSeleccionada: null,
      empresaForm: {
        id_empresa: null,
        nombre: '',
        cif: '',
        direccion: '',
        telefono: '',
        email: '',
        activo: true
      },
      validationErrors: {},
      saving: false,
      processing: false,
      confirmAction: '',
      empresaStats: null,

      filtros: {
        search: '',
        activo: null,
        page: 1,
        limit: 10
      },

      pagination: {
        page: 1,
        totalPages: 0,
        totalItems: 0,
        limit: 10
      }
    };
  },

  computed: {
    isEditing() {
      return !!this.empresaForm.id_empresa;
    },

    isFormValid() {
      return this.empresaForm.nombre.trim() !== '' && this.empresaForm.cif.trim() !== '';
    }
  },

  methods: {
    async loadEmpresas() {
      this.loading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = {
          data: [
            {
              id_empresa: 1,
              nombre: 'Empresa A',
              cif: 'A12345678',
              direccion: 'Calle Principal 123',
              telefono: '912345678',
              email: 'contacto@empresaa.com',
              activo: true
            },
            {
              id_empresa: 2,
              nombre: 'Empresa B',
              cif: 'B87654321',
              direccion: 'Avenida Secundaria 456',
              telefono: '987654321',
              email: 'info@empresab.com',
              activo: true
            },
            {
              id_empresa: 3,
              nombre: 'Empresa C',
              cif: 'C11223344',
              direccion: 'Plaza Mayor 789',
              telefono: '911223344',
              email: 'contacto@empresac.com',
              activo: false
            }
          ],
          page: 1,
          totalPages: 1,
          totalItems: 3,
          limit: 10
        };

        this.empresas = response.data;

        this.pagination = {
          page: response.page,
          totalPages: response.totalPages,
          totalItems: response.totalItems,
          limit: response.limit
        };
      } catch (error) {
        console.error('Error al cargar empresas:', error);
        this.$store.dispatch('notification/error', 'Error al cargar las empresas');
      } finally {
        this.loading = false;
      }
    },

    refreshData() {
      this.loadEmpresas();
    },

    aplicarFiltros() {
      this.filtros.page = 1;
      this.loadEmpresas();
    },

    limpiarFiltros() {
      this.filtros = {
        search: '',
        activo: null,
        page: 1,
        limit: 10
      };
      this.loadEmpresas();
    },

    cambiarPagina(page) {
      this.filtros.page = page;
      this.loadEmpresas();
    },

    openModal(empresa = null) {
      this.validationErrors = {};

      if (empresa) {
        this.empresaForm = { ...empresa };
      } else {
        this.empresaForm = {
          id_empresa: null,
          nombre: '',
          cif: '',
          direccion: '',
          telefono: '',
          email: '',
          activo: true
        };
      }

      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.empresaForm = {
        id_empresa: null,
        nombre: '',
        cif: '',
        direccion: '',
        telefono: '',
        email: '',
        activo: true
      };
      this.validationErrors = {};
    },

    async saveEmpresa() {
      if (!this.isFormValid) return;

      this.saving = true;
      this.validationErrors = {};

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (this.isEditing) {
          const index = this.empresas.findIndex(e => e.id_empresa === this.empresaForm.id_empresa);
          if (index !== -1) {
            this.empresas.splice(index, 1, { ...this.empresaForm });
          }
          this.$store.dispatch('notification/success', 'Empresa actualizada correctamente');
        } else {
          const newId = Math.max(0, ...this.empresas.map(e => e.id_empresa)) + 1;
          this.empresas.push({
            ...this.empresaForm,
            id_empresa: newId
          });
          this.$store.dispatch('notification/success', 'Empresa creada correctamente');
        }

        this.closeModal();
        this.loadEmpresas();
      } catch (error) {
        console.error('Error al guardar empresa:', error);

        this.validationErrors = {
          general: 'Error al guardar la empresa'
        };

        this.$store.dispatch('notification/error', 'Error al guardar la empresa');
      } finally {
        this.saving = false;
      }
    },

    async viewEmpresa(empresa) {
      this.empresaSeleccionada = empresa;
      this.showViewModal = true;

      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        this.empresaStats = {
          totalEmpleados: Math.floor(Math.random() * 100),
          totalContratos: Math.floor(Math.random() * 150),
          contratosActivos: Math.floor(Math.random() * 50)
        };
      } catch (error) {
        console.error('Error al cargar estadísticas de la empresa:', error);
        this.empresaStats = null;
      }
    },

    closeViewModal() {
      this.showViewModal = false;
      this.empresaSeleccionada = null;
      this.empresaStats = null;
    },

    editEmpresa(empresa) {
      this.closeViewModal();
      this.openModal(empresa);
    },

    confirmDelete(empresa) {
      this.empresaSeleccionada = empresa;
      this.confirmAction = 'delete';
      this.showConfirmDialog = true;
    },

    async deleteEmpresa() {
      if (!this.empresaSeleccionada) return;

      this.processing = true;

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.empresas = this.empresas.filter(
            e => e.id_empresa !== this.empresaSeleccionada.id_empresa
        );

        this.$store.dispatch('notification/success', 'Empresa eliminada correctamente');
        this.closeConfirmDialog();
        this.loadEmpresas();
      } catch (error) {
        console.error('Error al eliminar empresa:', error);
        this.$store.dispatch('notification/error', 'Error al eliminar la empresa');
      } finally {
        this.processing = false;
      }
    },

    toggleEstado(empresa) {
      this.empresaSeleccionada = empresa;
      this.confirmAction = 'toggle';
      this.showConfirmDialog = true;
    },

      async confirmToggleEstado() {
        if (!this.empresaSeleccionada) return;

        this.processing = true;

        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const nuevoEstado = !this.empresaSeleccionada.activo;

          const index = this.empresas.findIndex(
              e => e.id_empresa === this.empresaSeleccionada.id_empresa
          );

          if (index !== -1) {
            this.empresas[index].activo = nuevoEstado;
          }

          this.$store.dispatch(
              'notification/success',
              `Empresa ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`
          );

          this.closeConfirmDialog();
          this.loadEmpresas();
        } catch (error) {
          console.error('Error al cambiar estado de la empresa:', error);
          this.$store.dispatch('notification/error', 'Error al cambiar el estado de la empresa');
        } finally {
          this.processing = false;
        }
      },

      closeConfirmDialog() {
        this.showConfirmDialog = false;
        this.empresaSeleccionada = null;
        this.confirmAction = '';
      }
    },

    mounted() {
      this.loadEmpresas();
    }
  };
</script>

<style scoped>
.empresas-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.description {
  color: #6b7280;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.card-body {
  padding: 1.5rem;
}

.filter-section {
  background-color: #f9fafb;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
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

.search-input {
  position: relative;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 1rem;
  height: 1rem;
}

.form-control {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #111827;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #4b5563;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.data-table tr:hover {
  background-color: #f9fafb;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.status-active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.status-inactive {
  background-color: #f3f4f6;
  color: #4b5563;
}

.action-buttons-inline {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
  color: #dc2626;
}

.loading-text {
  color: #6b7280;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: #d1d5db;
}

.empty-text {
  color: #6b7280;
  margin-bottom: 1rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-current {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  font-weight: 500;
  color: #111827;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-sm {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #dc2626;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.toggle-switch {
  display: flex;
  align-items: center;
}

.toggle-input {
  display: none;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background-color: white;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle-input:checked + .toggle-label {
  background-color: #dc2626;
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(1.5rem);
}

.toggle-text {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.alert {
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
}

.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-outline {
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
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

.btn-warning {
  background-color: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background-color: #d97706;
}

.btn-info {
  background-color: #3b82f6;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-icon {
  padding: 0.375rem;
  border-radius: 0.375rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.icon-sm {
  width: 1rem;
  height: 1rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

.text-center {
  text-align: center;
}

.mt-4 {
  margin-top: 1rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>