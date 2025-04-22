<template>
  <div class="documentos-empleado">
    <!-- Filtros y barra de herramientas (solo visible con permisos de escritura) -->
    <DocumentosFiltros
        v-if="canViewDocuments"
        :filtros="filtros"
        :mostrar-avanzados="mostrarFiltrosAvanzados"
        :vista="vistaDocumentos"
        @actualizar-filtro="actualizarFiltros"
        @limpiar-filtros="limpiarFiltros"
        @toggle-avanzados="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
        @subir-documento="canUploadDocuments ? mostrarModalSubida = true : mostrarMensajePermiso('subir')"
        @cambiar-vista="cambiarVista"
    />

    <!-- Mensaje de permisos insuficientes -->
    <div v-if="!canViewDocuments" class="error-container">
      <div class="error-message">
        <AlertTriangle size="24" />
        <p>No tiene permisos para ver documentos.</p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="cargando" class="loading-container">
      <LoadingSpinner message="Cargando documentos..." />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <AlertTriangle size="24" />
        <p>{{ error }}</p>
      </div>
      <button @click="cargarDocumentos" class="btn btn-primary">
        <RefreshCw size="16" class="btn-icon" />
        Reintentar
      </button>
    </div>

    <!-- Document list -->
    <DocumentosLista
        v-else-if="documentosFiltrados.length > 0"
        :documentos="documentosFiltrados"
        :vista="vistaDocumentos"
        @previsualizar="previsualizarDocumento"
        @descargar="descargarDocumento"
        @editar="canEditDocuments ? editarDocumento : mostrarMensajePermiso('editar')"
        @eliminar="canDeleteDocuments ? confirmarEliminar : mostrarMensajePermiso('eliminar')"
    />

    <!-- Empty state -->
    <DocumentosEstadoVacio
        v-else-if="canViewDocuments"
        :icono="documentos.length === 0 ? 'FileText' : 'Search'"
        :titulo="documentos.length === 0 ? 'No hay documentos' : 'No se encontraron resultados'"
        :mensaje="documentos.length === 0
          ? 'No se han subido documentos para este empleado.'
          : 'No se encontraron documentos que coincidan con los filtros aplicados.'"
        :mostrar-boton-subir="documentos.length === 0 && canUploadDocuments"
        :mostrar-boton-limpiar="documentos.length > 0"
        @subir-documento="canUploadDocuments ? mostrarModalSubida = true : mostrarMensajePermiso('subir')"
        @limpiar-filtros="limpiarFiltros"
    />

    <!-- Modals -->
    <DocumentoModalSubida
        v-if="mostrarModalSubida && canUploadDocuments"
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
        v-if="mostrarModalEliminar && canDeleteDocuments"
        :documento="documentoEliminar"
        :eliminando="eliminandoDocumento"
        @cerrar="mostrarModalEliminar = false"
        @eliminar="eliminarDocumento"
    />

    <DocumentoModalPrevista
        v-if="documentoPreview && canViewDocuments"
        :documento="documentoPreview"
        :url="urlPreview"
        :cargando="cargandoPreview"
        :error="errorPreview"
        @cerrar="cerrarPreview"
        @descargar="descargarDocumento"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useDocumentos } from "../../../composables/useDocumentos.js"
import { useNotificationStore } from "../../../stores/notification.js"
import { useDocumentosStore } from "../../../stores/documentos.js"
import { useAuthStore } from "../../../stores/auth.js"
import LoadingSpinner from "../../common/LoadingSpinner.vue"
import DocumentosFiltros from "./DocumentosFiltros.vue"
import DocumentosLista from "./DocumentosLista.vue"
import DocumentosEstadoVacio from "./DocumentosEstadoVacio.vue"
import DocumentoModalSubida from "../modals/DocumentoModalSubida.vue"
import DocumentoModalEdicion from "../modals/DocumentoModalEdicion.vue"
import DocumentoModalEliminar from "../modals/DocumentoModalEliminar.vue"
import DocumentoModalPrevistaEmpleados from "../modals/DocumentoModalPrevistaEmpleados.vue"
import { AlertTriangle, RefreshCw } from "lucide-vue-next"

export default {
  name: "DocumentosEmpleado",

  components: {
    LoadingSpinner,
    DocumentosFiltros,
    DocumentosLista,
    DocumentosEstadoVacio,
    DocumentoModalSubida,
    DocumentoModalEdicion,
    DocumentoModalEliminar,
    DocumentoModalPrevista: DocumentoModalPrevistaEmpleados,
    AlertTriangle,
    RefreshCw
  },

  props: {
    idEmpleado: {
      type: [Number, String],
      required: true,
    },
  },

  setup(props) {
    const notificationStore = useNotificationStore()
    const authStore = useAuthStore()
    const vistaDocumentos = ref('grid')

    const canViewDocuments = computed(() => {
      return authStore.hasPermission({ nombre: "Documentos", tipo: "Lectura" });
    });

    const canUploadDocuments = computed(() => {
      return authStore.hasPermission({ nombre: "Documentos", tipo: "Escritura" });
    });

    const canEditDocuments = computed(() => {
      return authStore.hasPermission({ nombre: "Documentos", tipo: "Escritura" });
    });

    const canDeleteDocuments = computed(() => {
      return authStore.hasPermission({ nombre: "Documentos", tipo: "Escritura" });
    });

    const mostrarFiltrosAvanzados = ref(false)
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

    const {
      documentos,
      documentosFiltrados,
      cargando,
      error,
      filtros,
      documentoPreview,
      urlPreview,
      cargandoPreview,
      errorPreview,
      cargarDocumentos,
      actualizarFiltros,
      limpiarFiltros,
      previsualizarDocumento: originalPrevisualizarDocumento,
      cerrarPreview,
      descargarDocumento: originalDescargarDocumento
    } = useDocumentos(props.idEmpleado)

    const mostrarMensajePermiso = (accion) => {
      notificationStore.error(`No tiene permisos para ${accion} documentos`, 'Error de permisos');
    };

    const previsualizarDocumento = (documento) => {
      if (!canViewDocuments.value) {
        mostrarMensajePermiso('ver');
        return;
      }
      originalPrevisualizarDocumento(documento);
    };

    const descargarDocumento = (documento) => {
      if (!canViewDocuments.value) {
        mostrarMensajePermiso('descargar');
        return;
      }
      originalDescargarDocumento(documento);
    };

    const manejarSeleccionArchivo = (archivo) => {
      if (!canUploadDocuments.value) {
        mostrarMensajePermiso('subir');
        return;
      }
      archivoSeleccionado.value = archivo
    }

    const manejarSoltarArchivo = (archivo) => {
      if (!canUploadDocuments.value) {
        mostrarMensajePermiso('subir');
        return;
      }
      archivoSeleccionado.value = archivo
    }

    const eliminarArchivoSeleccionado = () => {
      if (!canUploadDocuments.value) {
        mostrarMensajePermiso('eliminar');
        return;
      }
      archivoSeleccionado.value = null
    }

    const validarDocumento = (documento, requiereArchivo = true) => {
      const errores = {}

      if (!documento.nombre || documento.nombre.trim() === "") {
        errores.nombre = "El nombre del documento es obligatorio"
      }

      if (!documento.tipo_documento || documento.tipo_documento === "") {
        errores.tipo = "Debe seleccionar un tipo de documento"
      }

      if (requiereArchivo && !archivoSeleccionado.value) {
        errores.archivo = "Debe seleccionar un archivo"
      }

      erroresValidacion.value = errores
      return Object.keys(errores).length === 0
    }

    const subirDocumento = async (nuevoDoc) => {
      if (!canUploadDocuments.value) {
        mostrarMensajePermiso('subir');
        return;
      }

      if (!validarDocumento(nuevoDoc)) {
        return
      }

      try {
        subiendoDocumento.value = true

        const formData = new FormData()
        formData.append("archivo", archivoSeleccionado.value)
        formData.append("nombre", nuevoDoc.nombre)
        formData.append("tipo_documento", nuevoDoc.tipo_documento)
        formData.append("observaciones", nuevoDoc.observaciones || "")
        formData.append("id_empleado", props.idEmpleado)

        const documentosStore = useDocumentosStore()
        await documentosStore.uploadDocumento(formData)
        await cargarDocumentos()

        notificationStore.success("El documento ha sido subido correctamente", "Documento subido")
        cerrarModalSubida()
      } catch (error) {
        console.error("Error al subir documento:", error)
        notificationStore.error(error.message || "Ha ocurrido un error al subir el documento", "Error al subir")
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
        mostrarMensajePermiso('editar');
        return;
      }
      documentoEditando.value = { ...documento }
      mostrarModalEdicion.value = true
      erroresValidacion.value = {}
    }

    const actualizarDocumento = async (documentoActualizado) => {
      if (!canEditDocuments.value) {
        mostrarMensajePermiso('editar');
        return;
      }

      if (!validarDocumento(documentoActualizado, false)) {
        return
      }

      try {
        guardandoDocumento.value = true
        const documentosStore = useDocumentosStore()
        await documentosStore.updateDocumento(documentoActualizado.id_documento, documentoActualizado)
        await cargarDocumentos()

        notificationStore.success("El documento ha sido actualizado correctamente", "Documento actualizado")
        mostrarModalEdicion.value = false
      } catch (error) {
        console.error("Error al actualizar documento:", error)
        notificationStore.error(
            error.message || "Ha ocurrido un error al actualizar el documento",
            "Error al actualizar"
        )
      } finally {
        guardandoDocumento.value = false
      }
    }

    const actualizarDocumentoConArchivo = async (formData, idDocumento) => {
      if (!canEditDocuments.value) {
        mostrarMensajePermiso('editar');
        return;
      }

      try {
        guardandoDocumento.value = true
        const documentosStore = useDocumentosStore()
        await documentosStore.updateDocumentoWithFile(idDocumento, formData)
        await cargarDocumentos()

        notificationStore.success("El documento ha sido actualizado correctamente", "Documento actualizado")
        mostrarModalEdicion.value = false
      } catch (error) {
        console.error("Error al actualizar documento con archivo:", error)
        notificationStore.error(
            error.message || "Ha ocurrido un error al actualizar el documento",
            "Error al actualizar"
        )
      } finally {
        guardandoDocumento.value = false
      }
    }

    const confirmarEliminar = (documento) => {
      if (!canDeleteDocuments.value) {
        mostrarMensajePermiso('eliminar');
        return;
      }
      documentoEliminar.value = documento
      mostrarModalEliminar.value = true
    }

    const eliminarDocumento = async () => {
      if (!canDeleteDocuments.value || !documentoEliminar.value) {
        mostrarMensajePermiso('eliminar');
        return;
      }

      try {
        eliminandoDocumento.value = true
        const documentosStore = useDocumentosStore()
        await documentosStore.deleteDocumento(documentoEliminar.value.id_documento)
        await cargarDocumentos()

        notificationStore.success("El documento ha sido eliminado correctamente", "Documento eliminado")
        mostrarModalEliminar.value = false
        documentoEliminar.value = null
      } catch (error) {
        console.error("Error al eliminar documento:", error)
        notificationStore.error(
            error.message || "Ha ocurrido un error al eliminar el documento",
            "Error al eliminar"
        )
      } finally {
        eliminandoDocumento.value = false
      }
    }

    const cambiarVista = (nuevaVista) => {
      vistaDocumentos.value = nuevaVista
    }

    onMounted(() => {
      if (canViewDocuments.value) {
        cargarDocumentos();
      }
    });

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

      vistaDocumentos,
      mostrarFiltrosAvanzados,
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
      canUploadDocuments,
      canEditDocuments,
      canDeleteDocuments,
      mostrarMensajePermiso,

      cargarDocumentos,
      actualizarFiltros,
      limpiarFiltros,
      previsualizarDocumento,
      cerrarPreview,
      descargarDocumento,

      cambiarVista,
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
      eliminarDocumento
    }
  }
}
</script>

<style scoped>
.documentos-empleado {
  width: 100%;
}

.loading-container,
.error-container {
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
}

.btn-primary:hover {
  background-color: #b91c1c;
}
</style>