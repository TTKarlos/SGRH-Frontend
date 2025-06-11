<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title">
          <component :is="getIconForInforme()" size="20" class="modal-icon" />
          <h3>{{ informe.nombre }}</h3>
        </div>
        <button @click="$emit('close')" class="btn-close" aria-label="Cerrar">
          <X size="18" />
        </button>
      </div>

      <div class="modal-body">
        <p class="modal-description">{{ informe.descripcion }}</p>

        <!-- Selector para departamentos, centros, zonas, empresas -->
        <div v-if="requiereSelector" class="form-group">
          <label class="form-label">{{ getSelectorLabel() }}</label>
          <div class="select-wrapper">
            <select v-model="parametros.id" class="form-select" required>
              <option value="" disabled>Seleccionar {{ getSelectorLabel().toLowerCase() }}</option>
              <option
                  v-for="opcion in opciones"
                  :key="opcion.id"
                  :value="opcion.id"
              >
                {{ opcion.nombre }}
                <span v-if="opcion.total_empleados !== undefined">
                  ({{ opcion.total_empleados }} empleados)
                </span>
              </option>
            </select>
            <ChevronDown size="16" class="select-icon" />
          </div>
        </div>

        <!-- Selector de fechas para cumpleaños -->
        <div v-if="esCumpleanos" class="form-group">
          <label class="form-label">Rango de fechas</label>
          <div class="fecha-group">
            <div class="fecha-field">
              <div class="input-wrapper">
                <Calendar size="16" class="input-icon" />
                <input
                    v-model="parametros.fechaInicio"
                    type="date"
                    class="form-input"
                    required
                />
              </div>
              <span class="input-label">Fecha inicio</span>
            </div>
            <div class="fecha-field">
              <div class="input-wrapper">
                <Calendar size="16" class="input-icon" />
                <input
                    v-model="parametros.fechaFin"
                    type="date"
                    class="form-input"
                    required
                />
              </div>
              <span class="input-label">Fecha fin</span>
            </div>
          </div>
          <p class="form-help">
            <InfoIcon size="14" class="help-icon" />
            Selecciona el rango de fechas para buscar empleados que cumplan años
          </p>
        </div>

        <!-- Información adicional -->
        <div v-if="opcionSeleccionada" class="info-seleccion">
          <div class="info-card">
            <component :is="getIconForSeleccion()" size="20" class="info-icon" />

            <div class="info-content">
              <h4>{{ opcionSeleccionada.nombre }}</h4>
              <p v-if="opcionSeleccionada.descripcion">{{ opcionSeleccionada.descripcion }}</p>
              <div class="info-stats">
                <span v-if="opcionSeleccionada.total_empleados !== undefined" class="info-stat">
                  <Users size="14" />
                  {{ opcionSeleccionada.total_empleados }} empleados
                </span>
                <span v-if="opcionSeleccionada.total_centros !== undefined" class="info-stat">
                  <Building2 size="14" />
                  {{ opcionSeleccionada.total_centros }} centros
                </span>
                <span v-if="opcionSeleccionada.total_contratos !== undefined" class="info-stat">
                  <FileText size="14" />
                  {{ opcionSeleccionada.total_contratos }} contratos
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista previa del informe -->
        <div class="preview-section">
          <h4 class="preview-title">
            <Eye size="16" />
            Vista previa
          </h4>
          <div class="preview-container">
            <div class="preview-placeholder">
              <FileText size="48" />
              <p>Vista previa del informe</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancelar
        </button>
        <button
            @click="handleGenerar"
            class="btn btn-primary"
            :disabled="!isFormValid || loading"
        >
          <Loader v-if="loading" size="16" class="btn-icon animate-spin" />
          <Download v-else size="16" class="btn-icon" />
          Generar PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  X, Download, Loader, Calendar, InfoIcon, Eye,
  Users, Building2, MapPin, Briefcase, FileText, ChevronDown
} from 'lucide-vue-next'

export default {
  name: 'InformesParametrosModal',

  components: {
    X,
    Download,
    Loader,
    Calendar,
    InfoIcon,
    Eye,
    Users,
    Building2,
    MapPin,
    Briefcase,
    FileText,
    ChevronDown
  },

  props: {
    informe: {
      type: Object,
      required: true
    },
    opciones: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      parametros: {
        id: '',
        fechaInicio: '',
        fechaFin: ''
      }
    }
  },

  computed: {
    requiereSelector() {
      return ['departamento-especifico', 'centro-especifico', 'zona-especifica', 'empresa-especifica']
          .includes(this.informe.id);
    },

    esCumpleanos() {
      return this.informe.id === 'cumpleanos-rango';
    },

    opcionSeleccionada() {
      if (!this.parametros.id || !this.opciones.length) return null;
      return this.opciones.find(opcion => opcion.id == this.parametros.id);
    },

    isFormValid() {
      if (this.requiereSelector) {
        return this.parametros.id !== '';
      }

      if (this.esCumpleanos) {
        return this.parametros.fechaInicio !== '' && this.parametros.fechaFin !== '';
      }

      return true;
    }
  },

  created() {
    if (this.esCumpleanos) {
      const now = new Date();
      const year = now.getFullYear();
      this.parametros.fechaInicio = `${year}-01-01`;
      this.parametros.fechaFin = `${year}-12-31`;
    }
  },

  methods: {
    getSelectorLabel() {
      const labels = {
        'departamento-especifico': 'Departamento',
        'centro-especifico': 'Centro',
        'zona-especifica': 'Zona',
        'empresa-especifica': 'Empresa'
      };
      return labels[this.informe.id] || 'Opción';
    },

    getIconForInforme() {
      const iconMap = {
        'departamento-especifico': Building2,
        'centro-especifico': MapPin,
        'zona-especifica': MapPin,
        'empresa-especifica': Briefcase,
        'cumpleanos-rango': Calendar
      };

      return iconMap[this.informe.id] || FileText;
    },

    getIconForSeleccion() {
      if (this.informe.id.includes('departamento')) return Building2;
      if (this.informe.id.includes('centro')) return MapPin;
      if (this.informe.id.includes('zona')) return MapPin;
      if (this.informe.id.includes('empresa')) return Briefcase;
      return FileText;
    },

    handleGenerar() {
      if (!this.isFormValid) return;

      const params = {};

      if (this.requiereSelector) {
        params.id = this.parametros.id;
      }

      if (this.esCumpleanos) {
        params.fechaInicio = this.parametros.fechaInicio;
        params.fechaFin = this.parametros.fechaFin;
      }

      this.$emit('generar', params);
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background-color: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  color: #dc2626;
}

.modal-title h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  border-radius: 9999px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.modal-body {
  padding: 1.5rem;
}

.modal-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.form-select {
  width: 100%;
  padding: 0.75rem 2rem 0.75rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  background-color: white;
  appearance: none;
  transition: all 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.fecha-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.fecha-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.input-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.form-help {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.75rem;
  margin-bottom: 0;
}

.help-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.info-seleccion {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-card {
  display: flex;
  gap: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.info-icon {
  color: #dc2626;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.info-content p {
  color: #6b7280;
  font-size: 0.75rem;
  margin: 0 0 0.5rem 0;
}

.info-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.info-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.preview-section {
  margin-top: 1.5rem;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.preview-container {
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #9ca3af;
}

.preview-placeholder p {
  margin: 0;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-icon {
  flex-shrink: 0;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .modal-container {
    margin: 1rem;
    max-width: calc(100% - 2rem);
    max-height: calc(100vh - 2rem);
  }

  .fecha-group {
    grid-template-columns: 1fr;
  }
}
</style>
