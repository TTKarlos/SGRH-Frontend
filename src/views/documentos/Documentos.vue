<template>
  <DefaultLayout>
    <div class="documentos-page">
      <!-- Cabecera con título y botón de subida -->
      <DocumentosHeader
          title="Gestión de Documentos"
          :can-upload="canUpload"
          @upload="mostrarModalSubida = true"
      />

      <div class="card">
        <!-- Filtros de búsqueda y filtrado -->
        <DocumentosFiltros
            v-model:search-query="searchQuery"
            v-model:filters="filters"
            :tipos-documento="tiposDocumento"
            @search="handleSearch"
            @apply-filters="aplicarFiltros"
            @reset-filters="resetFiltros"
        />

        <!-- Estados de carga, error y vacío -->
        <div v-if="loading" class="loading-container">
          <LoadingSpinner message="Cargando documentos..." />
        </div>

        <div v-else-if="error" class="error-container">
          <AlertTriangle size="24" class="error-icon" />
          <p>{{ error }}</p>
          <button @click="cargarDocumentos" class="btn btn-primary">
            <RefreshCw size="16" class="btn-icon" />
            Reintentar
          </button>
        </div>

        <DocumentosEstadoVacio
            v-else-if="documentos.length === 0"
            :hay-filtros-aplicados="hayFiltrosAplicados"
            :can-upload="canUpload"
            @upload="mostrarModalSubida = true"
        />

        <!-- Lista de documentos -->
        <DocumentosTabla
            v-else
            :documentos="documentos"
            :can-delete="canDelete"
            @preview="previewDocumento"
            @download="descargarDocumento"
            @delete="confirmarEliminar"
        />

        <!-- Paginación -->
        <div v-if="documentos.length > 0" class="card-footer">
          <UsuariosPaginacion
              :pagination="documentosStore.pagination"
              @change-page="cambiarPagina"
          />
        </div>
      </div>

      <!-- Modales -->
      <DocumentoModalSubida
          v-if="mostrarModalSubida"
          :empleados="empleados"
          :subiendo-documento="subiendoDocumento"
          @cerrar="mostrarModalSubida = false"
          @subir="subirDocumento"
          @archivo-seleccionado="archivoSeleccionado = $event"
      />

      <DocumentoModalEliminar
          v-if="documentoAEliminar"
          :documento="documentoAEliminar"
          :eliminando="eliminandoDocumento"
          @cerrar="documentoAEliminar = null"
          @eliminar="eliminarDocumento"
      />

      <DocumentoModalPrevista
          v-if="documentoPreview"
          :documento="documentoPreview"
          :url-preview="urlPreview"
          :es-visualizable-p-d-f="esVisualizablePDF"
          :es-visualizable-imagen="esVisualizableImagen"
          @cerrar="documentoPreview = null"
          @descargar="descargarDocumento"
      />
    </div>
  </DefaultLayout>
</template>

<script>
import { useDocumentosStore } from '../../stores/documentos';
import { useEmpleadosStore } from '../../stores/empleados';
import { useAuthStore } from '../../stores/auth';
import { useNotificationStore } from '../../stores/notification';
import { usePermission } from '../../composables/usePermission';

import DefaultLayout from '../../layouts/DefaultLayout.vue';
import LoadingSpinner from '../../components/common/LoadingSpinner.vue';
import UsuariosPaginacion from '../../components/usuarios/UsuariosPaginacion.vue';

import DocumentosHeader from '../../components/documentos/gestion/DocumentosHeader.vue';
import DocumentosFiltros from '../../components/documentos/gestion/DocumentosFiltros.vue';
import DocumentosTabla from '../../components/documentos/gestion/DocumentosTabla.vue';
import DocumentosEstadoVacio from '../../components/documentos/gestion/DocumentosEstadoVacio.vue';
import DocumentoModalSubida from '../../components/documentos/modals/DocumentoModalSubida.vue';
import DocumentoModalEliminar from '../../components/documentos/modals/DocumentoModalEliminar.vue';
import DocumentoModalPrevistaEmpleados from '../../components/documentos/modals/DocumentoModalPrevistaGestion.vue';

import { RefreshCw, AlertTriangle } from 'lucide-vue-next';

export default {
  name: 'Documentos',

  components: {
    DefaultLayout,
    LoadingSpinner,
    UsuariosPaginacion,
    DocumentosHeader,
    DocumentosFiltros,
    DocumentosTabla,
    DocumentosEstadoVacio,
    DocumentoModalSubida,
    DocumentoModalEliminar,
    DocumentoModalPrevista: DocumentoModalPrevistaEmpleados,
    RefreshCw,
    AlertTriangle
  },

  setup() {
    const documentosStore = useDocumentosStore();
    const empleadosStore = useEmpleadosStore();
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();
    const { canWrite } = usePermission();

    return {
      documentosStore,
      empleadosStore,
      authStore,
      notificationStore,
      canWrite
    };
  },

  data() {
    return {
      searchQuery: '',
      searchTimeout: null,
      filters: {
        search: '',
        tipo_documento: '',
        fecha_desde: null,
        fecha_hasta: null
      },
      mostrarModalSubida: false,
      documentoAEliminar: null,
      documentoPreview: null,
      urlPreview: null,
      archivoSeleccionado: null,
      subiendoDocumento: false,
      eliminandoDocumento: false
    };
  },

  computed: {
    loading() {
      return this.documentosStore.loading;
    },

    error() {
      return this.documentosStore.error;
    },

    documentos() {
      return this.documentosStore.documentos || [];
    },

    empleados() {
      return this.empleadosStore.empleados || [];
    },

    tiposDocumento() {
      const tipos = new Set();
      if (this.documentos && this.documentos.length) {
        this.documentos.forEach(doc => {
          if (doc.tipo_documento) {
            tipos.add(doc.tipo_documento);
          }
        });
      }
      return Array.from(tipos).sort();
    },

    canUpload() {
      return this.canWrite('Documentos');
    },

    canDelete() {
      return this.canWrite('Documentos');
    },

    hayFiltrosAplicados() {
      return this.filters.search ||
          this.filters.tipo_documento ||
          this.filters.fecha_desde ||
          this.filters.fecha_hasta;
    }
  },

  mounted() {
    this.cargarDocumentos();
    this.cargarEmpleados();
  },

  methods: {
    async cargarDocumentos() {
      try {
        await this.documentosStore.fetchDocumentos();
      } catch (err) {
        console.error('Error al cargar documentos:', err);
        this.notificationStore.error('Error al cargar los documentos', 'Error');
      }
    },

    async cargarEmpleados() {
      try {
        await this.empleadosStore.fetchEmpleados();
      } catch (err) {
        console.error('Error al cargar empleados:', err);
        this.notificationStore.error('Error al cargar los empleados', 'Error');
      }
    },

    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.filters.search = this.searchQuery;
        this.aplicarFiltros();
      }, 300);
    },

    aplicarFiltros() {
      try {
        this.documentosStore.updateFilters(this.filters);
        this.cargarDocumentos();
      } catch (err) {
        console.error('Error al aplicar filtros:', err);
        this.notificationStore.error('Error al aplicar los filtros', 'Error');
      }
    },

    resetFiltros() {
      this.searchQuery = '';
      this.filters = {
        search: '',
        tipo_documento: '',
        fecha_desde: null,
        fecha_hasta: null
      };
      try {
        this.documentosStore.resetFilters();
        this.cargarDocumentos();
      } catch (err) {
        console.error('Error al resetear filtros:', err);
        this.notificationStore.error('Error al resetear los filtros', 'Error');
      }
    },

    cambiarPagina(page) {
      try {
        this.documentosStore.setPage(page);
        this.cargarDocumentos();
      } catch (err) {
        console.error('Error al cambiar página:', err);
        this.notificationStore.error('Error al cambiar de página', 'Error');
      }
    },

    async subirDocumento(formData) {
      if (!this.archivoSeleccionado) {
        this.notificationStore.error('Por favor, seleccione un archivo', 'Error de validación');
        return;
      }

      this.subiendoDocumento = true;

      try {
        formData.append('archivo', this.archivoSeleccionado);

        await this.documentosStore.uploadDocumento(formData);
        this.notificationStore.success('Documento subido correctamente', 'Éxito');
        this.mostrarModalSubida = false;
        this.archivoSeleccionado = null;

        await this.cargarDocumentos();
      } catch (err) {
        console.error('Error al subir documento:', err);
        this.notificationStore.error('Error al subir el documento', 'Error');
      } finally {
        this.subiendoDocumento = false;
      }
    },

    confirmarEliminar(documento) {
      this.documentoAEliminar = documento;
    },

    async eliminarDocumento() {
      if (!this.documentoAEliminar) return;

      this.eliminandoDocumento = true;

      try {
        await this.documentosStore.deleteDocumento(this.documentoAEliminar.id_documento);
        this.notificationStore.success('Documento eliminado correctamente', 'Éxito');
        this.documentoAEliminar = null;

        await this.cargarDocumentos();
      } catch (err) {
        console.error('Error al eliminar documento:', err);
        this.notificationStore.error('Error al eliminar el documento', 'Error');
      } finally {
        this.eliminandoDocumento = false;
      }
    },

    async previewDocumento(documento) {
      this.documentoPreview = documento;

      try {
        this.urlPreview = await this.documentosStore.previewDocumento(documento.id_documento);
      } catch (err) {
        console.error('Error al previsualizar documento:', err);
        this.notificationStore.error('Error al previsualizar el documento', 'Error');
        this.urlPreview = null;
      }
    },

    async descargarDocumento(documento) {
      try {
        await this.documentosStore.downloadDocumento(documento.id_documento);
      } catch (err) {
        console.error('Error al descargar documento:', err);
        this.notificationStore.error('Error al descargar el documento', 'Error');
      }
    },

    esVisualizablePDF(documento) {
      return documento && documento.mimetype === 'application/pdf';
    },

    esVisualizableImagen(documento) {
      return documento && ['image/jpeg', 'image/png', 'image/gif'].includes(documento.mimetype);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.documentos-page {
  padding: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

.card {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #f1f1f1;
}

.card-footer {
  padding: 1.25rem;
  border-top: 1px solid #e5e7eb;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.error-icon {
  color: #dc2626;
  margin-bottom: 1rem;
}

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
}

.btn-icon {
  margin-right: 0.5rem;
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

@media (max-width: 768px) {
  .documentos-page {
    padding: 1rem;
  }
}
</style>