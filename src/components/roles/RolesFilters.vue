<template>
  <div class="filters-container">
    <div class="search-container">
      <Search size="18" class="search-icon" />
      <input
          type="text"
          :value="search"
          @input="$emit('update:search', $event.target.value)"
          placeholder="Buscar roles..."
          class="search-input"
      />
      <button
          v-if="search"
          @click="clearSearch"
          class="clear-button"
      >
        <X size="16" />
      </button>
    </div>
  </div>
</template>

<script>
import { Search, X, RefreshCw } from 'lucide-vue-next';

export default {
  name: 'RolesFilters',
  components: {
    Search,
    X,
    RefreshCw
  },
  props: {
    search: {
      type: String,
      default: ''
    }
  },
  emits: ['update:search', 'reset'],
  methods: {
    clearSearch() {
      this.$emit('update:search', '');
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.filters-container {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: 'Poppins', sans-serif;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 10px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: 'Poppins', sans-serif;
}

.search-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.clear-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-button:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

@media (max-width: 640px) {
  .filters-container {
    flex-direction: column;
    gap: 16px;
  }

  .search-container {
    max-width: 100%;
    width: 100%;
  }
}
</style>