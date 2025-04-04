<template>
  <button
      type="submit"
      class="btn btn-primary"
      :disabled="loading"
  >
    <Loader v-if="loading" size="16" class="spinner" />
    <span v-else>{{ text }}</span>
  </button>
</template>

<script>
import { Loader } from 'lucide-vue-next';

export default {
  name: 'SubmitButton',

  components: {
    Loader
  },

  props: {
    loading: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: 'Enviar'
    }
  }
};
</script>

<style scoped>
.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 3.25rem;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3a56d4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.15);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
</style>

