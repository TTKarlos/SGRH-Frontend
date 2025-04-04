<template>
  <div v-if="hasPermission">
    <slot></slot>
  </div>
</template>

<script>
import { useAuthStore } from '../../stores/auth';

export default {
  name: 'PermissionCheck',

  props: {
    permiso: {
      type: Object,
      required: true,
      validator: (value) => {
        return value.nombre && value.tipo;
      }
    }
  },

  setup(props) {
    const authStore = useAuthStore();

    return {
      authStore
    };
  },

  computed: {
    hasPermission() {
      if (this.authStore.isAdmin) {
        return true;
      }
      return this.authStore.hasPermission(this.permiso);
    }
  }
}
</script>

