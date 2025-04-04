<template>
  <div class="alert" :class="`alert-${type}`">
    <AlertCircle v-if="type === 'danger'" size="16" class="alert-icon" />
    <InfoIcon v-else-if="type === 'info'" size="16" class="alert-icon" />
    <CheckCircle v-else-if="type === 'success'" size="16" class="alert-icon" />
    <AlertTriangle v-else-if="type === 'warning'" size="16" class="alert-icon" />
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
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.alert-danger {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fee2e2;
}

.alert-info {
  background-color: #eff6ff;
  color: #1e40af;
  border: 1px solid #dbeafe;
}

.alert-success {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #dcfce7;
}

.alert-warning {
  background-color: #fffbeb;
  color: #92400e;
  border: 1px solid #fef3c7;
}

.alert-icon {
  margin-right: 0.5rem;
  flex-shrink: 0;
}
</style>

