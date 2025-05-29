<template>
  <div class="page-header">
    <h1>Gestión de Usuarios</h1>
    <button
        @click="$emit('nuevo-usuario')"
        class="btn btn-primary"
        v-if="canCreate"
    >
      <UserPlus size="18" class="btn-icon" />
      Nuevo Usuario
    </button>
  </div>
</template>

<script>
import { UserPlus } from 'lucide-vue-next';
import { useAuthStore } from '../../stores/auth';
import { computed } from 'vue';

export default {
  name: 'UsuariosHeader',
  components: {
    UserPlus
  },
  emits: ['nuevo-usuario'],
  setup() {
    const authStore = useAuthStore();

    const canCreate = computed(() => {
      return authStore.hasPermission({ nombre: 'Usuarios', tipo: 'Escritura' });
    });

    return {
      canCreate
    };
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #111827;
  position: relative;
  padding-bottom: 0.5rem;
}

.page-header h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #dc2626, #ef4444);
  border-radius: 3px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
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

.btn-primary:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-icon {
  margin-right: 0.5rem;
}

@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn {
    width: 100%;
  }
}
</style>