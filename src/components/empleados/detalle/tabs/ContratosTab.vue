<template>
  <div class="tab-panel">
    <!-- Cabecera con estadísticas y botones de acción -->
    <div class="header-actions">
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
        <button
            @click="openModal"
            class="btn btn-primary"
            :disabled="loading"
        >
          <PlusIcon class="icon" />
          Nuevo Contrato
        </button>
        <button
            @click="refreshData"
            class="btn btn-outline"
            :disabled="loading"
        >
          <RefreshCwIcon class="icon" />
        </button>
      </div>
    </div>

    <!-- Filtros de búsqueda -->
    <div class="card">
      <div class="card-body filter-section">
        <div class="filter-grid">
          <div class="form-group">
            <label>Tipo de Contrato</label>
            <select v-model="filtros.id_tipo_contrato" class="form-control">
              <option :value="null">Todos</option>
              <option v-for="tipo in tiposContrato" :key="tipo.id_tipo_contrato" :value="tipo.id_tipo_contrato">
                {{ tipo.nombre }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Empresa</label>
            <select v-model="filtros.id_empresa" class="form-control">
              <option :value="null">Todas</option>
              <option v-for="empresa in empresas" :key="empresa.id_empresa" :value="empresa.id_empresa">
                {{ empresa.nombre }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select v-model="filtros.vigentes" class="form-control">
              <option :value="null">Todos</option>
              <option :value="true">Vigentes</option>
              <option :value="false">Finalizados</option>
            </select>
          </div>
        </div>
        <div class="filter-actions">
          <button @click="aplicarFiltros" class="btn btn-primary" :disabled="loading">
            <SearchIcon class="icon-sm" />
            Filtrar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de contratos -->
    <div class="card">
      <div class="card-body">
        <div class="table-container">
          <table class="data-table">
            <thead>
            <tr>
              <th>Tipo</th>
              <th>Empresa</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Convenio</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th class="text-center">Acciones</th>
            </tr>
            </thead>
            <tbody v-if="!loading && contratos.length > 0">
            <tr v-for="contrato in contratos" :key="contrato.id_contrato">
              <td>{{ contrato.TipoContrato?.nombre || 'N/A' }}</td>
              <td>{{ contrato.Empresa?.nombre || 'N/A' }}</td>
              <td>{{ formatDate(contrato.fecha_inicio) }}</td>
              <td>{{ contrato.fecha_fin ? formatDate(contrato.fecha_fin) : 'Indefinido' }}</td>
              <td>{{ contrato.Convenio?.nombre || 'N/A' }}</td>
              <td>{{ contrato.CategoriaConvenio?.nombre || 'N/A' }}</td>
              <td>
                  <span
                      :class="[
                      'status-badge',
                      isContratoVigente(contrato) ? 'status-active' : 'status-inactive'
                    ]"
                  >
                    {{ isContratoVigente(contrato) ? 'Vigente' : 'Finalizado' }}
                  </span>
              </td>
              <td class="text-center">
                <div class="action-buttons-inline">
                  <button @click="viewContrato(contrato)" class="btn-icon btn-info">
                    <EyeIcon class="icon-sm" />
                  </button>
                  <button @click="editContrato(contrato)" class="btn-icon btn-warning">
                    <EditIcon class="icon-sm" />
                  </button>
                  <button
                      v-if="contrato.ruta_archivo"
                      @click="downloadDocumento(contrato.id_contrato)"
                      class="btn-icon btn-secondary"
                  >
                    <DownloadIcon class="icon-sm" />
                  </button>
                  <button @click="confirmDelete(contrato)" class="btn-icon btn-danger">
                    <TrashIcon class="icon-sm" />
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
            <tbody v-else-if="loading">
            <tr>
              <td colspan="8" class="loading-state">
                <div class="loading-indicator">
                  <LoaderIcon class="loading-spinner" />
                </div>
                <p class="loading-text">Cargando contratos...</p>
              </td>
            </tr>
            </tbody>
            <tbody v-else>
            <tr>
              <td colspan="8" class="empty-state">
                <FolderXIcon class="empty-icon" />
                <p class="empty-text">No se encontraron contratos</p>
                <button @click="openModal" class="btn btn-primary mt-4">
                  <PlusIcon class="icon-sm" />
                  Crear Contrato
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="pagination && pagination.totalPages > 1" class="pagination">
      <div class="pagination-info">
        Mostrando {{ pagination.page }} de {{ pagination.totalPages }} páginas
      </div>
      <div class="pagination-controls">
        <button
            @click="cambiarPagina(pagination.page - 1)"
            class="btn btn-outline btn-sm"
            :disabled="pagination.page <= 1 || loading"
        >
          <ChevronLeftIcon class="icon-sm" />
        </button>
        <button
            @click="cambiarPagina(pagination.page + 1)"
            class="btn btn-outline btn-sm"
            :disabled="pagination.page >= pagination.totalPages || loading"
        >
          <ChevronRightIcon class="icon-sm" />
        </button>
      </div>
    </div>

    <!-- Modal de Contrato -->
    <ContratoModal
        v-if="showModal"
        :contrato="contratoSeleccionado"
        :id-empleado="idEmpleado"
        @close="closeModal"
        @save="saveContrato"
    />

    <!-- Modal de Confirmación de Eliminación (integrado) -->
    <div v-if="showConfirmDialog" class="modal-overlay">
      <div class="modal-container modal-sm">
        <div class="modal-header">
          <h3 class="modal-title">Eliminar Contrato</h3>
        </div>
        <div class="modal-body">
          <p>¿Está seguro de que desea eliminar este contrato? Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="showConfirmDialog = false" class="btn btn-outline">
            Cancelar
          </button>
          <button @click="deleteContrato" class="btn btn-danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Visualización de Contrato (integrado) -->
    <div v-if="showViewerModal" class="modal-overlay">
      <div class="modal-container modal-lg">
        <!-- Cabecera del modal -->
        <div class="modal-header">
          <h3 class="modal-title">Detalles del Contrato</h3>
          <button @click="closeViewerModal" class="modal-close">
            <XIcon class="icon" />
          </button>
        </div>

        <!-- Contenido del modal -->
        <div class="modal-body">
          <div v-if="contratoSeleccionado" class="detail-content">
            <!-- Información básica -->
            <div class="detail-grid">
              <div class="detail-item">
                <h4 class="detail-label">Empleado</h4>
                <p class="detail-value">{{ empleadoInfo?.nombre }} {{ empleadoInfo?.apellidos }}</p>
              </div>

              <div class="detail-item">
                <h4 class="detail-label">Tipo de Contrato</h4>
                <p class="detail-value">{{ contratoSeleccionado.TipoContrato?.nombre || 'N/A' }}</p>
              </div>

              <div class="detail-item">
                <h4 class="detail-label">Empresa</h4>
                <p class="detail-value">{{ contratoSeleccionado.Empresa?.nombre || 'N/A' }}</p>
              </div>

              <div class="detail-item">
                <h4 class="detail-label">Fecha de Inicio</h4>
                <p class="detail-value">{{ formatDate(contratoSeleccionado.fecha_inicio) }}</p>
              </div>

              <div class="detail-item">
                <h4 class="detail-label">Fecha de Fin</h4>
                <p class="detail-value">{{ contratoSeleccionado.fecha_fin ? formatDate(contratoSeleccionado.fecha_fin) : 'Indefinido' }}</p>
              </div>

              <div class="detail-item">
                <h4 class="detail-label">Fin Periodo de Prueba</h4>
                <p class="detail-value">{{ contratoSeleccionado.fin_periodo_prueba ? formatDate(contratoSeleccionado.fin_periodo_prueba) : 'N/A' }}</p>
              </div>

              <div class="detail-item">
                <h4 class="detail-label">Antigüedad (días)</h4>
                <p class="detail-value">{{ contratoSeleccionado.antiguedad_contrato || 'N/A' }}</p>
              </div>

              <div class="detail-item">
                <h4 class="detail-label">Estado</h4>
                <p class="detail-value">
                  <span
                      :class="[
                      'status-badge',
                      isContratoVigente(contratoSeleccionado) ? 'status-active' : 'status-inactive'
                    ]"
                  >
                    {{ isContratoVigente(contratoSeleccionado) ? 'Vigente' : 'Finalizado' }}
                  </span>
                </p>
              </div>
            </div>

            <!-- Información del convenio -->
            <div v-if="contratoSeleccionado.Convenio" class="detail-section">
              <h4 class="section-subtitle">Información del Convenio</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <h4 class="detail-label">Convenio</h4>
                  <p class="detail-value">{{ contratoSeleccionado.Convenio.nombre }}</p>
                </div>

                <div v-if="contratoSeleccionado.CategoriaConvenio" class="detail-item">
                  <h4 class="detail-label">Categoría</h4>
                  <p class="detail-value">{{ contratoSeleccionado.CategoriaConvenio.nombre }}</p>
                </div>
              </div>
            </div>

            <!-- Documento adjunto -->
            <div v-if="contratoSeleccionado.ruta_archivo" class="detail-section">
              <h4 class="section-subtitle">Documento Adjunto</h4>
              <div class="document-item">
                <FileTextIcon class="document-icon" />
                <div class="document-info">
                  <p class="document-name">{{ contratoSeleccionado.nombre_original || 'Documento de contrato' }}</p>
                  <p class="document-size">{{ formatFileSize(contratoSeleccionado.tamano) }}</p>
                </div>
                <div class="document-actions">
                  <button @click="downloadDocumento(contratoSeleccionado.id_contrato)" class="btn btn-sm btn-primary">
                    <DownloadIcon class="icon-sm" />
                    Descargar
                  </button>
                  <button @click="previewDocumento(contratoSeleccionado.id_contrato)" class="btn btn-sm btn-secondary">
                    <EyeIcon class="icon-sm" />
                    Previsualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pie del modal -->
        <div class="modal-footer">
          <button @click="editContrato(contratoSeleccionado)" class="btn btn-warning">
            <EditIcon class="icon-sm" />
            Editar
          </button>
          <button @click="closeViewerModal" class="btn btn-outline">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useContratosStore } from '@/stores/contratos';
import { useTiposContratoStore } from '@/stores/tiposContrato';
import { useEmpresasStore } from '@/stores/empresas';
import { useConveniosStore } from '@/stores/convenios';
import { useCategoriasConvenioStore } from '@/stores/categoriasConvenio';
import ContratoModal from '@/components/empleados/detalle/modals/ContratoModal.vue';
import {
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  EyeIcon,
  EditIcon,
  DownloadIcon,
  TrashIcon,
  LoaderIcon,
  FolderXIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  FileTextIcon
} from 'lucide-vue-next';

export default {
  name: 'ContratosTab',

  components: {
    ContratoModal,
    PlusIcon,
    RefreshCwIcon,
    SearchIcon,
    EyeIcon,
    EditIcon,
    DownloadIcon,
    TrashIcon,
    LoaderIcon,
    FolderXIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XIcon,
    FileTextIcon
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

  setup(props, { emit }) {
    const contratosStore = useContratosStore();
    const tiposContratoStore = useTiposContratoStore();
    const empresasStore = useEmpresasStore();
    const conveniosStore = useConveniosStore();
    const categoriasStore = useCategoriasConvenioStore();

    const showModal = ref(false);
    const showConfirmDialog = ref(false);
    const showViewerModal = ref(false);
    const contratoSeleccionado = ref(null);
    const filtros = ref({
      id_tipo_contrato: null,
      id_empresa: null,
      vigentes: null,
      page: 1
    });

    const tiposContrato = ref([]);
    const empresas = ref([]);
    const convenios = ref([]);
    const categorias = ref({});

    const estadisticas = computed(() => {
      if (!props.contratos || props.contratos.length === 0) return null;

      const total = props.contratos.length;
      const contratoVigente = props.contratos.find(c =>
          c.fecha_fin === null || new Date(c.fecha_fin) >= new Date()
      );

      return {
        total,
        vigente: !!contratoVigente,
        contratoVigente
      };
    });

    const pagination = computed(() => {
      return contratosStore.pagination;
    });

    const empleadoInfo = computed(() => {
      return contratosStore.empleadoInfo;
    });

    const refreshData = () => {
      emit('refresh');
    };

    const openModal = () => {
      contratoSeleccionado.value = null;
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      contratoSeleccionado.value = null;
    };

    const viewContrato = (contrato) => {
      contratoSeleccionado.value = contrato;
      showViewerModal.value = true;
    };

    const closeViewerModal = () => {
      showViewerModal.value = false;
      contratoSeleccionado.value = null;
    };

    const editContrato = (contrato) => {
      contratoSeleccionado.value = contrato;
      showModal.value = true;
    };

    const saveContrato = async (contratoData) => {
      try {
        if (contratoSeleccionado.value) {
          await contratosStore.updateContrato(contratoSeleccionado.value.id_contrato, contratoData);
        } else {
          await contratosStore.createContrato(contratoData);
        }
        closeModal();
        refreshData();
      } catch (error) {
        console.error('Error al guardar contrato:', error);
      }
    };

    const confirmDelete = (contrato) => {
      contratoSeleccionado.value = contrato;
      showConfirmDialog.value = true;
    };

    const deleteContrato = async () => {
      if (!contratoSeleccionado.value) return;

      try {
        await contratosStore.deleteContrato(contratoSeleccionado.value.id_contrato);
        showConfirmDialog.value = false;
        contratoSeleccionado.value = null;
        refreshData();
      } catch (error) {
        console.error('Error al eliminar contrato:', error);
      }
    };

    const downloadDocumento = async (id) => {
      try {
        await contratosStore.downloadContrato(id);
      } catch (error) {
        console.error('Error al descargar documento:', error);
      }
    };

    const previewDocumento = async (id) => {
      try {
        await contratosStore.previewContrato(id);
      } catch (error) {
        console.error('Error al previsualizar documento:', error);
      }
    };

    const isContratoVigente = (contrato) => {
      return contrato.fecha_fin === null || new Date(contrato.fecha_fin) >= new Date();
    };

    const aplicarFiltros = () => {
      filtros.value.page = 1;
      refreshData();
    };

    const cambiarPagina = (page) => {
      filtros.value.page = page;
      refreshData();
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return dateString;
      }
    };

    const formatFileSize = (bytes) => {
      if (!bytes) return 'Desconocido';

      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${size.toFixed(2)} ${units[unitIndex]}`;
    };

    const cargarEntidadesFaltantes = async () => {
      try {
        if (tiposContrato.value.length === 0) {
          tiposContrato.value = await tiposContratoStore.fetchTiposContrato();
        }

        if (empresas.value.length === 0) {
          empresas.value = await empresasStore.fetchEmpresas();
        }

        if (convenios.value.length === 0) {
          convenios.value = await conveniosStore.fetchConvenios();
        }

        const conveniosUsados = new Set();
        props.contratos.forEach(contrato => {
          if (contrato.id_convenio) {
            conveniosUsados.add(contrato.id_convenio);
          }
        });

        for (const idConvenio of conveniosUsados) {
          if (!categorias.value[idConvenio]) {
            categorias.value[idConvenio] = await categoriasStore.fetchCategoriasByConvenio(idConvenio);
          }
        }
      } catch (error) {
        console.error('Error al cargar entidades relacionadas:', error);
      }
    };

    onMounted(() => {
      if (props.contratos && props.contratos.length > 0) {
        cargarEntidadesFaltantes();
      }
    });

    watch(() => props.contratos, (newContratos) => {
      if (newContratos && newContratos.length > 0) {
        cargarEntidadesFaltantes();
      }
    });

    return {
      showModal,
      showConfirmDialog,
      showViewerModal,
      contratoSeleccionado,
      filtros,
      tiposContrato,
      empresas,
      convenios,
      categorias,
      estadisticas,
      pagination,
      empleadoInfo,
      refreshData,
      openModal,
      closeModal,
      viewContrato,
      closeViewerModal,
      editContrato,
      saveContrato,
      confirmDelete,
      deleteContrato,
      downloadDocumento,
      previewDocumento,
      isContratoVigente,
      aplicarFiltros,
      cambiarPagina,
      cargarEntidadesFaltantes,
      formatDate,
      formatFileSize
    };
  }
};
</script>

<style scoped>
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.section-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
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

.status-inactive {
  color: #6b7280;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons-inline {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
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
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
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
  color: #3b82f6;
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
  gap: 0.5rem;
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
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-sm {
  max-width: 28rem;
}

.modal-lg {
  max-width: 64rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid #e5e7eb;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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

.document-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.document-icon {
  width: 2rem;
  height: 2rem;
  color: #6b7280;
}

.document-info {
  flex-grow: 1;
}

.document-name {
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.document-size {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
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
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-outline {
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn-warning {
  background-color: #f59e0b;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background-color: #d97706;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-icon {
  padding: 0.375rem;
  border-radius: 0.375rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-info {
  background-color: #dbeafe;
  color: #1e40af;
}

.btn-info:hover {
  background-color: #bfdbfe;
}

.btn-danger {
  background-color: #fee2e2;
  color: #b91c1c;
}

.btn-danger:hover {
  background-color: #fecaca;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.icon-sm {
  width: 1rem;
  height: 1rem;
}

.text-center {
  text-align: center;
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

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .document-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .document-actions {
    margin-top: 0.5rem;
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
