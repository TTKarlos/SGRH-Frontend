<template>
  <div class="login-page">
    <!-- Sección de imagen (70%) -->
    <div class="login-image-section">
      <div class="login-overlay">
        <div class="welcome-text">
          <h1>Bienvenido al Sistema de SGRH</h1>
          <p>Gestione su personal de manera eficiente y organizada</p>
        </div>
      </div>
    </div>

    <!-- Sección de formulario (30%) -->
    <div class="login-form-section">
      <div class="login-container">
        <div class="login-logo">
          <img src="../assets/images/logo.png" alt="Logo" />
        </div>

        <slot></slot>

        <div class="login-footer">
          <p>&copy; {{ currentYear }} Sistema SGRH. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AuthLayout",
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
  },
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  width: 100%;
}

.login-image-section {
  flex: 7;
  background-image: url('../assets/images/login.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  display: none;
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(200deg, rgba(255, 0, 0, 0.8), rgba(56, 17, 17, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.welcome-text {
  color: white;
  text-align: center;
  max-width: 600px;
}

.welcome-text h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.welcome-text p {
  font-size: 1.25rem;
  opacity: 0.9;
}

.login-form-section {
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fb;
  padding: 2rem;
  width: 100%;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-logo {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo img {
  max-width: 150px;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Responsive */
@media (min-width: 1024px) {
  .login-image-section {
    display: block;
  }
}

@media (max-width: 1023px) {
  .login-page {
    flex-direction: column;
  }

  .login-image-section {
    display: block;
    flex: none;
    height: 30vh;
  }

  .login-form-section {
    flex: none;
    padding: 2rem 1rem;
  }
}
</style>