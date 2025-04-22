<template>
  <div class="empty-state">
    <FileText size="48" class="empty-icon" />
    <h3>No hay documentos</h3>
    <p v-if="hayFiltrosAplicados">No se encontraron documentos con los filtros aplicados.</p>
    <p v-else>No se han subido documentos al sistema.</p>
    <div v-if="canUpload" class="empty-actions">
      <button @click="$emit('upload')" class="btn btn-primary">
        <Upload size="18" class="btn-icon" />
        Subir Documento
      </button>
    </div>
  </div>
</template>

<script>
import { FileText, Upload } from 'lucide-vue-next';

export default {
  name: 'DocumentosEstadoVacio',

  components: {
    FileText,
    Upload
  },

  props: {
    hayFiltrosAplicados: {
      type: Boolean,
      default: false
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
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background-color: #f9fafb;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.empty-actions {
  margin-top: 1rem;
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
</style>