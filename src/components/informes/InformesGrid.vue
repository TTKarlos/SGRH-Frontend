<template>
  <div class="informes-grid">
    <div v-for="categoria in informes" :key="categoria.categoria" class="categoria-section">
      <div class="categoria-header">
        <div class="categoria-title-container">
          <h2 class="categoria-title">{{ categoria.categoria }}</h2>
          <div class="categoria-badge">{{ categoria.informes.length }}</div>
        </div>
        <div class="categoria-description">
          {{ getCategoriaDescription(categoria.categoria) }}
        </div>
      </div>

      <div class="informes-cards">
        <div
            v-for="informe in categoria.informes"
            :key="informe.id"
            class="informe-card"
            :class="{ 'generating': generando && informeGenerando === informe.id }"
        >
          <div class="card-icon-wrapper">
            <component :is="getIconForInforme(informe.id)" size="24" class="card-icon" />
          </div>

          <div class="card-content">
            <h3 class="card-title">{{ informe.nombre }}</h3>
            <p class="card-description">{{ informe.descripcion }}</p>

            <div v-if="informe.parametros && informe.parametros.length > 0" class="card-metadata">
              <div class="metadata-label">
                <Settings size="14" />
                <span>Parámetros requeridos</span>
              </div>
              <div class="metadata-tags">
                <span v-for="(param, index) in informe.parametros" :key="index" class="metadata-tag">
                  {{ param }}
                </span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button
                @click="$emit('generar-informe', informe)"
                class="btn-generar"
                :disabled="generando"
                :title="generando ? 'Generando informe...' : 'Generar informe PDF'"
            >
              <Loader v-if="generando && informeGenerando === informe.id" size="16" class="btn-icon animate-spin" />
              <Download v-else size="16" class="btn-icon" />
              <span>{{ generando && informeGenerando === informe.id ? 'Generando...' : 'Generar PDF' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Download, Loader, Users, Building2, MapPin,
  Briefcase, Calendar, Phone, BarChart3, FileText, Settings
} from 'lucide-vue-next'

export default {
  name: 'InformesGrid',

  components: {
    Download,
    Loader,
    Users,
    Building2,
    MapPin,
    Briefcase,
    Calendar,
    Phone,
    BarChart3,
    FileText,
    Settings
  },

  props: {
    informes: {
      type: Array,
      default: () => []
    },
    generando: {
      type: Boolean,
      default: false
    }
  },

  emits: ['generar-informe'],

  data() {
    return {
      informeGenerando: null
    }
  },

  methods: {
    getIconForInforme(informeId) {
      const iconMap = {
        'empleados-activos': 'Users',
        'empleados-inactivos': 'Users',
        'departamento-general': 'Building2',
        'departamento-especifico': 'Building2',
        'centro-general': 'MapPin',
        'centro-especifico': 'MapPin',
        'zona-general': 'MapPin',
        'zona-especifica': 'MapPin',
        'empresa-general': 'Briefcase',
        'empresa-especifica': 'Briefcase',
        'cumpleanos-rango': 'Calendar',
        'directorio-contactos': 'Phone',
        'dashboard-ejecutivo': 'BarChart3',
        'empleados-todos': 'Users'
      }

      return iconMap[informeId] || 'FileText'
    },

    getCategoriaDescription(categoria) {
      const descriptions = {
        'Empleados': 'Informes relacionados con datos de empleados y su estado',
        'Departamentos': 'Informes de empleados agrupados por departamentos',
        'Centros': 'Informes de empleados agrupados por centros de trabajo',
        'Zonas': 'Informes de empleados agrupados por zonas geográficas',
        'Empresas': 'Informes de empleados agrupados por empresas',
        'Especiales': 'Informes especializados con información específica',
        'Dashboard': 'Informes ejecutivos y resúmenes gerenciales'
      }

      return descriptions[categoria] || 'Informes disponibles en esta categoría'
    }
  },

  watch: {
    generando(newVal) {
      if (!newVal) {
        this.informeGenerando = null
      }
    }
  }
}
</script>

<style scoped>
.informes-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
}

.categoria-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.categoria-header {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.categoria-title-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.categoria-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.categoria-badge {
  background-color: #dc2626;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  min-width: 1.5rem;
  text-align: center;
}

.categoria-description {
  color: #6b7280;
  font-size: 0.875rem;
}

.informes-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.informe-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.informe-card:hover {
  border-color: #dc2626;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.informe-card.generating {
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
}

.card-icon-wrapper {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background-color: #fee2e2;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon {
  color: #dc2626;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
  padding-right: 3rem;
}

.card-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.card-metadata {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e5e7eb;
}

.metadata-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.metadata-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.metadata-tag {
  background-color: #f3f4f6;
  color: #4b5563;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.card-actions {
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.btn-generar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-generar:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-generar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  flex-shrink: 0;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .informes-grid {
    padding: 1rem;
  }

  .informes-cards {
    grid-template-columns: 1fr;
  }
}
</style>
