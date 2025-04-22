<template>
  <div class="empty-state">
    <component :is="iconoComponente" size="48" class="empty-icon" />
    <h3>{{ titulo }}</h3>
    <p>{{ mensaje }}</p>

    <PermissionCheck v-if="mostrarBotonSubir" :permiso="{ nombre: 'Documentos', tipo: 'Escritura' }">
      <button @click="$emit('subir-documento')" class="btn btn-primary">
        <Upload size="18" class="btn-icon" />
        Subir documento
      </button>
    </PermissionCheck>

    <button v-if="mostrarBotonLimpiar" @click="$emit('limpiar-filtros')" class="btn btn-secondary">
      <X size="18" class="btn-icon" />
      Limpiar filtros
    </button>
  </div>
</template>

<script>
import { FileText, Search, Upload, X } from 'lucide-vue-next'
import PermissionCheck from '../../common/PermissionCheck.vue'

export default {
  name: 'DocumentosEstadoVacio',

  components: {
    FileText,
    Search,
    Upload,
    X,
    PermissionCheck
  },

  props: {
    icono: {
      type: String,
      default: 'FileText'
    },
    titulo: {
      type: String,
      default: 'No hay documentos'
    },
    mensaje: {
      type: String,
      default: 'No se han encontrado documentos.'
    },
    mostrarBotonSubir: {
      type: Boolean,
      default: true
    },
    mostrarBotonLimpiar: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    iconoComponente() {
      const iconos = {
        'FileText': FileText,
        'Search': Search
      }
      return iconos[this.icono] || FileText
    }
  },

  emits: ['subir-documento', 'limpiar-filtros']
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  color: #dc2626;
  opacity: 0.5;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}
</style>