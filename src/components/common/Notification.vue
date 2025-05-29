<template>
  <div v-if="notificationStore.message" class="notification" :class="notificationClass">
    <div class="notification-content">
      <span class="notification-icon">
        <CheckCircle v-if="notificationStore.type === 'success'" size="20" />
        <AlertCircle v-else-if="notificationStore.type === 'error'" size="20" />
        <AlertTriangle v-else-if="notificationStore.type === 'warning'" size="20" />
        <Info v-else size="20" />
      </span>
      <span class="notification-message">{{ notificationStore.message }}</span>
    </div>
    <button class="notification-close" @click="notificationStore.clearNotification">
      <X size="16" />
    </button>
  </div>
</template>

<script>
import { useNotificationStore } from '../../stores/notification';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

export default {
  name: 'Notification',
  components: {
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Info,
    X
  },

  setup() {
    const notificationStore = useNotificationStore();

    return {
      notificationStore
    };
  },

  computed: {
    notificationClass() {
      return {
        'notification-success': this.notificationStore.type === 'success',
        'notification-error': this.notificationStore.type === 'error',
        'notification-info': this.notificationStore.type === 'info',
        'notification-warning': this.notificationStore.type === 'warning'
      };
    }
  }
};
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 450px;
  padding: 15px;
  border-radius: 0.375rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10000;
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.notification-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
}

.notification-message {
  font-size: 14px;
  line-height: 1.5;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  opacity: 0.7;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 0.25rem;
}

.notification-close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
}

.notification-success {
  background-color: #dcfce7;
  border-left: 4px solid #10b981;
  color: #166534;
}

.notification-success .notification-icon {
  color: #10b981;
}

.notification-error {
  background-color: #fee2e2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
}

.notification-error .notification-icon {
  color: #ef4444;
}

.notification-info {
  background-color: #eff6ff;
  border-left: 4px solid #4361ee;
  color: #1e40af;
}

.notification-info .notification-icon {
  color: #4361ee;
}

.notification-warning {
  background-color: #fffbeb;
  border-left: 4px solid #f59e0b;
  color: #92400e;
}

.notification-warning .notification-icon {
  color: #f59e0b;
}
</style>