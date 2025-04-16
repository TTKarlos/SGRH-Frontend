<template>
  <div class="form-group" :class="{ 'has-error': error }">
    <label :for="id">{{ label }}</label>
    <div class="input-wrapper">
      <i class="input-icon">
        <Lock size="18" />
      </i>
      <input
          :id="id"
          :type="showPassword ? 'text' : 'password'"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :placeholder="placeholder"
          :disabled="disabled"
          class="form-control"
          :class="{ 'is-invalid': error }"
      />
      <button
          type="button"
          class="btn-toggle-password"
          @click="togglePasswordVisibility"
          :disabled="disabled"
      >
        <Eye v-if="!showPassword" size="18" />
        <EyeOff v-else size="18" />
      </button>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref } from "vue"
import { Eye, EyeOff, Lock } from "lucide-vue-next"

export default {
  name: "PasswordInput",

  components: {
    Eye,
    EyeOff,
    Lock
  },

  props: {
    id: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: "Ingresar su contraseña",
    },
    error: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["update:modelValue", "input"],

  setup() {
    const showPassword = ref(false)

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    return {
      showPassword,
      togglePasswordVisibility,
    }
  },
}
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
  z-index: 2;
}

.form-control {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f9fafb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-control:focus {
  outline: none;
  border-color: #dc2626;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-control.is-invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.btn-toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-toggle-password:hover {
  color: #4b5563;
  background-color: #f3f4f6;
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.has-error .form-control {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.has-error .form-control:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
</style>