<template>
  <div class="form-group" :class="{ 'has-error': error }">
    <label :for="id">{{ label }}</label>
    <div class="input-wrapper">
      <i v-if="icon" class="input-icon">
        <component :is="icon" size="18" />
      </i>
      <input
          :id="id"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :type="type"
          class="form-control"
          :placeholder="placeholder"
          :disabled="disabled"
          v-bind="$attrs"
      />
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: 'FormInput',

  props: {
    id: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'text'
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
    },
    icon: {
      type: [Object, Function],
      default: null
    }
  },

  emits: ['update:modelValue', 'input']
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
</style>