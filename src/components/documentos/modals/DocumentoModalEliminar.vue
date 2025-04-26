<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Confirmar eliminación</h3>
        <button @click="$emit('cerrar')" class="btn-close">
          <X size="18" />
        </button>
      </div>
      <div class="modal-body">
        <div class="warning-icon">
          <AlertTriangle size="48" />
        </div>
        <h4>¿Está seguro de que desea eliminar este documento?</h4>
        <p>Esta acción no se puede deshacer.</p>

        <div class="documento-info">
          <div class="documento-preview">
            <component :is="getFileIcon(documento.nombre_original)" size="24" class="documento-icon" />
            <div class="documento-detalles">
              <span class="documento-nombre">{{ documento.nombre }}</span>
              <span class="documento-tipo">{{ documento.tipo_documento }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('cerrar')" class="btn btn-secondary">
          Cancelar
        </button>
        <button @click="$emit('eliminar')" class="btn btn-danger" :disabled="eliminando">
          <Trash2 v-if="!eliminando" size="18" class="btn-icon" />
          <Loader v-else size="18" class="btn-icon animate-spin" />
          Eliminar documento
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { X, AlertTriangle, Trash2, Loader, FileText, FileImage, FileSpreadsheet, File } from 'lucide-vue-next'

export default {
  name: 'DocumentoModalEliminar',

  components: {
    X,
    AlertTriangle,
    Trash2,
    Loader,
    FileText,
    FileImage,
    FileSpreadsheet,
    File
  },

  props: {
    documento: {
      type: Object,
      required: true
    },
    eliminando: {
      type: Boolean,
      default: false
    }
  },

  emits: ['cerrar', 'eliminar'],

  setup() {
    const getFileIcon = (fileName) => {
      if (!fileName) return File

      fileName = fileName.toLowerCase()

      if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
        return FileImage
      }

      if (/\.(pdf|doc|docx|txt|rtf)$/i.test(fileName)) {
        return FileText
      }

      if (/\.(xls|xlsx|csv)$/i.test(fileName)) {
        return FileSpreadsheet
      }

      return File
    }

    return {
      getFileIcon
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
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 28rem;
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
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.warning-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.warning-icon svg {
  color: #dc2626;
}

.modal-body h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.modal-body p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.documento-info {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.documento-preview {
  display: flex;
  align-items: center;
}

.documento-icon {
  color: #dc2626;
  margin-right: 0.75rem;
}

.documento-detalles {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.documento-nombre {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.documento-tipo {
  font-size: 0.75rem;
  color: #6b7280;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
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

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  margin-right: 0.5rem;
}

.btn-danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-danger:hover:not(:disabled) {
  background-color: #fecaca;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
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
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>