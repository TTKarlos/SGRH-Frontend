<template>
  <DefaultLayout>
    <div class="empleado-nuevo">
      <div class="page-header">
        <div class="header-left">
          <button @click="goBack" class="btn btn-icon btn-ghost">
            <ArrowLeft size="18" />
            <span>Volver</span>
          </button>
          <h1>Nuevo Empleado</h1>
        </div>

        <div class="header-actions">
          <button @click="saveEmpleado" class="btn btn-success" :disabled="empleadosStore.loading">
            <Save size="18" class="btn-icon" />
            Guardar
          </button>

          <button @click="goBack" class="btn btn-secondary">
            <X size="18" class="btn-icon" />
            Cancelar
          </button>
        </div>
      </div>

      <div v-if="empleadosStore.loading" class="loading-container">
        <LoadingSpinner message="Guardando empleado..." />
      </div>

      <div v-else class="empleado-content">
        <div class="tabs">
          <button
              class="tab-button"
              :class="{ active: activeTab === 'personal', 'has-errors': hasPersonalErrors }"
              @click="activeTab = 'personal'"
          >
            <User size="18" class="tab-icon" />
            Datos Personales
            <span v-if="hasPersonalErrors" class="error-indicator">!</span>
          </button>
          <button
              class="tab-button"
              :class="{ active: activeTab === 'laboral', 'has-errors': hasLaboralErrors }"
              @click="activeTab = 'laboral'"
          >
            <Briefcase size="18" class="tab-icon" />
            Información Laboral
            <span v-if="hasLaboralErrors" class="error-indicator">!</span>
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
                    <label>Nombre <span class="required">*</span></label>
                    <input
                        v-model="empleado.nombre"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.nombre }"
                        @blur="validateField('nombre')"
                        @input="clearFieldError('nombre')"
                        placeholder="Ingrese el nombre"
                    />
                    <div v-if="validationErrors.nombre" class="invalid-feedback">
                      {{ validationErrors.nombre }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Apellidos <span class="required">*</span></label>
                    <input
                        v-model="empleado.apellidos"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.apellidos }"
                        @blur="validateField('apellidos')"
                        @input="clearFieldError('apellidos')"
                        placeholder="Ingrese los apellidos"
                    />
                    <div v-if="validationErrors.apellidos" class="invalid-feedback">
                      {{ validationErrors.apellidos }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>DNI/NIE <span class="required">*</span></label>
                    <input
                        v-model="empleado.dni_nie"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.dni_nie }"
                        @blur="validateField('dni_nie')"
                        @input="clearFieldError('dni_nie')"
                        placeholder="Ej: 12345678A o X1234567L"
                        maxlength="9"
                    />
                    <div v-if="validationErrors.dni_nie" class="invalid-feedback">
                      {{ validationErrors.dni_nie }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Fecha de Nacimiento <span class="required">*</span></label>
                    <input
                        v-model="empleado.fecha_nacimiento"
                        type="date"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.fecha_nacimiento }"
                        @blur="validateField('fecha_nacimiento')"
                        @change="clearFieldError('fecha_nacimiento')"
                        :max="maxBirthDate"
                    />
                    <div v-if="validationErrors.fecha_nacimiento" class="invalid-feedback">
                      {{ validationErrors.fecha_nacimiento }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Estado Civil</label>
                    <select
                        v-model="empleado.estado_civil"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.estado_civil }"
                        @blur="validateField('estado_civil')"
                        @change="clearFieldError('estado_civil')"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Soltero/a">Soltero/a</option>
                      <option value="Casado/a">Casado/a</option>
                      <option value="Divorciado/a">Divorciado/a</option>
                      <option value="Viudo/a">Viudo/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <div v-if="validationErrors.estado_civil" class="invalid-feedback">
                      {{ validationErrors.estado_civil }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Dirección</label>
                    <textarea
                        v-model="empleado.direccion"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.direccion }"
                        @blur="validateField('direccion')"
                        @input="clearFieldError('direccion')"
                        placeholder="Ingrese la dirección completa"
                        maxlength="500"
                    ></textarea>
                    <div v-if="validationErrors.direccion" class="invalid-feedback">
                      {{ validationErrors.direccion }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Teléfono</label>
                    <input
                        v-model="empleado.telefono"
                        type="tel"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.telefono }"
                        @blur="validateField('telefono')"
                        @input="clearFieldError('telefono')"
                        placeholder="Ej: +34 123 456 789"
                        maxlength="20"
                    />
                    <div v-if="validationErrors.telefono" class="invalid-feedback">
                      {{ validationErrors.telefono }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Email</label>
                    <input
                        v-model="empleado.email"
                        type="email"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.email }"
                        @blur="validateField('email')"
                        @input="clearFieldError('email')"
                        placeholder="ejemplo@correo.com"
                    />
                    <div v-if="validationErrors.email" class="invalid-feedback">
                      {{ validationErrors.email }}
                    </div>
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
                    <label>Puesto Actual <span class="required">*</span></label>
                    <input
                        v-model="empleado.puesto_actual"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.puesto_actual }"
                        @blur="validateField('puesto_actual')"
                        @input="clearFieldError('puesto_actual')"
                        placeholder="Ej: Desarrollador, Analista, etc."
                    />
                    <div v-if="validationErrors.puesto_actual" class="invalid-feedback">
                      {{ validationErrors.puesto_actual }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Centro</label>
                    <select
                        v-model="empleado.id_centro"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.id_centro }"
                        @change="handleCentroChange"
                        @blur="validateField('id_centro')"
                    >
                      <option :value="null">Sin centro</option>
                      <option v-for="centro in centrosStore.centros"
                              :key="centro.id_centro"
                              :value="centro.id_centro">
                        {{ centro.nombre }}
                      </option>
                    </select>
                    <div v-if="validationErrors.id_centro" class="invalid-feedback">
                      {{ validationErrors.id_centro }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Departamento</label>
                    <select
                        v-model="empleado.id_departamento"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.id_departamento }"
                        @blur="validateField('id_departamento')"
                        @change="clearFieldError('id_departamento')"
                        :disabled="!empleado.id_centro"
                    >
                      <option :value="null">Sin departamento</option>
                      <option v-for="departamento in departamentosFiltrados"
                              :key="departamento.id_departamento"
                              :value="departamento.id_departamento">
                        {{ departamento.nombre }}
                      </option>
                    </select>
                    <div v-if="validationErrors.id_departamento" class="invalid-feedback">
                      {{ validationErrors.id_departamento }}
                    </div>
                    <div v-if="!empleado.id_centro" class="form-text">
                      Seleccione un centro primero para ver los departamentos disponibles
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Fecha de Incorporación <span class="required">*</span></label>
                    <input
                        v-model="empleado.fecha_incorporacion"
                        type="date"
                        class="form-control"
                        :class="{ 'is-invalid': validationErrors.fecha_incorporacion }"
                        @blur="validateField('fecha_incorporacion')"
                        @change="clearFieldError('fecha_incorporacion')"
                        :max="maxIncorporationDate"
                    />
                    <div v-if="validationErrors.fecha_incorporacion" class="invalid-feedback">
                      {{ validationErrors.fecha_incorporacion }}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Estado</label>
                    <div class="toggle-switch">
                      <input
                          type="checkbox"
                          id="estado-switch"
                          v-model="empleado.activo"
                      />
                      <label for="estado-switch" class="toggle-label">
                        <span class="toggle-inner"></span>
                        <span class="toggle-switch-label">{{ empleado.activo ? 'Activo' : 'Inactivo' }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useEmpleadosStore } from "../../stores/empleados"
import { useNotificationStore } from "../../stores/notification"
import { useDepartamentosStore } from "../../stores/departamentos"
import { useCentrosStore } from "../../stores/centros"
import { validateEmpleado } from "../../validation/empleadoSchema"
import DefaultLayout from "../../layouts/DefaultLayout.vue"
import LoadingSpinner from "../../components/common/LoadingSpinner.vue"
import {
  User,
  Briefcase,
  ArrowLeft,
  X,
  Save,
} from "lucide-vue-next"

export default {
  name: "EmpleadoNuevo",

  components: {
    DefaultLayout,
    LoadingSpinner,
    User,
    Briefcase,
    ArrowLeft,
    X,
    Save,
  },

  setup() {
    const router = useRouter()
    const empleadosStore = useEmpleadosStore()
    const notificationStore = useNotificationStore()
    const departamentosStore = useDepartamentosStore()
    const centrosStore = useCentrosStore()
    const activeTab = ref("personal")
    const validationErrors = ref({})
    const selectedCentroId = ref(null)

    const empleado = ref({
      nombre: "",
      apellidos: "",
      dni_nie: "",
      fecha_nacimiento: "",
      estado_civil: "",
      direccion: "",
      telefono: "",
      email: "",
      puesto_actual: "",
      id_departamento: null,
      id_centro: null,
      fecha_incorporacion: new Date().toISOString().split('T')[0],
      activo: true
    })

    const departamentosFiltrados = computed(() => {
      if (!selectedCentroId.value) {
        return departamentosStore.departamentos
      }

      return departamentosStore.getDepartamentosPorCentro(selectedCentroId.value)
    })

    const maxBirthDate = computed(() => {
      const today = new Date()
      const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())
      return maxDate.toISOString().split('T')[0]
    })

    const maxIncorporationDate = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })

    const hasPersonalErrors = computed(() => {
      const personalFields = ['nombre', 'apellidos', 'dni_nie', 'fecha_nacimiento', 'estado_civil', 'direccion', 'telefono', 'email']
      return personalFields.some(field => validationErrors.value[field])
    })

    const hasLaboralErrors = computed(() => {
      const laboralFields = ['puesto_actual', 'id_departamento', 'id_centro', 'fecha_incorporacion']
      return laboralFields.some(field => validationErrors.value[field])
    })

    return {
      empleadosStore,
      notificationStore,
      departamentosStore,
      centrosStore,
      activeTab,
      validationErrors,
      empleado,
      selectedCentroId,
      departamentosFiltrados,
      maxBirthDate,
      maxIncorporationDate,
      hasPersonalErrors,
      hasLaboralErrors,
      router
    }
  },

  created() {
    this.loadDepartamentosYCentros()
  },

  methods: {
    loadDepartamentosYCentros() {
      this.departamentosStore.fetchDepartamentos()
      this.centrosStore.fetchCentros()
    },

    handleCentroChange() {
      this.selectedCentroId = this.empleado.id_centro
      this.clearFieldError('id_centro')

      if (this.empleado.id_departamento) {
        const departamentoActual = this.departamentosStore.departamentos.find(
            d => d.id_departamento === this.empleado.id_departamento
        )

        if (departamentoActual && departamentoActual.id_centro !== this.selectedCentroId) {
          this.empleado.id_departamento = null
          this.clearFieldError('id_departamento')
        }
      }
    },

    async validateField(fieldName) {
      try {
        const { isValid, errors } = await validateEmpleado(this.empleado)

        if (errors[fieldName]) {
          this.validationErrors[fieldName] = errors[fieldName]
        } else {
          delete this.validationErrors[fieldName]
        }

        switch (fieldName) {
          case 'dni_nie':
            this.validateDniNie()
            break
          case 'email':
            this.validateEmail()
            break
          case 'telefono':
            this.validateTelefono()
            break
          case 'fecha_nacimiento':
            this.validateFechaNacimiento()
            break
          case 'fecha_incorporacion':
            this.validateFechaIncorporacion()
            break
        }
      } catch (error) {
        console.error('Error en validación de campo:', error)
      }
    },

    validateDniNie() {
      const dni = this.empleado.dni_nie?.trim()
      if (!dni) return

      const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
      const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i

      if (!dniRegex.test(dni) && !nieRegex.test(dni)) {
        this.validationErrors.dni_nie = 'Formato de DNI/NIE inválido'
        return
      }

      if (dniRegex.test(dni)) {
        const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
        const number = parseInt(dni.substring(0, 8))
        const letter = dni.charAt(8).toUpperCase()
        const expectedLetter = letters.charAt(number % 23)

        if (letter !== expectedLetter) {
          this.validationErrors.dni_nie = 'La letra del DNI no es correcta'
        }
      }
    },

    validateEmail() {
      const email = this.empleado.email?.trim()
      if (!email) return

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        this.validationErrors.email = 'Formato de email inválido'
      }
    },

    validateTelefono() {
      const telefono = this.empleado.telefono?.trim()
      if (!telefono) return

      const telefonoRegex = /^[\+]?[0-9\s\-$$$$]{9,20}$/
      if (!telefonoRegex.test(telefono)) {
        this.validationErrors.telefono = 'Formato de teléfono inválido'
      }
    },

    validateFechaNacimiento() {
      const fecha = this.empleado.fecha_nacimiento
      if (!fecha) return

      const fechaNacimiento = new Date(fecha)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear()

      if (fechaNacimiento > hoy) {
        this.validationErrors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura'
      } else if (edad < 16) {
        this.validationErrors.fecha_nacimiento = 'El empleado debe tener al menos 16 años'
      } else if (edad > 100) {
        this.validationErrors.fecha_nacimiento = 'La fecha de nacimiento no es válida'
      }
    },

    validateFechaIncorporacion() {
      const fecha = this.empleado.fecha_incorporacion
      if (!fecha) return

      const fechaIncorporacion = new Date(fecha)
      const hoy = new Date()

      if (fechaIncorporacion > hoy) {
        this.validationErrors.fecha_incorporacion = 'La fecha de incorporación no puede ser futura'
      }
    },

    clearFieldError(fieldName) {
      if (this.validationErrors[fieldName]) {
        delete this.validationErrors[fieldName]
      }
    },

    goBack() {
      this.router.push("/empleados")
    },

    async saveEmpleado() {
      try {
        const { isValid, errors } = await validateEmpleado(this.empleado)

        await this.validateField('dni_nie')
        await this.validateField('email')
        await this.validateField('telefono')
        await this.validateField('fecha_nacimiento')
        await this.validateField('fecha_incorporacion')

        const allErrors = { ...errors, ...this.validationErrors }

        if (!isValid || Object.keys(allErrors).length > 0) {
          this.validationErrors = allErrors

          const firstError = Object.values(allErrors)[0]
          this.notificationStore.error(
              firstError,
              "Error de validación"
          )

          const personalFields = ['nombre', 'apellidos', 'dni_nie', 'fecha_nacimiento', 'estado_civil', 'direccion', 'telefono', 'email']
          const laboralFields = ['puesto_actual', 'id_departamento', 'id_centro', 'fecha_incorporacion']

          const errorField = Object.keys(allErrors)[0]

          if (personalFields.includes(errorField)) {
            this.activeTab = 'personal'
          } else if (laboralFields.includes(errorField)) {
            this.activeTab = 'laboral'
          }

          return
        }

        this.validationErrors = {}

        const nuevoEmpleado = await this.empleadosStore.createEmpleado(this.empleado)

        if (nuevoEmpleado) {
          this.notificationStore.success(
              `¡Empleado creado correctamente! ${nuevoEmpleado.nombre} ${nuevoEmpleado.apellidos} ha sido añadido al sistema.`,
              "Empleado creado"
          )

          this.router.push(`/empleados/${nuevoEmpleado.id_empleado}`)
        }
      } catch (error) {
        console.error("Error al crear empleado:", error)

        if (error.response?.data?.errors) {
          this.validationErrors = error.response.data.errors
        }

        this.notificationStore.error(
            error.message || "Ha ocurrido un error al crear el empleado. Por favor, inténtelo de nuevo.",
            "Error al crear"
        )
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.empleado-nuevo {
  padding: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
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
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.btn-success {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-success:hover:not(:disabled) {
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empleado-content {
  position: relative;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
}

.tab-button:hover {
  color: #4b5563;
  background-color: #f9fafb;
}

.tab-button.active {
  color: #dc2626;
  border-bottom-color: #dc2626;
}

.tab-button.has-errors {
  color: #dc2626;
}

.tab-button.has-errors:not(.active) {
  border-bottom-color: #fca5a5;
}

.error-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: #dc2626;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.tab-icon {
  margin-right: 0.5rem;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
  font-size: 0.875rem;
}

.required {
  color: #dc2626;
  margin-left: 0.25rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: white;
}

.form-control:focus {
  outline: none;
  border-color: #fca5a5;
  box-shadow: 0 0 0 3px rgba(252, 165, 165, 0.2);
}

.form-control:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-control.is-invalid {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
  font-weight: 500;
}

.form-text {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  margin-top: 0.5rem;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-inner {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #e5e7eb;
  border-radius: 34px;
  transition: .4s;
  margin-right: 10px;
}

.toggle-inner:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

input:checked + .toggle-label .toggle-inner {
  background-color: #dc2626;
}

input:checked + .toggle-label .toggle-inner:before {
  transform: translateX(26px);
}

.toggle-switch-label {
  font-size: 0.95rem;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 767px) {
  .empleado-nuevo {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  .tab-button {
    padding: 0.625rem 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
