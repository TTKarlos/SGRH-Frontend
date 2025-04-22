<template>
  <div class="modal-backdrop">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">Vista previa del documento</h3>
        <button @click="$emit('cerrar')" class="modal-close">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Estado de carga -->
        <div v-if="cargando" class="preview-loading">
          <Loader size="32" class="animate-spin" />
          <p>Cargando vista previa...</p>
        </div>

        <!-- Estado de error -->
        <div v-else-if="error" class="preview-error">
          <AlertTriangle size="32" />
          <p>{{ error }}</p>
        </div>

        <!-- Vista previa del documento -->
        <div v-else-if="urlPreview" class="preview-content">
          <!-- Vista previa para PDF -->
          <iframe
              v-if="esVisualizablePDF"
              :src="urlPreview"
              class="pdf-preview"
              frameborder="0"
              title="Vista previa del documento"
          ></iframe>

          <!-- Vista previa para imágenes -->
          <img
              v-else-if="esVisualizableImagen"
              :src="urlPreview"
              class="image-preview"
              alt="Vista previa del documento"
          />

          <!-- Mensaje para otros tipos de archivo -->
          <div v-else class="unsupported-preview">
            <FileText size="48" />
            <p>Este tipo de documento no se puede previsualizar.</p>
            <p>Puede descargar el documento para verlo.</p>
          </div>
        </div>

        <!-- Sin URL de vista previa -->
        <div v-else class="preview-error">
          <AlertTriangle size="32" />
          <p>No se pudo generar la vista previa del documento.</p>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('cerrar')" class="btn btn-secondary">
          Cerrar
        </button>
        <button
            v-if="documento"
            @click="$emit('descargar', documento)"
            class="btn btn-primary"
        >
          <Download size="16" class="btn-icon" />
          Descargar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { X, Loader, AlertTriangle, FileText, Download } from 'lucide-vue-next';

export default {
  name: 'DocumentoModalPrevista',

  components: {
    X,
    Loader,
    AlertTriangle,
    FileText,
    Download
  },

  props: {
    documento: {
      type: Object,
      required: true
    },
    urlPreview: {
      type: String,
      default: ''
    },
    esVisualizablePDF: {
      type: Boolean,
      default: false
    },
    esVisualizableImagen: {
      type: Boolean,
      default: false
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

  data() {
    return {
    };
  },

  computed: {
  },

  methods: {
  }
};
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
  z-index: 50;
  backdrop-filter: blur(2px);
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 800px;
  height: 80vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.preview-loading,
.preview-error,
.unsupported-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  gap: 1rem;
  color: #6b7280;
}

.preview-loading svg {
  color: #dc2626;
}

.preview-error svg {
  color: #dc2626;
}

.unsupported-preview svg {
  color: #6b7280;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pdf-preview,
.image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
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

.btn-primary {
  background-color: #dc2626;
  color: white;
}

.btn-primary:hover {
  background-color: #b91c1c;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-icon {
  margin-right: 0.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>