<template>
  <div class="tabs">
    <button
        v-for="tab in visibleTabs"
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="$emit('change-tab', tab.id)"
    >
      <component :is="tab.icon" size="18" class="tab-icon" />
      {{ tab.label }}
    </button>
  </div>
</template>

<script>
import { User, Briefcase, FileText, GraduationCap, Calendar } from 'lucide-vue-next'

export default {
  name: 'EmpleadoTabs',
  
  components: {
    User,
    Briefcase,
    FileText,
    GraduationCap,
    Calendar
  },
  
  props: {
    activeTab: {
      type: String,
      required: true
    },
    canViewDocuments: {
      type: Boolean,
      default: false
    },
    canViewFormacion: {
      type: Boolean,
      default: false
    },
    canViewAusencias: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['change-tab'],
  
  computed: {
    tabs() {
      return [
        { id: 'personal', label: 'Datos Personales', icon: 'User', visible: true },
        { id: 'laboral', label: 'Información Laboral', icon: 'Briefcase', visible: true },
        { id: 'documentos', label: 'Documentos', icon: 'FileText', visible: this.canViewDocuments },
        { id: 'formacion', label: 'Formación', icon: 'GraduationCap', visible: this.canViewFormacion },
        { id: 'ausencias', label: 'Ausencias', icon: 'Calendar', visible: this.canViewAusencias }
      ]
    },
    
    visibleTabs() {
      return this.tabs.filter(tab => tab.visible)
    }
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.tab-button:hover {
  color: #4b5563;
}

.tab-button.active {
  color: #dc2626;
  border-bottom-color: #dc2626;
}

.tab-icon {
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .tab-button {
    padding: 0.5rem 1rem;
  }
}
</style>