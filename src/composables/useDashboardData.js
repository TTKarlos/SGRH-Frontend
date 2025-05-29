import { ref, reactive } from "vue"
import { useEmpleadosStore } from "@/stores/empleados"
import { useContratosStore } from "@/stores/contratos"
import { useAusenciasStore } from "@/stores/ausencias"
import { useDocumentosStore } from "@/stores/documentos"
import { useEmpresasStore } from "@/stores/empresas"
import { useCentrosStore } from "@/stores/centros"
import { useDepartamentosStore } from "@/stores/departamentos"
import { useZonasStore } from "@/stores/zonas"
import { useAuthStore } from "@/stores/auth"

export function useDashboardData() {
    const empleadosStore = useEmpleadosStore()
    const contratosStore = useContratosStore()
    const ausenciasStore = useAusenciasStore()
    const documentosStore = useDocumentosStore()
    const empresasStore = useEmpresasStore()
    const centrosStore = useCentrosStore()
    const departamentosStore = useDepartamentosStore()
    const zonasStore = useZonasStore()
    const authStore = useAuthStore()

    const loading = ref(true)
    const error = ref(null)

    const totalEmpleados = ref(0)
    const totalDocumentos = ref(0)
    const totalEmpresas = ref(0)
    const totalCentros = ref(0)

    const selectedPeriod = ref("month")

    const activities = ref([])
    const vencimientos = reactive({
        contratos: [],
    })

    const generateActivities = () => {
        const allActivities = []
        const now = new Date()

        try {
            const currentUser = authStore.user || { nombre: "Sistema", id: "system" }

            const empleados = empleadosStore.empleados || []
            if (empleados.length > 0) {
                const empleadosConFecha = empleados
                    .filter(e => e.fecha_alta && new Date(e.fecha_alta).toString() !== 'Invalid Date')
                    .sort((a, b) => new Date(b.fecha_alta) - new Date(a.fecha_alta))
                    .slice(0, 3)

                empleadosConFecha.forEach(empleado => {
                    const creador = empleado.creado_por ?
                        { nombre: empleado.creado_por } :
                        { nombre: "Administrador" }

                    allActivities.push({
                        tipo: "empleado_nuevo",
                        texto: `<strong>${creador.nombre}</strong> creó el empleado <strong>${empleado.nombre || ''} ${empleado.apellidos || ""}</strong>`,
                        fecha: empleado.fecha_alta,
                        timestamp: new Date(empleado.fecha_alta).getTime(),
                        entidad: "empleado",
                        accion: "create",
                        usuario: creador.nombre,
                        id_entidad: empleado.id_empleado
                    })
                })
            }

            if (empleadosStore.actividades && empleadosStore.actividades.length > 0) {
                const actualizacionesEmpleados = empleadosStore.actividades
                    .filter(a => a.tipo === 'empleado_update')
                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                    .slice(0, 3)

                actualizacionesEmpleados.forEach(actividad => {
                    allActivities.push({
                        tipo: "empleado_update",
                        texto: actividad.texto,
                        fecha: actividad.fecha,
                        timestamp: new Date(actividad.fecha).getTime(),
                        entidad: "empleado",
                        accion: "update",
                        usuario: actividad.usuario,
                        id_entidad: actividad.id_empleado
                    })
                })
            }

            const contratos = contratosStore.contratos || []
            if (contratos.length > 0) {
                const contratosNuevos = contratos
                    .filter(c => c.fecha_creacion && new Date(c.fecha_creacion).toString() !== 'Invalid Date')
                    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                    .slice(0, 3)

                contratosNuevos.forEach(contrato => {
                    const empleado = empleadosStore.empleados?.find(e => e.id_empleado === contrato.id_empleado)
                    const nombreEmpleado = empleado ?
                        `${empleado.nombre || ''} ${empleado.apellidos || ""}` :
                        "Empleado"

                    const creador = contrato.creado_por ?
                        { nombre: contrato.creado_por } :
                        { nombre: "Administrador" }

                    allActivities.push({
                        tipo: "contrato_nuevo",
                        texto: `<strong>${creador.nombre}</strong> creó un nuevo contrato para <strong>${nombreEmpleado}</strong>`,
                        fecha: contrato.fecha_creacion || contrato.fecha_inicio,
                        timestamp: new Date(contrato.fecha_creacion || contrato.fecha_inicio).getTime(),
                        entidad: "contrato",
                        accion: "create",
                        usuario: creador.nombre,
                        id_entidad: contrato.id_contrato
                    })
                })
            }

            const documentos = documentosStore.documentos || []
            if (documentos.length > 0) {
                const documentosRecientes = documentos
                    .filter(d => d.fecha_subida && new Date(d.fecha_subida).toString() !== 'Invalid Date')
                    .sort((a, b) => new Date(b.fecha_subida) - new Date(a.fecha_subida))
                    .slice(0, 3)

                documentosRecientes.forEach(documento => {
                    const empleado = empleadosStore.empleados?.find(e => e.id_empleado === documento.id_empleado)
                    const nombreEmpleado = empleado ?
                        `${empleado.nombre || ''} ${empleado.apellidos || ""}` :
                        "Empleado"

                    const creador = documento.subido_por ?
                        { nombre: documento.subido_por } :
                        { nombre: nombreEmpleado }

                    allActivities.push({
                        tipo: "documento_nuevo",
                        texto: `<strong>${creador.nombre}</strong> subió el documento <strong>${documento.nombre || "Documento"}</strong>`,
                        fecha: documento.fecha_subida,
                        timestamp: new Date(documento.fecha_subida).getTime(),
                        entidad: "documento",
                        accion: "create",
                        usuario: creador.nombre,
                        id_entidad: documento.id_documento
                    })
                })
            }

            const ausencias = ausenciasStore.ausencias || []
            if (ausencias.length > 0) {
                const ausenciasRecientes = ausencias
                    .filter(a => a.fecha_creacion && new Date(a.fecha_creacion).toString() !== 'Invalid Date')
                    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                    .slice(0, 3)

                ausenciasRecientes.forEach(ausencia => {
                    const empleado = empleadosStore.empleados?.find(e => e.id_empleado === ausencia.id_empleado)
                    const nombreEmpleado = empleado ?
                        `${empleado.nombre || ''} ${empleado.apellidos || ""}` :
                        "Empleado"

                    const creador = ausencia.creado_por ?
                        { nombre: ausencia.creado_por } :
                        { nombre: "Administrador" }

                    allActivities.push({
                        tipo: "ausencia_nueva",
                        texto: `<strong>${creador.nombre}</strong> registró una ausencia para <strong>${nombreEmpleado}</strong>`,
                        fecha: ausencia.fecha_creacion || ausencia.fecha_inicio,
                        timestamp: new Date(ausencia.fecha_creacion || ausencia.fecha_inicio).getTime(),
                        entidad: "ausencia",
                        accion: "create",
                        usuario: creador.nombre,
                        id_entidad: ausencia.id_ausencia
                    })
                })
            }
        } catch (err) {
            console.error("Error al generar actividades:", err)
        }

        if (allActivities.length === 0) {
            allActivities.push({
                tipo: "sistema",
                texto: `Sistema RRHH inicializado`,
                fecha: now.toISOString(),
                timestamp: now.getTime(),
                entidad: "sistema",
                accion: "info",
                usuario: "Sistema",
                id_entidad: null
            })
        }

        return allActivities
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10)
    }

    const generateVencimientos = async () => {
        try {
            const { contratos: contratosProximos, estadisticas } = await contratosStore.fetchContratosProximosAVencer({
                dias: 90,
                limit: 5
            })

            const proximosVencimientos = contratosProximos.map(contrato => {
                try {
                    const empleado = contrato.Empleado || {}
                    const nombreEmpleado = `${empleado.nombre || ''} ${empleado.apellidos || ""}`

                    const tipoContrato = contrato.TipoContrato || {}

                    return {
                        id_contrato: contrato.id_contrato,
                        id_empleado: contrato.id_empleado,
                        titulo: `Contrato de ${nombreEmpleado}`,
                        subtitulo: tipoContrato.nombre || "Contrato",
                        fecha: contrato.fecha_fin,
                        diasRestantes: contrato.diasRestantes || 0
                    }
                } catch (err) {
                    console.error("Error al procesar contrato:", err)
                    return null
                }
            }).filter(Boolean)

            vencimientos.contratos = proximosVencimientos
            return proximosVencimientos
        } catch (error) {
            console.error("Error al obtener contratos próximos a vencer:", error)
            vencimientos.contratos = []
            return []
        }
    }

    const generateChartData = (tipo) => {
        try {
            const empleados = empleadosStore.empleados || []

            if (empleados.length === 0) {
                return []
            }

            switch (tipo) {
                case 'departamentos': {
                    const departamentos = {}

                    empleados.forEach(empleado => {
                        if (!empleado.departamento) return

                        const deptName = empleado.departamento.nombre || 'Sin departamento'
                        departamentos[deptName] = (departamentos[deptName] || 0) + 1
                    })

                    return Object.entries(departamentos)
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count)
                }

                case 'empresas': {
                    const empresas = {}

                    empleados.forEach(empleado => {
                        if (!empleado.empresa) return

                        const empresaName = empleado.empresa.nombre || 'Sin empresa'
                        empresas[empresaName] = (empresas[empresaName] || 0) + 1
                    })

                    return Object.entries(empresas)
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count)
                }

                case 'zonas': {
                    const zonas = {}

                    empleados.forEach(empleado => {
                        if (!empleado.centro) return

                        const zonaName = empleado.centro.zona?.nombre || 'Sin zona'
                        zonas[zonaName] = (zonas[zonaName] || 0) + 1
                    })

                    return Object.entries(zonas)
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count)
                }

                default:
                    return []
            }
        } catch (err) {
            console.error("Error al generar datos del gráfico:", err)
            return []
        }
    }

    const loadEmpleadosData = async () => {
        try {
            try {
                await empleadosStore.fetchEmpleadosCount()
                totalEmpleados.value = empleadosStore.totalEmpleados || 0
            } catch (err) {
                console.warn("Error al obtener conteo de empleados:", err)
                totalEmpleados.value = 0
            }

            if (!empleadosStore.empleados || empleadosStore.empleados.length === 0) {
                try {
                    await empleadosStore.fetchEmpleados()
                } catch (err) {
                    console.warn("Error al cargar empleados:", err)
                }
            }
        } catch (err) {
            console.error("Error al cargar datos de empleados:", err)
            error.value = "Error al cargar datos de empleados"
        }
    }

    const loadDocumentosData = async () => {
        try {
            try {
                const response = await documentosStore.fetchDocumentosCount()
                totalDocumentos.value = response || 0
            } catch (err) {
                console.warn("Error al obtener conteo de documentos:", err)
                totalDocumentos.value = 0
            }

            if (!documentosStore.documentos || documentosStore.documentos.length === 0) {
                try {
                    await documentosStore.fetchDocumentos()
                } catch (err) {
                    console.warn("Error al cargar documentos:", err)
                }
            }
        } catch (err) {
            console.error("Error al cargar datos de documentos:", err)
            error.value = "Error al cargar datos de documentos"
        }
    }

    const loadEmpresasData = async () => {
        try {
            try {
                const response = await empresasStore.fetchEmpresasCount()
                totalEmpresas.value = response || 0
            } catch (err) {
                console.warn("Error al obtener conteo de empresas:", err)
                totalEmpresas.value = 0
            }

            if (!empresasStore.empresas || empresasStore.empresas.length === 0) {
                try {
                    await empresasStore.fetchEmpresas()
                } catch (err) {
                    console.warn("Error al cargar empresas:", err)
                }
            }
        } catch (err) {
            console.error("Error al cargar datos de empresas:", err)
            error.value = "Error al cargar datos de empresas"
        }
    }

    const loadCentrosData = async () => {
        try {
            try {
                const response = await centrosStore.fetchCentrosCount()
                totalCentros.value = response || 0
            } catch (err) {
                console.warn("Error al obtener conteo de centros:", err)
                totalCentros.value = 0
            }

            if (!centrosStore.centros || centrosStore.centros.length === 0) {
                try {
                    await centrosStore.fetchCentros()
                } catch (err) {
                    console.warn("Error al cargar centros:", err)
                }
            }
        } catch (err) {
            console.error("Error al cargar datos de centros:", err)
            error.value = "Error al cargar datos de centros"
        }
    }

    const loadDepartamentosData = async () => {
        try {
            if (!departamentosStore.departamentos || departamentosStore.departamentos.length === 0) {
                try {
                    await departamentosStore.fetchDepartamentos()
                } catch (err) {
                    console.warn("Error al cargar departamentos:", err)
                }
            }
        } catch (err) {
            console.error("Error al cargar datos de departamentos:", err)
        }
    }

    const loadZonasData = async () => {
        try {
            if (!zonasStore.zonas || zonasStore.zonas.length === 0) {
                try {
                    await zonasStore.fetchZonas()
                } catch (err) {
                    console.warn("Error al cargar zonas:", err)
                }
            }
        } catch (err) {
            console.error("Error al cargar datos de zonas:", err)
        }
    }

    const loadContratosData = async () => {
        try {
            if (!contratosStore.contratos || contratosStore.contratos.length === 0) {
                try {
                    await contratosStore.fetchContratos()
                } catch (err) {
                    console.warn("Error al cargar contratos:", err)
                }
            }

            try {
                await generateVencimientos()
            } catch (err) {
                console.warn("Error al generar vencimientos:", err)
            }
        } catch (err) {
            console.error("Error al cargar datos de contratos:", err)
        }
    }

    const loadDashboardData = async () => {
        loading.value = true
        error.value = null

        try {
            const promises = [
                loadEmpleadosData(),
                loadDocumentosData(),
                loadEmpresasData(),
                loadCentrosData(),
            ]

            await Promise.allSettled(promises)

            const additionalPromises = [
                loadDepartamentosData(),
                loadZonasData()
            ]

            await Promise.allSettled(additionalPromises)

            try {
                await loadContratosData()
            } catch (err) {
                console.warn("Error al cargar contratos, continuando con datos parciales:", err)
            }

        } catch (err) {
            console.error("Error al cargar datos del dashboard:", err)
            error.value = "Error al cargar los datos del dashboard. Por favor, inténtelo de nuevo."
        } finally {
            loading.value = false
        }
    }

    const formatActivityTime = (dateString) => {
        try {
            const date = new Date(dateString)
            const now = new Date()
            const diffMs = now - date
            const diffSec = Math.floor(diffMs / 1000)
            const diffMin = Math.floor(diffSec / 60)
            const diffHour = Math.floor(diffMin / 60)
            const diffDay = Math.floor(diffHour / 24)
            const diffMonth = Math.floor(diffDay / 30)
            const diffYear = Math.floor(diffMonth / 12)

            if (diffYear > 0) {
                return diffYear === 1 ? "Hace 1 año" : `Hace ${diffYear} años`
            } else if (diffMonth > 0) {
                return diffMonth === 1 ? "Hace 1 mes" : `Hace ${diffMonth} meses`
            } else if (diffDay > 0) {
                return diffDay === 1 ? "Ayer" : `Hace ${diffDay} días`
            } else if (diffHour > 0) {
                return diffHour === 1 ? "Hace 1 hora" : `Hace ${diffHour} horas`
            } else if (diffMin > 0) {
                return diffMin === 1 ? "Hace 1 minuto" : `Hace ${diffMin} minutos`
            } else {
                return "Hace unos segundos"
            }
        } catch (e) {
            return "Fecha desconocida"
        }
    }

    const formatDay = (dateString) => {
        try {
            const date = new Date(dateString)
            return date.getDate().toString().padStart(2, '0')
        } catch (e) {
            return "--"
        }
    }

    const formatMonth = (dateString) => {
        try {
            const date = new Date(dateString)
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
            return meses[date.getMonth()]
        } catch (e) {
            return "---"
        }
    }

    const getVencimientoStatusClass = (diasRestantes) => {
        if (diasRestantes <= 7) {
            return 'danger'
        } else if (diasRestantes <= 30) {
            return 'warning'
        } else {
            return 'info'
        }
    }

    return {
        loading,
        error,
        totalEmpleados,
        totalDocumentos,
        totalEmpresas,
        totalCentros,
        selectedPeriod,
        activities,
        vencimientos,
        loadDashboardData,
        generateChartData,
        generateActivities,
        generateVencimientos,
        formatActivityTime,
        formatDay,
        formatMonth,
        getVencimientoStatusClass,
    }
}