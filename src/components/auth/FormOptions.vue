<template>
  <div class="form-options">
    <div class="remember-me">
      <input
          type="checkbox"
          id="remember"
          :checked="modelValue"
          @change="$emit('update:remember', $event.target.checked)"
      />
      <label for="remember">Recordarme</label>
    </div>
    <div class="forgot-password">
      <router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormOptions',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:remember']
}
</script>

<style scoped>
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input[type="checkbox"] {
  margin-right: 0.5rem;
}

.forgot-password a {
  color: #dc2626;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password a:hover {
  color: #b91c1c;
  text-decoration: underline;
}
</style>