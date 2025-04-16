<template>
  <div v-if="hasPermission">
    <slot></slot>
  </div>
  <div v-else-if="$slots.fallback">
    <slot name="fallback"></slot>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'PermissionCheck',
  props: {
    permiso: {
      type: Object,
      required: true,
      validator: (value) => {
        return value.nombre && value.tipo
      }
    },
    fallback: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const authStore = useAuthStore()

    const hasPermission = computed(() => {
      if (authStore.isAdmin) {
        return true
      }

      if (props.permiso.tipo === 'Escritura') {
        return authStore.hasPermission(props.permiso)
      } else if (props.permiso.tipo === 'Lectura') {
        return (
            authStore.hasPermission(props.permiso) ||
            authStore.hasPermission({ ...props.permiso, tipo: 'Escritura' })
        )
      }

      return props.fallback
    })

    return {
      hasPermission
    }
  }
}
</script>