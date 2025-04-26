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
                @click="cargarDocumentos"
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
          <button @click="cargarDocumentos" class="btn btn-primary btn-sm">
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
          >
            <div class="documento-icon">
              <component :is="getFileIcon(documento.nombre_original)" size="24" />
            </div>
            <div class="documento-info" @click.stop="solicitarPrevisualizacion(documento)">
              <h4 class="documento-nombre">{{ documento.nombre }}</h4>
              <p class="documento-tipo">{{ documento.tipo_documento }}</p>
              <p class="documento-fecha">
                {{ formatDate(documento.fecha_subida) }}
              </p>
            </div>
            <div class="documento-actions">
              <button
                  @click.stop="solicitarPrevisualizacion(documento)"
                  class="btn-action"
                  title="Ver documento"
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
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
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

  setup(props, { emit }) {
    const documentosStore = useDocumentosStore()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()

    const documentos = ref([])
    const cargando = ref(false)
    const error = ref(null)

    const filtros = ref({
      busqueda: '',
      tipo: '',
      fechaDesde: '',
      fechaHasta: ''
    })

    const documentoPreview = ref(null)
    const urlPreview = ref(null)
    const cargandoPreview = ref(false)
    const errorPreview = ref(null)
    const previewEnProceso = ref(false)
    const previewTimeoutId = ref(null)

    const mostrarModalSubida = ref(false)
    const mostrarModalEdicion = ref(false)
    const mostrarModalEliminar = ref(false)

    const documentoEditando = ref(null)
    const documentoEliminar = ref(null)

    const archivoSeleccionado = ref(null)
    const subiendoDocumento = ref(false)
    const guardandoDocumento = ref(false)
    const eliminandoDocumento = ref(false)
    const erroresValidacion = ref({})

    const canViewDocuments = computed(() =>
        authStore.hasPermission({ nombre: "Documentos", tipo: "Lectura" })
    )

    const canEditDocuments = computed(() =>
        authStore.hasPermission({ nombre: "Documentos", tipo: "Escritura" })
    )

    const documentosFiltrados = computed(() => {
      if (!documentos.value?.length) return []

      if (!filtros.value.busqueda) return documentos.value

      const busqueda = filtros.value.busqueda.toLowerCase()
      return documentos.value.filter(doc =>
          doc.nombre?.toLowerCase().includes(busqueda) ||
          doc.nombre_original?.toLowerCase().includes(busqueda) ||
          doc.tipo_documento?.toLowerCase().includes(busqueda) ||
          doc.observaciones?.toLowerCase().includes(busqueda)
      )
    })

    const cargarDocumentos = async () => {
      if (!props.idEmpleado) {
        error.value = 'No se pudo identificar al empleado'
        return
      }

      cargando.value = true
      error.value = null

      try {
        const response = await documentosStore.fetchDocumentosByEmpleado(props.idEmpleado)
        documentos.value = response || []
      } catch (err) {
        error.value = err.message || 'Error al cargar los documentos'
        notificationStore.error(error.value, 'Error')
      } finally {
        cargando.value = false
      }
    }

    const actualizarFiltros = () => {}

    const limpiarFiltros = () => {
      filtros.value = {
        busqueda: '',
        tipo: '',
        fechaDesde: '',
        fechaHasta: ''
      }
    }

    const solicitarPrevisualizacion = (documento) => {
      if (!documento) return

      if (props.manejoPreview) {
        previsualizarDocumento(documento)
      } else {
        emit('previsualizar', documento)
      }
    }

    const previsualizarDocumento = async (documento) => {
      if (!documento) return

      if (documentoPreview.value?.id_documento === documento.id_documento) return

      if (previewEnProceso.value) return

      previewEnProceso.value = true
      documentoPreview.value = documento
      cargandoPreview.value = true
      errorPreview.value = null
      urlPreview.value = null

      try {
        const url = await documentosStore.previewDocumento(documento.id_documento)

        if (!url) {
          throw new Error('No se pudo generar la URL de previsualización')
        }

        urlPreview.value = url
      } catch (err) {
        let mensajeError = err.message || 'No se pudo cargar la vista previa del documento'

        if (err.response) {
          const status = err.response.status
          if (status === 404) {
            mensajeError = 'El documento solicitado no existe o no está disponible'
          } else if (status === 403) {
            mensajeError = 'No tiene permisos para ver este documento'
          } else {
            mensajeError = `Error del servidor (${status}): ${err.response.statusText}`
          }
        }

        errorPreview.value = mensajeError
        notificationStore.warning(errorPreview.value, 'Error de previsualización')
      } finally {
        cargandoPreview.value = false

        previewTimeoutId.value = setTimeout(() => {
          previewEnProceso.value = false
        }, 300)
      }
    }

    const cerrarPreview = () => {
      if (urlPreview.value) {
        URL.revokeObjectURL(urlPreview.value)
      }
      documentoPreview.value = null
      urlPreview.value = null
      errorPreview.value = null
      previewEnProceso.value = false

      if (previewTimeoutId.value) {
        clearTimeout(previewTimeoutId.value)
        previewTimeoutId.value = null
      }
    }

    const descargarDocumento = async (documento) => {
      if (!documento) return

      try {
        await documentosStore.downloadDocumento(documento.id_documento)
      } catch (err) {
        notificationStore.error(
            err.message || 'Ha ocurrido un error al descargar el documento',
            'Error al descargar'
        )
      }
    }

    const manejarSeleccionArchivo = (archivo) => {
      archivoSeleccionado.value = archivo
    }

    const manejarSoltarArchivo = (archivo) => {
      archivoSeleccionado.value = archivo
    }

    const eliminarArchivoSeleccionado = () => {
      archivoSeleccionado.value = null
    }

    const validarDocumento = (documento, requiereArchivo = true) => {
      const errores = {}

      if (!documento.nombre?.trim()) {
        errores.nombre = "El nombre del documento es obligatorio"
      }

      if (!documento.tipo_documento) {
        errores.tipo = "Debe seleccionar un tipo de documento"
      }

      if (requiereArchivo && !archivoSeleccionado.value) {
        errores.archivo = "Debe seleccionar un archivo"
      }

      erroresValidacion.value = errores
      return Object.keys(errores).length === 0
    }

    const subirDocumento = async (nuevoDoc) => {
      if (!canEditDocuments.value) {
        notificationStore.error('No tiene permisos para subir documentos', 'Error de permisos')
        return
      }

      if (!props.idEmpleado) {
        notificationStore.error('No se pudo identificar al empleado', 'Error')
        return
      }

      if (!validarDocumento(nuevoDoc)) {
        return
      }

      try {
        subiendoDocumento.value = true

        const formData = new FormData()

        formData.append("id_empleado", String(props.idEmpleado))

        formData.append("archivo", archivoSeleccionado.value)
        formData.append("nombre", nuevoDoc.nombre)
        formData.append("tipo_documento", nuevoDoc.tipo_documento)
        formData.append("observaciones", nuevoDoc.observaciones || "")

        await documentosStore.uploadDocumento(formData)
        await cargarDocumentos()

        notificationStore.success("El documento ha sido subido correctamente", "Documento subido")
        cerrarModalSubida()
      } catch (error) {
        if (error.response?.data?.errors) {
          erroresValidacion.value = error.response.data.errors
        }

        notificationStore.error(
            error.response?.data?.message || error.message || "Ha ocurrido un error al subir el documento",
            "Error al subir"
        )
      } finally {
        subiendoDocumento.value = false
      }
    }

    const cerrarModalSubida = () => {
      mostrarModalSubida.value = false
      archivoSeleccionado.value = null
      erroresValidacion.value = {}
    }

    const editarDocumento = (documento) => {
      if (!canEditDocuments.value) {
        notificationStore.error('No tiene permisos para editar documentos', 'Error de permisos')
        return
      }

      documentoEditando.value = { ...documento }
      mostrarModalEdicion.value = true
      erroresValidacion.value = {}
    }

    const actualizarDocumento = async (documentoActualizado) => {
      if (!canEditDocuments.value) {
        notificationStore.error('No tiene permisos para editar documentos', 'Error de permisos')
        return
      }

      if (!validarDocumento(documentoActualizado, false)) {
        return
      }

      try {
        guardandoDocumento.value = true

        const docToUpdate = {
          ...documentoActualizado,
          id_empleado: props.idEmpleado
        }

        await documentosStore.updateDocumento(docToUpdate.id_documento, docToUpdate)
        await cargarDocumentos()

        notificationStore.success("El documento ha sido actualizado correctamente", "Documento actualizado")
        mostrarModalEdicion.value = false
      } catch (error) {
        notificationStore.error(
            error.response?.data?.message || error.message || "Ha ocurrido un error al actualizar el documento",
            "Error al actualizar"
        )
      } finally {
        guardandoDocumento.value = false
      }
    }

    const actualizarDocumentoConArchivo = async (formData, idDocumento) => {
      if (!canEditDocuments.value) {
        notificationStore.error('No tiene permisos para editar documentos', 'Error de permisos')
        return
      }

      if (!props.idEmpleado) {
        notificationStore.error('No se pudo identificar al empleado', 'Error')
        return
      }

      try {
        guardandoDocumento.value = true

        const nuevoFormData = new FormData()

        nuevoFormData.append('id_empleado', String(props.idEmpleado))

        for (const [key, value] of formData.entries()) {
          if (key !== 'id_empleado') {
            nuevoFormData.append(key, value)
          }
        }

        await documentosStore.updateDocumentoWithFile(idDocumento, nuevoFormData)
        await cargarDocumentos()

        notificationStore.success("El documento ha sido actualizado correctamente", "Documento actualizado")
        mostrarModalEdicion.value = false
      } catch (error) {
        notificationStore.error(
            error.response?.data?.message || error.message || "Ha ocurrido un error al actualizar el documento",
            "Error al actualizar"
        )
      } finally {
        guardandoDocumento.value = false
      }
    }

    const confirmarEliminar = (documento) => {
      if (!canEditDocuments.value) {
        notificationStore.error('No tiene permisos para eliminar documentos', 'Error de permisos')
        return
      }

      documentoEliminar.value = documento
      mostrarModalEliminar.value = true
    }

    const eliminarDocumento = async () => {
      if (!canEditDocuments.value || !documentoEliminar.value) {
        notificationStore.error('No tiene permisos para eliminar documentos', 'Error de permisos')
        return
      }

      try {
        eliminandoDocumento.value = true

        await documentosStore.deleteDocumento(documentoEliminar.value.id_documento)
        await cargarDocumentos()

        notificationStore.success("El documento ha sido eliminado correctamente", "Documento eliminado")
        mostrarModalEliminar.value = false
        documentoEliminar.value = null
      } catch (error) {
        notificationStore.error(
            error.response?.data?.message || error.message || "Ha ocurrido un error al eliminar el documento",
            "Error al eliminar"
        )
      } finally {
        eliminandoDocumento.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'

      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const getFileIcon = (fileName) => {
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

    onMounted(() => {
      if (canViewDocuments.value && props.idEmpleado) {
        cargarDocumentos()
      }
    })

    watch(() => props.idEmpleado, (newId) => {
      if (newId && canViewDocuments.value) {
        cargarDocumentos()
      }
    })

    onBeforeUnmount(() => {
      if (urlPreview.value) {
        URL.revokeObjectURL(urlPreview.value)
      }

      if (previewTimeoutId.value) {
        clearTimeout(previewTimeoutId.value)
      }
    })

    return {
      documentos,
      documentosFiltrados,
      cargando,
      error,
      filtros,
      documentoPreview,
      urlPreview,
      cargandoPreview,
      errorPreview,
      previewEnProceso,
      mostrarModalSubida,
      mostrarModalEdicion,
      mostrarModalEliminar,
      documentoEditando,
      documentoEliminar,
      archivoSeleccionado,
      subiendoDocumento,
      guardandoDocumento,
      eliminandoDocumento,
      erroresValidacion,

      canViewDocuments,
      canEditDocuments,

      cargarDocumentos,
      actualizarFiltros,
      limpiarFiltros,
      solicitarPrevisualizacion,
      previsualizarDocumento,
      cerrarPreview,
      descargarDocumento,
      manejarSeleccionArchivo,
      manejarSoltarArchivo,
      eliminarArchivoSeleccionado,
      validarDocumento,
      subirDocumento,
      cerrarModalSubida,
      editarDocumento,
      actualizarDocumento,
      actualizarDocumentoConArchivo,
      confirmarEliminar,
      eliminarDocumento,
      formatDate,
      getFileIcon
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

.documento-tipo {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0 0 0.25rem 0;
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

.btn-action:hover {
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