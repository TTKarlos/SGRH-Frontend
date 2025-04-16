<template>
  <div class="card-footer">
    <div class="pagination" v-if="shouldShowPagination">
      <button
          class="pagination-btn"
          :disabled="safeCurrentPage <= 1"
          @click="$emit('change-page', safeCurrentPage - 1)"
      >
        <ChevronLeft size="16" />
        <span class="pagination-text">Anterior</span>
      </button>

      <div class="pagination-pages">
        <button
            v-for="page in validPaginationPages"
            :key="page"
            class="page-btn"
            :class="{ active: page === safeCurrentPage }"
            @click="$emit('change-page', page)"
        >
          {{ page }}
        </button>
      </div>

      <button
          class="pagination-btn"
          :disabled="safeCurrentPage >= safeTotalPages"
          @click="$emit('change-page', safeCurrentPage + 1)"
      >
        <span class="pagination-text">Siguiente</span>
        <ChevronRight size="16" />
      </button>
    </div>
    <div v-else class="pagination-info">
      {{ paginationInfoText }}
    </div>
  </div>
</template>

<script>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

export default {
  name: 'UsuariosPaginacion',
  components: {
    ChevronLeft,
    ChevronRight
  },
  props: {
    pagination: {
      type: Object,
      required: true,
      default: () => ({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1
      })
    }
  },
  computed: {
    safeCurrentPage() {
      const page = parseInt(this.pagination.page);
      return isNaN(page) ? 1 : Math.max(1, page);
    },

    safeTotalPages() {
      const totalPages = parseInt(this.pagination.totalPages);
      return isNaN(totalPages) ? 1 : Math.max(1, totalPages);
    },

    safeTotalItems() {
      const totalItems = parseInt(this.pagination.totalItems);
      return isNaN(totalItems) ? 0 : Math.max(0, totalItems);
    },

    shouldShowPagination() {
      return this.safeTotalPages > 1;
    },

    paginationInfoText() {
      const start = ((this.safeCurrentPage - 1) * this.pagination.limit) + 1;
      const end = Math.min(this.safeCurrentPage * this.pagination.limit, this.safeTotalItems);
      return `Mostrando ${start}-${end} de ${this.safeTotalItems} resultado${this.safeTotalItems !== 1 ? 's' : ''}`;
    },

    validPaginationPages() {
      const currentPage = this.safeCurrentPage;
      const totalPages = this.safeTotalPages;

      if (totalPages <= 0) {
        return [];
      }

      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      if (currentPage <= 3) {
        return [1, 2, 3, 4, 5];
      }

      if (currentPage >= totalPages - 2) {
        return [
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        ];
      }

      return [
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2
      ];
    }
  },
  emits: ['change-page']
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.card-footer {
  padding: 1.25rem;
  border-top: 1px solid #e5e7eb;
  font-family: 'Poppins', sans-serif;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
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