<template>
  <div class="modal-backdrop">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">Editar documento</h3>
        <button @click="$emit('cerrar')" class="modal-close">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="guardarCambios">
          <!-- Campo de nombre -->
          <div class="form-group">
            <label for="nombre" class="form-label">Nombre del documento *</label>
            <input
                type="text"
                id="nombre"
                v-model="documentoLocal.nombre"
                class="form-input"
                :class="{ 'input-error': erroresValidacion.nombre }"
                placeholder="Ej: Contrato laboral"
            />
            <p v-if="erroresValidacion.nombre" class="error-message">
              {{ erroresValidacion.nombre }}
            </p>
          </div>

          <!-- Campo de tipo de documento -->
          <div class="form-group">
            <label for="tipo_documento" class="form-label">Tipo de documento *</label>
            <select
                id="tipo_documento"
                v-model="documentoLocal.tipo_documento"
                class="form-select"
                :class="{ 'input-error': erroresValidacion.tipo }"
            >
              <option value="">Seleccione un tipo</option>
              <option value="CONTRATO">Contrato</option>
              <option value="NOMINA">Nómina</option>
              <option value="CURRICULUM">Currículum</option>
              <option value="DNI">DNI/NIE</option>
              <option value="CERTIFICADO">Certificado</option>
              <option value="OTROS">Otros</option>
            </select>
            <p v-if="erroresValidacion.tipo" class="error-message">
              {{ erroresValidacion.tipo }}
            </p>
          </div>

          <!-- Campo de observaciones -->
          <div class="form-group">
            <label for="observaciones" class="form-label">Observaciones</label>
            <textarea
                id="observaciones"
                v-model="documentoLocal.observaciones"
                class="form-textarea"
                placeholder="Añada información adicional sobre el documento"
                rows="3"
            ></textarea>
          </div>

          <!-- Información del archivo actual -->
          <div class="form-group">
            <label class="form-label">Archivo actual</label>
            <div class="file-info-box">
              <div class="file-info">
                <FileText size="24" />
                <div class="file-details">
                  <p class="file-name">{{ documentoLocal.nombre_original || 'Documento' }}</p>
                  <p class="file-size" v-if="documentoLocal.tamano">
                    {{ formatearTamano(documentoLocal.tamano) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Área para reemplazar archivo -->
          <div class="form-group">
            <label class="form-label">Reemplazar archivo (opcional)</label>
            <div
                class="file-drop-area"
                :class="{
                'dragging': arrastrandoArchivo,
                'has-file': archivoSeleccionado,
              }"
                @dragover.prevent="activarArrastre"
                @dragleave.prevent="desactivarArrastre"
                @drop.prevent="soltarArchivo"
            >
              <div v-if="!archivoSeleccionado" class="file-drop-message">
                <Upload size="24" />
                <p>Arrastra un archivo aquí o</p>
                <label for="file-input-edit" class="file-select-button">
                  selecciona un archivo
                  <input
                      type="file"
                      id="file-input-edit"
                      ref="fileInput"
                      @change="seleccionarArchivo"
                      class="hidden-file-input"
                  />
                </label>
              </div>

              <div v-else class="file-preview">
                <div class="file-info">
                  <FileText size="24" />
                  <div class="file-details">
                    <p class="file-name">{{ archivoSeleccionado.name }}</p>
                    <p class="file-size">{{ formatearTamano(archivoSeleccionado.size) }}</p>
                  </div>
                </div>
                <button type="button" @click="eliminarArchivo" class="file-remove-button">
                  <X size="16" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button @click="$emit('cerrar')" class="btn btn-secondary">Cancelar</button>
        <button
            @click="guardarCambios"
            class="btn btn-primary"
            :disabled="guardando"
        >
          <Loader v-if="guardando" size="16" class="animate-spin mr-2" />
          {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { X, Save, Loader, Upload, FileText } from "lucide-vue-next"
import { formatUtils } from "../../../utils/formatUtils"

export default {
  name: "DocumentoModalEdicion",

  components: {
    X,
    Save,
    Loader,
    Upload,
    FileText,
  },

  props: {
    documento: {
      type: Object,
      required: true,
    },
    erroresValidacion: {
      type: Object,
      default: () => ({}),
    },
    guardando: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      documentoLocal: { ...this.documento },
      archivoSeleccionado: null,
      arrastrandoArchivo: false,
    }
  },

  watch: {
    documento(newVal) {
      this.documentoLocal = { ...newVal }
    },
  },

  methods: {
    activarArrastre() {
      this.arrastrandoArchivo = true
    },

    desactivarArrastre() {
      this.arrastrandoArchivo = false
    },

    seleccionarArchivo(event) {
      const archivo = event.target.files[0]
      if (archivo) {
        this.archivoSeleccionado = archivo
      }
    },

    soltarArchivo(event) {
      this.arrastrandoArchivo = false
      const archivo = event.dataTransfer.files[0]
      if (archivo) {
        this.archivoSeleccionado = archivo
      }
    },

    eliminarArchivo() {
      this.archivoSeleccionado = null
      this.$refs.fileInput.value = ""
    },

    guardarCambios() {

      if (this.archivoSeleccionado) {
        const formData = new FormData()
        formData.append("archivo", this.archivoSeleccionado)
        formData.append("nombre", this.documentoLocal.nombre)
        formData.append("tipo_documento", this.documentoLocal.tipo_documento)
        formData.append("observaciones", this.documentoLocal.observaciones || "")

        this.$emit("guardar-con-archivo", formData, this.documentoLocal.id_documento)
      } else {
        this.$emit("guardar", this.documentoLocal)
      }
    },

    formatearTamano(bytes) {
      return formatUtils.formatearTamano(bytes)
    },
  },
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
  z-index: 50;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
  padding: 1.5rem;
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

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  background-color: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 1px #dc2626;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.input-error {
  border-color: #dc2626;
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.file-info-box {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.75rem;
  background-color: #f9fafb;
}

.file-drop-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.375rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-drop-area:hover {
  border-color: #9ca3af;
}

.file-drop-area.dragging {
  border-color: #dc2626;
  background-color: rgba(220, 38, 38, 0.05);
}

.file-drop-area.has-file {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.05);
}

.file-drop-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.file-drop-message svg {
  color: #9ca3af;
}

.file-select-button {
  color: #dc2626;
  font-weight: 500;
  cursor: pointer;
}

.hidden-file-input {
  display: none;
}

.file-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-info svg {
  color: #6b7280;
}

.file-details {
  text-align: left;
}

.file-name {
  font-weight: 500;
  color: #111827;
  margin: 0;
  word-break: break-all;
}

.file-size {
  color: #6b7280;
  font-size: 0.75rem;
  margin: 0;
}

.file-remove-button {
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

.file-remove-button:hover {
  color: #dc2626;
  background-color: #fee2e2;
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

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.mr-2 {
  margin-right: 0.5rem;
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