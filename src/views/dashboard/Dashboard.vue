<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <div class="dashboard-actions">
        <div class="date-filter">
          <Calendar size="16" class="date-icon" />
          <select class="form-control select-period">
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month" selected>Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
        </div>
        <button class="btn btn-outline-primary">
          <Download size="16" class="btn-icon" />
          Exportar
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon employee-icon">
          <Users size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-header">
            <h3 class="stat-title">Total Empleados</h3>
            <span class="stat-badge positive">+3.2%</span>
          </div>
          <p class="stat-value">245</p>
          <div class="stat-footer">
            <span class="stat-label">18 nuevos este mes</span>
            <ArrowUpRight size="16" class="trend-icon positive" />
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon contract-icon">
          <FileText size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-header">
            <h3 class="stat-title">Contratos Activos</h3>
            <span class="stat-badge negative">-1.4%</span>
          </div>
          <p class="stat-value">238</p>
          <div class="stat-footer">
            <span class="stat-label">5 por vencer</span>
            <AlertCircle size="16" class="trend-icon warning" />
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon absence-icon">
          <Calendar size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-header">
            <h3 class="stat-title">Ausencias</h3>
            <span class="stat-badge neutral">0%</span>
          </div>
          <p class="stat-value">12</p>
          <div class="stat-footer">
            <span class="stat-label">3 pendientes de aprobar</span>
            <Clock size="16" class="trend-icon neutral" />
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon document-icon">
          <FolderOpen size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-header">
            <h3 class="stat-title">Documentos</h3>
            <span class="stat-badge positive">+5.7%</span>
          </div>
          <p class="stat-value">156</p>
          <div class="stat-footer">
            <span class="stat-label">24 nuevos este mes</span>
            <ArrowUpRight size="16" class="trend-icon positive" />
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-row">
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">Distribución por Departamentos</h3>
          <div class="chart-actions">
            <button class="btn btn-sm btn-outline-secondary">
              <BarChart3 size="14" class="btn-icon" />
              Barras
            </button>
            <button class="btn btn-sm btn-outline-secondary active">
              <PieChart size="14" class="btn-icon" />
              Circular
            </button>
          </div>
        </div>
        <div class="chart">
          <canvas ref="departmentChart" height="250"></canvas>
        </div>
        <div class="chart-legend">
          <div class="legend-item" v-for="(dept, index) in departmentData" :key="index">
            <span class="legend-color" :style="{ backgroundColor: chartColors[index % chartColors.length] }"></span>
            <span class="legend-label">{{ dept.name }}</span>
            <span class="legend-value">{{ dept.count }}</span>
          </div>
        </div>
      </div>

      <div class="activity-container">
        <div class="activity-header">
          <h3 class="activity-title">Actividad Reciente</h3>
          <button class="btn btn-sm btn-link">Ver todo</button>
        </div>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon contract-activity">
              <FileText size="16" />
            </div>
            <div class="activity-content">
              <p class="activity-text">Nuevo contrato creado para <strong>María López</strong></p>
              <span class="activity-time">Hace 2 horas</span>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon employee-activity">
              <UserPlus size="16" />
            </div>
            <div class="activity-content">
              <p class="activity-text">Nuevo empleado <strong>Juan Pérez</strong> añadido</p>
              <span class="activity-time">Hace 5 horas</span>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon document-activity">
              <Upload size="16" />
            </div>
            <div class="activity-content">
              <p class="activity-text"><strong>Ana García</strong> subió 3 documentos</p>
              <span class="activity-time">Ayer</span>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon absence-activity">
              <CalendarX size="16" />
            </div>
            <div class="activity-content">
              <p class="activity-text">Solicitud de ausencia de <strong>Carlos Ruiz</strong></p>
              <span class="activity-time">Hace 2 días</span>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon employee-activity">
              <UserMinus size="16" />
            </div>
            <div class="activity-content">
              <p class="activity-text">Empleado <strong>Pedro Sánchez</strong> dado de baja</p>
              <span class="activity-time">Hace 3 días</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-row">
      <div class="upcoming-container">
        <div class="upcoming-header">
          <h3 class="upcoming-title">Próximos Vencimientos</h3>
          <div class="upcoming-tabs">
            <button class="upcoming-tab active">Contratos</button>
            <button class="upcoming-tab">Documentos</button>
          </div>
        </div>
        <div class="upcoming-list">
          <div class="upcoming-item">
            <div class="upcoming-date">
              <span class="date-day">15</span>
              <span class="date-month">Jun</span>
            </div>
            <div class="upcoming-content">
              <p class="upcoming-title">Contrato de María López</p>
              <p class="upcoming-subtitle">Contrato temporal - Tecnología</p>
            </div>
            <div class="upcoming-status warning">
              <Clock size="16" class="status-icon" />
              <span>15 días</span>
            </div>
          </div>

          <div class="upcoming-item">
            <div class="upcoming-date">
              <span class="date-day">22</span>
              <span class="date-month">Jun</span>
            </div>
            <div class="upcoming-content">
              <p class="upcoming-title">Contrato de Juan Pérez</p>
              <p class="upcoming-subtitle">Contrato temporal - Ventas</p>
            </div>
            <div class="upcoming-status warning">
              <Clock size="16" class="status-icon" />
              <span>22 días</span>
            </div>
          </div>

          <div class="upcoming-item">
            <div class="upcoming-date">
              <span class="date-day">30</span>
              <span class="date-month">Jun</span>
            </div>
            <div class="upcoming-content">
              <p class="upcoming-title">Contrato de Ana García</p>
              <p class="upcoming-subtitle">Contrato temporal - RRHH</p>
            </div>
            <div class="upcoming-status warning">
              <Clock size="16" class="status-icon" />
              <span>30 días</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions-container">
        <h3 class="quick-actions-title">Acciones Rápidas</h3>
        <div class="quick-actions-grid">
          <button class="quick-action">
            <UserPlus size="20" class="action-icon" />
            <span class="action-text">Nuevo Empleado</span>
          </button>

          <button class="quick-action">
            <FileText size="20" class="action-icon" />
            <span class="action-text">Nuevo Contrato</span>
          </button>

          <button class="quick-action">
            <Upload size="20" class="action-icon" />
            <span class="action-text">Subir Documento</span>
          </button>

          <button class="quick-action">
            <CalendarPlus size="20" class="action-icon" />
            <span class="action-text">Registrar Ausencia</span>
          </button>

          <button class="quick-action">
            <BarChart2 size="20" class="action-icon" />
            <span class="action-text">Generar Informe</span>
          </button>

          <button class="quick-action">
            <Settings size="20" class="action-icon" />
            <span class="action-text">Configuración</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';
import {
  Users,
  FileText,
  Calendar,
  FolderOpen,
  ArrowUpRight,
  AlertCircle,
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
  Download
} from 'lucide-vue-next';

export default {
  name: 'Dashboard',
  components: {
    Users,
    FileText,
    Calendar,
    FolderOpen,
    ArrowUpRight,
    AlertCircle,
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
    Download
  },
  setup() {
    const departmentChart = ref(null);
    let chart = null;

    const departmentData = [
      { name: 'Tecnología', count: 45 },
      { name: 'Ventas', count: 65 },
      { name: 'Contabilidad', count: 35 },
      { name: 'RRHH', count: 25 },
      { name: 'Diseño', count: 15 },
      { name: 'Otros', count: 60 }
    ];

    const chartColors = [
      '#4361ee',
      '#3a0ca3',
      '#7209b7',
      '#f72585',
      '#4cc9f0',
      '#4895ef'
    ];

    const initChart = () => {
      const ctx = departmentChart.value.getContext('2d');

      chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: departmentData.map(dept => dept.name),
          datasets: [{
            data: departmentData.map(dept => dept.count),
            backgroundColor: chartColors,
            borderWidth: 0,
            borderRadius: 4,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    };

    const resizeChart = () => {
      if (chart) {
        chart.resize();
      }
    };

    onMounted(() => {
      initChart();
      window.addEventListener('resize', resizeChart);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resizeChart);
      if (chart) {
        chart.destroy();
      }
    });

    return {
      departmentChart,
      departmentData,
      chartColors
    };
  }
};
</script>

<style>
.dashboard {
  padding: 1.5rem;
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
  color: #111827;
}

.dashboard-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.date-filter {
  position: relative;
}

.date-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.select-period {
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  background-color: white;
  min-width: 150px;
}

.btn-outline-primary {
  background-color: transparent;
  border: 1px solid #4361ee;
  color: #4361ee;
}

.btn-outline-primary:hover {
  background-color: #4361ee;
  color: white;
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
  border: 1px solid #e5e7eb;
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
  background-color: #e0e7ff;
  color: #4f46e5;
}

.contract-icon {
  background-color: #fef3c7;
  color: #d97706;
}

.absence-icon {
  background-color: #dcfce7;
  color: #16a34a;
}

.document-icon {
  background-color: #dbeafe;
  color: #2563eb;
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

.stat-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.stat-badge.positive {
  background-color: #dcfce7;
  color: #16a34a;
}

.stat-badge.negative {
  background-color: #fee2e2;
  color: #dc2626;
}

.stat-badge.neutral {
  background-color: #f3f4f6;
  color: #6b7280;
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

.trend-icon {
  flex-shrink: 0;
}

.trend-icon.positive {
  color: #16a34a;
}

.trend-icon.negative {
  color: #dc2626;
}

.trend-icon.warning {
  color: #d97706;
}

.trend-icon.neutral {
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
  border: 1px solid #e5e7eb;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

.chart-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-outline-secondary {
  background-color: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
}

.btn-outline-secondary:hover,
.btn-outline-secondary.active {
  background-color: #f3f4f6;
  border-color: #9ca3af;
  color: #4b5563;
}

.chart {
  position: relative;
  height: 250px;
  margin-bottom: 1rem;
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

.btn-link {
  background: none;
  border: none;
  color: #4361ee;
  padding: 0;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
}

.btn-link:hover {
  text-decoration: underline;
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
  background-color: #e0e7ff;
  color: #4f46e5;
}

.contract-activity {
  background-color: #fef3c7;
  color: #d97706;
}

.document-activity {
  background-color: #dbeafe;
  color: #2563eb;
}

.absence-activity {
  background-color: #fee2e2;
  color: #dc2626;
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

.upcoming-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.upcoming-tabs {
  display: flex;
  gap: 0.5rem;
}

.upcoming-tab {
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

.upcoming-tab.active {
  background-color: #f3f4f6;
  color: #111827;
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
  background-color: #f3f4f6;
  flex-shrink: 0;
}

.date-day {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.date-month {
  font-size: 0.75rem;
  color: #6b7280;
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
  background-color: #fef3c7;
  color: #d97706;
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
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.action-icon {
  margin-bottom: 0.5rem;
  color: #4361ee;
}

.action-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #4b5563;
  text-align: center;
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
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .dashboard-actions {
    width: 100%;
    flex-direction: column;
  }

  .date-filter {
    width: 100%;
  }

  .select-period {
    width: 100%;
  }

  .btn-outline-primary {
    width: 100%;
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

