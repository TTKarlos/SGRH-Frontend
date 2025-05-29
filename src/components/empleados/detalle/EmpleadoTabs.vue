<template>
  <div class="tabs-container">
    <div class="tabs">
      <button
          class="tab"
          :class="{ 'active': activeTab === 'personal' }"
          @click="changeTab('personal')"
      >
        <User size="18" class="tab-icon" />
        <span class="tab-text">Datos personales</span>
      </button>

      <button
          class="tab"
          :class="{ 'active': activeTab === 'laboral' }"
          @click="changeTab('laboral')"
      >
        <Building size="18" class="tab-icon" />
        <span class="tab-text">Información laboral</span>
      </button>

      <button
          class="tab"
          :class="{ 'active': activeTab === 'documentos' }"
          @click="changeTab('documentos')"
          v-if="canViewDocuments"
      >
        <Files size="18" class="tab-icon" />
        <span class="tab-text">Documentos</span>
      </button>

      <button
          class="tab"
          :class="{ 'active': activeTab === 'formacion' }"
          @click="changeTab('formacion')"
          v-if="canViewFormacion"
      >
        <GraduationCap size="18" class="tab-icon" />
        <span class="tab-text">Formación</span>
      </button>

      <button
          class="tab"
          :class="{ 'active': activeTab === 'ausencias' }"
          @click="changeTab('ausencias')"
          v-if="canViewAusencias"
      >
        <Calendar size="18" class="tab-icon" />
        <span class="tab-text">Ausencias</span>
      </button>

      <button
          class="tab"
          :class="{ 'active': activeTab === 'contratos' }"
          @click="changeTab('contratos')"
          v-if="canViewContratos"
      >
        <FileText size="18" class="tab-icon" />
        <span class="tab-text">Contratos</span>
      </button>
    </div>
  </div>
</template>

<script>
import { User, Building, Files, GraduationCap, Calendar, FileText } from 'lucide-vue-next'

export default {
  name: 'EmpleadoTabs',

  components: {
    User,
    Building,
    Files,
    GraduationCap,
    Calendar,
    FileText
  },

  props: {
    activeTab: {
      type: String,
      default: 'personal'
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
    },
    canViewContratos: {
      type: Boolean,
      default: false
    }
  },

  emits: ['change-tab'],

  methods: {
    changeTab(tab) {
      this.$emit('change-tab', tab)
    }
  }
}
</script>

<style scoped>
.tabs-container {
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  overflow-x: auto;
  scrollbar-width: thin;
  gap: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tabs::-webkit-scrollbar {
  height: 4px;
}

.tabs::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 9999px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab:hover {
  color: #111827;
}

.tab.active {
  color: #dc2626;
  border-bottom-color: #dc2626;
}

.tab-icon {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .tab {
    padding: 0.75rem 0.5rem;
  }

  .tab-text {
    font-size: 0.875rem;
  }
}

@media (max-width: 640px) {
  .tab-text {
    display: none;
  }

  .tab {
    justify-content: center;
    padding: 0.75rem;
  }

  .tab-icon {
    margin-right: 0;
  }
}
</style>