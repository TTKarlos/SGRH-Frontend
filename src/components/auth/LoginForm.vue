<template>
  <div class="login-form">
    <h2 class="form-title">Iniciar Sesión</h2>

    <form @submit.prevent="handleLogin">
      <FormInput
          id="email"
          v-model="credentials.email"
          label="Email"
          type="email"
          placeholder="Ingresar Email"
          :icon="Mail"
          required
      />

      <PasswordInput
          id="password"
          v-model="credentials.password"
          label="Contraseña"
          placeholder="Ingresar su contraseña"
          required
      />

      <FormOptions v-model:remember="credentials.remember" />

      <AlertMessage
          v-if="localError"
          type="danger"
          :message="localError"
      />

      <SubmitButton
          :loading="loading"
          text="Iniciar Sesión"
      />
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import FormInput from './FormInput.vue';
import PasswordInput from './PasswordInput.vue';
import FormOptions from './FormOptions.vue';
import AlertMessage from './AlertMessage.vue';
import SubmitButton from './SubmitButton.vue';
import { Mail } from 'lucide-vue-next';
import authApi from '../../api/auth.api';
import { setAuthToken } from '../../api/axios';

export default {
  name: 'LoginForm',
  components: {
    FormInput,
    PasswordInput,
    FormOptions,
    AlertMessage,
    SubmitButton
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const localError = ref(null);
    const loading = ref(false);

    const credentials = ref({
      email: '',
      password: '',
      remember: false
    });

    const handleLogin = async () => {
      localError.value = null;
      loading.value = true;

      try {
        const response = await authApi.login(credentials.value);
        const data = response.data;

        if (data.success) {
          const userData = data.data.user;
          const userToken = userData.token;

          const userDataWithoutToken = { ...userData };
          delete userDataWithoutToken.token;

          setAuthToken(userToken);

          authStore.setUser(userDataWithoutToken);
          authStore.setToken(userToken);

          if (credentials.value.remember) {
            const expiryTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
            localStorage.setItem("sessionExpiry", expiryTime.toString());
          } else {
            const expiryTime = new Date().getTime() + 60 * 60 * 1000;
            localStorage.setItem("sessionExpiry", expiryTime.toString());
          }

          router.push({ name: 'dashboard' });
          return true;
        } else {
          localError.value = data.message || 'Error de autenticación';
          return false;
        }
      } catch (error) {
        console.error('Error de login:', error);

        if (error.response) {
          localError.value = error.response.data.message || 'Email o contraseña incorrectos';
        } else if (error.request) {
          localError.value = 'No se pudo conectar con el servidor';
        } else {
          localError.value = 'Error al intentar iniciar sesión';
        }

        return false;
      } finally {
        loading.value = false;
      }
    };

    return {
      credentials,
      authStore,
      localError,
      loading,
      handleLogin,
      Mail
    };
  }
}
</script>

<style scoped>
.login-form {
  background-color: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2rem;
  text-align: center;
}

@media (max-width: 640px) {
  .login-form {
    padding: 1.5rem;
    box-shadow: none;
  }

  .form-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
}
</style>