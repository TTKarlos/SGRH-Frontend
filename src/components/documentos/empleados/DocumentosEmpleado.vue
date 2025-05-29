<template>
  <div class="card">
    <div class="card-header">
      <h2>Documentos del Empleado</h2>
    </div>
    <div class="card-body">
      <div class="documentos-empleado">
        <!-- Barra de herramientas -->
        <div class="documentos-toolbar">
          <div class="documentos-search">
            <input
                type="text"
                v-model="filtros.busqueda"
                placeholder="Buscar documentos..."
                class="search-input"
                @input="actualizarFiltros"
            />
          </div>
          <div class="documentos-actions">
            <button
                v-if="canEditDocuments"
                @click="mostrarModalSubida = true"
                class="btn btn-primary btn-sm"
            >
              <Plus size="16" class="btn-icon" />
              Subir documento
            </button>
            <button
                @click="cargarDocumentos(true)"
                class="btn btn-icon-only"
                title="Recargar documentos"
            >
              <RefreshCw size="16" />
            </button>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="cargando" class="documentos-loading">
          <LoadingSpinner message="Cargando documentos..." />
        </div>

        <!-- Estado de error -->
        <div v-else-if="error" class="documentos-error">
          <div class="error-message">
            <AlertTriangle size="24" />
            <p>{{ error }}</p>
          </div>
          <button @click="cargarDocumentos(true)" class="btn btn-primary btn-sm">
            Reintentar
          </button>
        </div>

        <!-- Estado vacío -->
        <div v-else-if="documentosFiltrados.length === 0" class="documentos-empty">
          <div v-if="filtros.busqueda" class="empty-search-results">
            <Search size="48" class="empty-icon" />
            <h3>No se encontraron resultados</h3>
            <p>No hay documentos que coincidan con "{{ filtros.busqueda }}"</p>
            <button @click="limpiarFiltros" class="btn btn-secondary btn-sm">
              Limpiar búsqueda
            </button>
          </div>
          <div v-else class="empty-state">
            <FileText size="48" class="empty-icon" />
            <h3>No hay documentos</h3>
            <p>Aún no se han subido documentos para este empleado</p>
            <button
                v-if="canEditDocuments"
                @click="mostrarModalSubida = true"
                class="btn btn-primary btn-sm"
            >
              <Plus size="16" class="btn-icon" />
              Subir primer documento
            </button>
          </div>
        </div>

        <!-- Lista de documentos -->
        <div v-else class="documentos-grid">
          <div
              v-for="documento in documentosFiltrados"
              :key="documento.id_documento"
              class="documento-card"
              :class="{ 'documento-inaccesible': documento.archivoInaccesible }"
          >
            <div class="documento-icon">
              <component :is="getFileIcon(documento.nombre_original)" size="24" />
            </div>
            <div class="documento-info" @click.stop="solicitarPrevisualizacion(documento)">
              <h4 class="documento-nombre">{{ documento.nombre }}</h4>
              <p class="documento-fecha">
                {{ formatDate(documento.fecha_subida) }}
              </p>
              <div v-if="documento.archivoInaccesible" class="documento-inaccesible-badge">
                <AlertTriangle size="12" />
                <span>Archivo no encontrado</span>
              </div>
            </div>
            <div class="documento-actions">
              <button
                  @click.stop="solicitarPrevisualizacion(documento)"
                  class="btn-action"
                  title="Ver documento"
                  :disabled="documento.archivoInaccesible"
              >
                <Eye size="16" />
              </button>
              <button
                  v-if="canEditDocuments"
                  @click.stop="editarDocumento(documento)"
                  class="btn-action"
                  title="Editar documento"
              >
                <Edit size="16" />
              </button>
              <button
                  v-if="canEditDocuments"
                  @click.stop="confirmarEliminar(documento)"
                  class="btn-action btn-action-danger"
                  title="Eliminar documento"
              >
                <Trash2 size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- Modales -->
        <DocumentoModalSubida
            v-if="mostrarModalSubida && canEditDocuments"
            :id-empleado="idEmpleado"
            :errores-validacion="erroresValidacion"
            :subiendo-documento="subiendoDocumento"
            @cerrar="cerrarModalSubida"
            @subir="subirDocumento"
            @seleccionar-archivo="manejarSeleccionArchivo"
            @soltar-archivo="manejarSoltarArchivo"
            @eliminar-archivo="eliminarArchivoSeleccionado"
        />

        <DocumentoModalEdicion
            v-if="mostrarModalEdicion && canEditDocuments"
            :documento="documentoEditando"
            :errores-validacion="erroresValidacion"
            :guardando="guardandoDocumento"
            @cerrar="mostrarModalEdicion = false"
            @guardar="actualizarDocumento"
            @guardar-con-archivo="actualizarDocumentoConArchivo"
        />

        <DocumentoModalEliminar
            v-if="mostrarModalEliminar && canEditDocuments"
            :documento="documentoEliminar"
            :eliminando="eliminandoDocumento"
            @cerrar="mostrarModalEliminar = false"
            @eliminar="eliminarDocumento"
        />

        <!-- El modal de previsualización solo se muestra si manejoPreview es true -->
        <DocumentoModalPrevistaEmpleados
            v-if="manejoPreview && documentoPreview"
            :documento="documentoPreview"
            :url="urlPreview"
            :cargando="cargandoPreview"
            :error="errorPreview"
            @cerrar="cerrarPreview"
            @descargar="descargarDocumento"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useDocumentosStore } from "@/stores/documentos"
import { useAuthStore } from "@/stores/auth"
import { useNotificationStore } from "@/stores/notification"
import LoadingSpinner from "@/components/common/LoadingSpinner.vue"
import DocumentoModalSubida from "@/components/documentos/modals/DocumentoModalSubida.vue"
import DocumentoModalEdicion from "@/components/documentos/modals/DocumentoModalEdicion.vue"
import DocumentoModalEliminar from "@/components/documentos/modals/DocumentoModalEliminar.vue"
import DocumentoModalPrevistaEmpleados from "@/components/documentos/modals/DocumentoModalPrevistaEmpleados.vue"
import {
  AlertTriangle,
  RefreshCw,
  Plus,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Eye,
  Edit,
  Trash2,
  Search
} from "lucide-vue-next"

export default {
  name: "DocumentosEmpleado",

  components: {
    LoadingSpinner,
    DocumentoModalSubida,
    DocumentoModalEdicion,
    DocumentoModalEliminar,
    DocumentoModalPrevistaEmpleados,
    AlertTriangle,
    RefreshCw,
    Plus,
    FileText,
    FileImage,
    FileSpreadsheet,
    File,
    Eye,
    Edit,
    Trash2,
    Search
  },

  props: {
    idEmpleado: {
      type: [Number, String],
      required: true
    },
    manejoPreview: {
      type: Boolean,
      default: false
    }
  },

  emits: ['previsualizar'],

  data() {
    return {
      documentos: [],
      cargando: false,
      error: null,
      autoRefreshInterval: null,
      lastRefreshTime: Date.now(),
      autoRefreshEnabled: true,
      autoRefreshTime: 30000,
      verificandoArchivos: false,
      storeCheckInterval: null,

      filtros: {
        busqueda: '',
        fechaDesde: '',
        fechaHasta: ''
      },

      documentoPreview: null,
      urlPreview: null,
      cargandoPreview: false,
      errorPreview: null,
      previewEnProceso: false,
      previewTimeoutId: null,

      mostrarModalSubida: false,
      mostrarModalEdicion: false,
      mostrarModalEliminar: false,

      documentoEditando: null,
      documentoEliminar: null,

      archivoSeleccionado: null,
      subiendoDocumento: false,
      guardandoDocumento: false,
      eliminandoDocumento: false,
      erroresValidacion: {}
    }
  },

  computed: {
    documentosStore() {
      return useDocumentosStore()
    },

    authStore() {
      return useAuthStore()
    },

    notificationStore() {
      return useNotificationStore()
    },

    canViewDocuments() {
      return this.authStore.hasPermission({ nombre: "Documentos", tipo: "Lectura" })
    },

    canEditDocuments() {
      return this.authStore.hasPermission({ nombre: "Documentos", tipo: "Escritura" })
    },

    documentosFiltrados() {
      if (!this.documentos?.length) return []

      if (!this.filtros.busqueda) return this.documentos

      const busqueda = this.filtros.busqueda.toLowerCase()
      return this.documentos.filter(doc =>
          doc.nombre?.toLowerCase().includes(busqueda) ||
          doc.nombre_original?.toLowerCase().includes(busqueda) ||
          doc.observaciones?.toLowerCase().includes(busqueda)
      )
    }
  },

  watch: {
    idEmpleado: {
      handler(newId) {
        if (newId && this.canViewDocuments) {
          localStorage.setItem('currentEmpleadoId', newId)
          this.cargarDocumentos(true)
        }
      }
    },

    '$route.params.id': {
      handler(newId) {
        if (newId && this.canViewDocuments) {
          localStorage.setItem('currentEmpleadoId', newId)
          this.cargarDocumentos(true)
        }
      }
    }
  },

  created() {
    this.setupStoreListeners()
  },

  mounted() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    this.$nextTick(() => {
      if (this.canViewDocuments) {
        this.cargarDocumentos(true)
        this.iniciarAutoRefresh()
      }
    })
  },

  beforeUnmount() {
    if (this.urlPreview) {
      URL.revokeObjectURL(this.urlPreview)
    }

    if (this.previewTimeoutId) {
      clearTimeout(this.previewTimeoutId)
    }

    this.detenerAutoRefresh()

    if (this.storeCheckInterval) {
      clearInterval(this.storeCheckInterval)
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  },

  methods: {
    setupStoreListeners() {
      const checkStoreChanges = () => {
        const storeDocumentos = this.documentosStore.documentos

        if (storeDocumentos.length !== this.documentos.length) {
          this.documentos = [...storeDocumentos]
          return
        }

        let hayDiferencias = false
        storeDocumentos.forEach(storeDoc => {
          const localDoc = this.documentos.find(d => d.id_documento === storeDoc.id_documento)

          if (!localDoc ||
              localDoc.archivoInaccesible !== storeDoc.archivoInaccesible ||
              localDoc.nombre !== storeDoc.nombre) {
            hayDiferencias = true
          }
        })

        if (hayDiferencias) {
          this.documentos = [...storeDocumentos]
        }
      }

      this.storeCheckInterval = setInterval(checkStoreChanges, 2000)
    },

    obtenerIdEmpleadoDesdeURL() {
      if (this.idEmpleado) return this.idEmpleado

      const idFromRoute = this.$route.params.id || this.$route.query.id || localStorage.getItem('currentEmpleadoId')

      if (idFromRoute) {
        localStorage.setItem('currentEmpleadoId', idFromRoute)
        return idFromRoute
      }

      return null
    },

    async verificarArchivosInaccesibles() {
      if (this.verificandoArchivos) return

      this.verificandoArchivos = true
      try {
        const idEmpleado = this.obtenerIdEmpleadoDesdeURL()
        if (!idEmpleado) return

        await this.documentosStore.verificarYLimpiarDocumentosInaccesibles()

        this.documentos = [...this.documentosStore.documentos]
      } catch (error) {
        console.error("Error al verificar archivos inaccesibles:", error)
      } finally {
        this.verificandoArchivos = false
      }
    },

    async cargarDocumentos(forzarRecarga = false) {
      const idEmpleado = this.obtenerIdEmpleadoDesdeURL()

      if (!idEmpleado) {
        this.error = 'No se pudo identificar al empleado'
        return
      }

      if (!forzarRecarga && Date.now() - this.lastRefreshTime < 5000) {
        return
      }

      this.cargando = true
      this.error = null

      try {
        const response = await this.documentosStore.fetchDocumentosByEmpleado(idEmpleado)
        this.documentos = [...(response || [])]
        this.lastRefreshTime = Date.now()

        if (this.documentos.length > 0 && !this.verificandoArchivos) {
          setTimeout(() => this.verificarArchivosInaccesibles(), 500)
        }
      } catch (err) {
        this.error = err.message || 'Error al cargar los documentos'
        this.notificationStore.error(this.error, 'Error')
      } finally {
        this.cargando = false
      }
    },


    iniciarAutoRefresh() {
      this.detenerAutoRefresh()

      if (this.autoRefreshEnabled) {
        this.autoRefreshInterval = setInterval(() => {
          if (document.visibilityState === 'visible') {
            this.cargarDocumentos()
          }
        }, this.autoRefreshTime)
      }
    },

    detenerAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval)
        this.autoRefreshInterval = null
      }
    },

    handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        this.cargarDocumentos(true)
        this.iniciarAutoRefresh()
      } else {
        this.detenerAutoRefresh()
      }
    },

    actualizarFiltros() {
    },

    limpiarFiltros() {
      this.filtros = {
        busqueda: '',
        fechaDesde: '',
        fechaHasta: ''
      }
    },

    solicitarPrevisualizacion(documento) {
      if (!documento || documento.archivoInaccesible) return

      if (this.manejoPreview) {
        this.previsualizarDocumento(documento)
      } else {
        this.$emit('previsualizar', documento)
      }
    },

    async previsualizarDocumento(documento) {
      if (!documento || documento.archivoInaccesible) return

      if (this.documentoPreview?.id_documento === documento.id_documento) return

      if (this.previewEnProceso) return

      this.previewEnProceso = true
      this.documentoPreview = documento
      this.cargandoPreview = true
      this.errorPreview = null
      this.urlPreview = null

      try {
        const url = await this.documentosStore.previewDocumento(documento.id_documento)

        if (!url) {
          throw new Error('No se pudo generar la URL de previsualización')
        }

        this.urlPreview = url

        if (documento.archivoInaccesible) {
          const docIndex = this.documentos.findIndex(doc => doc.id_documento === documento.id_documento)
          if (docIndex !== -1) {
            this.documentos[docIndex].archivoInaccesible = false
            this.documentos = [...this.documentos]
          }
        }
      } catch (err) {
        let mensajeError = err.message || 'No se pudo cargar la vista previa del documento'

        if (err.response) {
          const status = err.response.status
          if (status === 404) {
            mensajeError = 'El archivo físico no se encuentra en el servidor'

            const docIndex = this.documentos.findIndex(doc => doc.id_documento === documento.id_documento)
            if (docIndex !== -1) {
              this.documentos[docIndex].archivoInaccesible = true
              this.documentos = [...this.documentos]
            }
          } else if (status === 403) {
            mensajeError = 'No tiene permisos para ver este documento'
          } else {
            mensajeError = `Error del servidor (${status}): ${err.response.statusText}`
          }
        }

        this.errorPreview = mensajeError
        this.notificationStore.warning(this.errorPreview, 'Error de previsualización')
      } finally {
        this.cargandoPreview = false

        this.previewTimeoutId = setTimeout(() => {
          this.previewEnProceso = false
        }, 300)
      }
    },

    cerrarPreview() {
      if (this.urlPreview) {
        URL.revokeObjectURL(this.urlPreview)
      }
      this.documentoPreview = null
      this.urlPreview = null
      this.errorPreview = null
      this.previewEnProceso = false

      if (this.previewTimeoutId) {
        clearTimeout(this.previewTimeoutId)
        this.previewTimeoutId = null
      }
    },

    async descargarDocumento(documento) {
      if (!documento || documento.archivoInaccesible) return

      try {
        await this.documentosStore.downloadDocumento(documento.id_documento)

        if (documento.archivoInaccesible) {
          const docIndex = this.documentos.findIndex(doc => doc.id_documento === documento.id_documento)
          if (docIndex !== -1) {
            this.documentos[docIndex].archivoInaccesible = false
            this.documentos = [...this.documentos]
          }
        }
      } catch (err) {
        if (err.response?.status === 404 || err.message?.includes("no se encuentra")) {
          const docIndex = this.documentos.findIndex(doc => doc.id_documento === documento.id_documento)
          if (docIndex !== -1) {
            this.documentos[docIndex].archivoInaccesible = true
            this.documentos = [...this.documentos]
          }
        }

        this.notificationStore.error(
            err.message || 'Ha ocurrido un error al descargar el documento',
            'Error al descargar'
        )
      }
    },

    manejarSeleccionArchivo(archivo) {
      this.archivoSeleccionado = archivo
    },

    manejarSoltarArchivo(archivo) {
      this.archivoSeleccionado = archivo
    },

    eliminarArchivoSeleccionado() {
      this.archivoSeleccionado = null
    },

    validarDocumento(documento, requiereArchivo = true) {
      const errores = {}

      if (!documento.nombre?.trim()) {
        errores.nombre = "El nombre del documento es obligatorio"
      }

      if (requiereArchivo && !this.archivoSeleccionado) {
        errores.archivo = "Debe seleccionar un archivo"
      }

      this.erroresValidacion = errores
      return Object.keys(errores).length === 0
    },

    async subirDocumento(nuevoDoc) {
      if (!this.canEditDocuments) {
        this.notificationStore.error('No tiene permisos para subir documentos', 'Error de permisos')
        return
      }

      const idEmpleado = this.obtenerIdEmpleadoDesdeURL()
      if (!idEmpleado) {
        this.notificationStore.error('No se pudo identificar al empleado', 'Error')
        return
      }

      if (!this.validarDocumento(nuevoDoc)) {
        return
      }

      try {
        this.subiendoDocumento = true

        const formData = new FormData()

        formData.append("id_empleado", String(idEmpleado))

        formData.append("archivo", this.archivoSeleccionado)
        formData.append("nombre", nuevoDoc.nombre)
        formData.append("observaciones", nuevoDoc.observaciones || "")

        await this.documentosStore.uploadDocumento(formData)
        await this.cargarDocumentos(true)

        this.notificationStore.success("El documento ha sido subido correctamente", "Documento subido")
        this.cerrarModalSubida()
      } catch (error) {
        if (error.response?.data?.errors) {
          this.erroresValidacion = error.response.data.errors
        }

        this.notificationStore.error(
            error.response?.data?.message || error.message || "Ha ocurrido un error al subir el documento",
            "Error al subir"
        )
      } finally {
        this.subiendoDocumento = false
      }
    },

    cerrarModalSubida() {
      this.mostrarModalSubida = false
      this.archivoSeleccionado = null
      this.erroresValidacion = {}
    },

    editarDocumento(documento) {
      if (!this.canEditDocuments) {
        this.notificationStore.error('No tiene permisos para editar documentos', 'Error de permisos')
        return
      }

      this.documentoEditando = { ...documento }
      this.mostrarModalEdicion = true
      this.erroresValidacion = {}
    },

    async actualizarDocumento(documentoActualizado) {
      if (!this.canEditDocuments) {
        this.notificationStore.error('No tiene permisos para editar documentos', 'Error de permisos')
        return
      }

      if (!this.validarDocumento(documentoActualizado, false)) {
        return
      }

      try {
        this.guardandoDocumento = true

        const idEmpleado = this.obtenerIdEmpleadoDesdeURL()
        const docToUpdate = {
          ...documentoActualizado,
          id_empleado: idEmpleado
        }

        await this.documentosStore.updateDocumento(docToUpdate.id_documento, docToUpdate)
        await this.cargarDocumentos(true)

        this.notificationStore.success("El documento ha sido actualizado correctamente", "Documento actualizado")
        this.mostrarModalEdicion = false
      } catch (error) {
        this.notificationStore.error(
            error.response?.data?.message || error.message || "Ha ocurrido un error al actualizar el documento",
            "Error al actualizar"
        )
      } finally {
        this.guardandoDocumento = false
      }
    },

    async actualizarDocumentoConArchivo(formData, idDocumento) {
      if (!this.canEditDocuments) {
        this.notificationStore.error('No tiene permisos para editar documentos', 'Error de permisos')
        return
      }

      const idEmpleado = this.obtenerIdEmpleadoDesdeURL()
      if (!idEmpleado) {
        this.notificationStore.error('No se pudo identificar al empleado', 'Error')
        return
      }

      try {
        this.guardandoDocumento = true

        const nuevoFormData = new FormData()

        nuevoFormData.append('id_empleado', String(idEmpleado))

        for (const [key, value] of formData.entries()) {
          if (key !== 'id_empleado') {
            nuevoFormData.append(key, value)
          }
        }

        await this.documentosStore.updateDocumentoWithFile(idDocumento, nuevoFormData)
        await this.cargarDocumentos(true)

        this.notificationStore.success("El documento ha sido actualizado correctamente", "Documento actualizado")
        this.mostrarModalEdicion = false
      } catch (error) {
        this.notificationStore.error(
            error.response?.data?.message || error.message || "Ha ocurrido un error al actualizar el documento",
            "Error al actualizar"
        )
      } finally {
        this.guardandoDocumento = false
      }
    },

    confirmarEliminar(documento) {
      if (!this.canEditDocuments) {
        this.notificationStore.error('No tiene permisos para eliminar documentos', 'Error de permisos')
        return
      }

      this.documentoEliminar = documento
      this.mostrarModalEliminar = true
    },

    async eliminarDocumento() {
      if (!this.canEditDocuments || !this.documentoEliminar) {
        this.notificationStore.error('No tiene permisos para eliminar documentos', 'Error de permisos')
        return
      }

      try {
        this.eliminandoDocumento = true

        await this.documentosStore.deleteDocumento(this.documentoEliminar.id_documento)

        this.documentos = this.documentos.filter(doc =>
            doc.id_documento !== this.documentoEliminar.id_documento
        )

        await this.cargarDocumentos(true)

        this.notificationStore.success("El documento ha sido eliminado correctamente", "Documento eliminado")
        this.mostrarModalEliminar = false
        this.documentoEliminar = null
      } catch (error) {
        this.notificationStore.error(
            error.response?.data?.message || error.message || "Ha ocurrido un error al eliminar el documento",
            "Error al eliminar"
        )
      } finally {
        this.eliminandoDocumento = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'

      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },

    getFileIcon(fileName) {
      if (!fileName) return File

      fileName = fileName.toLowerCase()

      if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
        return FileImage
      }

      if (/\.(pdf|doc|docx|txt|rtf)$/i.test(fileName)) {
        return FileText
      }

      if (/\.(xls|xlsx|csv)$/i.test(fileName)) {
        return FileSpreadsheet
      }

      return File
    }
  }
}
</script>

<style scoped>
/* Estilos para el card */
.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.card-body {
  padding: 1.5rem;
}

/* Estilos originales del componente */
.documentos-empleado {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.documentos-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.documentos-search {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.documentos-actions {
  display: flex;
  gap: 0.5rem;
}

.documentos-loading,
.documentos-error,
.documentos-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 200px;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.error-message svg {
  color: #dc2626;
  margin-bottom: 1rem;
}

.empty-search-results,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-search-results h3,
.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.empty-search-results p,
.empty-state p {
  margin: 0 0 1rem 0;
  color: #6b7280;
}

.documentos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.documento-card {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
}

.documento-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.documento-inaccesible {
  opacity: 0.7;
  border: 1px solid #fee2e2;
  background-color: #fff5f5;
}

.documento-inaccesible .documento-icon {
  background-color: #fee2e2;
}

.documento-inaccesible-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.documento-inaccesible-badge svg {
  flex-shrink: 0;
}

.documento-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f9fafb;
  color: #dc2626;
}

.documento-info {
  padding: 1rem;
  flex: 1;
  cursor: pointer;
}

.documento-nombre {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.documento-fecha {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.documento-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 0.25rem;
  background-color: transparent;
  color: #4b5563;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.25rem;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action:not(:disabled):hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.btn-action-danger:hover {
  background-color: #fee2e2;
  color: #dc2626;
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

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-icon {
  margin-right: 0.5rem;
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

.btn-icon-only:hover {
  background-color: #f3f4f6;
  color: #dc2626;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn-danger:hover {
  background-color: #fecaca;
  color: #b91c1c;
}

@media (max-width: 768px) {
  .documentos-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .documentos-search {
    max-width: 100%;
    width: 100%;
  }

  .documentos-grid {
    grid-template-columns: 1fr;
  }
}
</style>