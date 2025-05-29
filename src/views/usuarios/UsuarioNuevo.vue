<template>
  <DefaultLayout>
    <div class="usuario-nuevo-page">
      <div class="page-header">
        <div class="header-left">
          <button @click="goBack" class="btn-back">
            <ArrowLeft size="20" />
            <span>Volver</span>
          </button>
          <h1>Nuevo Usuario</h1>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Información del Usuario</h2>
          <p>Completa el formulario para crear un nuevo usuario en el sistema.</p>
        </div>

        <div class="card-body">
          <form @submit.prevent="guardarUsuario" class="form">
            <div class="form-section">
              <h3>Datos personales</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="nombre">Nombre *</label>
                  <input
                      id="nombre"
                      v-model="usuario.nombre"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.nombre }"
                      placeholder="Nombre del usuario"
                      required
                  />
                  <div v-if="errors.nombre" class="invalid-feedback">
                    {{ errors.nombre }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="apellidos">Apellidos *</label>
                  <input
                      id="apellidos"
                      v-model="usuario.apellidos"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.apellidos }"
                      placeholder="Apellidos del usuario"
                      required
                  />
                  <div v-if="errors.apellidos" class="invalid-feedback">
                    {{ errors.apellidos }}
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="email">Email *</label>
                  <input
                      id="email"
                      v-model="usuario.email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': errors.email }"
                      placeholder="correo@ejemplo.com"
                      required
                  />
                  <div v-if="errors.email" class="invalid-feedback">
                    {{ errors.email }}
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Datos de la cuenta</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="nombre_usuario">Nombre de usuario *</label>
                  <input
                      id="nombre_usuario"
                      v-model="usuario.nombre_usuario"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.nombre_usuario }"
                      placeholder="nombre.usuario"
                      required
                  />
                  <div v-if="errors.nombre_usuario" class="invalid-feedback">
                    {{ errors.nombre_usuario }}
                  </div>
                  <small class="form-text text-muted">
                    Solo puede contener letras, números, puntos, guiones y guiones bajos.
                  </small>
                </div>

                <div class="form-group">
                  <label for="password_hash">Contraseña *</label>
                  <PasswordInput
                      id="password_hash"
                      v-model="usuario.password_hash"
                      label=""
                      placeholder="Contraseña"
                      :error="errors.password_hash"
                      helpText="Debe tener al menos 8 caracteres."
                      required
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="id_rol">Rol *</label>
                  <select
                      id="id_rol"
                      v-model="usuario.id_rol"
                      class="form-control"
                      :class="{ 'is-invalid': errors.id_rol }"
                      required
                  >
                    <option value="">Selecciona un rol</option>
                    <option v-for="rol in roles" :key="rol.id_rol" :value="rol.id_rol">
                      {{ rol.nombre }}
                    </option>
                    <template v-if="roles.length === 0">
                      <option value="1">Administrador</option>
                      <option value="2">Gerente</option>
                      <option value="3">RRHH</option>
                      <option value="4">Usuario</option>
                    </template>
                  </select>
                  <div v-if="errors.id_rol" class="invalid-feedback">
                    {{ errors.id_rol }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="activo">Estado</label>
                  <div class="toggle-container">
                    <label class="toggle">
                      <input
                          id="activo"
                          v-model="usuario.activo"
                          type="checkbox"
                      />
                      <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">{{ usuario.activo ? 'Activo' : 'Inactivo' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button
                  type="button"
                  @click="goBack"
                  class="btn btn-outline-secondary"
                  :disabled="loading"
              >
                Cancelar
              </button>
              <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading"
              >
                <Loader v-if="loading" size="16" class="btn-icon spinner" />
                <Save v-else size="16" class="btn-icon" />
                Guardar Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUsuariosStore } from '../../stores/usuarios';
import { useRolesStore } from '../../stores/roles';
import { useNotificationStore } from '../../stores/notification';
import { validateCreateUser } from '../../validation/usuarioSchema';
import { storeToRefs } from 'pinia';
import DefaultLayout from '../../layouts/DefaultLayout.vue';
import PasswordInput from '../../components/auth/PasswordInput.vue';
import {
  ArrowLeft,
  Save,
  Loader,
  Eye,
  EyeOff
} from 'lucide-vue-next';

export default {
  name: 'UsuarioNuevo',
  components: {
    DefaultLayout,
    PasswordInput,
    ArrowLeft,
    Save,
    Loader,
    Eye,
    EyeOff
  },
  setup() {
    const router = useRouter();
    const usuariosStore = useUsuariosStore();
    const rolesStore = useRolesStore();
    const notificationStore = useNotificationStore();
    const { roles } = storeToRefs(rolesStore);

    const loading = ref(false);
    const showPassword = ref(false);

    const usuario = reactive({
      nombre: '',
      apellidos: '',
      email: '',
      nombre_usuario: '',
      password_hash: '',
      id_rol: '',
      activo: true
    });

    const errors = reactive({
      nombre: '',
      apellidos: '',
      email: '',
      nombre_usuario: '',
      password_hash: '',
      id_rol: ''
    });

    onMounted(async () => {
      if (roles.value.length === 0) {
        await rolesStore.fetchRoles();
      }
    });

    const validateForm = async () => {
      if (usuario.id_rol) {
        usuario.id_rol = Number(usuario.id_rol);
      }

      const result = await validateCreateUser(usuario);

      if (!result.isValid) {
        Object.assign(errors, result.errors);
        return false;
      }

      Object.keys(errors).forEach(key => {
        errors[key] = '';
      });

      return true;
    };

    const guardarUsuario = async () => {
      const isValid = await validateForm();

      if (!isValid) {
        notificationStore.error('Por favor, corrige los errores en el formulario', 'Error de validación');
        return;
      }

      loading.value = true;

      try {
        const result = await usuariosStore.createUsuario(usuario);

        if (result) {
          notificationStore.success('Usuario creado correctamente', 'Éxito');
          router.push('/usuarios');
        } else {
          notificationStore.error('No se pudo crear el usuario', 'Error');
        }
      } catch (err) {
        notificationStore.error(err.message || 'Error al crear el usuario', 'Error');
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.push('/usuarios');
    };

    return {
      usuario,
      errors,
      loading,
      showPassword,
      guardarUsuario,
      goBack,
      roles
    };
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.usuario-nuevo-page {
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

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  background-color: transparent;
  color: #4b5563;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

.card {
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fafafa;
}

.card-header h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.card-header p {
  margin: 0;
  color: #6b7280;
}

.card-body {
  padding: 1.25rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-section h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-control.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  font-size: 0.875rem;
  color: #dc2626;
}

.form-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: .4s;
  border-radius: 1.5rem;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 1.25rem;
  width: 1.25rem;
  left: 0.125rem;
  bottom: 0.125rem;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #dc2626;
}

input:checked + .toggle-slider:before {
  transform: translateX(1.5rem);
}

.toggle-label {
  font-size: 0.875rem;
  color: #374151;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
  border: none;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-primary:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-outline-secondary {
  background-color: transparent;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.btn-outline-secondary:hover {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.btn-icon {
  flex-shrink: 0;
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

@media (max-width: 767px) {
  .usuario-nuevo-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>