import { ref, computed } from "vue"
import { useDashboardStore } from "@/stores/dashboard"
import { useContratosStore } from "@/stores/contratos"

export function useDashboardData() {
    const dashboardStore = useDashboardStore()
    const contratosStore = useContratosStore()

    const loading = ref(false)
    const error = ref(null)

    const totales = computed(() => dashboardStore.totales)
    const totalEmpleados = computed(() => dashboardStore.resumen.total_empleados)
    const totalEmpresas = computed(() => dashboardStore.resumen.total_empresas)
    const totalZonas = computed(() => dashboardStore.resumen.total_zonas)
    const totalDepartamentos = computed(() => dashboardStore.resumen.total_departamentos)

    const totalDocumentos = ref(0)
    const totalCentros = computed(() => dashboardStore.resumen.total_zonas)

    const vencimientos = ref({
        contratos: [],
    })

    const loadDashboardData = async () => {
        loading.value = true
        error.value = null

        try {
            await dashboardStore.fetchStats()

            await loadVencimientos()
        } catch (err) {
            console.error("Error al cargar datos del dashboard:", err)
            error.value = err.message || "Error al cargar los datos del dashboard"
        } finally {
            loading.value = false
        }
    }

    const loadVencimientos = async () => {
        try {
            const { contratos: contratosProximos } = await contratosStore.fetchContratosProximosAVencer({
                dias: 90,
                limit: 10,
            })

            const proximosVencimientos = contratosProximos
                .map((contrato) => {
                    try {
                        const empleado = contrato.Empleado || {}
                        const nombreEmpleado = `${empleado.nombre || ""} ${empleado.apellidos || ""}`.trim()
                        const tipoContrato = contrato.TipoContrato || {}

                        return {
                            id_contrato: contrato.id_contrato,
                            id_empleado: contrato.id_empleado,
                            titulo: `Contrato de ${nombreEmpleado || "Empleado"}`,
                            subtitulo: tipoContrato.nombre || "Contrato",
                            fecha: contrato.fecha_fin,
                            diasRestantes: contrato.diasRestantes || 0,
                        }
                    } catch (err) {
                        console.error("Error al procesar contrato:", err)
                        return null
                    }
                })
                .filter(Boolean)
                .sort((a, b) => a.diasRestantes - b.diasRestantes)

            vencimientos.value.contratos = proximosVencimientos
        } catch (error) {
            console.error("Error al obtener contratos próximos a vencer:", error)
            vencimientos.value.contratos = []
        }
    }

    const generateChartData = async (tipo) => {
        try {
            if (!dashboardStore.statsData || dashboardStore.needsRefresh) {
                await dashboardStore.fetchStats()
            }

            return dashboardStore.getChartData(tipo)
        } catch (err) {
            console.error("Error al generar datos del gráfico:", err)
            return []
        }
    }

    const refreshData = async () => {
        loading.value = true
        try {
            await dashboardStore.refreshData()
            await loadVencimientos()
        } catch (err) {
            console.error("Error al refrescar datos:", err)
            error.value = err.message || "Error al refrescar los datos"
        } finally {
            loading.value = false
        }
    }

    const formatDay = (dateString) => {
        try {
            const date = new Date(dateString)
            return date.getDate().toString().padStart(2, "0")
        } catch (e) {
            return "--"
        }
    }

    const formatMonth = (dateString) => {
        try {
            const date = new Date(dateString)
            const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
            return meses[date.getMonth()]
        } catch (e) {
            return "---"
        }
    }

    const getVencimientoStatusClass = (diasRestantes) => {
        if (diasRestantes <= 7) {
            return "danger"
        } else if (diasRestantes <= 30) {
            return "warning"
        } else {
            return "info"
        }
    }

    return {
        loading: computed(() => loading.value || dashboardStore.loading),
        error: computed(() => error.value || dashboardStore.error),

        totales,
        totalEmpleados,
        totalEmpresas,
        totalZonas,
        totalDepartamentos,
        totalDocumentos,
        totalCentros,
        vencimientos,

        loadDashboardData,
        generateChartData,
        refreshData,
        formatDay,
        formatMonth,
        getVencimientoStatusClass,
    }
}
