<template>
  <div class="modal-backdrop" @click.self="cerrarModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ documento.nombre }}</h3>
        <button class="btn-close" @click="cerrarModal">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Estado de carga -->
        <div v-if="cargando" class="preview-loading">
          <LoadingSpinner message="Cargando documento..." />
        </div>

        <!-- Estado de error -->
        <div v-else-if="error" class="preview-error">
          <div class="error-message">
            <AlertTriangle size="24" />
            <p>{{ error }}</p>
          </div>
        </div>

        <!-- Previsualización -->
        <div v-else-if="url" class="preview-container">
          <!-- Previsualización de PDF -->
          <iframe
              v-if="isPdf"
              :src="url"
              class="pdf-preview"
              frameborder="0"
              title="Vista previa del documento"
          ></iframe>

          <!-- Previsualización de imagen -->
          <img
              v-else-if="isImage"
              :src="url"
              class="image-preview"
              alt="Vista previa del documento"
          />

          <!-- Mensaje para otros tipos de archivo -->
          <div v-else class="unsupported-preview">
            <FileText size="48" class="file-icon" />
            <p>
              Este tipo de archivo no se puede previsualizar directamente.
              <br />
              Puede descargar el archivo para verlo.
            </p>
          </div>
        </div>

        <!-- Sin URL -->
        <div v-else class="preview-error">
          <div class="error-message">
            <AlertTriangle size="24" />
            <p>No se pudo generar la vista previa del documento.</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="documento-info">
          <div class="info-item">
            <span class="info-label">Tipo:</span>
            <span class="info-value">{{ documento.tipo_documento }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Subido:</span>
            <span class="info-value">{{ formatDate(documento.fecha_subida) }}</span>
          </div>
          <div v-if="documento.observaciones" class="info-item">
            <span class="info-label">Observaciones:</span>
            <span class="info-value">{{ documento.observaciones }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button
              class="btn btn-secondary"
              @click="cerrarModal"
          >
            Cerrar
          </button>
          <button
              class="btn btn-primary"
              @click="descargar"
          >
            <Download size="16" class="btn-icon" />
            Descargar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { X, AlertTriangle, FileText, Download } from 'lucide-vue-next'
import LoadingSpinner from "@/components/common/LoadingSpinner.vue"

export default {
  name: 'DocumentoModalPrevistaEmpleados',

  components: {
    X,
    AlertTriangle,
    FileText,
    Download,
    LoadingSpinner
  },

  props: {
    documento: {
      type: Object,
      required: true
    },
    url: {
      type: String,
      default: null
    },
    cargando: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },

  emits: ['cerrar', 'descargar'],

  setup(props, { emit }) {
    const isPdf = computed(() => {
      if (!props.url) return false

      const fileName = props.documento.nombre_original?.toLowerCase() || ''
      const mimeType = props.documento.mimetype?.toLowerCase() || ''

      return fileName.endsWith('.pdf') ||
          mimeType.includes('application/pdf') ||
          props.url.includes('application/pdf')
    })

    const isImage = computed(() => {
      if (!props.url) return false

      const fileName = props.documento.nombre_original?.toLowerCase() || ''
      const mimeType = props.documento.mimetype?.toLowerCase() || ''

      return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName) ||
          mimeType.includes('image/') ||
          props.url.includes('image/')
    })

    const formatDate = (dateString) => {
      if (!dateString) return '-'

      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const cerrarModal = () => {
      emit('cerrar')
    }

    const descargar = () => {
      emit('descargar', props.documento)
    }

    return {
      isPdf,
      isImage,
      formatDate,
      cerrarModal,
      descargar
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
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
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 800px;
  height: 90vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-close {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.preview-loading,
.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-message svg {
  color: #dc2626;
  margin-bottom: 1rem;
}

.preview-container {
  height: 100%;
  overflow: hidden;
}

.pdf-preview,
.image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.unsupported-preview .file-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.unsupported-preview p {
  color: #4b5563;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.documento-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  overflow: hidden;
}

.info-item {
  display: flex;
  font-size: 0.875rem;
}

.info-label {
  font-weight: 600;
  color: #4b5563;
  margin-right: 0.5rem;
  white-space: nowrap;
}

.info-value {
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-icon {
  margin-right: 0.5rem;
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

.btn-primary:hover {
  background-color: #b91c1c;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 768px) {
  .modal-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .modal-actions {
    justify-content: flex-end;
  }
}
</style>