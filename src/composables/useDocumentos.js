import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useDocumentosStore } from '@/stores/documentos'
import { useNotificationStore } from '@/stores/notification'

/**
 * Composable para gestionar documentos
 */
export const useDocumentos = (idEmpleado) => {
    const documentosStore = useDocumentosStore()
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

    const documentosFiltrados = computed(() => {
        if (!documentos.value || documentos.value.length === 0) return []

        return documentos.value.filter(doc => {
            const busquedaMatch = !filtros.value.busqueda ||
                doc.nombre?.toLowerCase().includes(filtros.value.busqueda.toLowerCase()) ||
                doc.nombre_original?.toLowerCase().includes(filtros.value.busqueda.toLowerCase()) ||
                doc.tipo_documento?.toLowerCase().includes(filtros.value.busqueda.toLowerCase()) ||
                doc.observaciones?.toLowerCase().includes(filtros.value.busqueda.toLowerCase())

            const tipoMatch = !filtros.value.tipo || doc.tipo_documento === filtros.value.tipo

            const fechaDesdeMatch = !filtros.value.fechaDesde ||
                new Date(doc.fecha_subida) >= new Date(filtros.value.fechaDesde)

            const fechaHastaMatch = !filtros.value.fechaHasta ||
                new Date(doc.fecha_subida) <= new Date(filtros.value.fechaHasta)

            return busquedaMatch && tipoMatch && fechaDesdeMatch && fechaHastaMatch
        })
    })

    const tiposDocumento = computed(() => {
        if (!documentos.value || documentos.value.length === 0) return []

        const tipos = [...new Set(documentos.value.map(doc => doc.tipo_documento).filter(Boolean))]
        return tipos.sort()
    })

    const cargarDocumentos = async () => {
        if (!idEmpleado) return

        cargando.value = true
        error.value = null

        try {
            const response = await documentosStore.fetchDocumentosByEmpleado(idEmpleado)
            documentos.value = response || []
        } catch (err) {
            console.error('Error al cargar documentos:', err)
            error.value = err.message || 'Error al cargar los documentos'
            notificationStore.error(error.value, 'Error')
        } finally {
            cargando.value = false
        }
    }

    const actualizarFiltros = (nuevosFiltros) => {
        filtros.value = { ...nuevosFiltros }
    }

    const limpiarFiltros = () => {
        filtros.value = {
            busqueda: '',
            tipo: '',
            fechaDesde: '',
            fechaHasta: ''
        }
    }

    const previsualizarDocumento = async (documento) => {
        if (!documento) return

        if (documentoPreview.value && documentoPreview.value.id_documento === documento.id_documento) {
            console.log('El documento ya está siendo previsualizado')
            return
        }

        if (previewEnProceso.value) {
            console.log('Ya hay una previsualización en proceso, ignorando solicitud')
            return
        }

        previewEnProceso.value = true
        documentoPreview.value = documento
        cargandoPreview.value = true
        errorPreview.value = null
        urlPreview.value = null

        try {
            console.log(`Solicitando previsualización para documento ID: ${documento.id_documento}`)
            const url = await documentosStore.previewDocumento(documento.id_documento)

            if (!url) {
                throw new Error('No se pudo generar la URL de previsualización')
            }

            console.log("URL de previsualización recibida:", url)
            urlPreview.value = url
        } catch (err) {
            console.error('Error al obtener vista previa:', err)

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
            console.log("Liberando recursos de previsualización:", urlPreview.value)
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
            console.error('Error al descargar documento:', err)
            notificationStore.error(
                err.message || 'Ha ocurrido un error al descargar el documento',
                'Error al descargar'
            )
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
        if (!fileName) return 'File'

        fileName = fileName.toLowerCase()

        if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
            return 'FileImage'
        }

        if (/\.(pdf|doc|docx|txt|rtf)$/i.test(fileName)) {
            return 'FileText'
        }

        if (/\.(xls|xlsx|csv)$/i.test(fileName)) {
            return 'FileSpreadsheet'
        }

        return 'File'
    }

    watch(() => idEmpleado, (newId) => {
        if (newId) {
            cargarDocumentos()
        }
    }, { immediate: true })

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
        tiposDocumento,

        cargarDocumentos,
        actualizarFiltros,
        limpiarFiltros,
        previsualizarDocumento,
        cerrarPreview,
        descargarDocumento,
        formatDate,
        getFileIcon
    }
}