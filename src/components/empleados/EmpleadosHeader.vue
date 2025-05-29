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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  font-family: 'Poppins', sans-serif;
}

.header-title {
  display: flex;
  flex-direction: column;
}

.header-title h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
  position: relative;
  padding-bottom: 0.5rem;
}

.header-title h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #dc2626, #ef4444);
  border-radius: 3px;
}

.text-muted {
  color: #6b7280;
  margin-top: 0.5rem;
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
  }

  .page-header .btn {
    width: 100%;
  }
}
</style>