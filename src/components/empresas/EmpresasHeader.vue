<template>
  <div class="header-container">
    <div class="header-title">
      <h1>Empresas</h1>
      <p class="header-description">Gestión de empresas del sistema</p>
    </div>

    <div class="header-actions">
      <button
          v-if="canCreate"
          @click="$emit('nueva-empresa')"
          class="btn-primary"
      >
        <Plus size="18" class="btn-icon" />
        <span>Nueva Empresa</span>
      </button>
    </div>
  </div>
</template>

<script>
import { Plus } from 'lucide-vue-next';
import { usePermission } from '../../composables/usePermission';

export default {
  name: 'EmpresasHeader',

  components: {
    Plus
  },

  emits: ['nueva-empresa'],

  computed: {
    canCreate() {
      const { canWrite } = usePermission();
      return canWrite('Empresas') || canWrite('Master');
    }
  }
};
</script>

<style scoped>
.header-container {
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
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.header-description {
  color: #6b7280;
  margin-top: 0.25rem;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
}

.btn-primary:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.btn-icon {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
