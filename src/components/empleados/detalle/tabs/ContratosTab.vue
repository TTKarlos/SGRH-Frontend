<template>
  <div class="tab-panel">
    <div class="card">
      <div class="card-header">
        <div class="card-header-content">
          <div>
            <h2 class="section-title">Contratos</h2>
            <div v-if="estadisticas" class="statistics">
              <p>Total: {{ estadisticas.total }} contrato(s)</p>
              <p v-if="estadisticas.vigente" class="status-active">
                Contrato vigente: {{ estadisticas.contratoVigente?.TipoContrato?.nombre }}
              </p>
              <p v-else class="status-warning">Sin contrato vigente</p>
            </div>
          </div>
          <div class="action-buttons">
            <permission-check :permiso="{ nombre: 'Contratos', tipo: 'Escritura' }">
              <button @click="openModal" class="btn btn-primary" :disabled="loading">
                <PlusIcon size="18" class="btn-icon" />
                Nuevo Contrato
              </button>
            </permission-check>
          </div>
        </div>
      </div>

      <div class="card-body">
        <!-- Estado de carga -->
        <div v-if="loading" class="loading-container">
          <Loader size="32" class="animate-spin" />
          <p>Cargando contratos...</p>
        </div>

        <!-- Estado vacío -->
        <div v-else-if="!contratos || contratos.length === 0" class="empty-state">
          <FileTextIcon size="48" class="empty-icon" />
          <h3>Sin contratos registrados</h3>
          <p>Este empleado no tiene contratos registrados.</p>
        </div>

        <!-- Lista de contratos -->
        <div v-else class="contratos-list">
          <div v-for="contrato in contratos" :key="contrato.id_contrato" class="contrato-item">
            <div class="contrato-header">
              <div class="contrato-title">
                <h3>{{ contrato.TipoContrato?.nombre || 'N/A' }}</h3>
                <span
                    class="contrato-badge"
                    :class="isContratoVigente(contrato) ? 'badge-success' : 'badge-inactive'"
                >
                {{ isContratoVigente(contrato) ? 'Vigente' : 'Finalizado' }}
              </span>
              </div>
              <div class="contrato-actions">
                <button @click="viewContrato(contrato)" class="btn-icon-only" title="Ver detalles">
                  <EyeIcon size="16" />
                </button>
                <permission-check :permiso="{ nombre: 'Contratos', tipo: 'Escritura' }">
                  <button @click="editContrato(contrato)" class="btn-icon-only" title="Editar">
                    <EditIcon size="16" />
                  </button>
                </permission-check>
                <button
                    v-if="contrato.ruta_archivo"
                    @click="downloadDocumento(contrato.id_contrato)"
                    class="btn-icon-only"
                    title="Descargar"
                >
                  <DownloadIcon size="16" />
                </button>
                <permission-check :permiso="{ nombre: 'Contratos', tipo: 'Escritura' }">
                  <button @click="confirmDelete(contrato)" class="btn-icon-only btn-danger" title="Eliminar">
                    <Trash2Icon size="16" />
                  </button>
                </permission-check>
              </div>
            </div>

            <div class="contrato-info">
              <div class="contrato-info-item">
                <BuildingIcon size="14" />
                <span>{{ contrato.Empresa?.nombre || 'N/A' }}</span>
              </div>
              <div class="contrato-info-item">
                <CalendarIcon size="14" />
                <span>Inicio: {{ formatDate(contrato.fecha_inicio) }}</span>
              </div>
              <div class="contrato-info-item">
                <CalendarCheckIcon size="14" />
                <span>Fin: {{ contrato.fecha_fin ? formatDate(contrato.fecha_fin) : 'Indefinido' }}</span>
              </div>
              <div v-if="contrato.Convenio" class="contrato-info-item">
                <BookOpenIcon size="14" />
                <span>{{ contrato.Convenio.nombre }}</span>
                <span v-if="contrato.CategoriaConvenio">({{ contrato.CategoriaConvenio.nombre }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="paginationInfo && paginationInfo.totalPages > 1" class="pagination">
          <div class="pagination-info">
            Mostrando {{ paginationInfo.page }} de {{ paginationInfo.totalPages }} páginas
          </div>
          <div class="pagination-controls">
            <button
                @click="cambiarPagina(paginationInfo.page - 1)"
                class="btn-icon-only"
                :disabled="paginationInfo.page <= 1 || loading"
            >
              <ChevronLeftIcon size="16" />
            </button>
            <button
                @click="cambiarPagina(paginationInfo.page + 1)"
                class="btn-icon-only"
                :disabled="paginationInfo.page >= paginationInfo.totalPages || loading"
            >
              <ChevronRightIcon size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Contrato -->
    <ContratoModal
        v-if="showModal"
        :contrato="contratoSeleccionado"
        :id-empleado="idEmpleado"
        :loading="loadingAction"
        :validation-errors="validationErrors"
        :tipos-contrato="tiposContrato"
        :empresas="empresas"
        :convenios="convenios"
        :categorias="categoriasFiltradas"
        @close="closeModal"
        @save="saveContrato"
        @validation-error="handleValidationError"
        @convenio-change="handleConvenioChange"
    />

    <!-- Modal de Confirmación de Eliminación -->
    <div v-if="showConfirmDialog" class="modal-overlay">
      <div class="modal-container confirm-modal">
        <div class="modal-header">
          <h3>Eliminar Contrato</h3>
          <button @click="showConfirmDialog = false" class="btn-close">
            <X size="18" />
          </button>
        </div>
        <div class="modal-body">
          <AlertTriangleIcon size="32" class="confirm-icon" />
          <p>¿Está seguro de que desea eliminar este contrato?</p>
          <p class="confirm-warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="showConfirmDialog = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="deleteContrato" class="btn btn-danger" :disabled="loadingAction">
            <Loader v-if="loadingAction" size="18" class="btn-icon animate-spin" />
            <Trash2Icon v-else size="18" class="btn-icon" />
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Visualización de Contrato -->
    <div v-if="showViewerModal" class="modal-overlay">
      <div class="modal-container viewer-modal">
        <div class="modal-header">
          <h3>Detalles del Contrato</h3>
          <button @click="closeViewerModal" class="btn-close">
            <X size="18" />
          </button>
        </div>
        <div class="modal-body">
          <div v-if="contratoSeleccionado" class="detail-content">
            <!-- Información básica -->
            <div class="detail-section">
              <h4 class="detail-section-title">Información General</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <h5 class="detail-label">Empleado</h5>
                  <p class="detail-value">{{ empleadoInfo?.nombre }} {{ empleadoInfo?.apellidos }}</p>
                </div>
                <div class="detail-item">
                  <h5 class="detail-label">Tipo de Contrato</h5>
                  <p class="detail-value">{{ contratoSeleccionado.TipoContrato?.nombre || 'N/A' }}</p>
                </div>
                <div class="detail-item">
                  <h5 class="detail-label">Empresa</h5>
                  <p class="detail-value">{{ contratoSeleccionado.Empresa?.nombre || 'N/A' }}</p>
                </div>
                <div class="detail-item">
                  <h5 class="detail-label">Estado</h5>
                  <p class="detail-value">
                  <span
                      class="contrato-badge"
                      :class="isContratoVigente(contratoSeleccionado) ? 'badge-success' : 'badge-inactive'"
                  >
                    {{ isContratoVigente(contratoSeleccionado) ? 'Vigente' : 'Finalizado' }}
                  </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Fechas -->
            <div class="detail-section">
              <h4 class="detail-section-title">Fechas</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <h5 class="detail-label">Fecha de Inicio</h5>
                  <p class="detail-value">{{ formatDate(contratoSeleccionado.fecha_inicio) }}</p>
                </div>
                <div class="detail-item">
                  <h5 class="detail-label">Fecha de Fin</h5>
                  <p class="detail-value">{{ contratoSeleccionado.fecha_fin ? formatDate(contratoSeleccionado.fecha_fin) : 'Indefinido' }}</p>
                </div>
                <div class="detail-item">
                  <h5 class="detail-label">Fin Periodo de Prueba</h5>
                  <p class="detail-value">{{ contratoSeleccionado.fin_periodo_prueba ? formatDate(contratoSeleccionado.fin_periodo_prueba) : 'N/A' }}</p>
                </div>
                <div class="detail-item">
                  <h5 class="detail-label">Antigüedad</h5>
                  <p class="detail-value">{{ contratoSeleccionado.antiguedad_contrato || 0 }} días</p>
                </div>
              </div>
            </div>

            <!-- Información del convenio -->
            <div v-if="contratoSeleccionado.Convenio" class="detail-section">
              <h4 class="detail-section-title">Información del Convenio</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <h5 class="detail-label">Convenio</h5>
                  <p class="detail-value">{{ contratoSeleccionado.Convenio.nombre }}</p>
                </div>
                <div v-if="contratoSeleccionado.CategoriaConvenio" class="detail-item">
                  <h5 class="detail-label">Categoría</h5>
                  <p class="detail-value">{{ contratoSeleccionado.CategoriaConvenio.nombre }}</p>
                </div>
              </div>
            </div>

            <!-- Observaciones -->
            <div v-if="contratoSeleccionado.observaciones" class="detail-section">
              <h4 class="detail-section-title">Observaciones</h4>
              <p class="detail-text">{{ contratoSeleccionado.observaciones }}</p>
            </div>

            <!-- Documento adjunto -->
            <div v-if="contratoSeleccionado.ruta_archivo" class="detail-section">
              <h4 class="detail-section-title">Documento Adjunto</h4>
              <div class="document-item">
                <FileTextIcon size="24" class="document-icon" />
                <div class="document-info">
                  <p class="document-name">{{ contratoSeleccionado.nombre_original || 'Documento de contrato' }}</p>
                  <p class="document-size">{{ formatFileSize(contratoSeleccionado.tamano) }}</p>
                </div>
                <div class="document-actions">
                  <button @click="downloadDocumento(contratoSeleccionado.id_contrato)" class="btn btn-sm btn-primary">
                    <DownloadIcon size="14" class="btn-icon" />
                    Descargar
                  </button>
                  <button @click="previewDocumento(contratoSeleccionado.id_contrato)" class="btn btn-sm btn-secondary">
                    <EyeIcon size="14" class="btn-icon" />
                    Previsualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <permission-check :permiso="{ nombre: 'Contratos', tipo: 'Escritura' }">
            <button @click="editContrato(contratoSeleccionado)" class="btn btn-primary">
              <EditIcon size="18" class="btn-icon" />
              Editar
            </button>
          </permission-check>
          <button @click="closeViewerModal" class="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  PlusIcon,
  EyeIcon,
  EditIcon,
  DownloadIcon,
  Trash2 as Trash2Icon,
  Loader,
  FileText as FileTextIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  X,
  AlertTriangle as AlertTriangleIcon,
  Calendar as CalendarIcon,
  CalendarCheck as CalendarCheckIcon,
  Building as BuildingIcon,
  BookOpen as BookOpenIcon
} from 'lucide-vue-next';
import ContratoModal from '../modals/ContratoModal.vue';
import { useContratosStore } from '../../../../stores/contratos';
import { useTiposContratoStore } from '../../../../stores/tiposContrato';
import { useEmpresasStore } from '../../../../stores/empresas';
import { useConveniosStore } from '../../../../stores/convenios';
import { useCategoriasConvenioStore } from '../../../../stores/categoriasConvenio';
import { storeToRefs } from 'pinia';
import PermissionCheck from "../../../common/PermissionCheck.vue";

export default {
  name: 'ContratosTab',

  components: {
    PermissionCheck,
    ContratoModal,
    PlusIcon,
    EyeIcon,
    EditIcon,
    DownloadIcon,
    Trash2Icon,
    Loader,
    FileTextIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    X,
    AlertTriangleIcon,
    CalendarIcon,
    CalendarCheckIcon,
    BuildingIcon,
    BookOpenIcon
  },

  props: {
    contratos: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    idEmpleado: {
      type: [Number, String],
      required: true
    }
  },

  emits: ['refresh'],

  setup() {
    const contratosStore = useContratosStore();
    const tiposContratoStore = useTiposContratoStore();
    const empresasStore = useEmpresasStore();
    const conveniosStore = useConveniosStore();
    const categoriasConvenioStore = useCategoriasConvenioStore();

    const { empleadoInfo, pagination: paginationInfo } = storeToRefs(contratosStore);

    return {
      contratosStore,
      tiposContratoStore,
      empresasStore,
      conveniosStore,
      categoriasConvenioStore,
      empleadoInfo,
      paginationInfo
    };
  },

  data() {
    return {
      showModal: false,
      showConfirmDialog: false,
      showViewerModal: false,
      contratoSeleccionado: null,
      loadingAction: false,
      validationErrors: {},
      tiposContrato: [],
      empresas: [],
      convenios: [],
      categorias: {},
      selectedConvenioId: null,
      estadisticas: null
    };
  },

  computed: {
    categoriasFiltradas() {
      if (!this.selectedConvenioId) return [];
      return this.categorias[this.selectedConvenioId] || [];
    }
  },

  mounted() {
    this.initializeData();
  },

  watch: {
    contratos: {
      handler() {
        this.calcularEstadisticas();
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    async initializeData() {
      await this.cargarEntidadesFaltantes();
      this.calcularEstadisticas();
    },

    calcularEstadisticas() {
      if (!this.contratos?.length) {
        this.estadisticas = null;
        return;
      }

      const total = this.contratos.length;
      const contratoVigente = this.contratos.find(c =>
          c.fecha_fin === null || new Date(c.fecha_fin) >= new Date()
      );

      this.estadisticas = {
        total,
        vigente: !!contratoVigente,
        contratoVigente
      };
    },

    openModal() {
      console.log('Opening modal for new contract');
      this.contratoSeleccionado = null;
      this.validationErrors = {};
      this.selectedConvenioId = null;
      this.showModal = true;
    },

    closeModal() {
      console.log('Closing modal');
      this.showModal = false;
      this.contratoSeleccionado = null;
      this.validationErrors = {};
      this.selectedConvenioId = null;
    },

    viewContrato(contrato) {
      this.contratoSeleccionado = contrato;
      this.showViewerModal = true;
    },

    closeViewerModal() {
      this.showViewerModal = false;
      this.contratoSeleccionado = null;
    },

    editContrato(contrato) {
      console.log('Editing contract:', contrato);
      this.contratoSeleccionado = { ...contrato };
      this.selectedConvenioId = contrato.id_convenio;
      this.validationErrors = {};

      if (this.showViewerModal) {
        this.showViewerModal = false;
      }

      if (contrato.id_convenio && !this.categorias[contrato.id_convenio]) {
        this.loadCategoriasForConvenio(contrato.id_convenio);
      }

      this.showModal = true;
    },

    handleValidationError({ type, message }) {
      console.log('Validation error:', type, message);
      this.validationErrors = {
        ...this.validationErrors,
        [type]: message
      };
    },

    handleConvenioChange(convenioId) {
      console.log('Convenio changed:', convenioId);
      this.selectedConvenioId = convenioId;
      if (convenioId) {
        this.loadCategoriasForConvenio(convenioId);
      }
    },

    async loadCategoriasForConvenio(convenioId) {
      if (!convenioId || this.categorias[convenioId]) return;

      try {
        const categoriasData = await this.categoriasConvenioStore.fetchCategoriasByConvenio(convenioId);
        this.categorias = {
          ...this.categorias,
          [convenioId]: categoriasData
        };
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    },

    async saveContrato(contratoData) {
      console.log('saveContrato called with:', contratoData);

      this.loadingAction = true;
      this.validationErrors = {};

      try {
        if (!contratoData.get('id_empleado')) {
          console.error('Missing id_empleado in form data');
          throw new Error('El ID del empleado es requerido');
        }

        console.log('ID Empleado:', contratoData.get('id_empleado'));
        console.log('Is editing:', !!this.contratoSeleccionado?.id_contrato);

        let result;
        if (this.contratoSeleccionado?.id_contrato) {
          console.log('Updating contract:', this.contratoSeleccionado.id_contrato);
          result = await this.contratosStore.updateContrato(
              this.contratoSeleccionado.id_contrato,
              contratoData
          );
        } else {
          console.log('Creating new contract');
          result = await this.contratosStore.createContrato(contratoData);
        }

        console.log('Contract operation result:', result);

        if (result) {
          this.closeModal();
          this.$emit('refresh');
          console.log('Contract saved successfully');
        }
      } catch (error) {
        console.error('Error saving contract:', error);
        this.handleSaveError(error);
      } finally {
        this.loadingAction = false;
      }
    },

    handleSaveError(error) {
      console.log('Handling save error:', error);

      if (error.response?.data?.data?.errors) {
        const serverErrors = {};
        error.response.data.data.errors.forEach(err => {
          serverErrors[err.field] = err.message;
        });
        this.validationErrors = serverErrors;
      } else if (error.response?.data?.errors) {
        this.validationErrors = error.response.data.errors;
      } else {
        this.validationErrors = {
          general: error.response?.data?.message || error.message || 'Error al guardar el contrato'
        };
      }

      console.log('Validation errors set:', this.validationErrors);
    },

    confirmDelete(contrato) {
      this.contratoSeleccionado = contrato;
      this.showConfirmDialog = true;
    },

    async deleteContrato() {
      if (!this.contratoSeleccionado) return;

      this.loadingAction = true;
      try {
        await this.contratosStore.deleteContrato(this.contratoSeleccionado.id_contrato);
        this.showConfirmDialog = false;
        this.contratoSeleccionado = null;
        this.$emit('refresh');
      } catch (error) {
        console.error('Error deleting contract:', error);
      } finally {
        this.loadingAction = false;
      }
    },

    async downloadDocumento(id) {
      try {
        await this.contratosStore.downloadContrato(id);
      } catch (error) {
        console.error('Error downloading document:', error);
      }
    },

    async previewDocumento(id) {
      try {
        await this.contratosStore.previewContrato(id);
      } catch (error) {
        console.error('Error previewing document:', error);
      }
    },

    isContratoVigente(contrato) {
      return contrato.fecha_fin === null || new Date(contrato.fecha_fin) >= new Date();
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch {
        return dateString;
      }
    },

    formatFileSize(bytes) {
      if (!bytes) return 'Desconocido';

      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${size.toFixed(2)} ${units[unitIndex]}`;
    },

    async cargarEntidadesFaltantes() {
      try {
        const promises = [];

        if (!this.tiposContrato.length) {
          promises.push(
              this.tiposContratoStore.fetchTiposContrato()
                  .then(data => {
                    this.tiposContrato = data || [];
                    console.log('Tipos contrato loaded:', this.tiposContrato.length);
                  })
          );
        }

        if (!this.empresas.length) {
          promises.push(
              this.empresasStore.fetchEmpresas()
                  .then(data => {
                    this.empresas = data || [];
                    console.log('Empresas loaded:', this.empresas.length);
                  })
          );
        }

        if (!this.convenios.length) {
          promises.push(
              this.conveniosStore.fetchConvenios()
                  .then(data => {
                    this.convenios = data || [];
                    console.log('Convenios loaded:', this.convenios.length);
                  })
          );
        }

        await Promise.all(promises);

        const conveniosUsados = [...new Set(
            this.contratos
                .filter(c => c.id_convenio)
                .map(c => c.id_convenio)
        )];

        for (const idConvenio of conveniosUsados) {
          if (!this.categorias[idConvenio]) {
            await this.loadCategoriasForConvenio(idConvenio);
          }
        }

        console.log('All entities loaded successfully');
      } catch (error) {
        console.error('Error loading entities:', error);
      }
    },

    cambiarPagina(page) {
      if (page >= 1 && page <= this.paginationInfo.totalPages) {
        this.$emit('refresh', { page });
      }
    }
  }
};
</script>

<style scoped>
/* Estilos base */
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.statistics {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.status-active {
  color: #059669;
  font-weight: 500;
}

.status-warning {
  color: #d97706;
  font-weight: 500;
}

.card-body {
  padding: 1.5rem;
}

/* Estados de carga y vacío */
.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  color: #dc2626;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Lista de contratos */
.contratos-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contrato-item {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.contrato-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.contrato-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.contrato-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contrato-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.contrato-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-success {
  background-color: #dcfce7;
  color: #166534;
}

.badge-inactive {
  background-color: #f3f4f6;
  color: #4b5563;
}

.contrato-actions {
  display: flex;
  gap: 0.5rem;
}

.contrato-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.contrato-info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-icon {
  margin-right: 0.5rem;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
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

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  background-color: transparent;
  color: #4b5563;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-only:hover:not(:disabled) {
  background-color: #f3f4f6;
  color: #dc2626;
}

.btn-icon-only.btn-danger:hover:not(:disabled) {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-icon-only:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

/* Modales */
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
  backdrop-filter: blur(2px);
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeIn 0.3s ease;
}

.confirm-modal {
  max-width: 28rem;
}

.viewer-modal {
  max-width: 64rem;
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

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.confirm-icon {
  color: #f59e0b;
  margin-bottom: 1rem;
}

.confirm-warning {
  color: #b91c1c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Detalles del contrato */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-top: 0;
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

.detail-text {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
  white-space: pre-line;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.document-icon {
  color: #6b7280;
  flex-shrink: 0;
}

.document-info {
  flex-grow: 1;
  min-width: 0;
}

.document-name {
  font-weight: 500;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-size {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Animaciones */
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .card-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .document-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .document-info {
    width: 100%;
  }

  .document-actions {
    margin-top: 0.5rem;
    width: 100%;
    justify-content: flex-end;
  }

  .contrato-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .contrato-actions {
    align-self: flex-end;
  }
}
</style>
