<template>
  <div class="modal-backdrop" @click.self="cerrarModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Editar documento</h3>
        <button class="btn-close" @click="cerrarModal">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="nombre">Nombre del documento *</label>
            <input
                type="text"
                id="nombre"
                v-model="formData.nombre"
                class="form-control"
                :class="{ 'is-invalid': erroresValidacion.nombre }"
                placeholder="Nombre del documento"
            />
            <div v-if="erroresValidacion.nombre" class="invalid-feedback">
              {{ erroresValidacion.nombre }}
            </div>
          </div>

          <div class="form-group">
            <label for="observaciones">Observaciones</label>
            <textarea
                id="observaciones"
                v-model="formData.observaciones"
                class="form-control"
                placeholder="Observaciones (opcional)"
                rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Archivo actual</label>
            <div class="current-file">
              <FileText size="20" class="file-icon" />
              <span class="file-name">{{ documento.nombre_original }}</span>
              <button
                  type="button"
                  class="btn-preview"
                  @click="previsualizarDocumento"
              >
                <Eye size="16" /> Ver
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Reemplazar archivo (opcional)</label>
            <div
                class="file-drop-area"
                :class="{
                'is-dragover': isDragOver,
                'has-file': !!archivoSeleccionado,
                'is-invalid': erroresValidacion.archivo
              }"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop"
            >
              <div v-if="!archivoSeleccionado" class="file-message">
                <Upload size="24" />
                <p>Arrastra un archivo aquí o haz clic para seleccionarlo</p>
                <span class="file-formats">
                  Formatos permitidos: PDF, DOC, DOCX, JPG, PNG
                </span>
              </div>

              <div v-else class="file-preview">
                <div class="file-info">
                  <FileText size="24" class="file-icon" />
                  <div class="file-details">
                    <span class="file-name">{{ archivoSeleccionado.name }}</span>
                    <span class="file-size">
                      {{ formatFileSize(archivoSeleccionado.size) }}
                    </span>
                  </div>
                </div>
                <button
                    type="button"
                    class="btn-remove-file"
                    @click="eliminarArchivo"
                >
                  <X size="16" />
                </button>
              </div>

              <input
                  type="file"
                  ref="fileInput"
                  class="file-input"
                  @change="handleFileSelect"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            <div v-if="erroresValidacion.archivo" class="invalid-feedback">
              {{ erroresValidacion.archivo }}
            </div>
          </div>

          <div class="form-actions">
            <button
                type="button"
                class="btn btn-secondary"
                @click="cerrarModal"
                :disabled="guardando"
            >
              Cancelar
            </button>
            <button
                type="submit"
                class="btn btn-primary"
                :disabled="guardando"
            >
              <Loader2 v-if="guardando" size="16" class="spinner" />
              <span v-else>Guardar cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { X, FileText, Upload, Eye, Loader2 } from 'lucide-vue-next'

export default {
  name: 'DocumentoModalEdicion',

  components: {
    X,
    FileText,
    Upload,
    Eye,
    Loader2
  },

  props: {
    documento: {
      type: Object,
      required: true
    },
    erroresValidacion: {
      type: Object,
      default: () => ({})
    },
    guardando: {
      type: Boolean,
      default: false
    }
  },

  emits: ['cerrar', 'guardar', 'guardar-con-archivo'],

  setup(props, { emit }) {
    const formData = reactive({
      id_documento: null,
      nombre: '',
      observaciones: '',
      id_empleado: null
    })

    const fileInput = ref(null)
    const archivoSeleccionado = ref(null)
    const isDragOver = ref(false)

    const inicializarFormulario = () => {
      formData.id_documento = props.documento.id_documento
      formData.nombre = props.documento.nombre || ''
      formData.observaciones = props.documento.observaciones || ''
      formData.id_empleado = props.documento.id_empleado || null

      console.log("Formulario inicializado con ID de empleado:", formData.id_empleado)
    }

    const handleSubmit = () => {
      if (archivoSeleccionado.value) {
        const formDataObj = new FormData()
        formDataObj.append('archivo', archivoSeleccionado.value)
        formDataObj.append('nombre', formData.nombre)
        formDataObj.append('observaciones', formData.observaciones || '')

        if (formData.id_empleado) {
          formDataObj.append('id_empleado', String(formData.id_empleado))
        }

        console.log("Enviando FormData para actualización con archivo:");
        for (let [key, value] of formDataObj.entries()) {
          console.log(`- ${key}:`, key === 'archivo' ? `Archivo: ${value.name} (${value.size} bytes)` : value);
        }

        emit('guardar-con-archivo', formDataObj, formData.id_documento)
      } else {
        console.log("Enviando datos para actualización sin archivo:", formData);
        emit('guardar', { ...formData })
      }
    }

    const handleFileSelect = (event) => {
      const files = event.target.files
      if (files.length > 0) {
        archivoSeleccionado.value = files[0]
      }
    }

    const handleDragOver = () => {
      isDragOver.value = true
    }

    const handleDragLeave = () => {
      isDragOver.value = false
    }

    const handleDrop = (event) => {
      isDragOver.value = false
      const files = event.dataTransfer.files
      if (files.length > 0) {
        archivoSeleccionado.value = files[0]
      }
    }

    const eliminarArchivo = () => {
      archivoSeleccionado.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    const previsualizarDocumento = () => {
      console.log("Solicitando previsualización del documento:", props.documento.id_documento);
    }

    const cerrarModal = () => {
      emit('cerrar')
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    onMounted(() => {
      inicializarFormulario()
    })

    watch(() => props.documento, () => {
      inicializarFormulario()
    }, { deep: true })

    return {
      formData,
      fileInput,
      archivoSeleccionado,
      isDragOver,
      handleSubmit,
      handleFileSelect,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      eliminarArchivo,
      previsualizarDocumento,
      cerrarModal,
      formatFileSize
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
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.modal-body {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out;
}

.form-control:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
}

.form-control.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.current-file {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.file-icon {
  color: #dc2626;
  margin-right: 0.5rem;
}

.file-name {
  flex: 1;
  font-size: 0.875rem;
  color: #4b5563;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-preview {
  display: flex;
  align-items: center;
  background-color: transparent;
  border: none;
  color: #4b5563;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.btn-preview:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.btn-preview svg {
  margin-right: 0.25rem;
}

.file-drop-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.375rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.file-drop-area:hover {
  border-color: #9ca3af;
}

.file-drop-area.is-dragover {
  border-color: #dc2626;
  background-color: rgba(220, 38, 38, 0.05);
}

.file-drop-area.has-file {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.05);
}

.file-drop-area.is-invalid {
  border-color: #dc2626;
}

.file-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6b7280;
}

.file-message svg {
  margin-bottom: 0.5rem;
}

.file-message p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
}

.file-formats {
  font-size: 0.75rem;
  color: #9ca3af;
}

.file-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  display: flex;
  align-items: center;
}

.file-details {
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
  text-align: left;
}

.file-details .file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.125rem;
}

.file-details .file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.btn-remove-file {
  background-color: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
}

.btn-remove-file:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
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
</style>