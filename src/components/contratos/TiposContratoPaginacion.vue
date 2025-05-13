<template>
  <div class="card-footer">
    <div class="pagination" v-if="pagination.totalPages > 1">
      <button
          class="pagination-btn"
          :disabled="pagination.page <= 1"
          @click="$emit('cambiar-pagina', pagination.page - 1)"
      >
        <ChevronLeft size="16" />
        <span class="pagination-text">Anterior</span>
      </button>

      <div class="pagination-pages">
        <button
            v-for="pageNum in paginationRange"
            :key="pageNum"
            class="page-btn"
            :class="{ active: pageNum === pagination.page }"
            @click="$emit('cambiar-pagina', pageNum)"
            v-if="pageNum !== '...'"
        >
          {{ pageNum }}
        </button>
        <span v-else class="pagination-ellipsis">...</span>
      </div>

      <button
          class="pagination-btn"
          :disabled="pagination.page >= pagination.totalPages"
          @click="$emit('cambiar-pagina', pagination.page + 1)"
      >
        <span class="pagination-text">Siguiente</span>
        <ChevronRight size="16" />
      </button>
    </div>
    <div class="pagination-info">
      <FileText size="16" class="info-icon" />
      <span>Mostrando {{ pagination.page }} de {{ pagination.totalPages }} páginas ({{ pagination.totalItems }} registros)</span>
    </div>
  </div>
</template>

<script>
import { ChevronLeft, ChevronRight, FileText } from 'lucide-vue-next';

export default {
  name: 'TiposContratoPaginacion',
  components: {
    ChevronLeft,
    ChevronRight,
    FileText
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
  computed: {
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
  },
  emits: ['cambiar-pagina']
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.card-footer {
  padding: 1.25rem;
  border-top: 1px solid #f1f1f1;
  font-family: 'Poppins', sans-serif;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.pagination-info {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.info-icon {
  color: #dc2626;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: #fff;
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: #fff;
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(.active) {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.page-btn.active {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: #6b7280;
}

@media (max-width: 767px) {
  .pagination {
    justify-content: center;
  }

  .pagination-pages {
    order: -1;
    width: 100%;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 575px) {
  .pagination-text {
    display: none;
  }
}
</style>