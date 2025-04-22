<template>
  <DefaultLayout>
    <div class="empleado-detalle">
      <div class="page-header">
        <div class="header-left">
          <button @click="goBack" class="btn btn-icon btn-ghost">
            <ArrowLeft size="18" />
            <span>Volver</span>
          </button>
          <h1 v-if="empleado">{{ empleado.nombre }} {{ empleado.apellidos }}</h1>
        </div>

        <div class="header-actions" v-if="empleado && canEdit">
          <button
              @click="toggleEmpleadoStatus"
              class="btn btn-status"
              :class="empleado.activo ? 'btn-status-active' : 'btn-status-inactive'"
          >
            <ToggleRight v-if="empleado.activo" size="18" class="btn-icon" />
            <ToggleLeft v-else size="18" class="btn-icon" />
            {{ empleado.activo ? 'Activo' : 'Inactivo' }}
          </button>

          <button v-if="!editMode" @click="editMode = true" class="btn btn-primary">
            <Edit size="18" class="btn-icon" />
            Editar
          </button>

          <button v-if="editMode" @click="saveEmpleado" class="btn btn-success">
            <Save size="18" class="btn-icon" />
            Guardar
          </button>

          <button v-if="editMode" @click="cancelEdit" class="btn btn-secondary">
            <X size="18" class="btn-icon" />
            Cancelar
          </button>

          <button @click="showDeleteModal = true" class="btn btn-danger">
            <Trash2 size="18" class="btn-icon" />
            Eliminar
          </button>
        </div>
      </div>

      <div v-if="empleadosStore.loading" class="loading-container">
        <LoadingSpinner message="Cargando datos del empleado..." />
      </div>

      <div v-else-if="empleadosStore.error" class="error-container">
        <div class="error-message">
          <AlertTriangle size="24" />
          <p>{{ empleadosStore.error }}</p>
        </div>
        <button @click="loadEmpleado" class="btn btn-primary">
          Reintentar
        </button>
      </div>

      <div v-else-if="!empleado" class="error-container">
        <div class="error-message">
          <AlertTriangle size="24" />
          <p>No se encontró el empleado solicitado.</p>
        </div>
        <button @click="goBack" class="btn btn-primary">
          Volver a la lista
        </button>
      </div>

      <div v-else class="empleado-content">
        <div class="tabs">
          <button
              class="tab-button"
              :class="{ active: activeTab === 'personal' }"
              @click="activeTab = 'personal'"
          >
            <User size="18" class="tab-icon" />
            Datos Personales
          </button>
          <button
              class="tab-button"
              :class="{ active: activeTab === 'laboral' }"
              @click="activeTab = 'laboral'"
          >
            <Briefcase size="18" class="tab-icon" />
            Información Laboral
          </button>
          <!-- Pestaña de documentos solo visible con permisos de lectura -->
          <button
              v-if="canViewDocuments"
              class="tab-button"
              :class="{ active: activeTab === 'documentos' }"
              @click="activeTab = 'documentos'"
          >
            <FileText size="18" class="tab-icon" />
            Documentos
          </button>
          <button
              class="tab-button"
              :class="{ active: activeTab === 'historial' }"
              @click="activeTab = 'historial'"
          >
            <FolderOpen size="18" class="tab-icon" />
            Historial
          </button>
        </div>

        <div class="tab-content">
          <!-- Datos Personales -->
          <div v-if="activeTab === 'personal'" class="tab-panel">
            <div class="card">
              <div class="card-header">
                <h2>Datos Personales</h2>
              </div>
              <div class="card-body">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Nombre</label>
                    <input
                        v-if="editMode"
                        v-model="empleado.nombre"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.nombre }"
                    />
                    <div v-if="editMode && validationErrors.nombre" class="invalid-feedback">
                      {{ validationErrors.nombre }}
                    </div>
                    <div v-else class="form-value">{{ empleado.nombre }}</div>
                  </div>

                  <div class="form-group">
                    <label>Apellidos</label>
                    <input
                        v-if="editMode"
                        v-model="empleado.apellidos"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.apellidos }"
                    />
                    <div v-if="editMode && validationErrors.apellidos" class="invalid-feedback">
                      {{ validationErrors.apellidos }}
                    </div>
                    <div v-else class="form-value">{{ empleado.apellidos }}</div>
                  </div>

                  <div class="form-group">
                    <label>DNI/NIE</label>
                    <input
                        v-if="editMode"
                        v-model="empleado.dni_nie"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.dni_nie }"
                    />
                    <div v-if="editMode && validationErrors.dni_nie" class="invalid-feedback">
                      {{ validationErrors.dni_nie }}
                    </div>
                    <div v-else class="form-value">{{ empleado.dni_nie }}</div>
                  </div>

                  <div class="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input
                        v-if="editMode"
                        v-model="empleado.fecha_nacimiento"
                        type="date"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.fecha_nacimiento }"
                    />
                    <div v-if="editMode && validationErrors.fecha_nacimiento" class="invalid-feedback">
                      {{ validationErrors.fecha_nacimiento }}
                    </div>
                    <div v-else class="form-value">{{ formatDate(empleado.fecha_nacimiento) }}</div>
                  </div>

                  <div class="form-group">
                    <label>Estado Civil</label>
                    <select
                        v-if="editMode"
                        v-model="empleado.estado_civil"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.estado_civil }"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Soltero/a">Soltero/a</option>
                      <option value="Casado/a">Casado/a</option>
                      <option value="Divorciado/a">Divorciado/a</option>
                      <option value="Viudo/a">Viudo/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <div v-if="editMode && validationErrors.estado_civil" class="invalid-feedback">
                      {{ validationErrors.estado_civil }}
                    </div>
                    <div v-else class="form-value">{{ empleado.estado_civil || 'No especificado' }}</div>
                  </div>

                  <div class="form-group">
                    <label>Dirección</label>
                    <textarea
                        v-if="editMode"
                        v-model="empleado.direccion"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.direccion }"
                    ></textarea>
                    <div v-if="editMode && validationErrors.direccion" class="invalid-feedback">
                      {{ validationErrors.direccion }}
                    </div>
                    <div v-else class="form-value">{{ empleado.direccion || 'No especificada' }}</div>
                  </div>

                  <div class="form-group">
                    <label>Teléfono</label>
                    <input
                        v-if="editMode"
                        v-model="empleado.telefono"
                        type="tel"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.telefono }"
                    />
                    <div v-if="editMode && validationErrors.telefono" class="invalid-feedback">
                      {{ validationErrors.telefono }}
                    </div>
                    <div v-else class="form-value">{{ empleado.telefono || 'No especificado' }}</div>
                  </div>

                  <div class="form-group">
                    <label>Email</label>
                    <input
                        v-if="editMode"
                        v-model="empleado.email"
                        type="email"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.email }"
                    />
                    <div v-if="editMode && validationErrors.email" class="invalid-feedback">
                      {{ validationErrors.email }}
                    </div>
                    <div v-else class="form-value">{{ empleado.email || 'No especificado' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Información Laboral -->
          <div v-if="activeTab === 'laboral'" class="tab-panel">
            <div class="card">
              <div class="card-header">
                <h2>Información Laboral</h2>
              </div>
              <div class="card-body">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Puesto Actual</label>
                    <input
                        v-if="editMode"
                        v-model="empleado.puesto_actual"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.puesto_actual }"
                    />
                    <div v-if="editMode && validationErrors.puesto_actual" class="invalid-feedback">
                      {{ validationErrors.puesto_actual }}
                    </div>
                    <div v-else class="form-value">{{ empleado.puesto_actual || 'No especificado' }}</div>
                  </div>

                  <div class="form-group">
                    <label>Centro</label>
                    <select
                        v-if="editMode"
                        v-model="empleado.id_centro"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.id_centro }"
                        @change="handleCentroChange"
                    >
                      <option :value="null">Sin centro</option>
                      <option v-for="centro in centrosStore.centros"
                              :key="centro.id_centro"
                              :value="centro.id_centro">
                        {{ centro.nombre }}
                      </option>
                    </select>
                    <div v-if="editMode && validationErrors.id_centro" class="invalid-feedback">
                      {{ validationErrors.id_centro }}
                    </div>
                    <div v-else class="form-value">
                      {{ empleado.Centro ? empleado.Centro.nombre : 'No asignado' }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Departamento</label>
                    <select
                        v-if="editMode"
                        v-model="empleado.id_departamento"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.id_departamento }"
                    >
                      <option :value="null">Sin departamento</option>
                      <option v-for="departamento in departamentosFiltrados"
                              :key="departamento.id_departamento"
                              :value="departamento.id_departamento">
                        {{ departamento.nombre }}
                      </option>
                    </select>
                    <div v-if="editMode && validationErrors.id_departamento" class="invalid-feedback">
                      {{ validationErrors.id_departamento }}
                    </div>
                    <div v-else class="form-value">
                      {{ empleado.Departamento ? empleado.Departamento.nombre : 'No asignado' }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Fecha de Incorporación</label>
                    <input
                        v-if="editMode"
                        v-model="empleado.fecha_incorporacion"
                        type="date"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.fecha_incorporacion }"
                    />
                    <div v-if="editMode && validationErrors.fecha_incorporacion" class="invalid-feedback">
                      {{ validationErrors.fecha_incorporacion }}
                    </div>
                    <div v-else class="form-value">{{ formatDate(empleado.fecha_incorporacion) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Documentos (solo visible con permisos) -->
          <div v-if="activeTab === 'documentos' && canViewDocuments" class="tab-panel">
            <div class="card">
              <div class="card-header">
                <h2>Documentos</h2>
              </div>
              <div class="card-body">
                <DocumentosEmpleado
                    v-if="empleado"
                    :idEmpleado="empleadoId"
                    @previsualizar="previsualizarDocumento"
                />
              </div>
            </div>
          </div>

          <!-- Historial -->
          <div v-if="activeTab === 'historial'" class="tab-panel">
            <div class="card">
              <div class="card-header">
                <h2>Historial</h2>
              </div>
              <div class="card-body">
                <div class="empty-state">
                  <Calendar size="48" class="empty-icon" />
                  <h3>No hay registros</h3>
                  <p>No hay registros de actividad para este empleado.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Confirmar eliminación</h3>
            <button @click="showDeleteModal = false" class="btn-close">
              <X size="18" />
            </button>
          </div>
          <div class="modal-body">
            <p>¿Está seguro de que desea eliminar a <strong>{{ empleado.nombre }} {{ empleado.apellidos }}</strong>?</p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" class="btn btn-secondary">
              Cancelar
            </button>
            <button @click="deleteEmpleado" class="btn btn-danger" :disabled="empleadosStore.loading">
              <Trash2 v-if="!empleadosStore.loading" size="18" class="btn-icon" />
              <Loader v-else size="18" class="btn-icon animate-spin" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de previsualización de documento (solo visible con permisos) -->
      <div v-if="documentoPreview && canViewDocuments" class="modal-overlay">
        <div class="modal-container modal-lg">
          <div class="modal-header">
            <h3>{{ documentoPreview.nombre_original || documentoPreview.nombre }}</h3>
            <div class="modal-header-actions">
              <button @click="descargarDocumento(documentoPreview)" class="btn-icon-only" title="Descargar">
                <Download size="18" />
              </button>
              <button @click="cerrarPreview" class="btn-close">
                <X size="18" />
              </button>
            </div>
          </div>
          <div class="modal-body preview-container">
            <!-- Estado de carga -->
            <div v-if="cargandoPreview" class="preview-loading">
              <Loader size="32" class="animate-spin" />
              <p>Cargando vista previa...</p>
            </div>

            <!-- Estado de error -->
            <div v-else-if="errorPreview" class="preview-error">
              <AlertTriangle size="32" />
              <p>{{ errorPreview }}</p>
              <p class="error-details" v-if="documentoPreview">
                Documento: {{ documentoPreview.nombre }} ({{ documentoPreview.tipo_documento }})
              </p>
            </div>

            <!-- Vista previa del documento -->
            <template v-else-if="urlPreview">
              <!-- Vista previa para PDF -->
              <iframe
                  v-if="esPDF"
                  :src="urlPreview"
                  class="documento-preview"
                  frameborder="0"
                  title="Vista previa del documento"
              ></iframe>

              <!-- Vista previa para imágenes -->
              <img
                  v-else-if="esImagen"
                  :src="urlPreview"
                  class="imagen-preview"
                  alt="Vista previa del documento"
              />

              <!-- Mensaje para otros tipos de archivo -->
              <div v-else class="preview-no-disponible">
                <FileText size="48" class="empty-icon" />
                <p>Este tipo de documento no se puede previsualizar.</p>
                <p>Puede descargar el documento para verlo.</p>
                <button @click="descargarDocumento(documentoPreview)" class="btn btn-primary">
                  <Download size="16" class="btn-icon" />
                  Descargar archivo
                </button>
              </div>
            </template>

            <!-- Sin URL de vista previa -->
            <div v-else class="preview-no-disponible">
              <AlertTriangle size="32" />
              <p>No se pudo generar la vista previa del documento.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useEmpleadosStore } from "../../stores/empleados"
import { useDocumentosStore } from "../../stores/documentos"
import { useAuthStore } from "../../stores/auth"
import { useNotificationStore } from "../../stores/notification"
import { useDepartamentosStore } from "../../stores/departamentos"
import { useCentrosStore } from "../../stores/centros"
import { validateEmpleado } from "../../validation/empleadoSchema"
import DefaultLayout from "../../layouts/DefaultLayout.vue"
import LoadingSpinner from "../../components/common/LoadingSpinner.vue"
import PermissionCheck from "../../components/common/PermissionCheck.vue"
import DocumentosEmpleado from "../../components/documentos/empleados/DocumentosEmpleado.vue"
import {
  User,
  Briefcase,
  FileText,
  FolderOpen,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  X,
  AlertTriangle,
  Plus,
  Upload,
  Save,
  ToggleLeft,
  ToggleRight,
  Loader,
  Download
} from "lucide-vue-next"

export default {
  name: "EmpleadoDetalle",

  components: {
    DefaultLayout,
    LoadingSpinner,
    PermissionCheck,
    DocumentosEmpleado,
    User,
    Briefcase,
    FileText,
    FolderOpen,
    Calendar,
    Edit,
    Trash2,
    ArrowLeft,
    X,
    AlertTriangle,
    Plus,
    Upload,
    Save,
    ToggleLeft,
    ToggleRight,
    Loader,
    Download
  },

  props: {
    id: {
      type: [String, Number],
      required: false
    }
  },

  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const empleadosStore = useEmpleadosStore()
    const documentosStore = useDocumentosStore()
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    const departamentosStore = useDepartamentosStore()
    const centrosStore = useCentrosStore()
    const activeTab = ref("personal")
    const showDeleteModal = ref(false)
    const editMode = ref(false)
    const validationErrors = ref({})
    const originalEmpleado = ref(null)
    const selectedCentroId = ref(null)

    const documentoPreview = ref(null)
    const urlPreview = ref(null)
    const cargandoPreview = ref(false)
    const errorPreview = ref(null)

    const empleadoId = computed(() => {
      return props.id || route.params.id
    })

    const departamentosFiltrados = computed(() => {
      if (!selectedCentroId.value) {
        return departamentosStore.departamentos
      }

      return departamentosStore.departamentos.filter(
          departamento => departamento.id_centro === selectedCentroId.value
      )
    })

    const canViewDocuments = computed(() => {
      return authStore.hasPermission({ nombre: "Documentos", tipo: "Lectura" });
    });

    const canEditDocuments = computed(() => {
      return authStore.hasPermission({ nombre: "Documentos", tipo: "Escritura" });
    });

    const esPDF = computed(() => {
      if (!documentoPreview.value) return false

      if (documentoPreview.value.mimetype === 'application/pdf') return true

      const nombreOriginal = documentoPreview.value.nombre_original?.toLowerCase() || ''
      return nombreOriginal.endsWith('.pdf')
    })

    const esImagen = computed(() => {
      if (!documentoPreview.value) return false

      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp']
      if (documentoPreview.value.mimetype && imageTypes.includes(documentoPreview.value.mimetype)) return true

      const nombreOriginal = documentoPreview.value.nombre_original?.toLowerCase() || ''
      return /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(nombreOriginal)
    })

    const loadEmpleado = () => {
      if (!empleadoId.value) {
        return
      }

      console.log("Cargando empleado con ID:", empleadoId.value)
      empleadosStore.fetchEmpleadoById(empleadoId.value).then(() => {
        if (empleadosStore.currentEmpleado) {
          originalEmpleado.value = JSON.parse(JSON.stringify(empleadosStore.currentEmpleado))
          selectedCentroId.value = empleadosStore.currentEmpleado.id_centro
        }
      })
    }

    const previsualizarDocumento = async (documento) => {
      if (!canViewDocuments.value) {
        notificationStore.error('No tiene permisos para ver documentos', 'Error de permisos');
        return;
      }

      if (!documento) return

      documentoPreview.value = documento
      cargandoPreview.value = true
      errorPreview.value = null
      urlPreview.value = null

      try {
        console.log(`Solicitando previsualización para documento ID: ${documento.id_documento}`)

        const url = await documentosStore.previewDocumento(documento.id_documento)

        if (!url) {
          throw new Error("No se pudo generar la URL de previsualización")
        }

        console.log("URL de previsualización recibida:", url)
        urlPreview.value = url
      } catch (error) {
        console.error("Error al obtener vista previa:", error)

        let mensajeError = error.message || "No se pudo cargar la vista previa del documento"

        if (error.response) {
          const status = error.response.status
          if (status === 404) {
            mensajeError = "El documento solicitado no existe o no está disponible"
          } else if (status === 403) {
            mensajeError = "No tiene permisos para ver este documento"
          } else {
            mensajeError = `Error del servidor (${status}): ${error.response.statusText}`
          }
        }

        errorPreview.value = mensajeError
        notificationStore.warning(errorPreview.value, "Error de previsualización")
      } finally {
        cargandoPreview.value = false
      }
    }

    const cerrarPreview = () => {
      if (urlPreview.value) {
        console.log("Liberando recursos de previsualización:", urlPreview.value)
        URL.revokeObjectURL(urlPreview.value)
      }
      documentoPreview.value = null
      urlPreview.value = null
      errorPreview.value = null
    }

    const descargarDocumento = async (documento) => {
      if (!canViewDocuments.value) {
        notificationStore.error('No tiene permisos para descargar documentos', 'Error de permisos');
        return;
      }

      if (!documento) return

      try {
        await documentosStore.downloadDocumento(documento.id_documento)
      } catch (error) {
        console.error("Error al descargar documento:", error)
        notificationStore.error(
            error.message || "Ha ocurrido un error al descargar el documento",
            "Error al descargar"
        )
      }
    }

    onMounted(() => {
      loadEmpleado()
      departamentosStore.fetchDepartamentos()
      centrosStore.fetchCentros()
    })

    watch(empleadoId, () => {
      loadEmpleado()
    })

    return {
      route,
      router,
      empleadosStore,
      documentosStore,
      authStore,
      notificationStore,
      departamentosStore,
      centrosStore,
      activeTab,
      showDeleteModal,
      editMode,
      validationErrors,
      originalEmpleado,
      selectedCentroId,
      departamentosFiltrados,
      empleadoId,
      loadEmpleado,
      documentoPreview,
      urlPreview,
      cargandoPreview,
      errorPreview,
      esPDF,
      esImagen,
      canViewDocuments,
      canEditDocuments,
      previsualizarDocumento,
      cerrarPreview,
      descargarDocumento
    }
  },

  computed: {
    empleado() {
      return this.empleadosStore.currentEmpleado
    },

    canEdit() {
      return this.authStore.hasPermission({ nombre: "Empleados", tipo: "Escritura" })
    }
  },

  methods: {
    handleCentroChange() {
      this.selectedCentroId = this.empleado.id_centro

      if (this.empleado.id_departamento) {
        const departamentoActual = this.departamentosStore.departamentos.find(
            d => d.id_departamento === this.empleado.id_departamento
        )

        if (departamentoActual && departamentoActual.id_centro !== this.selectedCentroId) {
          this.empleado.id_departamento = null
        }
      }
    },

    formatDate(dateString) {
      if (!dateString) return "No especificada"

      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    },

    goBack() {
      this.router.push("/empleados")
    },

    cancelEdit() {
      if (this.originalEmpleado) {
        this.empleadosStore.currentEmpleado = JSON.parse(JSON.stringify(this.originalEmpleado))
        this.selectedCentroId = this.empleado.id_centro
      }
      this.editMode = false
      this.validationErrors = {}
    },

    async saveEmpleado() {
      try {
        const { isValid, errors } = await validateEmpleado(this.empleado)

        if (!isValid) {
          this.validationErrors = errors

          const firstError = Object.values(errors)[0]
          this.notificationStore.error(
              firstError,
              "Error de validación"
          )
          return
        }

        this.validationErrors = {}

        const updatedEmpleado = await this.empleadosStore.updateEmpleado(this.empleadoId, this.empleado)

        if (updatedEmpleado) {
          this.originalEmpleado = JSON.parse(JSON.stringify(updatedEmpleado))
          this.editMode = false
          this.notificationStore.success(
              `¡Empleado modificado correctamente! Los datos de ${updatedEmpleado.nombre} ${updatedEmpleado.apellidos} han sido actualizados.`,
              "Empleado actualizado"
          )
        }
      } catch (error) {
        console.error("Error al guardar empleado:", error)
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al guardar los cambios. Por favor, inténtelo de nuevo.",
            "Error al actualizar"
        )
      }
    },

    async deleteEmpleado() {
      try {
        const success = await this.empleadosStore.deleteEmpleado(this.empleadoId)

        if (success) {
          this.showDeleteModal = false
          this.notificationStore.success("El empleado ha sido eliminado correctamente.", "Empleado eliminado")
          this.router.push("/empleados")
        } else {
          this.notificationStore.error(
              "Ha ocurrido un error al eliminar el empleado. Por favor, inténtelo de nuevo.",
              "Error al eliminar"
          )
        }
      } catch (error) {
        console.error("Error al eliminar empleado:", error)
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al eliminar el empleado. Por favor, inténtelo de nuevo.",
            "Error al eliminar"
        )
      }
    },

    async toggleEmpleadoStatus() {
      try {
        const newStatus = !this.empleado.activo
        console.log(`Componente: Cambiando estado a ${newStatus ? 'activo' : 'inactivo'}`)

        const success = await this.empleadosStore.changeEmpleadoStatus(this.empleadoId, newStatus)

        if (success) {
          this.empleado.activo = newStatus
          this.originalEmpleado = JSON.parse(JSON.stringify(this.empleado))

          this.notificationStore.success(
              `El empleado ha sido ${newStatus ? "activado" : "desactivado"} correctamente.`,
              `Empleado ${newStatus ? "activado" : "desactivado"}`
          )
        } else {
          this.notificationStore.error(
              `Ha ocurrido un error al ${newStatus ? "activar" : "desactivar"} el empleado. Por favor, inténtelo de nuevo.`,
              "Error al cambiar estado"
          )
        }
      } catch (error) {
        console.error("Error en toggleEmpleadoStatus:", error)
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al cambiar el estado del empleado. Por favor, inténtelo de nuevo.",
            "Error al cambiar estado"
        )
      }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.empleado-detalle {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  position: relative;
  padding-bottom: 0.5rem;
}

.header-left h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #dc2626, #ef4444);
  border-radius: 3px;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
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

.btn-icon {
  margin-right: 0.5rem;
}

.btn-ghost {
  background-color: transparent;
  color: #4b5563;
}

.btn-ghost:hover {
  background-color: #f3f4f6;
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

.btn-success {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-success:hover {
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

.btn-danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-danger:hover {
  background-color: #fecaca;
}

.btn-status {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-status-active {
  background-color: #dcfce7;
  color: #166534;
}

.btn-status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.tab-button:hover {
  color: #4b5563;
}

.tab-button.active {
  color: #dc2626;
  border-bottom-color: #dc2626;
}

.tab-icon {
  margin-right: 0.5rem;
}

.tab-content {
  flex: 1;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.card-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.875rem;
}

.form-control {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #111827;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #fca5a5;
  box-shadow: 0 0 0 3px rgba(252, 165, 165, 0.2);
}

.form-control.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  color: #dc2626;
  font-size: 0.875rem;
}

.form-value {
  padding: 0.5rem 0;
  color: #111827;
  font-weight: 500;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 200px;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.error-message svg {
  color: #dc2626;
  margin-bottom: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  color: #dc2626;
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

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

.modal-lg {
  max-width: 80%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
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

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Estilos para la previsualización de documentos */
.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.preview-loading,
.preview-error,
.preview-no-disponible {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.preview-loading svg {
  color: #dc2626;
  margin-bottom: 1rem;
}

.preview-error svg {
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-details {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

.documento-preview {
  width: 100%;
  height: 100%;
  min-height: 50vh;
  border: none;
}

.imagen-preview {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
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

@media (max-width: 768px) {
  .empleado-detalle {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .tab-button {
    padding: 0.5rem 1rem;
  }

  .modal-lg {
    max-width: 95%;
    max-height: 90vh;
  }
}
</style>