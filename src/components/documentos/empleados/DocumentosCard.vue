<template>
  <div class="documento-card" :class="{ 'documento-archivado': documento.archivado }">
    <div class="documento-icon">
      <component :is="obtenerIcono(documento)" size="24" class="icon-file" />
    </div>

    <div class="documento-info">
      <div class="documento-header">
        <h3 class="documento-titulo">{{ documento.nombre }}</h3>
        <span class="documento-tipo" :class="obtenerClaseTipo(documento.tipo_documento)">
          {{ documento.tipo_documento || 'Otro' }}
        </span>
      </div>
      <p class="documento-descripcion">{{ documento.observaciones || 'Sin descripción' }}</p>
      <div class="documento-meta">
        <span class="documento-fecha">
          <Calendar size="14" class="meta-icon" />
          {{ formatearFecha(documento.fecha_subida) }}
        </span>
        <span class="documento-tamano" v-if="documento.tamano">
          <HardDrive size="14" class="meta-icon" />
          {{ formatearTamano(documento.tamano) }}
        </span>
        <span v-if="documento.archivado" class="documento-archivado-badge">
          <Archive size="14" class="meta-icon" />
          Archivado
        </span>
      </div>
    </div>

    <div class="documento-acciones">
      <button @click="$emit('previsualizar', documento)" class="btn-accion" title="Previsualizar">
        <Eye size="18" />
      </button>
      <button @click="$emit('descargar', documento)" class="btn-accion" title="Descargar">
        <Download size="18" />
      </button>
      <PermissionCheck :permiso="{ nombre: 'Documentos', tipo: 'Escritura' }">
        <button @click="$emit('editar', documento)" class="btn-accion" title="Editar">
          <Edit size="18" />
        </button>
        <button @click="$emit('eliminar', documento)" class="btn-accion btn-eliminar" title="Eliminar">
          <Trash2 size="18" />
        </button>
      </PermissionCheck>
    </div>
  </div>
</template>

<script>
import {
  FileText, FileImage, FileSpreadsheet, File,
  Calendar, HardDrive, Archive, Eye, Download, Edit, Trash2
} from 'lucide-vue-next'
import PermissionCheck from '../../common/PermissionCheck.vue'
import { formatUtils } from '../../../utils/formatUtils.js'

export default {
  name: 'DocumentoCard',

  components: {
    FileText,
    FileImage,
    FileSpreadsheet,
    File,
    Calendar,
    HardDrive,
    Archive,
    Eye,
    Download,
    Edit,
    Trash2,
    PermissionCheck
  },

  props: {
    documento: {
      type: Object,
      required: true
    }
  },

  emits: ['previsualizar', 'descargar', 'editar', 'eliminar'],

  methods: {
    formatearFecha(fechaString) {
      return formatUtils.formatearFecha(fechaString)
    },

    formatearTamano(bytes) {
      return formatUtils.formatearTamano(bytes)
    },

    obtenerIcono(documento) {
      const tipo = documento.tipo_documento?.toLowerCase() || ''
      const extension = documento.nombre_original?.split('.').pop()?.toLowerCase() || ''

      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) || tipo.includes('imagen')) {
        return FileImage
      }

      if (extension === 'pdf' || tipo.includes('contrato') || tipo.includes('cv') || tipo.includes('dni')) {
        return FileText
      }

      if (['xls', 'xlsx', 'csv'].includes(extension) || tipo.includes('nomina')) {
        return FileSpreadsheet
      }

      return File
    },

    obtenerClaseTipo(tipo) {
      if (!tipo) return 'tipo-otro'

      const tipoLower = tipo.toLowerCase()

      if (tipoLower.includes('contrato')) return 'tipo-contrato'
      if (tipoLower.includes('nomina')) return 'tipo-nomina'
      if (tipoLower.includes('cv') || tipoLower.includes('curriculum')) return 'tipo-cv'
      if (tipoLower.includes('dni') || tipoLower.includes('nie')) return 'tipo-dni-nie'
      if (tipoLower.includes('formacion') || tipoLower.includes('titulacion')) return 'tipo-formacion'

      return 'tipo-otro'
    }
  }
}
</script>

<style scoped>
.documento-card {
  display: flex;
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.documento-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
  border-color: #d1d5db;
}

.documento-archivado {
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.documento-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  background-color: #f3f4f6;
  color: #dc2626;
}

.documento-info {
  flex: 1;
  padding: 0.75rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.documento-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.documento-titulo {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.documento-tipo {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}

.tipo-contrato {
  background-color: #dbeafe;
  color: #1e40af;
}

.tipo-nomina {
  background-color: #dcfce7;
  color: #166534;
}

.tipo-cv {
  background-color: #fef3c7;
  color: #92400e;
}

.tipo-dni-nie {
  background-color: #f3e8ff;
  color: #6b21a8;
}

.tipo-formacion {
  background-color: #ffedd5;
  color: #9a3412;
}

.tipo-otro {
  background-color: #e5e7eb;
  color: #4b5563;
}

.documento-descripcion {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.documento-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.documento-fecha,
.documento-tamano {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
}

.meta-icon {
  margin-right: 0.25rem;
}

.documento-archivado-badge {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.documento-acciones {
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e5e7eb;
}

.btn-accion {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-accion:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.btn-eliminar:hover {
  color: #dc2626;
}

@media (max-width: 640px) {
  .documento-card {
    flex-direction: column;
  }

  .documento-icon {
    width: 100%;
    height: 40px;
  }

  .documento-acciones {
    flex-direction: row;
    border-left: none;
    border-top: 1px solid #e5e7eb;
    justify-content: flex-end;
  }
}
</style>