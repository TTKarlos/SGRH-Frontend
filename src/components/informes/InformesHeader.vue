<template>
  <div class="page-header">
    <div class="header-title">
      <h1>Informes PDF</h1>
      <p class="text-muted">Genera informes detallados en formato PDF de empleados, departamentos, centros y más</p>
    </div>

    <div class="header-actions">
      <div class="search-box">
        <input
            type="text"
            placeholder="Buscar informes..."
            v-model="searchQuery"
            @input="handleSearch"
        />
        <Search size="18" class="search-icon" />
      </div>

      <button class="btn-view" @click="toggleView">
        <component :is="currentView === 'grid' ? 'List' : 'Grid'" size="18" />
        <span>{{ currentView === 'grid' ? 'Vista lista' : 'Vista cuadrícula' }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { Search, Grid, List } from 'lucide-vue-next'

export default {
  name: 'InformesHeader',

  components: {
    Search,
    Grid,
    List
  },

  data() {
    return {
      searchQuery: '',
      currentView: 'grid'
    }
  },

  methods: {
    handleSearch() {
      this.$emit('search', this.searchQuery);
    },

    toggleView() {
      this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
      this.$emit('change-view', this.currentView);
    }
  }
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
  gap: 1.5rem;
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

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-box input {
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 250px;
  transition: all 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.btn-view {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  padding: 0.625rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view:hover {
  background-color: #e5e7eb;
}

@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    width: 100%;
  }

  .btn-view {
    width: 100%;
    justify-content: center;
  }
}
</style>
