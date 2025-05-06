<template>
  <div class="tab-panel">
    <div class="card">
      <div class="card-header">
        <h2>Ausencias</h2>
        <button v-if="canEdit" @click="openModal()" class="btn btn-primary">
          <Plus size="16" class="btn-icon" />
          Nueva ausencia
        </button>
      </div>

      <div class="card-body">
        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <LoadingSpinner message="Cargando ausencias..." />
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <div class="error-message">
            <AlertTriangle size="24" />
            <p>{{ error }}</p>
          </div>
          <button @click="$emit('reload')" class="btn btn-primary">
            <RefreshCw size="16" class="btn-icon" />
            Reintentar
          </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="!ausencias || ausencias.length === 0" class="empty-container">
          <Calendar size="48" class="empty-icon" />
          <p>No hay ausencias registradas para este empleado.</p>
        </div>

        <!-- Data table -->
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
            <tr>
              <th>Tipo de ausencia</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Duración</th>
              <th v-if="canEdit">Acciones</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="ausencia in ausencias" :key="ausencia.id_ausencia">
              <td>
                <span v-if="ausencia.TipoAusencia && ausencia.TipoAusencia.nombre">
                  {{ ausencia.TipoAusencia.nombre }}
                </span>
                <span v-else>
                  {{ getTipoAusenciaNombre(ausencia.id_tipo_ausencia) }}
                </span>
              </td>
              <td>{{ formatDate(ausencia.fecha_inicio) }}</td>
              <td>
                <span v-if="ausencia.fecha_fin">{{ formatDate(ausencia.fecha_fin) }}</span>
                <span v-else class="badge badge-active">En curso</span>
              </td>
              <td>{{ calcularDuracion(ausencia.fecha_inicio, ausencia.fecha_fin) }}</td>
              <td v-if="canEdit" class="actions-cell">
                <button @click="editAusencia(ausencia)" class="btn-icon-only" title="Editar">
                  <Edit size="16" />
                </button>
                <button @click="deleteAusencia(ausencia)" class="btn-icon-only text-danger" title="Eliminar">
                  <Trash2 size="16" />
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de ausencia -->
    <AusenciaModal
        v-if="showModal"
        :value="currentAusencia"
        :loading="savingAusencia"
        :validation-errors="validationErrors"
        :id_empleado="id_empleado"
        :tiposAusencia="tiposAusenciaStore.tiposAusencia"
        :ausencias-existentes="ausencias"
        @close="closeModal"
        @save="saveAusencia"
        @validation-error="handleValidationError"
    />
  </div>
</template>

<script>
import { useTiposAusenciaStore } from "../../../../stores/tiposAusencia"
import LoadingSpinner from "../../../common/LoadingSpinner.vue"
import AusenciaModal from "../modals/AusenciaModal.vue"
import { AlertTriangle, Plus, Edit, Trash2, Calendar, RefreshCw } from "lucide-vue-next"

export default {
  name: "AusenciasTab",

  components: {
    LoadingSpinner,
    AusenciaModal,
    AlertTriangle,
    Plus,
    Edit,
    Trash2,
    Calendar,
    RefreshCw
  },

  props: {
    ausencias: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    id_empleado: {
      type: [Number, String],
      required: true
    }
  },

  emits: ['add-ausencia', 'edit-ausencia', 'delete-ausencia', 'reload', 'save-ausencia'],

  data() {
    return {
      tiposAusenciaStore: useTiposAusenciaStore(),
      tiposEnProcesoDeCarga: {},
      fechaActual: new Date(),
      showModal: false,
      currentAusencia: {},
      savingAusencia: false,
      validationErrors: {}
    }
  },

  created() {
    this.loadTiposAusencia()
    this.intervalId = setInterval(() => {
      this.fechaActual = new Date()
    }, 60000)
  },

  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  },

  methods: {
    async loadTiposAusencia() {
      try {
        await this.tiposAusenciaStore.fetchTiposAusencia()

        if (this.ausencias && this.ausencias.length > 0) {
          this.cargarTiposFaltantes()
        }
      } catch (error) {
        console.error('Error al cargar tipos de ausencia:', error)
      }
    },

    cargarTiposFaltantes() {
      if (!this.ausencias) return

      this.ausencias.forEach(ausencia => {
        if (!ausencia.id_tipo_ausencia) return

        const idNum = typeof ausencia.id_tipo_ausencia === 'string'
            ? parseInt(ausencia.id_tipo_ausencia, 10)
            : ausencia.id_tipo_ausencia

        if (isNaN(idNum)) return

        const tipoExistente = this.tiposAusenciaStore.getTipoAusenciaById(idNum)

        if (!tipoExistente && !this.tiposEnProcesoDeCarga[idNum]) {
          this.tiposEnProcesoDeCarga[idNum] = true
          this.cargarTipoAusencia(idNum)
        }
      })
    },

    async cargarTipoAusencia(id) {
      try {
        await this.tiposAusenciaStore.getTipoAusencia(id)
      } catch (error) {
        console.error(`Error al cargar tipo de ausencia con ID ${id}:`, error)
      } finally {
        this.tiposEnProcesoDeCarga[id] = false
      }
    },

    getTipoAusenciaNombre(idTipoAusencia) {
      if (!idTipoAusencia) return "Sin especificar"

      const idNum = typeof idTipoAusencia === 'string'
          ? parseInt(idTipoAusencia, 10)
          : idTipoAusencia

      if (isNaN(idNum)) return "ID inválido"

      const tipo = this.tiposAusenciaStore.getTipoAusenciaById(idNum)

      if (tipo) {
        return tipo.nombre
      }

      if (!this.tiposEnProcesoDeCarga[idNum]) {
        this.tiposEnProcesoDeCarga[idNum] = true
        this.cargarTipoAusencia(idNum)
        return "Cargando..."
      }

      return "Cargando..."
    },

    formatDate(dateString) {
      if (!dateString) return '-'

      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },

    calcularDuracion(fechaInicio, fechaFin) {
      if (!fechaInicio) return '-'

      const inicio = new Date(fechaInicio)

      const fin = fechaFin ? new Date(fechaFin) : new Date()

      const inicioAjustado = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())
      const finAjustado = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate())

      const diffTime = finAjustado - inicioAjustado

      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

      if (!fechaFin) {
        return `${diffDays} día${diffDays !== 1 ? 's' : ''} (en curso)`
      }

      return `${diffDays} día${diffDays !== 1 ? 's' : ''}`
    },

    openModal() {
      this.currentAusencia = {
        id_empleado: this.id_empleado,
        id_tipo_ausencia: "",
        fecha_inicio: "",
        fecha_fin: ""
      }
      this.validationErrors = {}
      this.showModal = true
    },

    editAusencia(ausencia) {
      this.currentAusencia = {
        ...ausencia,
        id_empleado: this.id_empleado
      }
      this.validationErrors = {}
      this.showModal = true
    },

    deleteAusencia(ausencia) {
      if (confirm(`¿Está seguro de eliminar esta ausencia?`)) {
        this.$emit('delete-ausencia', ausencia)
      }
    },

    closeModal() {
      this.showModal = false
      this.currentAusencia = {}
      this.validationErrors = {}
    },

    async saveAusencia(ausencia) {
      try {
        this.savingAusencia = true
        this.validationErrors = {}

        this.$emit('save-ausencia', ausencia)

        this.closeModal()
      } catch (error) {
        console.error('Error al guardar ausencia:', error)
        this.validationErrors = error.validationErrors || { general: 'Error al guardar la ausencia' }
      } finally {
        this.savingAusencia = false
      }
    },

    handleValidationError(error) {
      console.error("Error de validación:", error)

      if (error.type === 'solapamiento') {
        this.validationErrors = {
          general: `Error: ${error.message}`
        }
      } else if (error.type === 'fecha') {
        this.validationErrors = {
          fecha_fin: error.message
        }
      } else {
        this.validationErrors = {
          general: error.message
        }
      }
    }
  },

  watch: {
    ausencias: {
      handler() {
        this.cargarTiposFaltantes()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.tab-panel {
  margin-top: 1rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.card-body {
  padding: 1.5rem;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
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

.empty-icon {
  color: #9ca3af;
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
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-primary:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  font-weight: 600;
  color: #4b5563;
  background-color: #f9fafb;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background-color: #f9fafb;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  background-color: transparent;
  color: #4b5563;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-only:hover {
  background-color: #f3f4f6;
}

.text-danger {
  color: #dc2626;
}

.text-danger:hover {
  background-color: #fee2e2;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-active {
  background-color: #dcfce7;
  color: #166534;
}
</style>