<template>
  <div class="pagination-container">
    <div class="pagination-info">
      <span>Mostrando {{ startItem }} - {{ endItem }} de {{ pagination.total }} resultados</span>
    </div>

    <div class="pagination-controls">
      <button
          @click="$emit('cambiar-pagina', 1)"
          class="pagination-button"
          :disabled="pagination.page === 1 || loading"
          title="Primera página"
      >
        <ChevronsLeft size="16" />
      </button>

      <button
          @click="$emit('cambiar-pagina', pagination.page - 1)"
          class="pagination-button"
          :disabled="pagination.page === 1 || loading"
          title="Página anterior"
      >
        <ChevronLeft size="16" />
      </button>

      <div class="pagination-pages">
        <template v-for="(pageNum, index) in paginationRange" :key="index">
          <button
              v-if="pageNum !== '...'"
              @click="$emit('cambiar-pagina', pageNum)"
              class="pagination-page"
              :class="{ active: pageNum === pagination.page }"
              :disabled="loading"
          >
            {{ pageNum }}
          </button>
          <span v-else class="pagination-ellipsis">...</span>
        </template>
      </div>

      <button
          @click="$emit('cambiar-pagina', pagination.page + 1)"
          class="pagination-button"
          :disabled="pagination.page === pagination.totalPages || loading"
          title="Página siguiente"
      >
        <ChevronRight size="16" />
      </button>

      <button
          @click="$emit('cambiar-pagina', pagination.totalPages)"
          class="pagination-button"
          :disabled="pagination.page === pagination.totalPages || loading"
          title="Última página"
      >
        <ChevronsRight size="16" />
      </button>
    </div>
  </div>
</template>

<script>
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next';

export default {
  name: 'ConveniosPaginacion',

  components: {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
  },

  props: {
    pagination: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['cambiar-pagina'],

  computed: {
    startItem() {
      return (this.pagination.page - 1) * this.pagination.limit + 1;
    },

    endItem() {
      const end = this.pagination.page * this.pagination.limit;
      return end > this.pagination.total ? this.pagination.total : end;
    },

    paginationRange() {
      const currentPage = this.pagination.page;
      const totalPages = this.pagination.totalPages;

      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      let range = [1];

      if (currentPage > 3) {
        range.push('...');
      }

      const rangeStart = Math.max(2, currentPage - 1);
      const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

      for (let i = rangeStart; i <= rangeEnd; i++) {
        range.push(i);
      }

      if (currentPage < totalPages - 2) {
        range.push('...');
      }

      if (totalPages > 1) {
        range.push(totalPages);
      }

      return range;
    }
  }
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.pagination-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0 0.5rem;
  flex-wrap: wrap;
}

.pagination-page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
  color: #4b5563;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-page:hover:not(:disabled):not(.active) {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.pagination-page.active {
  background-color: #dc2626;
  border-color: #dc2626;
  color: white;
  font-weight: 500;
}

.pagination-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  color: #6b7280;
}

@media (max-width: 640px) {
  .pagination-container {
    flex-direction: column;
  }

  .pagination-info {
    text-align: center;
    width: 100%;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
}
</style>
