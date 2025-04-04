<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-logo">
        <img src="../../assets/images/logo.png" alt="Logo" />
      </div>

      <login-form />
    </div>
  </div>
</template>

<script>
import LoginForm from '../../components/auth/LoginForm.vue';

export default {
  name: 'Login',

  components: {
    LoginForm
  }
}
</script>

<style>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fb;
}

.login-container {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
}

.login-logo {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo img {
  max-width: 150px;
}
</style>

