import { ref, computed, watch } from 'vue'
import { useDocumentosStore } from "../stores/documentos"
import { useNotificationStore } from "../stores/notification"

export function useDocumentos(idEmpleado = null) {
    const documentosStore = useDocumentosStore()
    const notificationStore = useNotificationStore()

    const cargando = ref(false)
    const error = ref(null)
    const documentoPreview = ref(null)
    const urlPreview = ref(null)
    const cargandoPreview = ref(false)
    const errorPreview = ref(null)

    const filtros = ref({
        busqueda: "",
        tipo: "",
        fechaDesde: "",
        fechaHasta: "",
        activos: true,
        archivados: false,
    })

    const documentosFiltrados = computed(() => {
        if (!documentosStore.documentos || !Array.isArray(documentosStore.documentos)) {
            return []
        }

        let resultado = [...documentosStore.documentos]

        if (filtros.value.busqueda) {
            const busqueda = filtros.value.busqueda.toLowerCase()
            resultado = resultado.filter(
                (doc) =>
                    (doc.nombre && doc.nombre.toLowerCase().includes(busqueda)) ||
                    (doc.observaciones && doc.observaciones.toLowerCase().includes(busqueda)),
            )
        }

        if (filtros.value.tipo) {
            resultado = resultado.filter((doc) => doc.tipo_documento === filtros.value.tipo)
        }

        if (filtros.value.fechaDesde) {
            const fechaDesde = new Date(filtros.value.fechaDesde)
            resultado = resultado.filter((doc) => {
                if (!doc.fecha_subida) return false
                const fechaDoc = new Date(doc.fecha_subida)
                return fechaDoc >= fechaDesde
            })
        }

        if (filtros.value.fechaHasta) {
            const fechaHasta = new Date(filtros.value.fechaHasta)
            fechaHasta.setHours(23, 59, 59)
            resultado = resultado.filter((doc) => {
                if (!doc.fecha_subida) return false
                const fechaDoc = new Date(doc.fecha_subida)
                return fechaDoc <= fechaHasta
            })
        }

        return resultado
    })

    const esPDF = computed(() => {
        if (!documentoPreview.value) return false

        if (documentoPreview.value.mimetype === 'application/pdf') return true

        const nombreOriginal = documentoPreview.value.nombre_original?.toLowerCase() || ''
        return nombreOriginal.endsWith('.pdf')
    })

    const esImagen = computed(() => {
        if (!documentoPreview.value) return false

        const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp']
        if (documentoPreview.value.mimetype && imageTypes.includes(documentoPreview.value.mimetype)) return true

        const nombreOriginal = documentoPreview.value.nombre_original?.toLowerCase() || ''
        return /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(nombreOriginal)
    })

    const cargarDocumentos = async () => {
        cargando.value = true
        error.value = null

        try {
            if (idEmpleado) {
                await documentosStore.fetchDocumentosByEmpleado(idEmpleado)
            } else {
                await documentosStore.fetchDocumentos()
            }
        } catch (err) {
            console.error("Error al cargar documentos:", err)
            error.value = err.message || "Error al cargar documentos"
            notificationStore.error(error.value)
        } finally {
            cargando.value = false
        }
    }

    const actualizarFiltros = (nuevosFiltros) => {
        filtros.value = { ...filtros.value, ...nuevosFiltros }
    }

    const limpiarFiltros = () => {
        filtros.value = {
            busqueda: "",
            tipo: "",
            fechaDesde: "",
            fechaHasta: "",
            activos: true,
            archivados: false,
        }
    }

    const previsualizarDocumento = async (documento) => {
        if (!documento) return

        documentoPreview.value = documento
        cargandoPreview.value = true
        errorPreview.value = null
        urlPreview.value = null

        try {
            // Obtener la URL de vista previa directamente del store
            const url = await documentosStore.previewDocumento(documento.id_documento)

            if (!url) {
                throw new Error("No se pudo generar la URL de previsualización")
            }

            urlPreview.value = url
        } catch (error) {
            console.error("Error al obtener vista previa:", error)
            errorPreview.value = error.message || "No se pudo cargar la vista previa del documento"
            notificationStore.warning(errorPreview.value, "Error de previsualización")
        } finally {
            cargandoPreview.value = false
        }
    }

    const cerrarPreview = () => {
        if (urlPreview.value) {
            URL.revokeObjectURL(urlPreview.value)
        }
        documentoPreview.value = null
        urlPreview.value = null
        errorPreview.value = null
    }

    const descargarDocumento = async (documento) => {
        if (!documento) return

        try {
            await documentosStore.downloadDocumento(documento.id_documento)
        } catch (error) {
            console.error("Error al descargar documento:", error)
            notificationStore.error(
                error.message || "Ha ocurrido un error al descargar el documento",
                "Error al descargar"
            )
        }
    }

    const formatearFecha = (fechaString) => {
        if (!fechaString) return "Fecha desconocida"

        const fecha = new Date(fechaString)
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const formatearTamano = (bytes) => {
        if (!bytes || bytes === 0) return "Desconocido"

        const unidades = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))

        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${unidades[i]}`
    }

    const obtenerIconoPorTipo = (tipo) => {
        if (!tipo) return 'File'

        const tipoLower = tipo.toLowerCase()

        if (tipoLower.includes('contrato')) return 'FileText'
        if (tipoLower.includes('cv') || tipoLower.includes('curriculum')) return 'FileText'
        if (tipoLower.includes('dni') || tipoLower.includes('nie')) return 'FileText'
        if (tipoLower.includes('nomina')) return 'FileSpreadsheet'
        if (tipoLower.includes('seguridad')) return 'FileText'
        if (tipoLower.includes('titulacion')) return 'FileText'
        if (tipoLower.includes('pdf')) return 'FileText'
        if (tipoLower.includes('imagen') || /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(tipoLower)) return 'FileImage'

        return 'File'
    }

    if (idEmpleado) {
        cargarDocumentos()

        watch(() => idEmpleado, (nuevoId) => {
            if (nuevoId) {
                cargarDocumentos()
            }
        })
    }

    return {
        documentos: computed(() => documentosStore.documentos || []),
        documentosFiltrados,
        cargando,
        error,
        filtros,
        documentoPreview,
        urlPreview,
        cargandoPreview,
        errorPreview,
        esPDF,
        esImagen,

        cargarDocumentos,
        actualizarFiltros,
        limpiarFiltros,
        previsualizarDocumento,
        cerrarPreview,
        descargarDocumento,
        formatearFecha,
        formatearTamano,
        obtenerIconoPorTipo
    }
}