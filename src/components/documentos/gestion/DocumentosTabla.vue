<template>
  <div class="table-responsive">
    <table class="table">
      <thead>
      <tr>
        <th>Documento</th>
        <th>Tipo</th>
        <th>Empleado</th>
        <th>Fecha</th>
        <th>Tamaño</th>
        <th>Acciones</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="documento in documentos" :key="documento.id_documento" class="documento-row">
        <td>
          <div class="documento-cell">
            <div class="documento-icon">
              <component :is="getIconByType(documento.tipo_documento)" size="20" />
            </div>
            <span class="documento-nombre">{{ documento.nombre_original || documento.nombre }}</span>
          </div>
        </td>
        <td>
          <span class="badge badge-tipo">{{ documento.tipo_documento }}</span>
        </td>
        <td>
          <router-link
              :to="`/empleados/${documento.id_empleado}`"
              class="empleado-link"
              v-if="documento.Empleado"
          >
            {{ documento.Empleado.nombre }} {{ documento.Empleado.apellidos }}
          </router-link>
          <span v-else class="text-muted">Empleado no disponible</span>
        </td>
        <td>{{ formatDate(documento.fecha_subida) }}</td>
        <td>{{ formatFileSize(documento.tamano) }}</td>
        <td>
          <div class="acciones-cell">
            <button @click="$emit('preview', documento)" class="btn-icon-only" title="Ver documento">
              <Eye size="18" />
            </button>
            <button @click="$emit('download', documento)" class="btn-icon-only" title="Descargar">
              <Download size="18" />
            </button>
            <button
                v-if="canDelete"
                @click="$emit('delete', documento)"
                class="btn-icon-only btn-danger"
                title="Eliminar"
            >
              <Trash2 size="18" />
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {
  FileText, FileCheck, FileSpreadsheet, FileImage, File, Shield,
  Eye, Download, Trash2
} from 'lucide-vue-next';

export default {
  name: 'DocumentosTabla',

  components: {
    FileText,
    FileCheck,
    FileSpreadsheet,
    FileImage,
    File,
    Shield,
    Eye,
    Download,
    Trash2
  },

  props: {
    documentos: {
      type: Array,
      required: true
    },
    canDelete: {
      type: Boolean,
      default: false
    }
  },

  emits: ['preview', 'download', 'delete'],

  methods: {
    formatDate(dateString) {
      if (!dateString) return 'Fecha desconocida';

      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    formatFileSize(bytes) {
      if (!bytes) return 'Desconocido';
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    getIconByType(tipo) {
      if (!tipo) return File;

      const tipoLower = tipo.toLowerCase();

      if (tipoLower.includes('contrato')) return FileText;
      if (tipoLower.includes('cv') || tipoLower.includes('curriculum')) return FileText;
      if (tipoLower.includes('dni') || tipoLower.includes('nie')) return FileText;
      if (tipoLower.includes('nomina')) return FileSpreadsheet;
      if (tipoLower.includes('seguridad')) return Shield;
      if (tipoLower.includes('titulacion')) return FileCheck;
      if (tipoLower.includes('pdf')) return FileText;
      if (tipoLower.includes('word')) return FileText;
      if (tipoLower.includes('excel')) return FileSpreadsheet;
      if (tipoLower.includes('imagen')) return FileImage;

      return File;
    }
  }
};
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.table th {
  font-weight: 600;
  color: #374151;
  background-color: #f9fafb;
}

.documento-row {
  transition: background-color 0.2s ease;
}

.documento-row:hover {
  background-color: #fef2f2;
}

.documento-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.documento-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.375rem;
  background-color: #fef2f2;
  color: #dc2626;
}

.documento-nombre {
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-tipo {
  background-color: #fef2f2;
  color: #dc2626;
}

.empleado-link {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.empleado-link:hover {
  color: #dc2626;
  text-decoration: underline;
}

.text-muted {
  color: #9ca3af;
  font-style: italic;
}

.acciones-cell {
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
  color: #dc2626;
}

.btn-icon-only.btn-danger:hover {
  background-color: #fee2e2;
  color: #dc2626;
}
</style>