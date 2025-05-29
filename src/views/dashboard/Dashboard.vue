<template>
  <defaultLayout>
    <div class="dashboard">
      <div class="dashboard-header">
        <h1 class="dashboard-title">Dashboard RRHH</h1>
      </div>

      <!-- Indicador de carga -->
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>

      <div v-else>
        <div class="stats-grid">
          <!-- Tarjeta de Empleados -->
          <div class="stat-card">
            <div class="stat-icon employee-icon">
              <Users size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-header">
                <h3 class="stat-title">Total Empleados</h3>
              </div>
              <p class="stat-value">{{ totalEmpleados }}</p>
              <div class="stat-footer">
                <span class="stat-label">Empleados activos</span>
              </div>
            </div>
          </div>

          <!-- Tarjeta de Documentos -->
          <div class="stat-card">
            <div class="stat-icon document-icon">
              <FolderOpen size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-header">
                <h3 class="stat-title">Total Documentos</h3>
              </div>
              <p class="stat-value">{{ totalDocumentos }}</p>
              <div class="stat-footer">
                <span class="stat-label">Documentos registrados</span>
              </div>
            </div>
          </div>

          <!-- Tarjeta de Empresas -->
          <div class="stat-card">
            <div class="stat-icon company-icon">
              <Building2 size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-header">
                <h3 class="stat-title">Total Empresas</h3>
              </div>
              <p class="stat-value">{{ totalEmpresas }}</p>
              <div class="stat-footer">
                <span class="stat-label">Empresas registradas</span>
              </div>
            </div>
          </div>

          <!-- Tarjeta de Centros -->
          <div class="stat-card">
            <div class="stat-icon center-icon">
              <MapPin size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-header">
                <h3 class="stat-title">Total Centros</h3>
              </div>
              <p class="stat-value">{{ totalCentros }}</p>
              <div class="stat-footer">
                <span class="stat-label">Centros de trabajo</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-row">
          <div class="chart-container">
            <div class="chart-header">
              <div class="chart-title-container">
                <h3 class="chart-title">Distribución por {{ chartTitles[selectedChart] }}</h3>
                <select v-model="selectedChart" class="form-control select-chart" @change="updateChart">
                  <option value="departamentos">Departamentos</option>
                  <option value="empresas">Empresas</option>
                  <option value="zonas">Zonas</option>
                </select>
              </div>
              <div class="chart-actions">
                <button
                    :class="['btn btn-sm btn-outline-secondary', chartType === 'bar' ? 'active' : '']"
                    @click="setChartType('bar')"
                >
                  <BarChart3 size="14" class="btn-icon" />
                  Barras
                </button>
                <button
                    :class="['btn btn-sm btn-outline-secondary', chartType === 'doughnut' ? 'active' : '']"
                    @click="setChartType('doughnut')"
                >
                  <PieChart size="14" class="btn-icon" />
                  Circular
                </button>
              </div>
            </div>
            <div class="chart">
              <div v-if="!chartData || chartData.length === 0" class="chart-empty">
                <BarChart3 size="32" class="empty-icon" />
                <p>No hay datos suficientes para mostrar el gráfico</p>
              </div>
              <canvas v-else ref="distributionChart" height="250"></canvas>
            </div>
            <div class="chart-legend" v-if="chartData && chartData.length > 0">
              <div class="legend-item" v-for="(item, index) in displayedChartData" :key="index">
                <span class="legend-color" :style="{ backgroundColor: chartColors[index % chartColors.length] }"></span>
                <span class="legend-label">{{ item.name }}</span>
                <span class="legend-value">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <div class="activity-container">
            <div class="activity-header">
              <h3 class="activity-title">Actividad Reciente</h3>
            </div>

            <!-- Indicador de carga específico para actividades -->
            <div v-if="loadingActivities" class="activity-loading">
              <div class="spinner-sm"></div>
              <p>Cargando actividades...</p>
            </div>

            <!-- Lista de actividades -->
            <div v-else class="activity-list">
              <div class="activity-item" v-for="(activity, index) in activities" :key="index">
                <div :class="['activity-icon', getActivityIconClass(activity.tipo)]">
                  <component :is="getActivityIcon(activity.tipo)" size="16" />
                </div>
                <div class="activity-content">
                  <p class="activity-text" v-html="activity.texto"></p>
                  <span class="activity-time">{{ formatActivityTime(activity.fecha) }}</span>
                </div>
              </div>
              <div class="activity-empty" v-if="!activities || activities.length === 0">
                <p>No hay actividades recientes</p>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-row">
          <div class="upcoming-container">
            <div class="upcoming-header">
              <h3 class="upcoming-title">Próximos Vencimientos de Contratos</h3>
              <div class="upcoming-filter">
                <label for="vencimiento-periodo" class="filter-label">Mostrar vencimientos en:</label>
                <select id="vencimiento-periodo" v-model="vencimientoPeriodo" class="form-control select-period" @change="filtrarVencimientos">
                  <option value="7">Próximos 7 días</option>
                  <option value="30">Próximos 30 días</option>
                  <option value="60">Próximos 60 días</option>
                  <option value="90">Próximos 90 días</option>
                </select>
              </div>
            </div>
            <div class="upcoming-list">
              <div class="upcoming-item" v-for="(item, index) in vencimientosFiltrados" :key="index">
                <div class="upcoming-date">
                  <span class="date-day">{{ formatDay(item.fecha) }}</span>
                  <span class="date-month">{{ formatMonth(item.fecha) }}</span>
                </div>
                <div class="upcoming-content">
                  <p class="upcoming-title">{{ item.titulo }}</p>
                  <p class="upcoming-subtitle">{{ item.subtitulo }}</p>
                </div>
                <div :class="['upcoming-status', getVencimientoStatusClass(item.diasRestantes)]">
                  <Clock size="16" class="status-icon" />
                  <span>{{ item.diasRestantes }} días</span>
                </div>
              </div>
              <div class="upcoming-empty" v-if="!vencimientosFiltrados || vencimientosFiltrados.length === 0">
                <p>No hay contratos próximos a vencer en este período</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </defaultLayout>
</template>

<script>
import Chart from 'chart.js/auto';
import { mapState } from 'pinia';
import { useRouter } from 'vue-router';
import { useContratosStore } from '../../stores/contratos';
import { useAusenciasStore } from '../../stores/ausencias';
import { useEmpleadosStore } from '../../stores/empleados';
import { useDocumentosStore } from '../../stores/documentos';
import { useEmpresasStore } from '../../stores/empresas';
import { useCentrosStore } from '../../stores/centros';
import { useDepartamentosStore } from '../../stores/departamentos';
import { useZonasStore } from '../../stores/zonas';
import { useAuthStore } from '../../stores/auth';
import {
  Users,
  FileText,
  Calendar,
  FolderOpen,
  Clock,
  BarChart3,
  PieChart,
  UserPlus,
  Upload,
  CalendarX,
  UserMinus,
  CalendarPlus,
  BarChart2,
  Settings,
  Building2,
  MapPin,
  Info,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-vue-next';
import DefaultLayout from "../../layouts/DefaultLayout.vue";
import api from '../../api/axios';
import empleadosApi from '../../api/empleados.api';

export default {
  name: 'Dashboard',
  components: {
    DefaultLayout,
    Users,
    FileText,
    Calendar,
    FolderOpen,
    Clock,
    BarChart3,
    PieChart,
    UserPlus,
    Upload,
    CalendarX,
    UserMinus,
    CalendarPlus,
    BarChart2,
    Settings,
    Building2,
    MapPin,
    Info,
    RefreshCw,
    Edit,
    Trash2
  },
  data() {
    return {
      loading: true,
      loadingActivities: false,
      error: null,
      chart: null,
      selectedChart: 'departamentos',
      chartType: 'doughnut',
      chartData: [],
      activities: [],
      vencimientos: {
        contratos: []
      },
      vencimientoPeriodo: '30',
      vencimientosFiltrados: [],
      totalEmpleados: 0,
      totalDocumentos: 0,
      totalEmpresas: 0,
      totalCentros: 0,
      chartTitles: {
        departamentos: 'Departamentos',
        empresas: 'Empresas',
        zonas: 'Zonas'
      },
      chartColors: [
        '#e63946', // Rojo principal
        '#f1faee', // Blanco/crema
        '#a8dadc', // Azul claro
        '#457b9d', // Azul medio
        '#1d3557', // Azul oscuro
        '#ffb4a2', // Rosa claro
        '#e5989b', // Rosa medio
        '#b5838d', // Rosa oscuro
        '#6d6875', // Gris
        '#d90429'  // Rojo intenso
      ],
      formattedVencimientos: []
    };
  },
  computed: {
    ...mapState(useEmpleadosStore, ['empleados']),
    ...mapState(useContratosStore, ['contratos']),
    ...mapState(useDocumentosStore, ['documentos']),
    ...mapState(useAusenciasStore, ['ausencias']),
    ...mapState(useEmpresasStore, ['empresas']),
    ...mapState(useCentrosStore, ['centros']),
    ...mapState(useDepartamentosStore, ['departamentos']),
    ...mapState(useZonasStore, ['zonas']),
    router() {
      return useRouter();
    },
    displayedChartData() {
      if (!this.chartData || this.chartData.length === 0) {
        return [];
      }

      if (this.chartData.length <= 8) {
        return this.chartData;
      }

      const topItems = this.chartData.slice(0, 7);
      const othersCount = this.chartData.slice(7).reduce((sum, item) => sum + item.count, 0);

      return [
        ...topItems,
        { name: 'Otros', count: othersCount }
      ];
    }
  },
  watch: {
    totalEmpleados() {
      this.updateChart();
    },
    totalDocumentos() {
      this.updateChart();
    },
    totalEmpresas() {
      this.updateChart();
    },
    totalCentros() {
      this.updateChart();
    },
    vencimientos: {
      handler: function(newVencimientos) {
        if (newVencimientos && newVencimientos.contratos) {
          this.formattedVencimientos = newVencimientos.contratos.map(item => ({
            ...item,
            formattedDay: this.formatDay(item.fecha),
            formattedMonth: this.formatMonth(item.fecha)
          }));
          this.filtrarVencimientos();
        } else {
          this.formattedVencimientos = [];
          this.vencimientosFiltrados = [];
        }
      },
      deep: true
    }
  },
  mounted() {
    this.loadData();

    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.loadingActivities = true;
      this.error = null;

      try {
        await this.loadDashboardData();

        this.chartData = this.generateChartData(this.selectedChart);

        this.activities = this.generateActivities();

        if (this.chartData && this.chartData.length > 0) {
          this.$nextTick(() => {
            this.initChart();
          });
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        this.error = "Error al cargar los datos del dashboard";
      } finally {
        this.loading = false;
        this.loadingActivities = false;
      }
    },

    async loadDashboardData() {
      try {
        const results = await Promise.allSettled([
          this.loadEmpleadosCount(),
          this.loadDocumentosCount(),
          this.loadEmpresasCount(),
          this.loadCentrosCount(),
          this.loadEmpleadosData(),
          this.loadDepartamentosData(),
          this.loadZonasData()
        ]);

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const endpoints = [
              'empleados/count',
              'documentos/count',
              'empresas/count',
              'centros/count',
              'empleados',
              'departamentos',
              'zonas'
            ];
            console.warn(`Error al cargar ${endpoints[index]}:`, result.reason);
          }
        });

        await this.loadVencimientosContratos();
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
        this.error = "Error al cargar los datos del dashboard. Por favor, inténtelo de nuevo.";
      }
    },

    async loadEmpleadosCount() {
      try {
        const response = await empleadosApi.getCount();

        if (response.data && response.data.success) {
          this.totalEmpleados = response.data.data.total || 0;
          return this.totalEmpleados;
        } else {
          throw new Error("Respuesta inválida del servidor");
        }
      } catch (err) {
        console.warn("Error al obtener conteo de empleados:", err);

        try {
          const response = await api.get("/empleados", {
            params: {
              limit: 1,
              page: 1
            }
          });

          if (response.data && response.data.success) {
            this.totalEmpleados = response.data.data.pagination?.total || 0;
          } else {
            const empleadosStore = useEmpleadosStore();
            this.totalEmpleados = empleadosStore.empleados?.length || 0;
          }
        } catch (paginationErr) {
          const empleadosStore = useEmpleadosStore();
          this.totalEmpleados = empleadosStore.empleados?.length || 0;
        }

        return this.totalEmpleados;
      }
    },

    async loadDocumentosCount() {
      try {
        const response = await api.get("/documentos/count");
        if (response.data && response.data.success) {
          this.totalDocumentos = response.data.data.total || 0;
          return this.totalDocumentos;
        } else {
          throw new Error("Respuesta inválida del servidor");
        }
      } catch (err) {
        console.warn("Error al obtener conteo de documentos:", err);

        try {
          const response = await api.get("/documentos", {
            params: {
              limit: 1,
              page: 1
            }
          });

          if (response.data && response.data.success) {
            this.totalDocumentos = response.data.data.pagination?.total || 0;
          } else {
            const documentosStore = useDocumentosStore();
            this.totalDocumentos = documentosStore.documentos?.length || 0;
          }
        } catch (paginationErr) {
          const documentosStore = useDocumentosStore();
          this.totalDocumentos = documentosStore.documentos?.length || 0;
        }

        return this.totalDocumentos;
      }
    },

    async loadEmpresasCount() {
      try {
        const response = await api.get("/empresas/count");
        if (response.data && response.data.success) {
          this.totalEmpresas = response.data.data.total || 0;
          return this.totalEmpresas;
        } else {
          throw new Error("Respuesta inválida del servidor");
        }
      } catch (err) {
        console.warn("Error al obtener conteo de empresas:", err);

        try {
          const response = await api.get("/empresas", {
            params: {
              limit: 1,
              page: 1
            }
          });

          if (response.data && response.data.success) {
            this.totalEmpresas = response.data.data.pagination?.total || 0;
          } else {
            const empresasStore = useEmpresasStore();
            this.totalEmpresas = empresasStore.empresas?.length || 0;
          }
        } catch (paginationErr) {
          const empresasStore = useEmpresasStore();
          this.totalEmpresas = empresasStore.empresas?.length || 0;
        }

        return this.totalEmpresas;
      }
    },

    async loadCentrosCount() {
      try {
        const response = await api.get("/centros/count");
        if (response.data && response.data.success) {
          this.totalCentros = response.data.data.total || 0;
          return this.totalCentros;
        } else {
          throw new Error("Respuesta inválida del servidor");
        }
      } catch (err) {
        console.warn("Error al obtener conteo de centros:", err);

        try {
          const response = await api.get("/centros", {
            params: {
              limit: 1,
              page: 1
            }
          });

          if (response.data && response.data.success) {
            this.totalCentros = response.data.data.pagination?.total || 0;
          } else {
            const centrosStore = useCentrosStore();
            this.totalCentros = centrosStore.centros?.length || 0;
          }
        } catch (paginationErr) {
          const centrosStore = useCentrosStore();
          this.totalCentros = centrosStore.centros?.length || 0;
        }

        return this.totalCentros;
      }
    },

    async loadEmpleadosData() {
      try {
        const empleadosStore = useEmpleadosStore();

        if (!empleadosStore.empleados || empleadosStore.empleados.length === 0) {
          await empleadosStore.fetchEmpleados();
        }
      } catch (err) {
        console.warn("Error al cargar empleados:", err);
      }
    },

    async loadDepartamentosData() {
      try {
        const departamentosStore = useDepartamentosStore();

        if (!departamentosStore.departamentos || departamentosStore.departamentos.length === 0) {
          await departamentosStore.fetchDepartamentos();
        }
      } catch (err) {
        console.warn("Error al cargar departamentos:", err);
      }
    },

    async loadZonasData() {
      try {
        const zonasStore = useZonasStore();

        if (!zonasStore.zonas || zonasStore.zonas.length === 0) {
          await zonasStore.fetchZonas();
        }
      } catch (err) {
        console.warn("Error al cargar zonas:", err);
      }
    },

    async loadVencimientosContratos() {
      try {
        const contratosStore = useContratosStore();

        try {
          const { contratos: contratosProximos } = await contratosStore.fetchContratosProximosAVencer({
            dias: 90,
            limit: 10
          });

          if (contratosProximos && contratosProximos.length > 0) {
            this.vencimientos.contratos = contratosProximos.map(contrato => {
              const fechaFin = new Date(contrato.fecha_fin);
              const hoy = new Date();
              const diffTime = fechaFin.getTime() - hoy.getTime();
              const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              const empleado = contrato.Empleado || {};
              const nombreEmpleado = `${empleado.nombre || ''} ${empleado.apellidos || ""}`;

              const tipoContrato = contrato.TipoContrato || {};

              return {
                id_contrato: contrato.id_contrato,
                id_empleado: contrato.id_empleado,
                titulo: `Contrato de ${nombreEmpleado}`,
                subtitulo: tipoContrato.nombre || "Contrato",
                fecha: contrato.fecha_fin,
                diasRestantes: diasRestantes > 0 ? diasRestantes : 0
              };
            });

            this.filtrarVencimientos();
            return;
          }
        } catch (apiErr) {
          console.warn("Error al obtener contratos próximos a vencer desde la API:", apiErr);
        }

        this.vencimientos.contratos = this.generateMockVencimientos();
        this.filtrarVencimientos();
      } catch (err) {
        console.error("Error al cargar vencimientos de contratos:", err);
        this.vencimientos.contratos = [];
        this.vencimientosFiltrados = [];
      }
    },

    filtrarVencimientos() {
      const diasLimite = parseInt(this.vencimientoPeriodo);

      if (!this.vencimientos.contratos || this.vencimientos.contratos.length === 0) {
        this.vencimientosFiltrados = [];
        return;
      }

      this.vencimientosFiltrados = this.vencimientos.contratos
          .filter(item => item.diasRestantes <= diasLimite)
          .sort((a, b) => a.diasRestantes - b.diasRestantes);
    },

    generateMockVencimientos() {
      const empleadosStore = useEmpleadosStore();
      const empleados = empleadosStore.empleados || [];

      if (empleados.length === 0) {
        return [];
      }

      const empleadosSeleccionados = empleados.slice(0, 5);

      return empleadosSeleccionados.map((empleado, index) => {
        const hoy = new Date();
        const diasAleatorios = Math.floor(Math.random() * 90) + 1;
        const fechaVencimiento = new Date(hoy);
        fechaVencimiento.setDate(hoy.getDate() + diasAleatorios);

        return {
          id_contrato: index + 1,
          id_empleado: empleado.id_empleado,
          titulo: `Contrato de ${empleado.nombre || ''} ${empleado.apellidos || ""}`,
          subtitulo: "Contrato temporal",
          fecha: fechaVencimiento.toISOString(),
          diasRestantes: diasAleatorios
        };
      });
    },

    generateChartData(tipo) {
      const empleadosStore = useEmpleadosStore();
      const empleados = empleadosStore.empleados || [];

      if (empleados.length === 0) {
        return [];
      }

      switch (tipo) {
        case 'departamentos': {
          const departamentos = {};

          empleados.forEach(empleado => {
            if (!empleado.departamento) return;

            const deptName = empleado.departamento.nombre || 'Sin departamento';
            departamentos[deptName] = (departamentos[deptName] || 0) + 1;
          });

          return Object.entries(departamentos)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count);
        }

        case 'empresas': {
          const empresas = {};

          empleados.forEach(empleado => {
            if (!empleado.empresa) return;

            const empresaName = empleado.empresa.nombre || 'Sin empresa';
            empresas[empresaName] = (empresas[empresaName] || 0) + 1;
          });

          return Object.entries(empresas)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count);
        }

        case 'zonas': {
          const zonas = {};

          empleados.forEach(empleado => {
            if (!empleado.centro) return;

            const zonaName = empleado.centro.zona?.nombre || 'Sin zona';
            zonas[zonaName] = (zonas[zonaName] || 0) + 1;
          });

          return Object.entries(zonas)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count);
        }

        default:
          return [];
      }
    },

    generateActivities() {
      const empleadosStore = useEmpleadosStore();
      const documentosStore = useDocumentosStore();
      const ausenciasStore = useAusenciasStore();
      const authStore = useAuthStore();

      const allActivities = [];
      const now = new Date();

      try {
        const currentUser = authStore.user || { nombre: "Sistema", id: "system" };

        const empleados = empleadosStore.empleados || [];
        if (empleados.length > 0) {
          const empleadosConFecha = empleados
              .filter(e => e.fecha_alta && new Date(e.fecha_alta).toString() !== 'Invalid Date')
              .sort((a, b) => new Date(b.fecha_alta) - new Date(a.fecha_alta))
              .slice(0, 3);

          empleadosConFecha.forEach(empleado => {
            const creador = empleado.creado_por ?
                { nombre: empleado.creado_por } :
                { nombre: "Administrador" };

            allActivities.push({
              tipo: "empleado_nuevo",
              texto: `<strong>${creador.nombre}</strong> creó el empleado <strong>${empleado.nombre || ''} ${empleado.apellidos || ""}</strong>`,
              fecha: empleado.fecha_alta,
              timestamp: new Date(empleado.fecha_alta).getTime(),
              entidad: "empleado",
              accion: "create",
              usuario: creador.nombre,
              id_entidad: empleado.id_empleado
            });
          });
        }

        if (empleadosStore.actividades && empleadosStore.actividades.length > 0) {
          const actualizacionesEmpleados = empleadosStore.actividades
              .filter(a => a.tipo === 'empleado_update')
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
              .slice(0, 3);

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
            });
          });
        }

        const documentos = documentosStore.documentos || [];
        if (documentos.length > 0) {
          const documentosRecientes = documentos
              .filter(d => d.fecha_subida && new Date(d.fecha_subida).toString() !== 'Invalid Date')
              .sort((a, b) => new Date(b.fecha_subida) - new Date(a.fecha_subida))
              .slice(0, 3);

          documentosRecientes.forEach(documento => {
            const empleado = empleados.find(e => e.id_empleado === documento.id_empleado);
            const nombreEmpleado = empleado ?
                `${empleado.nombre || ''} ${empleado.apellidos || ""}` :
                "Empleado";

            const creador = documento.subido_por ?
                { nombre: documento.subido_por } :
                { nombre: nombreEmpleado };

            allActivities.push({
              tipo: "documento_nuevo",
              texto: `<strong>${creador.nombre}</strong> subió el documento <strong>${documento.nombre || "Documento"}</strong>`,
              fecha: documento.fecha_subida,
              timestamp: new Date(documento.fecha_subida).getTime(),
              entidad: "documento",
              accion: "create",
              usuario: creador.nombre,
              id_entidad: documento.id_documento
            });
          });
        }

        const ausencias = ausenciasStore.ausencias || [];
        if (ausencias.length > 0) {
          const ausenciasRecientes = ausencias
              .filter(a => a.fecha_creacion && new Date(a.fecha_creacion).toString() !== 'Invalid Date')
              .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
              .slice(0, 3);

          ausenciasRecientes.forEach(ausencia => {
            const empleado = empleados.find(e => e.id_empleado === ausencia.id_empleado);
            const nombreEmpleado = empleado ?
                `${empleado.nombre || ''} ${empleado.apellidos || ""}` :
                "Empleado";

            const creador = ausencia.creado_por ?
                { nombre: ausencia.creado_por } :
                { nombre: "Administrador" };

            allActivities.push({
              tipo: "ausencia_nueva",
              texto: `<strong>${creador.nombre}</strong> registró una ausencia para <strong>${nombreEmpleado}</strong>`,
              fecha: ausencia.fecha_creacion || ausencia.fecha_inicio,
              timestamp: new Date(ausencia.fecha_creacion || ausencia.fecha_inicio).getTime(),
              entidad: "ausencia",
              accion: "create",
              usuario: creador.nombre,
              id_entidad: ausencia.id_ausencia
            });
          });
        }
      } catch (err) {
        console.error("Error al generar actividades:", err);
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
        });
      }

      return allActivities
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);
    },

    async reloadActivities() {
      this.loadingActivities = true;
      try {
        const empleadosStore = useEmpleadosStore();
        const documentosStore = useDocumentosStore();
        const ausenciasStore = useAusenciasStore();

        if (!empleadosStore.empleados || empleadosStore.empleados.length === 0) {
          try {
            await empleadosStore.fetchEmpleados();
          } catch (error) {
            console.warn("Error al cargar empleados para actividades:", error);
          }
        }

        if (!documentosStore.documentos || documentosStore.documentos.length === 0) {
          try {
            await documentosStore.fetchDocumentos();
          } catch (error) {
            console.warn("Error al cargar documentos para actividades:", error);
          }
        }

        if (!ausenciasStore.ausencias || ausenciasStore.ausencias.length === 0) {
          try {
            await ausenciasStore.fetchAusencias();
          } catch (error) {
            console.warn("Error al cargar ausencias para actividades:", error);
          }
        }

        this.activities = this.generateActivities();
      } catch (error) {
        console.error("Error al recargar actividades:", error);
      } finally {
        this.loadingActivities = false;
      }
    },

    initChart() {
      const chartElement = this.$refs.distributionChart;
      if (!chartElement) {
        console.warn("Elemento canvas no disponible para inicializar el gráfico");
        return;
      }

      if (this.chart) {
        this.chart.destroy();
      }

      if (!this.chartData || this.chartData.length === 0) {
        console.warn("No hay datos para mostrar en el gráfico");
        return;
      }

      const ctx = chartElement.getContext('2d');
      const data = this.chartData;

      let labels, values, backgroundColor;

      if (data.length <= 8) {
        labels = data.map(item => item.name);
        values = data.map(item => item.count);
        backgroundColor = this.chartColors.slice(0, data.length);
      } else {
        labels = [...data.slice(0, 7).map(item => item.name), 'Otros'];
        values = [
          ...data.slice(0, 7).map(item => item.count),
          data.slice(7).reduce((sum, item) => sum + item.count, 0)
        ];
        backgroundColor = [...this.chartColors.slice(0, 7), '#9ca3af'];
      }

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${value}`;
              }
            }
          }
        }
      };

      if (this.chartType === 'doughnut') {
        Object.assign(chartOptions, {
          cutout: '60%'
        });
      } else {
        Object.assign(chartOptions, {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        });
      }

      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: backgroundColor,
            borderWidth: 0,
            borderRadius: this.chartType === 'bar' ? 4 : 0,
            hoverOffset: this.chartType === 'doughnut' ? 10 : 0
          }]
        },
        options: chartOptions
      });
    },

    updateChart() {
      this.chartData = this.generateChartData(this.selectedChart);
      if (this.chartData && this.chartData.length > 0) {
        this.$nextTick(() => {
          this.initChart();
        });
      }
    },

    setChartType(type) {
      this.chartType = type;
      if (this.chartData && this.chartData.length > 0) {
        this.initChart();
      }
    },

    formatActivityTime(dateString) {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffMonth / 12);

        if (diffYear > 0) {
          return diffYear === 1 ? "Hace 1 año" : `Hace ${diffYear} años`;
        } else if (diffMonth > 0) {
          return diffMonth === 1 ? "Hace 1 mes" : `Hace ${diffMonth} meses`;
        } else if (diffDay > 0) {
          return diffDay === 1 ? "Ayer" : `Hace ${diffDay} días`;
        } else if (diffHour > 0) {
          return diffHour === 1 ? "Hace 1 hora" : `Hace ${diffHour} horas`;
        } else if (diffMin > 0) {
          return diffMin === 1 ? "Hace 1 minuto" : `Hace ${diffMin} minutos`;
        } else {
          return "Hace unos segundos";
        }
      } catch (e) {
        return "Fecha desconocida";
      }
    },

    formatDay(dateString) {
      try {
        const date = new Date(dateString);
        return date.getDate().toString().padStart(2, '0');
      } catch (e) {
        return "--";
      }
    },

    formatMonth(dateString) {
      try {
        const date = new Date(dateString);
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return meses[date.getMonth()];
      } catch (e) {
        return "---";
      }
    },

    getVencimientoStatusClass(diasRestantes) {
      if (diasRestantes <= 7) {
        return 'danger';
      } else if (diasRestantes <= 30) {
        return 'warning';
      } else {
        return 'info';
      }
    },

    getActivityIcon(tipo) {
      const parts = tipo.split('_');
      if (parts.length >= 2) {
        const [entidad, accion] = parts;

        if (accion === 'create' || accion === 'nuevo' || accion === 'nueva') {
          switch (entidad) {
            case 'empleado': return UserPlus;
            case 'contrato': return FileText;
            case 'documento': return Upload;
            case 'ausencia': return CalendarX;
            default: return UserPlus;
          }
        } else if (accion === 'update' || accion === 'actualizado' || accion === 'actualizada') {
          switch (entidad) {
            case 'empleado': return Edit;
            case 'contrato': return Edit;
            case 'documento': return Edit;
            case 'ausencia': return Edit;
            default: return Edit;
          }
        } else if (accion === 'delete' || accion === 'eliminado' || accion === 'eliminada') {
          return Trash2;
        }
      }

      switch (tipo) {
        case 'empleado_nuevo': return UserPlus;
        case 'empleado_update': return Edit;
        case 'contrato_nuevo': return FileText;
        case 'ausencia_nueva': return CalendarX;
        case 'documento_nuevo': return Upload;
        case 'sistema': return Info;
        default: return Clock;
      }
    },

    getActivityIconClass(tipo) {
      const parts = tipo.split('_');
      if (parts.length >= 2) {
        const [entidad, accion] = parts;

        let baseClass = '';
        switch (entidad) {
          case 'empleado': baseClass = 'employee'; break;
          case 'contrato': baseClass = 'contract'; break;
          case 'documento': baseClass = 'document'; break;
          case 'ausencia': baseClass = 'absence'; break;
          case 'sistema': baseClass = 'system'; break;
          default: baseClass = 'default'; break;
        }

        if (accion === 'create' || accion === 'nuevo' || accion === 'nueva') {
          return `${baseClass}-activity`;
        } else if (accion === 'update' || accion === 'actualizado' || accion === 'actualizada') {
          return `${baseClass}-update`;
        } else if (accion === 'delete' || accion === 'eliminado' || accion === 'eliminada') {
          return `${baseClass}-delete`;
        }

        return `${baseClass}-activity`;
      }

      switch (tipo) {
        case 'empleado_nuevo': return 'employee-activity';
        case 'empleado_update': return 'employee-update';
        case 'contrato_nuevo': return 'contract-activity';
        case 'ausencia_nueva': return 'absence-activity';
        case 'documento_nuevo': return 'document-activity';
        case 'sistema': return 'system-activity';
        default: return 'default-activity';
      }
    },

    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    },

    navigateTo(path) {
      this.router.push(path);
    }
  }
};
</script>

<style>
.dashboard {
  padding: 1.5rem;
  background-color: #f8f9fa;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: #e63946;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  border-left: 4px solid #e63946;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.employee-icon {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.document-icon {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.company-icon {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.center-icon {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
}

.stat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.dashboard-row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.chart-container,
.activity-container,
.upcoming-container,
.quick-actions-container {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
  border-top: 4px solid #e63946;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-title-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chart-title,
.activity-title,
.upcoming-title,
.quick-actions-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.select-chart, .select-period {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  font-size: 0.75rem;
  background-color: white;
}

.chart-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-outline-secondary {
  background-color: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
}

.btn-outline-secondary:hover,
.btn-outline-secondary.active {
  background-color: #e63946;
  border-color: #e63946;
  color: white;
}

.chart {
  position: relative;
  height: 250px;
  margin-bottom: 1rem;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  color: #9ca3af;
  text-align: center;
  padding: 1rem;
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
  color: #e63946;
}

.chart-legend {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  color: #6b7280;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-value {
  font-weight: 500;
  color: #111827;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.employee-activity {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.contract-activity {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.document-activity {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.absence-activity {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.system-activity {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

/* Estilos para actualizaciones */
.employee-update, .contract-update, .document-update, .absence-update {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

/* Estilos para eliminaciones */
.employee-delete, .contract-delete, .document-delete, .absence-delete {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.activity-empty,
.upcoming-empty {
  text-align: center;
  padding: 1.5rem 0;
  color: #9ca3af;
  font-size: 0.875rem;
}

.activity-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
}

.spinner-sm {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(230, 57, 70, 0.1);
  border-radius: 50%;
  border-top-color: #e63946;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(230, 57, 70, 0.1);
  border-radius: 50%;
  border-top-color: #e63946;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

.upcoming-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.upcoming-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upcoming-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.upcoming-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.upcoming-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 0.375rem;
  background-color: rgba(230, 57, 70, 0.1);
  flex-shrink: 0;
}

.date-day {
  font-size: 1rem;
  font-weight: 600;
  color: #e63946;
}

.date-month {
  font-size: 0.75rem;
  color: #e63946;
}

.upcoming-content {
  flex: 1;
}

.upcoming-title {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.upcoming-subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.upcoming-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  height: fit-content;
}

.upcoming-status.warning {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.upcoming-status.danger {
  background-color: rgba(230, 57, 70, 0.2);
  color: #e63946;
}

.upcoming-status.info {
  background-color: rgba(230, 57, 70, 0.05);
  color: #e63946;
}

.status-icon {
  flex-shrink: 0;
}

.quick-actions-title {
  margin-bottom: 1rem;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action:hover {
  background-color: #e63946;
  border-color: #e63946;
  transform: translateY(-2px);
}

.quick-action:hover .action-icon,
.quick-action:hover .action-text {
  color: white;
}

.action-icon {
  margin-bottom: 0.5rem;
  color: #e63946;
  transition: color 0.2s ease;
}

.action-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #4b5563;
  text-align: center;
  transition: color 0.2s ease;
}

@media (max-width: 1200px) {
  .dashboard-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .chart-legend {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .chart-legend {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .upcoming-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>