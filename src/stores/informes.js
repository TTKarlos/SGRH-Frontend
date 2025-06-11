import { defineStore } from "pinia"
import informesApi from "../api/informes.api"

export const useInformesStore = defineStore("informes", {
    state: () => ({
        informesDisponibles: [],
        opcionesDepartamentos: [],
        opcionesCentros: [],
        opcionesZonas: [],
        opcionesEmpresas: [],
        loading: false,
        error: null,
        generandoInforme: false,
    }),

    getters: {
        getTotalInformes: (state) => {
            return state.informesDisponibles.reduce((total, categoria) => {
                return total + (categoria.informes?.length || 0)
            }, 0)
        },
    },

    actions: {
        async fetchInformesDisponibles() {
            this.loading = true
            this.error = null

            try {
                try {
                    const response = await informesApi.getInformesDisponibles()
                    const data = response.data

                    if (data.success) {
                        this.informesDisponibles = data.data.informes || []
                        console.log("Informes cargados desde API:", this.informesDisponibles)
                        return data.data.informes || []
                    } else {
                        throw new Error(data.message || "Error al cargar informes disponibles")
                    }
                } catch (apiError) {
                    console.error("Error al cargar informes desde API:", apiError)
                    throw apiError
                }
            } catch (err) {
                console.log("Usando datos mock para informes")
                const mockData = this.getMockInformes()
                this.informesDisponibles = mockData
                return mockData
            } finally {
                this.loading = false
            }
        },

        async fetchOpcionesDepartamentos() {
            try {
                const response = await informesApi.getOpcionesDepartamentos()
                const data = response.data

                if (data.success) {
                    const departamentos = data.data.departamentos || []
                    this.opcionesDepartamentos = departamentos
                    return departamentos
                } else {
                    throw new Error(data.message || "Error al cargar departamentos")
                }
            } catch (err) {
                console.log("Usando datos mock para departamentos")
                const mockDepartamentos = [
                    { id: 1, nombre: "Recursos Humanos", total_empleados: 15 },
                    { id: 2, nombre: "Desarrollo", total_empleados: 25 },
                    { id: 3, nombre: "Marketing", total_empleados: 12 },
                ]
                this.opcionesDepartamentos = mockDepartamentos
                return mockDepartamentos
            }
        },

        async fetchOpcionesCentros() {
            try {
                const response = await informesApi.getOpcionesCentros()
                const data = response.data

                if (data.success) {
                    const centros = data.data.centros || []
                    this.opcionesCentros = centros
                    return centros
                } else {
                    throw new Error(data.message || "Error al cargar centros")
                }
            } catch (err) {
                console.log("Usando datos mock para centros")
                const mockCentros = [
                    { id: 1, nombre: "Centro Madrid", total_empleados: 45 },
                    { id: 2, nombre: "Centro Barcelona", total_empleados: 32 },
                    { id: 3, nombre: "Centro Valencia", total_empleados: 28 },
                ]
                this.opcionesCentros = mockCentros
                return mockCentros
            }
        },

        async fetchOpcionesZonas() {
            try {
                const response = await informesApi.getOpcionesZonas()
                const data = response.data

                if (data.success) {
                    const zonas = data.data.zonas || []
                    this.opcionesZonas = zonas
                    return zonas
                } else {
                    throw new Error(data.message || "Error al cargar zonas")
                }
            } catch (err) {
                console.log("Usando datos mock para zonas")
                const mockZonas = [
                    { id: 1, nombre: "Zona Norte", total_empleados: 65, total_centros: 3 },
                    { id: 2, nombre: "Zona Sur", total_empleados: 48, total_centros: 2 },
                    { id: 3, nombre: "Zona Este", total_empleados: 52, total_centros: 2 },
                ]
                this.opcionesZonas = mockZonas
                return mockZonas
            }
        },

        async fetchOpcionesEmpresas() {
            try {
                const response = await informesApi.getOpcionesEmpresas()
                const data = response.data

                if (data.success) {
                    const empresas = data.data.empresas || []
                    this.opcionesEmpresas = empresas
                    return empresas
                } else {
                    throw new Error(data.message || "Error al cargar empresas")
                }
            } catch (err) {
                console.log("Usando datos mock para empresas")
                const mockEmpresas = [
                    { id: 1, nombre: "Empresa Principal S.A.", total_empleados: 120, total_contratos: 95 },
                    { id: 2, nombre: "Filial Norte S.L.", total_empleados: 45, total_contratos: 38 },
                    { id: 3, nombre: "Subsidiaria Este S.A.", total_empleados: 67, total_contratos: 52 },
                ]
                this.opcionesEmpresas = mockEmpresas
                return mockEmpresas
            }
        },

        async generarInforme(tipoInforme, parametros = {}) {
            this.generandoInforme = true
            this.error = null

            try {
                console.log(`Generando informe: ${tipoInforme}`, parametros)

                await new Promise((resolve) => setTimeout(resolve, 1500))

                try {
                    let response
                    const informeId = typeof tipoInforme === "string" ? tipoInforme : tipoInforme.id

                    switch (informeId) {
                        case "empleados-activos":
                            response = await informesApi.getEmpleadosActivos()
                            break
                        case "empleados-inactivos":
                            response = await informesApi.getEmpleadosInactivos()
                            break
                        case "departamento-general":
                            response = await informesApi.getEmpleadosPorDepartamentoGeneral()
                            break
                        case "departamento-especifico":
                            response = await informesApi.getEmpleadosPorDepartamentoEspecifico(parametros.id)
                            break
                        case "centro-general":
                            response = await informesApi.getEmpleadosPorCentroGeneral()
                            break
                        case "centro-especifico":
                            response = await informesApi.getEmpleadosPorCentroEspecifico(parametros.id)
                            break
                        case "zona-general":
                            response = await informesApi.getEmpleadosPorZonaGeneral()
                            break
                        case "zona-especifica":
                            response = await informesApi.getEmpleadosPorZonaEspecifica(parametros.id)
                            break
                        case "empresa-general":
                            response = await informesApi.getEmpleadosPorEmpresaGeneral()
                            break
                        case "empresa-especifica":
                            response = await informesApi.getEmpleadosPorEmpresaEspecifica(parametros.id)
                            break
                        case "cumpleanos-rango":
                            response = await informesApi.getCumpleanosPorRango(parametros.fechaInicio, parametros.fechaFin)
                            break
                        case "directorio-contactos":
                            response = await informesApi.getInformeContactos()
                            break
                        case "dashboard-ejecutivo":
                            response = await informesApi.getDashboardEjecutivo()
                            break
                        default:
                            throw new Error(`Tipo de informe no reconocido: ${informeId}`)
                    }

                    const blob = new Blob([response.data], { type: "application/pdf" })
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement("a")
                    link.href = url

                    const fecha = new Date().toISOString().split("T")[0]
                    const nombreInforme = this.getNombreInforme(informeId, parametros)
                    link.download = `${nombreInforme}_${fecha}.pdf`

                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                } catch (apiError) {
                    console.log("API no disponible, simulando descarga de informe")
                    this.simularDescargaPDF(tipoInforme, parametros)
                }

                return true
            } catch (err) {
                console.error("Error al generar informe:", err)
                this.error = err.message || "Error al generar el informe"

                this.simularDescargaPDF(tipoInforme, parametros)
                return true
            } finally {
                this.generandoInforme = false
            }
        },

        simularDescargaPDF(informeId, parametros = {}) {
            console.log("Simulando descarga de PDF", informeId, parametros)

            const contenidoPDF = this.generarContenidoSimulado(informeId, parametros)

            const blob = new Blob([contenidoPDF], { type: "text/plain" })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url

            const fecha = new Date().toISOString().split("T")[0]
            const nombreInforme = this.getNombreInforme(informeId, parametros)
            link.download = `${nombreInforme}_${fecha}_SIMULADO.txt`

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        },

        generarContenidoSimulado(informeId, parametros) {
            const fecha = new Date().toLocaleDateString("es-ES")
            const hora = new Date().toLocaleTimeString("es-ES")
            const id = typeof informeId === "string" ? informeId : informeId.id

            return `
INFORME SIMULADO - SISTEMA SGRH
================================

Tipo de Informe: ${this.getNombreInforme(id, parametros)}
Fecha de Generación: ${fecha}
Hora de Generación: ${hora}
ID del Informe: ${id}

Parámetros utilizados:
${JSON.stringify(parametros, null, 2)}

NOTA: Este es un archivo simulado generado para propósitos de desarrollo.
En el entorno de producción, este archivo contendría el informe real en formato PDF.

Contenido del informe:
- Datos de empleados
- Estadísticas relevantes
- Gráficos y tablas
- Información detallada según el tipo de informe seleccionado

Para más información, contacte con el administrador del sistema.
      `
        },

        getMockInformes() {
            return [
                {
                    categoria: "Empleados",
                    informes: [
                        {
                            id: "empleados-activos",
                            nombre: "Empleados Activos",
                            descripcion: "Listado completo de todos los empleados activos en la empresa",
                            parametros: [],
                        },
                        {
                            id: "empleados-inactivos",
                            nombre: "Empleados Inactivos",
                            descripcion: "Listado de empleados que han sido dados de baja",
                            parametros: [],
                        },
                    ],
                },
                {
                    categoria: "Departamentos",
                    informes: [
                        {
                            id: "departamento-general",
                            nombre: "Informe General por Departamentos",
                            descripcion: "Resumen de empleados agrupados por departamento",
                            parametros: [],
                        },
                        {
                            id: "departamento-especifico",
                            nombre: "Informe de Departamento Específico",
                            descripcion: "Detalle de empleados de un departamento en particular",
                            parametros: ["Departamento"],
                        },
                    ],
                },
                {
                    categoria: "Centros",
                    informes: [
                        {
                            id: "centro-general",
                            nombre: "Informe General por Centros",
                            descripcion: "Resumen de empleados agrupados por centro de trabajo",
                            parametros: [],
                        },
                        {
                            id: "centro-especifico",
                            nombre: "Informe de Centro Específico",
                            descripcion: "Detalle de empleados de un centro en particular",
                            parametros: ["Centro"],
                        },
                    ],
                },
                {
                    categoria: "Zonas",
                    informes: [
                        {
                            id: "zona-general",
                            nombre: "Informe General por Zonas",
                            descripcion: "Resumen de empleados agrupados por zona geográfica",
                            parametros: [],
                        },
                        {
                            id: "zona-especifica",
                            nombre: "Informe de Zona Específica",
                            descripcion: "Detalle de empleados de una zona en particular",
                            parametros: ["Zona"],
                        },
                    ],
                },
                {
                    categoria: "Empresas",
                    informes: [
                        {
                            id: "empresa-general",
                            nombre: "Informe General por Empresas",
                            descripcion: "Resumen de empleados agrupados por empresa",
                            parametros: [],
                        },
                        {
                            id: "empresa-especifica",
                            nombre: "Informe de Empresa Específica",
                            descripcion: "Detalle de empleados de una empresa en particular",
                            parametros: ["Empresa"],
                        },
                    ],
                },
                {
                    categoria: "Especiales",
                    informes: [
                        {
                            id: "cumpleanos-rango",
                            nombre: "Cumpleaños por Rango de Fechas",
                            descripcion: "Listado de empleados que cumplen años en un período específico",
                            parametros: ["Fecha Inicio", "Fecha Fin"],
                        },
                        {
                            id: "directorio-contactos",
                            nombre: "Directorio de Contactos",
                            descripcion: "Directorio completo con información de contacto de todos los empleados",
                            parametros: [],
                        },
                    ],
                },
                {
                    categoria: "Dashboard",
                    informes: [
                        {
                            id: "dashboard-ejecutivo",
                            nombre: "Dashboard Ejecutivo",
                            descripcion: "Resumen ejecutivo con métricas clave y estadísticas generales",
                            parametros: [],
                        },
                    ],
                },
            ]
        },

        getNombreInforme(tipoInforme, parametros) {
            const tiposInforme = {
                "empleados-activos": "Empleados_Activos",
                "empleados-inactivos": "Empleados_Inactivos",
                "departamento-general": "Informe_Departamentos",
                "departamento-especifico": "Departamento",
                "centro-general": "Informe_Centros",
                "centro-especifico": "Centro",
                "zona-general": "Informe_Zonas",
                "zona-especifica": "Zona",
                "empresa-general": "Informe_Empresas",
                "empresa-especifica": "Empresa",
                "cumpleanos-rango": "Cumpleanos",
                "directorio-contactos": "Directorio_Contactos",
                "dashboard-ejecutivo": "Dashboard_Ejecutivo",
            }

            return tiposInforme[tipoInforme] || `Informe_${tipoInforme}`
        },
    },
})
