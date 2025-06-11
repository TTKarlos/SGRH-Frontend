<template>
  <div class="documentos-lista" :class="vista">
    <TransitionGroup name="documento-fade">
      <DocumentoCard
          v-for="documento in documentos"
          :key="documento.id_documento"
          :documento="documento"
          @click="$emit('ver-detalles', documento)"
          @ver-detalles="$emit('ver-detalles', documento)"
          @descargar="$emit('descargar', documento)"
          @editar="$emit('editar', documento)"
          @eliminar="$emit('eliminar', documento)"
      />
    </TransitionGroup>
  </div>
</template>

<script>
import { ref } from 'vue'
import DocumentoCard from './DocumentosCard.vue'

export default {
  name: 'DocumentosLista',

  components: {
    DocumentoCard
  },

  props: {
    documentos: {
      type: Array,
      required: true
    },
    vista: {
      type: String,
      default: 'grid',
      validator: (value) => ['grid', 'list'].includes(value)
    }
  },

  emits: ['ver-detalles', 'descargar', 'editar', 'eliminar'],

  setup() {
    return {}
  }
}
</script>

<style scoped>
.documentos-lista {
  width: 100%;
}

.documentos-lista.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.documentos-lista.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Animaciones */
.documento-fade-enter-active,
.documento-fade-leave-active {
  transition: all 0.3s ease;
}

.documento-fade-enter-from,
.documento-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .documentos-lista.grid {
    grid-template-columns: 1fr;
  }
}
</style>
