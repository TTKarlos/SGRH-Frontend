<template>
  <div class="form-options">
    <div class="remember-me">
      <input
          type="checkbox"
          id="remember"
          :checked="remember"
          @change="$emit('update:remember', $event.target.checked)"
      />
      <label for="remember">Recordarme</label>
    </div>
    <a href="#" class="forgot-password">¿Olvidó su contraseña?</a>
  </div>
</template>

<script>
export default {
  name: 'FormOptions',

  props: {
    remember: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:remember']
};
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
  cursor: pointer;
}

.remember-me label {
  cursor: pointer;
  color: #4b5563;
}

.forgot-password {
  color: #4361ee;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #3a56d4;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>

