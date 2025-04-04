<template>
  <div class="form-group" :class="{ 'has-error': error }">
    <label :for="id">{{ label }}</label>
    <div class="input-wrapper">
      <i class="input-icon">
        <Lock size="18" />
      </i>
      <input
          :id="id"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :type="showPassword ? 'text' : 'password'"
          class="form-control"
          :placeholder="placeholder"
          :disabled="disabled"
          v-bind="$attrs"
      />
      <button
          type="button"
          class="toggle-password"
          @click="togglePasswordVisibility"
          tabindex="-1"
      >
        <Eye v-if="!showPassword" size="18" />
        <EyeOff v-else size="18" />
      </button>
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script>
import { Lock, Eye, EyeOff } from 'lucide-vue-next';

export default {
  name: 'PasswordInput',

  components: {
    Lock,
    Eye,
    EyeOff
  },

  props: {
    id: {
      type: String,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'input'],

  data() {
    return {
      showPassword: false
    };
  },

  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #4b5563;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.form-control {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f9fafb;
}

.form-control:focus {
  outline: none;
  border-color: #4361ee;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.has-error .form-control {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.has-error .form-control:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
}

.toggle-password:hover {
  color: #4b5563;
}
</style>

