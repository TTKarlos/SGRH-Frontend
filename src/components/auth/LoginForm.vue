<template>
  <div class="login-form">
    <h1 class="title">Iniciar Sesión</h1>

    <form @submit.prevent="handleSubmit">
      <FormInput
          id="email"
          v-model="formData.email"
          type="email"
          label="Email"
          placeholder="Ingrese su email"
          :error="errors.email"
          :disabled="authStore.loading"
          @input="clearFieldError('email')"
          autocomplete="email"
          :icon="Mail"
      />

      <PasswordInput
          id="password"
          v-model="formData.password"
          label="Contraseña"
          placeholder="Ingrese su contraseña"
          :error="errors.password"
          :disabled="authStore.loading"
          @input="clearFieldError('password')"
          autocomplete="current-password"
      />

      <FormOptions
          :remember="rememberMe"
          @update:remember="rememberMe = $event"
      />

      <div v-if="errors.auth || authStore.error" class="alert alert-danger">
        <span>{{ errors.auth || authStore.error }}</span>
      </div>

      <SubmitButton
          :loading="authStore.loading || isSubmitting"
          text="Iniciar Sesión"
      />
    </form>
  </div>
</template>

<script>
import { useAuthStore } from '../../stores/auth';
import { Mail } from 'lucide-vue-next';
import FormInput from './FormInput.vue';
import PasswordInput from './PasswordInput.vue';
import FormOptions from './FormOptions.vue';
import SubmitButton from './SubmitButton.vue';
import { validateEmail } from '../../utils/validators';

export default {
  name: 'LoginForm',

  components: {
    FormInput,
    PasswordInput,
    FormOptions,
    SubmitButton
  },

  data() {
    return {
      Mail,
      formData: {
        email: '',
        password: ''
      },
      errors: {},
      rememberMe: false,
      isSubmitting: false
    };
  },

  computed: {
    authStore() {
      return useAuthStore();
    }
  },

  methods: {
    validateForm() {
      const newErrors = {};

      const emailError = validateEmail(this.formData.email);

      let passwordError = null;
      if (!this.formData.password) {
        passwordError = 'La contraseña es requerida';
      }

      if (emailError || passwordError) {
        newErrors.auth = 'Email o contraseña incorrectos';

        if (emailError) newErrors.email = emailError;
        if (passwordError) newErrors.password = passwordError;
      }

      Object.assign(this.errors, newErrors);

      return Object.keys(newErrors).length === 0;
    },

    clearFieldError(field) {
      if (this.errors[field]) {
        delete this.errors[field];
      }
      if (this.errors.auth) {
        delete this.errors.auth;
      }
    },

    async handleSubmit() {
      if (this.isSubmitting || this.authStore.loading) return;

      this.isSubmitting = true;

      if (this.validateForm()) {
        try {
          const success = await this.authStore.login({
            ...this.formData,
            remember: this.rememberMe
          });

          if (success) {
            this.$router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error durante el inicio de sesión:', error);
        } finally {
          this.isSubmitting = false;
        }
      } else {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  background-color: #fff;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
}

@media (max-width: 480px) {
  .login-form {
    padding: 1.5rem;
    max-width: 100%;
    margin: 0 1rem;
  }
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.alert-danger {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fee2e2;
}

.alert-icon {
  margin-right: 0.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
</style>

