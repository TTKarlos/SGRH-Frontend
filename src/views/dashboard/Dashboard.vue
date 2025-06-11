<template>
  <defaultLayout>
    <div class="dashboard">
      <div class="dashboard-header">
        <h1 class="dashboard-title">Dashboard RRHH</h1>
        <button
            @click="refreshData"
            :disabled="loading"
            class="btn btn-outline-primary btn-sm"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin': loading }" />
          Actualizar
        </button>
      </div>

      <!-- Indicador de carga -->
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="error-message">
        <div class="error-content">
          <AlertCircle :size="24" />
          <div>
            <h3>Error al cargar datos</h3>
            <p>{{ error }}</p>
            <button @click="loadDashboardData" class="btn btn-primary btn-sm">
              Reintentar
            </button>
          </div>
        </div>
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

          <!-- Tarjeta de Zonas -->
          <div class="stat-card">
            <div class="stat-icon center-icon">
              <MapPin size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-header">
                <h3 class="stat-title">Total Zonas</h3>
              </div>
              <p class="stat-value">{{ totalZonas }}</p>
              <div class="stat-footer">
                <span class="stat-label">Zonas de trabajo</span>
              </div>
            </div>
          </div>

          <!-- Tarjeta de Departamentos -->
          <div class="stat-card">
            <div class="stat-icon department-icon">
              <FolderOpen size="20" />
            </div>
            <div class="stat-content">
              <div class="stat-header">
                <h3 class="stat-title">Total Departamentos</h3>
              </div>
              <p class="stat-value">{{ totalDepartamentos }}</p>
              <div class="stat-footer">
                <span class="stat-label">Departamentos activos</span>
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
              <div v-else class="chart-canvas-container">
                <canvas ref="distributionChart" :key="chartKey"></canvas>
              </div>
            </div>
            <div class="chart-legend" v-if="chartData && chartData.length > 0">
              <div class="legend-item" v-for="(item, index) in displayedChartData" :key="index">
                <span class="legend-color" :style="{ backgroundColor: chartColors[index % chartColors.length] }"></span>
                <span class="legend-label">{{ item.name }}</span>
                <span class="legend-value">{{ item.count }}</span>
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
import { useDashboardData } from '../../composables/useDashboardData';
import {
  Users,
  FolderOpen,
  Clock,
  BarChart3,
  PieChart,
  Building2,
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-vue-next';
import DefaultLayout from "../../layouts/DefaultLayout.vue";

export default {
  name: 'Dashboard',
  components: {
    DefaultLayout,
    Users,
    FolderOpen,
    Clock,
    BarChart3,
    PieChart,
    Building2,
    MapPin,
    RefreshCw,
    AlertCircle
  },
  setup() {
    const {
      loading,
      error,
      totalEmpleados,
      totalEmpresas,
      totalZonas,
      totalDepartamentos,
      vencimientos,
      loadDashboardData,
      generateChartData,
      refreshData,
      formatDay,
      formatMonth,
      getVencimientoStatusClass,
    } = useDashboardData()

    return {
      loading,
      error,
      totalEmpleados,
      totalEmpresas,
      totalZonas,
      totalDepartamentos,
      vencimientos,
      loadDashboardData,
      generateChartData,
      refreshData,
      formatDay,
      formatMonth,
      getVencimientoStatusClass,
    }
  },
  data() {
    return {
      chart: null,
      selectedChart: 'departamentos',
      chartType: 'doughnut',
      chartData: [],
      chartKey: 0,
      vencimientoPeriodo: '30',
      vencimientosFiltrados: [],
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
    };
  },
  computed: {
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
    vencimientos: {
      handler: function(newVencimientos) {
        if (newVencimientos && newVencimientos.contratos) {
          this.filtrarVencimientos();
        } else {
          this.vencimientosFiltrados = [];
        }
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadData();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.destroyChart();
  },
  methods: {
    async loadData() {
      try {
        await this.loadDashboardData();
        await this.updateChart();
      } catch (error) {
        console.error("Error al cargar datos:", error);
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

    async updateChart() {
      try {
        this.chartData = await this.generateChartData(this.selectedChart);
        if (this.chartData && this.chartData.length > 0) {
          await this.$nextTick();
          setTimeout(() => {
            this.initChart();
          }, 100);
        }
      } catch (error) {
        console.error("Error al actualizar gráfico:", error);
      }
    },

    destroyChart() {
      if (this.chart) {
        try {
          this.chart.destroy();
        } catch (error) {
          console.warn("Error al destruir gráfico:", error);
        } finally {
          this.chart = null;
        }
      }
    },

    initChart() {
      this.destroyChart();

      if (!this.chartData || this.chartData.length === 0) {
        console.warn("No hay datos para mostrar en el gráfico");
        return;
      }

      this.$nextTick(() => {
        const chartElement = this.$refs.distributionChart;

        if (!chartElement) {
          console.warn("Elemento canvas no disponible para inicializar el gráfico");
          return;
        }

        try {
          const ctx = chartElement.getContext('2d');

          if (!ctx) {
            console.warn("No se pudo obtener el contexto 2D del canvas");
            return;
          }

          ctx.clearRect(0, 0, chartElement.width, chartElement.height);

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
            animation: {
              duration: 750,
              easing: 'easeInOutQuart'
            },
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
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                },
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 0
                  }
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

        } catch (error) {
          console.error("Error al crear el gráfico:", error);
        }
      });
    },

    setChartType(type) {
      if (this.chartType === type) return;

      this.chartType = type;

      this.chartKey++;

      this.$nextTick(() => {
        setTimeout(() => {
          if (this.chartData && this.chartData.length > 0) {
            this.initChart();
          }
        }, 150);
      });
    },

    handleResize() {
      if (this.chart) {
        try {
          this.chart.resize();
        } catch (error) {
          console.warn("Error al redimensionar gráfico:", error);
        }
      }
    },
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
  color: #000000;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline-primary {
  color: #e63946;
  border-color: #e63946;
  background-color: transparent;
}

.btn-outline-primary:hover:not(:disabled) {
  color: white;
  background-color: #e63946;
}

.btn-primary {
  color: white;
  background-color: #e63946;
  border-color: #e63946;
}

.btn-primary:hover:not(:disabled) {
  background-color: #d32f2f;
  border-color: #d32f2f;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.error-message {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border-left: 4px solid #dc3545;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.error-content h3 {
  margin: 0 0 0.5rem;
  color: #dc3545;
  font-size: 1.125rem;
}

.error-content p {
  margin: 0 0 1rem;
  color: #6b7280;
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

.employee-icon,
.company-icon,
.center-icon,
.department-icon {
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
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.chart-container,
.upcoming-container {
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
.upcoming-title {
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

.chart-canvas-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.chart-canvas-container canvas {
  max-height: 250px;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.upcoming-status.warning,
.upcoming-status.danger,
.upcoming-status.info {
  background-color: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.upcoming-status.danger {
  background-color: rgba(230, 57, 70, 0.2);
}

.status-icon {
  flex-shrink: 0;
}

.upcoming-empty {
  text-align: center;
  padding: 1.5rem 0;
  color: #9ca3af;
  font-size: 0.875rem;
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
}
</style>
