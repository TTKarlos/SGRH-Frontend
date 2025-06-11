<template>
  <div class="modal-overlay" @click.self="$emit('cerrar')">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Detalles del Documento</h3>
        <button @click="$emit('cerrar')" class="btn-close">
          <X size="18" />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="documento" class="detail-content">
          <!-- Información básica -->
          <div class="detail-section">
            <h4 class="detail-section-title">Información General</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <h5 class="detail-label">Nombre del Documento</h5>
                <p class="detail-value">{{ documento.nombre || 'Sin nombre' }}</p>
              </div>
              <div class="detail-item">
                <h5 class="detail-label">Tipo de Documento</h5>
                <p class="detail-value">{{ documento.tipo_documento || 'Sin especificar' }}</p>
              </div>
              <div class="detail-item">
                <h5 class="detail-label">Archivo Original</h5>
                <p class="detail-value">{{ documento.nombre_original || 'Sin archivo' }}</p>
              </div>
              <div class="detail-item">
                <h5 class="detail-label">Tamaño</h5>
                <p class="detail-value">{{ formatFileSize(documento.tamano) }}</p>
              </div>
            </div>
          </div>

          <!-- Información técnica -->
          <div class="detail-section">
            <h4 class="detail-section-title">Información Técnica</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <h5 class="detail-label">ID Documento</h5>
                <p class="detail-value">{{ documento.id_documento }}</p>
              </div>
              <div class="detail-item">
                <h5 class="detail-label">Tipo MIME</h5>
                <p class="detail-value">{{ documento.mimetype || 'Desconocido' }}</p>
              </div>
              <div class="detail-item">
                <h5 class="detail-label">Fecha de Subida</h5>
                <p class="detail-value">{{ formatDate(documento.fecha_subida) }}</p>
              </div>
              <div class="detail-item">
                <h5 class="detail-label">Ruta del Archivo</h5>
                <p class="detail-value file-path">{{ documento.ruta_archivo || 'Sin ruta' }}</p>
              </div>
            </div>
          </div>

          <!-- Observaciones -->
          <div v-if="documento.observaciones" class="detail-section">
            <h4 class="detail-section-title">Observaciones</h4>
            <p class="detail-text">{{ documento.observaciones }}</p>
          </div>

          <!-- Vista previa del archivo -->
          <div v-if="documento.ruta_archivo" class="detail-section">
            <h4 class="detail-section-title">Archivo</h4>
            <div class="document-preview">
              <div class="document-icon-container">
                <FileText size="32" class="document-icon" />
              </div>
              <div class="document-info">
                <p class="document-name">{{ documento.nombre_original }}</p>
                <p class="document-type">{{ getFileExtension(documento.nombre_original) }}</p>
              </div>
              <div class="document-actions">
                <button @click="$emit('descargar', documento)" class="btn btn-primary">
                  <Download size="16" class="btn-icon" />
                  Descargar
                </button>
                <button @click="$emit('previsualizar', documento)" class="btn btn-secondary">
                  <Eye size="16" class="btn-icon" />
                  Previsualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('editar', documento)" class="btn btn-primary">
          <Edit size="16" class="btn-icon" />
          Editar
        </button>
        <button @click="$emit('cerrar')" class="btn btn-secondary">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { X, FileText, Download, Eye, Edit } from 'lucide-vue-next'

export default {
  name: 'ModalDetallesDocumento',

  components: {
    X,
    FileText,
    Download,
    Eye,
    Edit
  },

  props: {
    documento: {
      type: Object,
      required: true
    }
  },

  emits: ['cerrar', 'descargar', 'previsualizar', 'editar'],

  methods: {
    formatFileSize(bytes) {
      if (!bytes) return 'Desconocido'

      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }

      return `${size.toFixed(2)} ${units[unitIndex]}`
    },

    formatDate(dateString) {
      if (!dateString) return 'Sin fecha'

      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'Fecha inválida'
      }
    },

    getFileExtension(filename) {
      if (!filename) return 'Sin extensión'
      const extension = filename.split('.').pop()
      return extension ? extension.toUpperCase() : 'Sin extensión'
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.modal-body {
  padding: 1.5rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-top: 0;
  margin-bottom: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
  word-break: break-word;
}

.file-path {
  font-family: monospace;
  font-size: 0.75rem;
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
}

.detail-text {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
  white-space: pre-line;
  margin: 0;
}

.document-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.document-icon-container {
  flex-shrink: 0;
}

.document-icon {
  color: #6b7280;
}

.document-info {
  flex-grow: 1;
  min-width: 0;
}

.document-name {
  font-weight: 500;
  color: #111827;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-type {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
  text-transform: uppercase;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
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
  font-size: 0.875rem;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .document-preview {
    flex-direction: column;
    align-items: flex-start;
  }

  .document-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
