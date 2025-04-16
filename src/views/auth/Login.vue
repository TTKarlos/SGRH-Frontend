<template>
  <div class="auth-layout">
    <div class="login-page">
      <div class="login-image-section">
        <div class="login-overlay">
          <div class="welcome-text">
            <h1>Bienvenido al Sistema de SGRH</h1>
            <p>Gestione su personal de manera eficiente y organizada</p>
          </div>
        </div>
      </div>
      <div class="login-form-section">
        <div class="login-container">
          <div class="login-logo">
            <img src="../../assets/images/logo.png" alt="Logo">
          </div>
          <LoginForm />
          <div class="login-footer">
            <p>© {{ currentYear }} Sistema SGRH. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import LoginForm from "../../components/auth/LoginForm.vue";

export default {
  name: "Login",
  components: {
    LoginForm,
  },
  setup() {
    const currentYear = computed(() => new Date().getFullYear());

    return {
      currentYear,
    };
  },
};
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.login-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.login-image-section {
  flex: 0 0 60%;
  position: relative;
  background: linear-gradient(to right, #7f1d1d, #dc2626);
  display: none;
}

.login-image-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('../../assets/images/login.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  mix-blend-mode: multiply;
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 3;
}

.welcome-text {
  color: white;
  text-align: center;
  max-width: 600px;
}

.welcome-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.welcome-text p {
  font-size: 1.25rem;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.login-form-section {
  flex: 0 0 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
}

.login-container {
  width: 100%;
  max-width: 480px;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-logo {
  margin-bottom: 2rem;
  text-align: center;
}

.login-logo img {
  height: 60px;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  width: 100%;
}

@media (min-width: 1024px) {
  .login-image-section {
    display: block;
  }
}

@media (max-width: 1023px) {
  .login-form-section {
    flex: 0 0 100%;
  }

  .login-container {
    padding: 2rem;
  }
}

@media (max-width: 640px) {
  .login-container {
    padding: 1.5rem;
  }
}
</style>