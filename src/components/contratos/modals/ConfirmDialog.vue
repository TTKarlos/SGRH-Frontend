<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content modal-sm">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="$emit('close')" class="btn-close">
          <X />
        </button>
      </div>
      <div class="modal-body">
        <div class="confirm-icon-wrapper" :class="confirmIconClass">
          <component :is="confirmIconComponent" class="confirm-icon" />
        </div>
        <p v-html="message" class="confirm-message"></p>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          <X class="btn-icon" />
          <span>Cancelar</span>
        </button>
        <button
            @click="$emit('confirm')"
            class="btn"
            :class="confirmButtonClass"
            :disabled="processing"
        >
          <span v-if="processing" class="btn-content">
            <Loader class="spinner" />
            <span>{{ processingText }}</span>
          </span>
          <span v-else class="btn-content">
            <component :is="confirmButtonIcon" class="btn-icon" />
            <span>{{ confirmText }}</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { X, AlertTriangle, CheckCircle, HelpCircle, Loader, Trash, Power } from 'lucide-vue-next'

export default {
  name: 'ConfirmDialog',
  components: {
    X,
    AlertTriangle,
    CheckCircle,
    HelpCircle,
    Loader,
    Trash,
    Power
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
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
    processingText: {
      type: String,
      default: 'Procesando...'
    },
    confirmButtonClass: {
      type: String,
      default: 'btn-danger'
    },
    processing: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    confirmIconClass() {
      if (this.confirmButtonClass === 'btn-danger') {
        return 'icon-danger';
      } else if (this.confirmButtonClass === 'btn-success') {
        return 'icon-success';
      } else {
        return 'icon-warning';
      }
    },
    confirmIconComponent() {
      if (this.confirmButtonClass === 'btn-danger') {
        return AlertTriangle;
      } else if (this.confirmButtonClass === 'btn-success') {
        return CheckCircle;
      } else {
        return HelpCircle;
      }
    },
    confirmButtonIcon() {
      if (this.confirmText === 'Eliminar') {
        return Trash;
      } else if (this.confirmText === 'Activar' || this.confirmText === 'Desactivar') {
        return Power;
      } else {
        return CheckCircle;
      }
    }
  },
  emits: ['close', 'confirm']
}
</script>

<style scoped>
.modal-overlay {
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
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

.modal-sm {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close:hover {
  color: #dc2626;
  background-color: rgba(220, 38, 38, 0.1);
}

.modal-body {
  padding: 1.75rem 1.5rem;
  text-align: center;
}

.confirm-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
}

.icon-danger {
  background-color: #fef2f2;
  color: #dc2626;
}

.icon-success {
  background-color: #f0fdf4;
  color: #16a34a;
}

.icon-warning {
  background-color: #fffbeb;
  color: #d97706;
}

.confirm-icon {
  width: 2rem;
  height: 2rem;
}

.confirm-message {
  color: #4b5563;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.25);
}

.btn-success {
  background-color: #16a34a;
  color: white;
  box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);
}

.btn-success:hover:not(:disabled) {
  background-color: #15803d;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(22, 163, 74, 0.25);
}

.btn-icon {
  width: 1.125rem;
  height: 1.125rem;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>