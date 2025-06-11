<template>
  <DefaultLayout>
    <div class="informes-page">
      <!-- Header estandarizado -->
      <div class="page-header">
        <div class="header-title">
          <h1>Informes PDF</h1>
          <p class="text-muted">Genera informes detallados en formato PDF de empleados, departamentos, centros y más</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-number">{{ informesDisponibles.length }}</span>
            <span class="stat-label">Categorías</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalInformes }}</span>
            <span class="stat-label">Informes</span>
          </div>
        </div>
      </div>

      <!-- Estados de carga y error -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando informes disponibles...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error al cargar informes</h3>
        <p>{{ error }}</p>
        <button @click="loadInformes" class="btn btn-primary">
          <RefreshCw size="16" class="btn-icon" />
          Reintentar
        </button>
      </div>

      <!-- Contenido principal -->
      <div v-else class="informes-content">
        <!-- Sidebar de categorías -->
        <div class="categorias-sidebar">
          <div class="sidebar-header">
            <h3>Categorías</h3>
            <span class="sidebar-badge">{{ informesDisponibles.length }}</span>
          </div>

          <div class="categorias-list">
            <div
                v-for="categoria in informesDisponibles"
                :key="categoria.categoria"
                :class="['categoria-item', { active: selectedCategoria === categoria.categoria }]"
                @click="selectedCategoria = categoria.categoria"
            >
              <div class="categoria-icon">
                <component :is="getCategoriaIcon(categoria.categoria)" size="20" />
              </div>
              <div class="categoria-info">
                <div class="categoria-name">{{ categoria.categoria }}</div>
                <div class="categoria-count">{{ categoria.informes.length }} informes</div>
              </div>
              <ChevronRight size="16" class="categoria-arrow" />
            </div>
          </div>
        </div>

        <!-- Grid de informes -->
        <div class="informes-main">
          <div class="main-header">
            <h2>{{ selectedCategoria || 'Todos los informes' }}</h2>
            <p class="text-muted">{{ informesFiltrados.length }} informes disponibles</p>
          </div>

          <div v-if="informesFiltrados.length === 0" class="empty-state">
            <FileText size="48" class="empty-icon" />
            <h3>No hay informes disponibles</h3>
            <p>No se encontraron informes en esta categoría</p>
          </div>

          <div v-else class="informes-grid">
            <div
                v-for="informe in informesFiltrados"
                :key="informe.id"
                class="informe-card"
                :class="{ generating: generando === informe.id }"
            >
              <!-- Header de la card -->
              <div class="card-header">
                <div class="card-icon">
                  <component :is="getInformeIcon(informe.id)" size="24" />
                </div>
                <div v-if="generando === informe.id" class="generating-indicator">
                  <div class="spinner-small"></div>
                </div>
              </div>

              <!-- Contenido de la card -->
              <div class="card-content">
                <h3 class="card-title">{{ informe.nombre }}</h3>
                <p class="card-description">{{ informe.descripcion }}</p>

                <!-- Parámetros requeridos -->
                <div v-if="informe.parametros && informe.parametros.length" class="parametros-section">
                  <div class="parametros-header">
                    <Settings size="14" />
                    <span>Parámetros requeridos</span>
                  </div>
                  <div class="parametros-tags">
                    <span
                        v-for="(param, index) in informe.parametros"
                        :key="index"
                        class="parametro-tag"
                    >
                      {{ param }}
                    </span>
                  </div>
                </div>

                <!-- Vista previa del informe -->
                <div class="preview-section">
                  <div class="preview-header">
                    <Eye size="14" />
                    <span>Vista previa</span>
                  </div>
                  <div class="preview-content">
                    <div class="preview-mockup">
                      <div class="preview-header-bar">
                        <div class="preview-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span class="preview-title">{{ informe.nombre }}.pdf</span>
                      </div>
                      <div class="preview-body">
                        <div class="preview-lines">
                          <div class="preview-line long"></div>
                          <div class="preview-line medium"></div>
                          <div class="preview-line short"></div>
                          <div class="preview-line long"></div>
                          <div class="preview-line medium"></div>
                        </div>
                        <div class="preview-chart">
                          <div class="chart-bars">
                            <div class="bar" style="height: 60%"></div>
                            <div class="bar" style="height: 80%"></div>
                            <div class="bar" style="height: 40%"></div>
                            <div class="bar" style="height: 90%"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer de la card -->
              <div class="card-footer">
                <button
                    @click="generarInforme(informe)"
                    class="btn btn-primary btn-full"
                    :disabled="generando === informe.id"
                >
                  <component
                      :is="generando === informe.id ? 'Loader' : 'Download'"
                      size="16"
                      class="btn-icon"
                      :class="{ 'animate-spin': generando === informe.id }"
                  />
                  {{ generando === informe.id ? 'Generando...' : 'Generar PDF' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal para parámetros -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <div class="modal-title-section">
              <component :is="getInformeIcon(informeSeleccionado?.id)" size="24" class="modal-icon" />
              <div>
                <h2>{{ informeSeleccionado?.nombre }}</h2>
                <p class="modal-subtitle">{{ informeSeleccionado?.descripcion }}</p>
              </div>
            </div>
            <button @click="closeModal" class="modal-close">
              <X size="18" />
            </button>
          </div>

          <div class="modal-body">
            <!-- Selector para departamentos, centros, zonas, empresas -->
            <div v-if="requiereSelector" class="form-group">
              <label class="form-label">
                <component :is="getSelectorIcon()" size="16" class="label-icon" />
                {{ getSelectorLabel() }}
              </label>
              <div class="select-wrapper">
                <select v-model="parametros.id" class="form-select">
                  <option value="" disabled>Seleccionar {{ getSelectorLabel().toLowerCase() }}</option>
                  <option
                      v-for="opcion in opcionesModal"
                      :key="opcion.id"
                      :value="opcion.id"
                  >
                    {{ opcion.nombre }}
                    <span v-if="opcion.total_empleados">({{ opcion.total_empleados }} empleados)</span>
                  </option>
                </select>
                <ChevronDown size="16" class="select-arrow" />
              </div>
            </div>

            <!-- Selector de fechas para cumpleaños -->
            <div v-if="esCumpleanos" class="form-group">
              <label class="form-label">
                <Calendar size="16" class="label-icon" />
                Rango de fechas
              </label>
              <div class="date-range">
                <div class="date-field">
                  <label class="date-label">Fecha inicio</label>
                  <input v-model="parametros.fechaInicio" type="date" class="form-input" />
                </div>
                <div class="date-separator">—</div>
                <div class="date-field">
                  <label class="date-label">Fecha fin</label>
                  <input v-model="parametros.fechaFin" type="date" class="form-input" />
                </div>
              </div>
            </div>

            <!-- Vista previa expandida en modal -->
            <div class="modal-preview-section">
              <div class="preview-header">
                <Eye size="16" />
                <span>Vista previa del informe</span>
              </div>
              <div class="modal-preview-content">
                <div class="preview-mockup large">
                  <div class="preview-header-bar">
                    <div class="preview-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span class="preview-title">{{ informeSeleccionado?.nombre }}.pdf</span>
                  </div>
                  <div class="preview-body">
                    <div class="preview-content-large">
                      <div class="preview-header-section">
                        <div class="preview-logo"></div>
                        <div class="preview-title-section">
                          <div class="preview-line extra-long"></div>
                          <div class="preview-line medium"></div>
                        </div>
                      </div>
                      <div class="preview-data-section">
                        <div class="preview-table">
                          <div class="table-row header">
                            <div class="table-cell"></div>
                            <div class="table-cell"></div>
                            <div class="table-cell"></div>
                          </div>
                          <div class="table-row">
                            <div class="table-cell"></div>
                            <div class="table-cell"></div>
                            <div class="table-cell"></div>
                          </div>
                          <div class="table-row">
                            <div class="table-cell"></div>
                            <div class="table-cell"></div>
                            <div class="table-cell"></div>
                          </div>
                        </div>
                        <div class="preview-chart-large">
                          <div class="chart-bars">
                            <div class="bar" style="height: 45%"></div>
                            <div class="bar" style="height: 70%"></div>
                            <div class="bar" style="height: 30%"></div>
                            <div class="bar" style="height: 85%"></div>
                            <div class="bar" style="height: 55%"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn-secondary">
              <X size="16" class="btn-icon" />
              Cancelar
            </button>
            <button
                @click="generarInformeConParametros"
                class="btn btn-primary"
                :disabled="!isFormValid"
            >
              <Download size="16" class="btn-icon" />
              Generar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import DefaultLayout from '../../layouts/DefaultLayout.vue'
import { useInformesStore } from '../../stores/informes'
import { useNotificationStore } from '../../stores/notification'
import {
  FileText, Users, Building2, MapPin, Briefcase, Calendar,
  Phone, BarChart3, Download, Loader, Settings, Eye,
  ChevronRight, ChevronDown, X, RefreshCw
} from 'lucide-vue-next'

export default defineComponent({
  name: 'Informes',

  components: {
    DefaultLayout,
    FileText, Users, Building2, MapPin, Briefcase, Calendar,
    Phone, BarChart3, Download, Loader, Settings, Eye,
    ChevronRight, ChevronDown, X, RefreshCw
  },

  setup() {
    const informesDisponibles = ref([])
    const selectedCategoria = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const generando = ref(null)
    const showModal = ref(false)
    const informeSeleccionado = ref(null)
    const opcionesModal = ref([])
    const parametros = ref({
      id: '',
      fechaInicio: '',
      fechaFin: ''
    })

    const informesStore = useInformesStore()
    const notificationStore = useNotificationStore()

    const loadInformes = async () => {
      loading.value = true
      error.value = null

      try {
        const response = await informesStore.fetchInformesDisponibles()
        informesDisponibles.value = response

        if (informesDisponibles.value.length > 0) {
          selectedCategoria.value = informesDisponibles.value[0].categoria
        }
      } catch (err) {
        console.error('Error cargando informes:', err)
        error.value = 'Error al cargar los informes. Por favor, intente nuevamente.'
      } finally {
        loading.value = false
      }
    }

    const generarInforme = async (informe) => {
      if (requiereParametros(informe)) {
        mostrarModal(informe)
        return
      }

      try {
        generando.value = informe.id
        await informesStore.generarInforme(informe.id)

        notificationStore.success(
            `El informe "${informe.nombre}" se ha generado correctamente`,
            "Informe generado"
        )
      } catch (err) {
        console.error('Error generando informe:', err)
        notificationStore.error(
            err.message || 'Error al generar el informe',
            "Error"
        )
      } finally {
        generando.value = null
      }
    }

    const requiereParametros = (informe) => {
      return informe.parametros && informe.parametros.length > 0
    }

    const mostrarModal = async (informe) => {
      informeSeleccionado.value = informe
      parametros.value = { id: '', fechaInicio: '', fechaFin: '' }

      if (informe.id === 'cumpleanos-rango') {
        const now = new Date()
        const year = now.getFullYear()
        parametros.value.fechaInicio = `${year}-01-01`
        parametros.value.fechaFin = `${year}-12-31`
      }

      try {
        switch (informe.id) {
          case 'departamento-especifico':
            opcionesModal.value = await informesStore.fetchOpcionesDepartamentos()
            break
          case 'centro-especifico':
            opcionesModal.value = await informesStore.fetchOpcionesCentros()
            break
          case 'zona-especifica':
            opcionesModal.value = await informesStore.fetchOpcionesZonas()
            break
          case 'empresa-especifica':
            opcionesModal.value = await informesStore.fetchOpcionesEmpresas()
            break
          default:
            opcionesModal.value = []
        }

        showModal.value = true
      } catch (err) {
        console.error('Error cargando opciones:', err)
        notificationStore.error(
            'Error al cargar las opciones para el informe',
            "Error"
        )
      }
    }

    const closeModal = () => {
      showModal.value = false
      informeSeleccionado.value = null
      opcionesModal.value = []
    }

    const generarInformeConParametros = async () => {
      if (!isFormValid.value) return

      try {
        generando.value = informeSeleccionado.value.id

        const params = {}

        if (requiereSelector.value) {
          params.id = parametros.value.id
        }

        if (esCumpleanos.value) {
          params.fechaInicio = parametros.value.fechaInicio
          params.fechaFin = parametros.value.fechaFin
        }

        await informesStore.generarInforme(informeSeleccionado.value.id, params)

        notificationStore.success(
            `El informe "${informeSeleccionado.value.nombre}" se ha generado correctamente`,
            "Informe generado"
        )

        closeModal()
      } catch (err) {
        console.error('Error generando informe con parámetros:', err)
        notificationStore.error(
            err.message || 'Error al generar el informe',
            "Error"
        )
      } finally {
        generando.value = null
      }
    }

    const getSelectorLabel = () => {
      if (!informeSeleccionado.value) return ''

      const labels = {
        'departamento-especifico': 'Departamento',
        'centro-especifico': 'Centro',
        'zona-especifica': 'Zona',
        'empresa-especifica': 'Empresa'
      }

      return labels[informeSeleccionado.value.id] || 'Opción'
    }

    const getSelectorIcon = () => {
      if (!informeSeleccionado.value) return Building2

      const icons = {
        'departamento-especifico': Building2,
        'centro-especifico': MapPin,
        'zona-especifica': MapPin,
        'empresa-especifica': Briefcase
      }

      return icons[informeSeleccionado.value.id] || Building2
    }

    const getCategoriaIcon = (categoria) => {
      const icons = {
        'Empleados': Users,
        'Departamentos': Building2,
        'Centros': MapPin,
        'Zonas': MapPin,
        'Empresas': Briefcase,
        'Especiales': Calendar,
        'Dashboard': BarChart3
      }
      return icons[categoria] || FileText
    }

    const getInformeIcon = (informeId) => {
      const icons = {
        'empleados-activos': Users,
        'empleados-inactivos': Users,
        'departamento-general': Building2,
        'departamento-especifico': Building2,
        'centro-general': MapPin,
        'centro-especifico': MapPin,
        'zona-general': MapPin,
        'zona-especifica': MapPin,
        'empresa-general': Briefcase,
        'empresa-especifica': Briefcase,
        'cumpleanos-rango': Calendar,
        'directorio-contactos': Phone,
        'dashboard-ejecutivo': BarChart3
      }
      return icons[informeId] || FileText
    }

    const totalInformes = computed(() => {
      return informesDisponibles.value.reduce((total, cat) => total + cat.informes.length, 0)
    })

    const informesFiltrados = computed(() => {
      if (!selectedCategoria.value) {
        return informesDisponibles.value.flatMap(cat => cat.informes)
      }

      const categoria = informesDisponibles.value.find(
          cat => cat.categoria === selectedCategoria.value
      )

      return categoria ? categoria.informes : []
    })

    const requiereSelector = computed(() => {
      if (!informeSeleccionado.value) return false
      return ['departamento-especifico', 'centro-especifico', 'zona-especifica', 'empresa-especifica']
          .includes(informeSeleccionado.value.id)
    })

    const esCumpleanos = computed(() => {
      return informeSeleccionado.value && informeSeleccionado.value.id === 'cumpleanos-rango'
    })

    const isFormValid = computed(() => {
      if (requiereSelector.value) {
        return parametros.value.id !== ''
      }
      if (esCumpleanos.value) {
        return parametros.value.fechaInicio !== '' && parametros.value.fechaFin !== ''
      }
      return true
    })

    onMounted(() => {
      loadInformes()
    })

    return {
      informesDisponibles,
      selectedCategoria,
      loading,
      error,
      generando,
      showModal,
      informeSeleccionado,
      opcionesModal,
      parametros,
      totalInformes,
      informesFiltrados,
      requiereSelector,
      esCumpleanos,
      isFormValid,
      loadInformes,
      generarInforme,
      requiereParametros,
      mostrarModal,
      closeModal,
      generarInformeConParametros,
      getSelectorLabel,
      getSelectorIcon,
      getCategoriaIcon,
      getInformeIcon
    }
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.informes-page {
  padding: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

/* Header estandarizado */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-title {
  display: flex;
  flex-direction: column;
}

.header-title h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
  position: relative;
  padding-bottom: 0.5rem;
}

.header-title h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #dc2626, #ef4444);
  border-radius: 3px;
}

.text-muted {
  color: #6b7280;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.header-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f1f1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* Estados de carga y error */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f1f1;
  border-top: 4px solid #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #dc2626;
  margin-bottom: 1rem;
}

/* Contenido principal */
.informes-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* Sidebar de categorías */
.categorias-sidebar {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f1f1;
  position: sticky;
  top: 1.5rem;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.sidebar-badge {
  background: #dc2626;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.categorias-list {
  padding: 1rem;
}

.categoria-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  border: 1px solid transparent;
}

.categoria-item:hover {
  background: #f9fafb;
}

.categoria-item.active {
  background: #fee2e2;
  border-color: #dc2626;
  color: #dc2626;
}

.categoria-icon {
  margin-right: 0.75rem;
  color: #6b7280;
}

.categoria-item.active .categoria-icon {
  color: #dc2626;
}

.categoria-info {
  flex: 1;
}

.categoria-name {
  font-weight: 500;
  margin-bottom: 0.125rem;
}

.categoria-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.categoria-arrow {
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #dc2626;
}

.categoria-item:hover .categoria-arrow,
.categoria-item.active .categoria-arrow {
  opacity: 1;
}

/* Main content */
.informes-main {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f1f1;
}

.main-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.main-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #374151;
  margin-bottom: 0.5rem;
}

/* Grid de informes */
.informes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.informe-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.informe-card:hover {
  border-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.informe-card.generating {
  border-color: #f59e0b;
  background: #fffbeb;
}

.card-header {
  background: #f9fafb;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.card-icon {
  color: #dc2626;
}

.generating-indicator {
  display: flex;
  align-items: center;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f59e0b;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.card-content {
  padding: 1rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.card-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

/* Sección de parámetros */
.parametros-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.parametros-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.parametros-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.parametro-tag {
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.625rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

/* Vista previa */
.preview-section {
  margin-bottom: 1rem;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.preview-content {
  border: 1px dashed #d1d5db;
  border-radius: 0.375rem;
  padding: 0.75rem;
  background: #fafafa;
}

.preview-mockup {
  background: white;
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.preview-mockup.large {
  min-height: 200px;
}

.preview-header-bar {
  background: #f3f4f6;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.preview-dots {
  display: flex;
  gap: 0.25rem;
}

.preview-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d1d5db;
}

.preview-dots span:nth-child(1) { background: #ef4444; }
.preview-dots span:nth-child(2) { background: #f59e0b; }
.preview-dots span:nth-child(3) { background: #10b981; }

.preview-title {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.preview-body {
  padding: 0.75rem;
}

.preview-lines {
  margin-bottom: 0.75rem;
}

.preview-line {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-bottom: 0.25rem;
}

.preview-line.short { width: 40%; }
.preview-line.medium { width: 60%; }
.preview-line.long { width: 80%; }
.preview-line.extra-long { width: 90%; }

.preview-chart {
  display: flex;
  align-items: end;
  height: 40px;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 100%;
  width: 100%;
}

.bar {
  background: #dc2626;
  border-radius: 1px;
  flex: 1;
  min-height: 4px;
}

/* Vista previa expandida en modal */
.modal-preview-section {
  margin-top: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.modal-preview-content {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 1rem;
  background: white;
}

.preview-content-large {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-header-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.preview-logo {
  width: 40px;
  height: 40px;
  background: #dc2626;
  border-radius: 0.25rem;
}

.preview-title-section {
  flex: 1;
}

.preview-data-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.preview-table {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.25rem;
}

.table-cell {
  height: 8px;
  background: #e5e7eb;
  border-radius: 2px;
}

.table-row.header .table-cell {
  background: #dc2626;
}

.preview-chart-large {
  display: flex;
  align-items: end;
  height: 60px;
}

/* Footer de la card */
.card-footer {
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-full {
  width: 100%;
}

.btn-icon {
  margin-right: 0.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title-section {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.modal-icon {
  color: #dc2626;
  margin-top: 0.25rem;
}

.modal-title-section h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #dc2626;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Formularios */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.label-icon {
  color: #6b7280;
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
}

.form-select:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 1px #dc2626;
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-field {
  flex: 1;
}

.date-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 1px #dc2626;
}

.date-separator {
  font-weight: bold;
  color: #6b7280;
  margin-top: 1rem;
}

/* Animaciones */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .informes-content {
    grid-template-columns: 1fr;
  }

  .categorias-sidebar {
    position: static;
  }

  .header-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .informes-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
  }

  .informes-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .date-range {
    flex-direction: column;
  }

  .date-separator {
    margin: 0;
    transform: rotate(90deg);
  }

  .modal-container {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }

  .modal-footer {
    flex-direction: column;
  }

  .preview-data-section {
    grid-template-columns: 1fr;
  }
}
</style>