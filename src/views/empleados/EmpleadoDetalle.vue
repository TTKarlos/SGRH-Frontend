<template>
  <DefaultLayout>
    <div class="empleado-detalle">
      <!-- Header -->
      <EmpleadoHeader
          v-if="empleado"
          :empleado="empleado"
          :canEdit="canEdit"
          :editMode="editMode"
          @edit="editMode = true"
          @save="saveEmpleado"
          @cancel="cancelEdit"
          @delete="showDeleteModal = true"
          @toggle-status="toggleEmpleadoStatus"
      />

      <!-- Loading state -->
      <div v-if="empleadosStore.loading" class="loading-container">
        <LoadingSpinner message="Cargando datos del empleado..." />
      </div>

      <!-- Error state -->
      <div v-else-if="empleadosStore.error" class="error-container">
        <div class="error-message">
          <AlertTriangle size="24" />
          <p>{{ empleadosStore.error }}</p>
        </div>
        <button @click="loadEmpleado" class="btn btn-primary">
          Reintentar
        </button>
      </div>

      <!-- Not found state -->
      <div v-else-if="!empleado" class="error-container">
        <div class="error-message">
          <AlertTriangle size="24" />
          <p>No se encontró el empleado solicitado.</p>
        </div>
        <button @click="goBack" class="btn btn-primary">
          Volver a la lista
        </button>
      </div>

      <!-- Content -->
      <div v-else class="empleado-content">
        <!-- Tabs -->
        <EmpleadoTabs
            :activeTab="activeTab"
            :canViewDocuments="canViewDocuments"
            :canViewFormacion="canViewFormacion"
            :canViewAusencias="canViewAusencias"
            :canViewContratos="canViewContratos"
            @change-tab="activeTab = $event"
        />

        <div class="tab-content">
          <!-- Datos Personales -->
          <DatosPersonalesTab
              v-if="activeTab === 'personal'"
              :empleado="empleado"
              :editMode="editMode"
              :validationErrors="validationErrors"
          />

          <!-- Información Laboral -->
          <InformacionLaboralTab
              v-if="activeTab === 'laboral'"
              :empleado="empleado"
              :editMode="editMode"
              :validationErrors="validationErrors"
              :centros="centrosStore.centros"
              :departamentos="departamentosStore.departamentos"
              :selectedCentroId="selectedCentroId"
              @centro-change="handleCentroChange"
          />

          <!-- Documentos -->
          <div v-if="activeTab === 'documentos' && canViewDocuments" class="tab-panel">
            <div class="card">
              <div class="card-body">
                <DocumentosEmpleado
                    v-if="empleado"
                    :idEmpleado="empleadoId"
                    @ver-detalles="mostrarDetallesDocumento"
                    @previsualizar="previsualizarDocumento"
                />
              </div>
            </div>
          </div>

          <!-- Formación -->
          <FormacionTab
              v-if="activeTab === 'formacion' && canViewFormacion"
              :formaciones="formacionesStore.formaciones"
              :loading="formacionesStore.loading"
              :error="formacionesStore.error"
              :canEdit="canEditFormacion"
              @add-formacion="showFormacionModal = true"
              @edit-formacion="editFormacion"
              @delete-formacion="deleteFormacion"
              @reload="loadFormaciones"
          />

          <!-- Ausencias -->
          <AusenciasTab
              v-if="activeTab === 'ausencias' && canViewAusencias"
              :ausencias="ausenciasStore.ausencias"
              :loading="ausenciasStore.loading"
              :error="ausenciasStore.error"
              :canEdit="canEditAusencias"
              :id_empleado="empleadoId"
              @add-ausencia="showAusenciaModal = true"
              @edit-ausencia="editAusencia"
              @delete-ausencia="deleteAusencia"
              @reload="loadAusencias"
              @save-ausencia="saveAusencia"
          />

          <!-- Contratos -->
          <ContratosTab
              v-if="activeTab === 'contratos' && canViewContratos"
              :contratos="contratosStore.contratos"
              :loading="contratosStore.loading"
              :id-empleado="empleadoId"
              @refresh="handleContratosRefresh"
          />
        </div>
      </div>

      <!-- Modal de detalles de documento -->
      <ModalDetallesDocumento
          v-if="showDocumentModal && documentoSeleccionado"
          :documento="documentoSeleccionado"
          @cerrar="cerrarModalDocumento"
          @descargar="descargarDocumento"
          @previsualizar="previsualizarDocumento"
          @editar="editarDocumento"
      />

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
            <p class="warning-text">⚠️ <strong>ATENCIÓN:</strong> Al eliminar este empleado también se eliminarán automáticamente todos sus documentos y contratos asociados.</p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" class="btn btn-secondary">
              Cancelar
            </button>
            <button @click="confirmDeleteEmpleado" class="btn btn-danger" :disabled="empleadosStore.loading">
              <Trash2 v-if="!empleadosStore.loading" size="18" class="btn-icon" />
              <Loader v-else size="18" class="btn-icon animate-spin" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de previsualización de documento -->
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

      <!-- Modal de Formación -->
      <FormacionModal
          v-if="showFormacionModal"
          :value="formacionForm"
          :validationErrors="formacionValidationErrors"
          :loading="savingFormacion"
          @close="closeFormacionModal"
          @save="saveFormacion"
      />

      <!-- Modal de Ausencia -->
      <AusenciaModal
          v-if="showAusenciaModal"
          :value="ausenciaForm"
          :tiposAusencia="tiposAusenciaStore.tiposAusencia"
          :validationErrors="ausenciaValidationErrors"
          :loading="savingAusencia"
          :id_empleado="empleadoId"
          :ausencias-existentes="ausenciasStore.ausencias"
          @close="closeAusenciaModal"
          @save="saveAusencia"
          @validation-error="handleAusenciaValidationError"
      />

      <!-- Modales de confirmación de eliminación -->
      <div v-if="showDeleteFormacionModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Confirmar eliminación</h3>
            <button @click="showDeleteFormacionModal = false" class="btn-close">
              <X size="18" />
            </button>
          </div>
          <div class="modal-body">
            <p>¿Está seguro de que desea eliminar la formación <strong>{{ formacionToDelete?.nombre }}</strong>?</p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteFormacionModal = false" class="btn btn-secondary">
              Cancelar
            </button>
            <button @click="confirmDeleteFormacion" class="btn btn-danger" :disabled="deletingFormacion">
              <Trash2 v-if="!deletingFormacion" size="18" class="btn-icon" />
              <Loader v-else size="18" class="btn-icon animate-spin" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación de ausencia -->
      <div v-if="showDeleteAusenciaModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Confirmar eliminación</h3>
            <button @click="showDeleteAusenciaModal = false" class="btn-close">
              <X size="18" />
            </button>
          </div>
          <div class="modal-body">
            <p>¿Está seguro de que desea eliminar la ausencia del tipo
              <strong v-if="ausenciaToDelete?.TipoAusencia?.nombre">
                {{ ausenciaToDelete.TipoAusencia.nombre }}
              </strong>
              <strong v-else-if="getTipoAusenciaNombre(ausenciaToDelete?.id_tipo_ausencia)">
                {{ getTipoAusenciaNombre(ausenciaToDelete?.id_tipo_ausencia) }}
              </strong>
              <strong v-else>
                seleccionada
              </strong>?
            </p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteAusenciaModal = false" class="btn btn-secondary">
              Cancelar
            </button>
            <button @click="confirmDeleteAusencia" class="btn btn-danger" :disabled="deletingAusencia">
              <Trash2 v-if="!deletingAusencia" size="18" class="btn-icon" />
              <Loader v-else size="18" class="btn-icon animate-spin" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script>
import { useEmpleadosStore } from "../../stores/empleados"
import { useDocumentosStore } from "../../stores/documentos"
import { useAuthStore } from "../../stores/auth"
import { useNotificationStore } from "../../stores/notification"
import { useDepartamentosStore } from "../../stores/departamentos"
import { useCentrosStore } from "../../stores/centros"
import { useFormacionEmpleadosStore } from "../../stores/formacionEmpleados"
import { useAusenciasStore } from "../../stores/ausencias"
import { useTiposAusenciaStore } from "../../stores/tiposAusencia"
import { useContratosStore } from "../../stores/contratos"
import { useTiposContratoStore } from "../../stores/tiposContrato"
import { useEmpresasStore } from "../../stores/empresas"
import { useConveniosStore } from "../../stores/convenios"
import { useCategoriasConvenioStore } from "../../stores/categoriasConvenio"
import { validateEmpleado } from "../../validation/empleadoSchema"
import DefaultLayout from "../../layouts/DefaultLayout.vue"
import LoadingSpinner from "../../components/common/LoadingSpinner.vue"
import DocumentosEmpleado from "../../components/documentos/empleados/DocumentosEmpleado.vue"
import ModalDetallesDocumento from "../../components/documentos/modals/ModalDetallesDocumento.vue"

import EmpleadoHeader from "../../components/empleados/detalle/EmpleadoHeader.vue"
import EmpleadoTabs from "../../components/empleados/detalle/EmpleadoTabs.vue"
import DatosPersonalesTab from "../../components/empleados/detalle/tabs/DatosPersonalesTab.vue"
import InformacionLaboralTab from "../../components/empleados/detalle/tabs/InformacionLaboralTab.vue"
import FormacionTab from "../../components/empleados/detalle/tabs/FormacionTab.vue"
import AusenciasTab from "../../components/empleados/detalle/tabs/AusenciasTab.vue"
import ContratosTab from "../../components/empleados/detalle/tabs/ContratosTab.vue"
import FormacionModal from "../../components/empleados/detalle/modals/FormacionModal.vue"
import AusenciaModal from "../../components/empleados/detalle/modals/AusenciaModal.vue"

import {
  AlertTriangle,
  Trash2,
  X,
  Loader,
  Download,
  FileText
} from "lucide-vue-next"

export default {
  name: "EmpleadoDetalle",

  components: {
    DefaultLayout,
    LoadingSpinner,
    DocumentosEmpleado,
    ModalDetallesDocumento,
    EmpleadoHeader,
    EmpleadoTabs,
    DatosPersonalesTab,
    InformacionLaboralTab,
    FormacionTab,
    AusenciasTab,
    ContratosTab,
    FormacionModal,
    AusenciaModal,
    AlertTriangle,
    Trash2,
    X,
    Loader,
    Download,
    FileText
  },

  props: {
    id: {
      type: [String, Number],
      required: false
    }
  },

  data() {
    return {
      empleadosStore: useEmpleadosStore(),
      documentosStore: useDocumentosStore(),
      authStore: useAuthStore(),
      notificationStore: useNotificationStore(),
      departamentosStore: useDepartamentosStore(),
      centrosStore: useCentrosStore(),
      formacionesStore: useFormacionEmpleadosStore(),
      ausenciasStore: useAusenciasStore(),
      tiposAusenciaStore: useTiposAusenciaStore(),
      contratosStore: useContratosStore(),
      tiposContratoStore: useTiposContratoStore(),
      empresasStore: useEmpresasStore(),
      conveniosStore: useConveniosStore(),
      categoriasConvenioStore: useCategoriasConvenioStore(),

      activeTab: "personal",
      showDeleteModal: false,
      editMode: false,
      validationErrors: {},
      originalEmpleado: null,
      selectedCentroId: null,

      showDocumentModal: false,
      documentoSeleccionado: null,

      documentoPreview: null,
      urlPreview: null,
      cargandoPreview: false,
      errorPreview: null,

      showFormacionModal: false,
      formacionForm: {
        nombre: '',
        es_interna: false,
        fecha_inicio: '',
        fecha_fin: ''
      },
      formacionValidationErrors: {},
      savingFormacion: false,
      showDeleteFormacionModal: false,
      formacionToDelete: null,
      deletingFormacion: false,

      showAusenciaModal: false,
      ausenciaForm: {
        id_tipo_ausencia: null,
        fecha_inicio: '',
        fecha_fin: '',
        id_empleado: null
      },
      ausenciaValidationErrors: {},
      savingAusencia: false,
      showDeleteAusenciaModal: false,
      ausenciaToDelete: null,
      deletingAusencia: false,
      tipoAusenciaEnCarga: {}
    }
  },

  computed: {
    empleado() {
      return this.empleadosStore.currentEmpleado
    },

    empleadoId() {
      return this.id || this.$route.params.id
    },

    canEdit() {
      return this.authStore.hasPermission({ nombre: "Empleados", tipo: "Escritura" })
    },

    canViewDocuments() {
      return this.authStore.hasPermission({ nombre: "Documentos", tipo: "Lectura" })
    },

    canEditDocuments() {
      return this.authStore.hasPermission({ nombre: "Documentos", tipo: "Escritura" })
    },

    canViewFormacion() {
      return this.authStore.hasPermission({ nombre: "Empleados", tipo: "Lectura" })
    },

    canEditFormacion() {
      return this.authStore.hasPermission({ nombre: "Empleados", tipo: "Escritura" })
    },

    canViewAusencias() {
      return this.authStore.hasPermission({ nombre: "Ausencias", tipo: "Lectura" })
    },

    canEditAusencias() {
      return this.authStore.hasPermission({ nombre: "Ausencias", tipo: "Escritura" })
    },

    canViewContratos() {
      return this.authStore.hasPermission({ nombre: "Contratos", tipo: "Lectura" })
    },

    canEditContratos() {
      return this.authStore.hasPermission({ nombre: "Contratos", tipo: "Escritura" })
    },

    esPDF() {
      if (!this.documentoPreview) return false

      if (this.documentoPreview.mimetype === 'application/pdf') return true

      const nombreOriginal = this.documentoPreview.nombre_original?.toLowerCase() || ''
      return nombreOriginal.endsWith('.pdf')
    },

    esImagen() {
      if (!this.documentoPreview) return false

      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp']
      if (this.documentoPreview.mimetype && imageTypes.includes(this.documentoPreview.mimetype)) return true

      const nombreOriginal = this.documentoPreview.nombre_original?.toLowerCase() || ''
      return /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(nombreOriginal)
    }
  },

  watch: {
    empleadoId: {
      handler() {
        this.loadEmpleado()
        this.initializeTabData()
      },
      immediate: true
    },

    activeTab(newTab) {
      this.loadTabData(newTab)
    }
  },

  async created() {
    await this.initializeStores()
  },

  methods: {
    async initializeStores() {
      try {
        await Promise.all([
          this.departamentosStore.fetchDepartamentos(),
          this.centrosStore.fetchCentros()
        ])

        if (this.canViewAusencias) {
          await this.loadTiposAusencia()
        }

        if (this.canViewContratos) {
          await Promise.all([
            this.loadTiposContrato(),
            this.loadEmpresas(),
            this.loadConvenios()
          ])
        }
      } catch (error) {
      }
    },

    initializeTabData() {
      if (this.canViewFormacion) {
        this.loadFormaciones()
      }

      if (this.canViewAusencias) {
        this.loadAusencias()
      }

      if (this.canViewContratos) {
        this.loadContratos()
      }
    },

    loadTabData(tab) {
      switch (tab) {
        case 'formacion':
          if (this.canViewFormacion) {
            this.loadFormaciones()
          }
          break
        case 'ausencias':
          if (this.canViewAusencias) {
            this.loadAusencias()
          }
          break
        case 'contratos':
          if (this.canViewContratos) {
            this.loadContratos()
          }
          break
      }
    },

    async loadEmpleado() {
      if (!this.empleadoId) return

      try {
        await this.empleadosStore.fetchEmpleadoById(this.empleadoId)
        if (this.empleadosStore.currentEmpleado) {
          this.originalEmpleado = JSON.parse(JSON.stringify(this.empleadosStore.currentEmpleado))
          this.selectedCentroId = this.empleadosStore.currentEmpleado.id_centro
        }
      } catch (error) {
      }
    },

    handleCentroChange(centroId) {
      this.selectedCentroId = centroId

      if (this.empleadosStore.currentEmpleado.id_departamento) {
        const departamentoActual = this.departamentosStore.departamentos.find(
            d => d.id_departamento === this.empleadosStore.currentEmpleado.id_departamento
        )

        if (departamentoActual && departamentoActual.id_centro !== this.selectedCentroId) {
          this.empleadosStore.currentEmpleado.id_departamento = null
        }
      }
    },

    goBack() {
      this.$router.push("/empleados")
    },

    cancelEdit() {
      if (this.originalEmpleado) {
        this.empleadosStore.currentEmpleado = JSON.parse(JSON.stringify(this.originalEmpleado))
        this.selectedCentroId = this.empleadosStore.currentEmpleado.id_centro
      }
      this.editMode = false
      this.validationErrors = {}
    },

    async saveEmpleado() {
      try {
        const { isValid, errors } = await validateEmpleado(this.empleadosStore.currentEmpleado)

        if (!isValid) {
          this.validationErrors = errors
          const firstError = Object.values(errors)[0]
          this.notificationStore.error(firstError, "Error de validación")
          return
        }

        this.validationErrors = {}

        const updatedEmpleado = await this.empleadosStore.updateEmpleado(
            this.empleadoId,
            this.empleadosStore.currentEmpleado
        )

        if (updatedEmpleado) {
          this.originalEmpleado = JSON.parse(JSON.stringify(updatedEmpleado))
          this.editMode = false
          this.notificationStore.success(
              `¡Empleado modificado correctamente! Los datos de ${updatedEmpleado.nombre} ${updatedEmpleado.apellidos} han sido actualizados.`,
              "Empleado actualizado"
          )
        }
      } catch (error) {
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al guardar los cambios. Por favor, inténtelo de nuevo.",
            "Error al actualizar"
        )
      }
    },

    mostrarDetallesDocumento(documento) {
      this.documentoSeleccionado = documento
      this.showDocumentModal = true
    },

    cerrarModalDocumento() {
      this.showDocumentModal = false
      this.documentoSeleccionado = null
    },

    editarDocumento(documento) {
      this.cerrarModalDocumento()
    },

    async previsualizarDocumento(documento) {
      if (!this.canViewDocuments) {
        this.notificationStore.error('No tiene permisos para ver documentos', 'Error de permisos')
        return
      }

      if (!documento) return

      this.documentoPreview = documento
      this.cargandoPreview = true
      this.errorPreview = null
      this.urlPreview = null

      try {
        const url = await this.documentosStore.previewDocumento(documento.id_documento)

        if (!url) {
          throw new Error("No se pudo generar la URL de previsualización")
        }

        this.urlPreview = url
      } catch (error) {
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

        this.errorPreview = mensajeError
        this.notificationStore.warning(this.errorPreview, "Error de previsualización")
      } finally {
        this.cargandoPreview = false
      }
    },

    cerrarPreview() {
      if (this.urlPreview) {
        URL.revokeObjectURL(this.urlPreview)
      }
      this.documentoPreview = null
      this.urlPreview = null
      this.errorPreview = null
    },

    async descargarDocumento(documento) {
      if (!this.canViewDocuments) {
        this.notificationStore.error('No tiene permisos para descargar documentos', 'Error de permisos')
        return
      }

      if (!documento) return

      try {
        await this.documentosStore.downloadDocumento(documento.id_documento)
      } catch (error) {
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al descargar el documento",
            "Error al descargar"
        )
      }
    },

    async confirmDeleteEmpleado() {
      try {
        const success = await this.empleadosStore.deleteEmpleado(this.empleadoId)

        if (success) {
          this.showDeleteModal = false
          this.notificationStore.success("El empleado ha sido eliminado correctamente.", "Empleado eliminado")
          this.$router.push("/empleados")
        } else {
          this.notificationStore.error(
              "Ha ocurrido un error al eliminar el empleado. Por favor, inténtelo de nuevo.",
              "Error al eliminar"
          )
        }
      } catch (error) {
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al eliminar el empleado. Por favor, inténtelo de nuevo.",
            "Error al eliminar"
        )
      }
    },

    async toggleEmpleadoStatus() {
      try {
        const newStatus = !this.empleadosStore.currentEmpleado.activo
        const success = await this.empleadosStore.changeEmpleadoStatus(this.empleadoId, newStatus)

        if (success) {
          this.empleadosStore.currentEmpleado.activo = newStatus
          this.originalEmpleado = JSON.parse(JSON.stringify(this.empleadosStore.currentEmpleado))

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
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al cambiar el estado del empleado. Por favor, inténtelo de nuevo.",
            "Error al cambiar estado"
        )
      }
    },

    async loadFormaciones() {
      if (!this.empleadoId || !this.canViewFormacion) return
      try {
        await this.formacionesStore.fetchFormacionesByEmpleado(this.empleadoId)
      } catch (error) {
      }
    },

    closeFormacionModal() {
      this.showFormacionModal = false
      this.formacionForm = {
        nombre: '',
        es_interna: false,
        fecha_inicio: '',
        fecha_fin: ''
      }
      this.formacionValidationErrors = {}
    },

    editFormacion(formacion) {
      this.formacionForm = {
        id_formacion: formacion.id_formacion,
        nombre: formacion.nombre,
        es_interna: formacion.es_interna,
        fecha_inicio: formacion.fecha_inicio,
        fecha_fin: formacion.fecha_fin || ''
      }
      this.showFormacionModal = true
    },

    async saveFormacion(formacion) {
      if (!this.canEditFormacion) {
        this.notificationStore.error('No tiene permisos para editar formaciones', 'Error de permisos')
        return
      }

      this.savingFormacion = true
      this.formacionValidationErrors = {}

      try {
        const formacionData = {
          ...formacion,
          id_empleado: this.empleadoId
        }

        let result
        if (formacionData.id_formacion) {
          result = await this.formacionesStore.updateFormacion(formacionData.id_formacion, formacionData)
        } else {
          result = await this.formacionesStore.createFormacion(formacionData)
        }

        if (result) {
          await this.loadFormaciones()
          this.closeFormacionModal()
          this.notificationStore.success(
              "La formación ha sido guardada correctamente.",
              "Formación guardada"
          )
        }
      } catch (error) {
        if (error.response?.data?.errors) {
          this.formacionValidationErrors = error.response.data.errors
        } else {
          this.notificationStore.error(
              error.message || "Ha ocurrido un error al guardar la formación",
              "Error"
          )
        }
      } finally {
        this.savingFormacion = false
      }
    },

    deleteFormacion(formacion) {
      this.formacionToDelete = formacion
      this.showDeleteFormacionModal = true
    },

    async confirmDeleteFormacion() {
      if (!this.canEditFormacion) {
        this.notificationStore.error('No tiene permisos para eliminar formaciones', 'Error de permisos')
        return
      }

      this.deletingFormacion = true

      try {
        const success = await this.formacionesStore.deleteFormacion(this.formacionToDelete.id_formacion)

        if (success) {
          await this.loadFormaciones()
          this.showDeleteFormacionModal = false
          this.formacionToDelete = null
          this.notificationStore.success(
              "La formación ha sido eliminada correctamente.",
              "Formación eliminada"
          )
        }
      } catch (error) {
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al eliminar la formación",
            "Error"
        )
      } finally {
        this.deletingFormacion = false
      }
    },

    async loadAusencias() {
      if (!this.empleadoId || !this.canViewAusencias) return
      try {
        await this.ausenciasStore.fetchAusenciasByEmpleado(this.empleadoId)
      } catch (error) {
      }
    },

    async loadTiposAusencia() {
      if (!this.canViewAusencias) return
      try {
        await this.tiposAusenciaStore.fetchTiposAusencia()
      } catch (error) {
      }
    },

    closeAusenciaModal() {
      this.showAusenciaModal = false
      this.ausenciaForm = {
        id_tipo_ausencia: null,
        fecha_inicio: '',
        fecha_fin: '',
        id_empleado: null
      }
      this.ausenciaValidationErrors = {}
    },

    editAusencia(ausencia) {
      this.ausenciaForm = {
        id_ausencia: ausencia.id_ausencia,
        id_tipo_ausencia: ausencia.id_tipo_ausencia,
        fecha_inicio: ausencia.fecha_inicio,
        fecha_fin: ausencia.fecha_fin,
        id_empleado: this.empleadoId
      }
      this.showAusenciaModal = true
    },

    async saveAusencia(ausencia) {
      if (!this.canEditAusencias) {
        this.notificationStore.error('No tiene permisos para editar ausencias', 'Error de permisos')
        return
      }

      this.savingAusencia = true
      this.ausenciaValidationErrors = {}

      try {
        const ausenciaData = {
          ...ausencia,
          id_empleado: this.empleadoId
        }

        let result
        if (ausenciaData.id_ausencia) {
          result = await this.ausenciasStore.updateAusencia(ausenciaData.id_ausencia, ausenciaData)
        } else {
          result = await this.ausenciasStore.createAusencia(ausenciaData)
        }

        if (result) {
          await this.loadAusencias()
          this.closeAusenciaModal()
          this.notificationStore.success(
              "La ausencia ha sido guardada correctamente.",
              "Ausencia guardada"
          )
        }
      } catch (error) {
        if (error.response?.data?.errors) {
          this.ausenciaValidationErrors = error.response.data.errors
        } else {
          this.notificationStore.error(
              error.message || "Ha ocurrido un error al guardar la ausencia",
              "Error"
          )
        }
      } finally {
        this.savingAusencia = false
      }
    },

    handleAusenciaValidationError(error) {
      if (error.type === 'solapamiento') {
        this.ausenciaValidationErrors = {
          general: `Error: ${error.message}`
        }
      } else if (error.type === 'fecha') {
        this.ausenciaValidationErrors = {
          fecha_fin: error.message
        }
      } else {
        this.ausenciaValidationErrors = {
          general: error.message
        }
      }
    },

    deleteAusencia(ausencia) {
      this.ausenciaToDelete = ausencia
      this.showDeleteAusenciaModal = true
    },

    async confirmDeleteAusencia() {
      if (!this.canEditAusencias) {
        this.notificationStore.error('No tiene permisos para eliminar ausencias', 'Error de permisos')
        return
      }

      this.deletingAusencia = true

      try {
        const success = await this.ausenciasStore.deleteAusencia(this.ausenciaToDelete.id_ausencia)

        if (success) {
          await this.loadAusencias()
          this.showDeleteAusenciaModal = false
          this.ausenciaToDelete = null
          this.notificationStore.success(
              "La ausencia ha sido eliminada correctamente.",
              "Ausencia eliminada"
          )
        }
      } catch (error) {
        this.notificationStore.error(
            error.message || "Ha ocurrido un error al eliminar la ausencia",
            "Error"
        )
      } finally {
        this.deletingAusencia = false
      }
    },

    getTipoAusenciaNombre(idTipoAusencia) {
      if (!idTipoAusencia) return "Sin especificar"

      const idNum = parseInt(idTipoAusencia)
      const tipo = this.tiposAusenciaStore.getTipoAusenciaById(idNum)

      if (tipo) {
        return tipo.nombre
      }

      if (!this.tipoAusenciaEnCarga[idNum]) {
        this.tipoAusenciaEnCarga[idNum] = true
        this.cargarTipoAusencia(idNum)
        return "Cargando..."
      }

      return "Cargando..."
    },

    async cargarTipoAusencia(id) {
      if (!id) return

      try {
        await this.tiposAusenciaStore.getTipoAusencia(id)
      } catch (error) {
      } finally {
        this.tipoAusenciaEnCarga[id] = false
      }
    },

    async loadContratos() {
      if (!this.empleadoId || !this.canViewContratos) return
      try {
        await this.contratosStore.fetchContratosByEmpleado(this.empleadoId)
      } catch (error) {
      }
    },

    async loadTiposContrato() {
      if (!this.canViewContratos) return
      try {
        await this.tiposContratoStore.fetchTiposContrato()
      } catch (error) {
      }
    },

    async loadEmpresas() {
      if (!this.canViewContratos) return
      try {
        await this.empresasStore.fetchEmpresas()
      } catch (error) {
      }
    },

    async loadConvenios() {
      if (!this.canViewContratos) return
      try {
        await this.conveniosStore.fetchConvenios()
      } catch (error) {
      }
    },

    async handleContratosRefresh(params = {}) {
      try {
        await this.contratosStore.fetchContratosByEmpleado(this.empleadoId, params)
      } catch (error) {
      }
    }
  }
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

.tab-content {
  flex: 1;
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
}

.btn-danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-danger:hover {
  background-color: #fecaca;
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

.warning-text {
  color: #dc2626 !important;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-weight: 500;
  border-left: 4px solid #dc2626;
  margin-bottom: 1rem;
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
}
</style>
