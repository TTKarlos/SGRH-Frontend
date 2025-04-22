<template>
  <div class="page-header">
    <h1>{{ title }}</h1>
    <div class="header-actions">
      <button v-if="canUpload" @click="$emit('upload')" class="btn btn-primary">
        <Upload size="18" class="btn-icon" />
        Subir Documento
      </button>
    </div>
  </div>
</template>

<script>
import { Upload } from 'lucide-vue-next';

export default {
  name: 'DocumentosHeader',

  components: {
    Upload
  },

  props: {
    title: {
      type: String,
      default: 'Documentos'
    },
    canUpload: {
      type: Boolean,
      default: false
    }
  },

  emits: ['upload']
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-icon {
  margin-right: 0.5rem;
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>