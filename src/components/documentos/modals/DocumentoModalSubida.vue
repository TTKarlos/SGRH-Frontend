<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Subir nuevo documento</h3>
        <button @click="$emit('cerrar')" class="btn-close">
          <X size="18" />
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="nombre">Nombre del documento <span class="required">*</span></label>
            <input
                id="nombre"
                v-model="formData.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': erroresValidacion.nombre }"
                placeholder="Ej: Contrato laboral 2025"
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
                rows="3"
                placeholder="Añada información adicional sobre el documento"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Archivo <span class="required">*</span></label>
            <div
                class="file-drop-area"
                :class="{
                'is-invalid': erroresValidacion.archivo,
                'has-file': archivoSeleccionado,
                'is-dragover': isDragOver
              }"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="handleFileDrop"
                @click="triggerFileInput"
            >
              <input
                  ref="fileInput"
                  type="file"
                  class="file-input"
                  @change="handleFileChange"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              />

              <div v-if="!archivoSeleccionado" class="file-message">
                <Upload size="32" class="file-icon" />
                <p>Arrastra y suelta un archivo aquí o haz clic para seleccionarlo</p>
                <p class="file-formats">Formatos permitidos: PDF, Word, Excel, imágenes</p>
              </div>

              <div v-else class="file-preview">
                <div class="file-preview-info">
                  <component :is="getFileIcon()" size="24" class="file-preview-icon" />
                  <div class="file-preview-details">
                    <span class="file-preview-name">{{ archivoSeleccionado.name }}</span>
                    <span class="file-preview-size">{{ formatFileSize(archivoSeleccionado.size) }}</span>
                  </div>
                </div>
                <button type="button" class="btn-remove-file" @click.stop="removeFile">
                  <X size="18" />
                </button>
              </div>
            </div>
            <div v-if="erroresValidacion.archivo" class="invalid-feedback d-block">
              {{ erroresValidacion.archivo }}
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button @click="$emit('cerrar')" class="btn btn-secondary">
          Cancelar
        </button>
        <button @click="handleSubmit" class="btn btn-primary" :disabled="subiendoDocumento">
          <Upload v-if="!subiendoDocumento" size="18" class="btn-icon" />
          <Loader v-else size="18" class="btn-icon animate-spin" />
          Subir documento
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { X, Upload, Loader, FileText, FileImage, FileSpreadsheet, File } from 'lucide-vue-next'

export default {
  name: 'DocumentoModalSubida',

  components: {
    X,
    Upload,
    Loader,
    FileText,
    FileImage,
    FileSpreadsheet,
    File
  },

  props: {
    idEmpleado: {
      type: [Number, String],
      required: true
    },
    erroresValidacion: {
      type: Object,
      default: () => ({})
    },
    subiendoDocumento: {
      type: Boolean,
      default: false
    }
  },

  emits: ['cerrar', 'subir', 'seleccionar-archivo', 'soltar-archivo', 'eliminar-archivo'],

  setup(props, { emit }) {
    const fileInput = ref(null)
    const isDragOver = ref(false)
    const archivoSeleccionado = ref(null)

    const formData = reactive({
      nombre: '',
      observaciones: '',
      id_empleado: props.idEmpleado
    })

    onMounted(() => {
      console.log('Modal de subida montado con ID de empleado:', props.idEmpleado)
      formData.id_empleado = props.idEmpleado
    })

    const triggerFileInput = () => {
      if (!archivoSeleccionado.value) {
        fileInput.value.click()
      }
    }

    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        archivoSeleccionado.value = file
        emit('seleccionar-archivo', file)
      }
    }

    const handleFileDrop = (event) => {
      isDragOver.value = false
      const file = event.dataTransfer.files[0]
      if (file) {
        archivoSeleccionado.value = file
        emit('soltar-archivo', file)
      }
    }

    const removeFile = () => {
      archivoSeleccionado.value = null
      fileInput.value.value = ''
      emit('eliminar-archivo')
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileIcon = () => {
      if (!archivoSeleccionado.value) return File

      const fileName = archivoSeleccionado.value.name.toLowerCase()
      const fileType = archivoSeleccionado.value.type

      if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)) {
        return FileImage
      }

      if (/\.(pdf|doc|docx|txt|rtf)$/i.test(fileName) || fileType === 'application/pdf') {
        return FileText
      }

      if (/\.(xls|xlsx|csv)$/i.test(fileName)) {
        return FileSpreadsheet
      }

      return File
    }

    const handleSubmit = () => {
      formData.id_empleado = props.idEmpleado

      console.log('Enviando formulario con ID de empleado:', formData.id_empleado)

      emit('subir', {
        ...formData,
        id_empleado: props.idEmpleado
      })
    }

    return {
      fileInput,
      isDragOver,
      archivoSeleccionado,
      formData,
      triggerFileInput,
      handleFileChange,
      handleFileDrop,
      removeFile,
      formatFileSize,
      getFileIcon,
      handleSubmit
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
  max-width: 32rem;
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
  overflow-y: auto;
  max-height: 60vh;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #dc2626;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
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
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.d-block {
  display: block;
}

.file-drop-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  cursor: pointer;
  text-align: center;
}

.file-drop-area:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.file-drop-area.is-dragover {
  background-color: #f3f4f6;
  border-color: #dc2626;
}

.file-drop-area.is-invalid {
  border-color: #dc2626;
}

.file-drop-area.has-file {
  padding: 1rem;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.file-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.file-icon {
  color: #9ca3af;
}

.file-message p {
  margin: 0;
  color: #4b5563;
}

.file-formats {
  font-size: 0.75rem;
  color: #6b7280;
}

.file-preview {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.file-preview-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-preview-icon {
  color: #dc2626;
}

.file-preview-details {
  display: flex;
  flex-direction: column;
}

.file-preview-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.file-preview-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.btn-remove-file {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.btn-remove-file:hover {
  background-color: #e5e7eb;
  color: #dc2626;
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

.btn-primary {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-primary:hover:not(:disabled) {
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