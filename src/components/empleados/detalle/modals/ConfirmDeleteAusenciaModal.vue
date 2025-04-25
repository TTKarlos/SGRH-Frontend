<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Confirmar eliminación</h3>
        <button @click="$emit('cancel')" class="btn-close">
          <X size="18" />
        </button>
      </div>
      <div class="modal-body">
        <p>¿Está seguro de que desea eliminar la ausencia del tipo <strong>{{ tipoAusenciaNombre }}</strong>?</p>
        <p>Esta acción no se puede deshacer.</p>
      </div>
      <div class="modal-footer">
        <button @click="$emit('cancel')" class="btn btn-secondary">
          Cancelar
        </button>
        <button @click="$emit('confirm')" class="btn btn-danger" :disabled="loading">
          <Trash2 v-if="!loading" size="18" class="btn-icon" />
          <Loader v-else size="18" class="btn-icon animate-spin" />
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { X, Trash2, Loader } from "lucide-vue-next"
import { useTiposAusenciaStore } from "../../../../stores/tiposAusencia"

export default {
  name: "ConfirmDeleteAusenciaModal",

  components: {
    X,
    Trash2,
    Loader,
  },

  props: {
    ausencia: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["confirm", "cancel"],

  data() {
    return {
      tiposAusenciaStore: useTiposAusenciaStore(),
      tipoAusenciaEnCarga: false
    }
  },

  computed: {
    tipoAusenciaNombre() {
      if (!this.ausencia) return "Sin especificar"

      if (this.ausencia.TipoAusencia && this.ausencia.TipoAusencia.nombre) {
        return this.ausencia.TipoAusencia.nombre
      }

      const idNum = parseInt(this.ausencia.id_tipo_ausencia)
      const tipo = this.tiposAusenciaStore.getTipoAusenciaById(idNum)

      if (tipo) {
        return tipo.nombre
      }

      if (!this.tipoAusenciaEnCarga) {
        this.cargarTipoAusencia(idNum)
      }

      return "Cargando..."
    },
  },

  created() {
    this.cargarTiposAusencia()

    if (this.ausencia && this.ausencia.id_tipo_ausencia) {
      this.cargarTipoAusencia(parseInt(this.ausencia.id_tipo_ausencia))
    }
  },

  methods: {
    async cargarTiposAusencia() {
      try {
        await this.tiposAusenciaStore.fetchTiposAusencia()
      } catch (error) {
        console.error("Error al cargar tipos de ausencia:", error)
      }
    },

    async cargarTipoAusencia(id) {
      if (!id) return

      this.tipoAusenciaEnCarga = true
      try {
        await this.tiposAusenciaStore.getTipoAusencia(id)
      } catch (error) {
        console.error(`Error al cargar tipo de ausencia con ID ${id}:`, error)
      } finally {
        this.tipoAusenciaEnCarga = false
      }
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(2px);
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 28rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background-color: #f3f4f6;
  color: #dc2626;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-danger:hover {
  background-color: #fecaca;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>