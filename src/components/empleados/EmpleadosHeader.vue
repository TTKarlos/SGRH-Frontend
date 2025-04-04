<template>
  <div class="page-header">
    <div class="header-title">
      <h1>Empleados</h1>
      <p class="text-muted">Gestión del personal de la empresa</p>
    </div>
    <permission-check :permiso="{ nombre: 'Empleados', tipo: 'Escritura' }">
      <button class="btn btn-primary" @click="$emit('nuevo-empleado')">
        <Plus size="16" class="btn-icon" />
        Nuevo Empleado
      </button>
    </permission-check>
  </div>
</template>

<script>
import { Plus } from 'lucide-vue-next';
import PermissionCheck from '../common/PermissionCheck.vue';

export default {
  name: 'EmpleadosHeader',
  components: {
    PermissionCheck,
    Plus
  },
  emits: ['nuevo-empleado']
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-title {
  display: flex;
  flex-direction: column;
}

.header-title h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.text-muted {
  color: #6c757d;
  margin-top: 0.25rem;
  font-size: 0.95rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
}

.btn-primary:hover {
  background-color: #3a56d4;
}

.btn-icon {
  margin-right: 0.5rem;
}

@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header .btn {
    width: 100%;
  }
}
</style>

