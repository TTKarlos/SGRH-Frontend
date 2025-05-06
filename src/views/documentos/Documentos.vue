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
          @cerrar="cerrarPreview"
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
      eliminandoDocumento: false,
      autoRefreshInterval: null,
      verificandoArchivos: false,
      storeCheckInterval: null,
      ultimaVerificacion: Date.now(),
      hayDocumentosSinArchivo: false
    };
  },

  computed: {
    documentosStore() {
      return useDocumentosStore();
    },

    empleadosStore() {
      return useEmpleadosStore();
    },

    authStore() {
      return useAuthStore();
    },

    notificationStore() {
      return useNotificationStore();
    },

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
    },

    documentosSinArchivo() {
      return this.documentos.filter(doc => doc.archivoInaccesible);
    }
  },

  created() {
    this.setupStoreListeners();
  },

  mounted() {
    this.cargarDocumentos();
    this.cargarEmpleados();
    this.iniciarAutoRefresh();

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  },

  beforeUnmount() {
    this.detenerAutoRefresh();

    if (this.storeCheckInterval) {
      clearInterval(this.storeCheckInterval);
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.urlPreview) {
      URL.revokeObjectURL(this.urlPreview);
    }
  },

  methods: {
    canWrite(modulo) {
      const { canWrite } = usePermission();
      return canWrite(modulo);
    },

    setupStoreListeners() {
      const checkStoreChanges = () => {
        const storeDocumentos = this.documentosStore.documentos;

        if (!storeDocumentos || !this.documentos) return;

        const docsSinArchivo = storeDocumentos.filter(doc => doc.archivoInaccesible);

        if (docsSinArchivo.length > 0) {
          this.hayDocumentosSinArchivo = true;
          this.$forceUpdate();
        } else if (this.hayDocumentosSinArchivo) {

          this.hayDocumentosSinArchivo = false;
          this.$forceUpdate();
        }
      };

      this.storeCheckInterval = setInterval(checkStoreChanges, 2000);
    },

    async verificarArchivosInaccesibles() {
      if (this.verificandoArchivos) return;

      if (Date.now() - this.ultimaVerificacion < 10000) return;

      this.verificandoArchivos = true;
      this.ultimaVerificacion = Date.now();

      try {
        const resultado = await this.documentosStore.verificarYLimpiarDocumentosInaccesibles();

        if (resultado && resultado.documentosInaccesibles && resultado.documentosInaccesibles.length > 0) {
          this.hayDocumentosSinArchivo = true;
          this.$forceUpdate();
        }
      } catch (error) {
        console.error("Error al verificar archivos inaccesibles:", error);
      } finally {
        this.verificandoArchivos = false;
      }
    },

    iniciarAutoRefresh() {
      this.detenerAutoRefresh();

      this.autoRefreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          this.verificarArchivosInaccesibles();
        }
      }, 30000);
    },

    detenerAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
      }
    },

    handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        this.verificarArchivosInaccesibles();
        this.iniciarAutoRefresh();
      } else {
        this.detenerAutoRefresh();
      }
    },

    async cargarDocumentos() {
      try {
        await this.documentosStore.fetchDocumentos();

        if (this.documentos.length > 0) {
          const docsSinArchivo = this.documentos.filter(doc => doc.archivoInaccesible);
          this.hayDocumentosSinArchivo = docsSinArchivo.length > 0;

          if (!this.verificandoArchivos) {
            setTimeout(() => this.verificarArchivosInaccesibles(), 500);
          }
        }
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
      if (documento.archivoInaccesible) {
        this.notificationStore.warning('El archivo físico no se encuentra en el servidor', 'Archivo no disponible');
        return;
      }

      this.documentoPreview = documento;
      this.urlPreview = null;

      try {
        this.urlPreview = await this.documentosStore.previewDocumento(documento.id_documento);
      } catch (err) {
        console.error('Error al previsualizar documento:', err);

        let mensajeError = 'Error al previsualizar el documento';

        if (err.response) {
          const status = err.response.status;
          if (status === 404) {
            mensajeError = 'El archivo físico no se encuentra en el servidor';

            await this.documentosStore.marcarDocumentoComoInaccesible(documento.id_documento);
            this.hayDocumentosSinArchivo = true;
            this.$forceUpdate();
          } else if (status === 403) {
            mensajeError = 'No tiene permisos para ver este documento';
          } else {
            mensajeError = `Error del servidor (${status}): ${err.response.statusText}`;
          }
        }

        this.notificationStore.error(mensajeError, 'Error');
        this.urlPreview = null;
      }
    },

    cerrarPreview() {
      if (this.urlPreview) {
        URL.revokeObjectURL(this.urlPreview);
      }
      this.documentoPreview = null;
      this.urlPreview = null;
    },

    async descargarDocumento(documento) {
      if (documento.archivoInaccesible) {
        this.notificationStore.warning('El archivo físico no se encuentra en el servidor', 'Archivo no disponible');
        return;
      }

      try {
        await this.documentosStore.downloadDocumento(documento.id_documento);
      } catch (err) {
        console.error('Error al descargar documento:', err);

        let mensajeError = 'Error al descargar el documento';

        if (err.response?.status === 404 || err.message?.includes("no se encuentra")) {
          mensajeError = 'El archivo físico no se encuentra en el servidor';

          await this.documentosStore.marcarDocumentoComoInaccesible(documento.id_documento);
          this.hayDocumentosSinArchivo = true;
          this.$forceUpdate();
        }

        this.notificationStore.error(mensajeError, 'Error');
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