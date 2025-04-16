<template>
  <div class="alert" :class="`alert-${type}`">
    <AlertCircle v-if="type === 'danger'" size="18" class="alert-icon" />
    <InfoIcon v-else-if="type === 'info'" size="18" class="alert-icon" />
    <CheckCircle v-else-if="type === 'success'" size="18" class="alert-icon" />
    <AlertTriangle v-else-if="type === 'warning'" size="18" class="alert-icon" />
    <span>{{ message }}</span>
  </div>
</template>

<script>
import { AlertCircle, InfoIcon, CheckCircle, AlertTriangle } from 'lucide-vue-next';

export default {
  name: 'AlertMessage',

  components: {
    AlertCircle,
    InfoIcon,
    CheckCircle,
    AlertTriangle
  },

  props: {
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['info', 'success', 'warning', 'danger'].includes(value)
    },
    message: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
.alert {
  padding: 0.875rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.alert-danger {
  background-color: #fef2f2;
  color: #b91c1c;
  border-left: 4px solid #ef4444;
}

.alert-info {
  background-color: #eff6ff;
  color: #1e40af;
  border-left: 4px solid #3b82f6;
}

.alert-success {
  background-color: #f0fdf4;
  color: #166534;
  border-left: 4px solid #10b981;
}

.alert-warning {
  background-color: #fffbeb;
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.alert-icon {
  margin-right: 0.75rem;
  flex-shrink: 0;
}
</style>