<template>
  <div v-if="notificationStore.message" class="notification" :class="notificationClass">
    <div class="notification-content">
      <span class="notification-icon">
        <i v-if="notificationStore.type === 'success'" class="fas fa-check-circle"></i>
        <i v-else-if="notificationStore.type === 'error'" class="fas fa-exclamation-circle"></i>
        <i v-else-if="notificationStore.type === 'warning'" class="fas fa-exclamation-triangle"></i>
        <i v-else class="fas fa-info-circle"></i>
      </span>
      <span class="notification-message">{{ notificationStore.message }}</span>
    </div>
    <button class="notification-close" @click="notificationStore.clearNotification">×</button>
  </div>
</template>

<script>
import { useNotificationStore } from '../../stores/notification';

export default {
  name: 'Notification',

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

<style>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 450px;
  padding: 15px;
  border-radius: 4px;
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
  font-size: 20px;
}

.notification-message {
  font-size: 14px;
  line-height: 1.5;
}

.notification-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  margin-left: 10px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.notification-close:hover {
  opacity: 1;
}

.notification-success {
  background-color: #f0fdf4;
  border-left: 4px solid #22c55e;
  color: #166534;
}

.notification-success .notification-icon {
  color: #22c55e;
}

.notification-error {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
}

.notification-error .notification-icon {
  color: #ef4444;
}

.notification-info {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
  color: #1e40af;
}

.notification-info .notification-icon {
  color: #3b82f6;
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

