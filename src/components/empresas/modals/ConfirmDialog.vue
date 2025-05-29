<template>
  <div class="confirm-dialog-backdrop">
    <div class="confirm-dialog">
      <div class="confirm-dialog-header">
        <h3>{{ title }}</h3>
        <button @click="$emit('close')" class="btn-close">
          <X size="20" />
        </button>
      </div>

      <div class="confirm-dialog-body">
        <div v-html="message" class="confirm-message"></div>
      </div>

      <div class="confirm-dialog-footer">
        <button
            @click="$emit('close')"
            class="btn btn-secondary"
            :disabled="processing"
        >
          Cancelar
        </button>

        <button
            @click="$emit('confirm')"
            :class="['btn', confirmButtonClass || 'btn-primary']"
            :disabled="processing"
        >
          <Loader v-if="processing" size="16" class="spinner" />
          <span v-else>{{ confirmText || 'Confirmar' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { X, Loader } from 'lucide-vue-next';

export default {
  name: 'ConfirmDialog',

  components: {
    X,
    Loader
  },

  props: {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    confirmButtonClass: {
      type: String,
      default: 'btn-primary'
    },
    processing: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'confirm']
};
</script>

<style scoped>
.confirm-dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.confirm-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.confirm-dialog-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-close {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.confirm-dialog-body {
  padding: 1.5rem;
}

.confirm-message {
  color: #4b5563;
  line-height: 1.5;
}

.confirm-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.1);
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.1);
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
