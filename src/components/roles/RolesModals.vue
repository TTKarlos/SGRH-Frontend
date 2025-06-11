<template>
  <!-- Modal para crear/editar rol -->
  <div v-if="showCreateModal || showEditModal" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ showEditModal ? 'Editar Rol' : 'Nuevo Rol' }}</h3>
        <button @click="closeModal" class="btn-close">
          <X size="18" />
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="nombre">Nombre del Rol *</label>
          <input
              id="nombre"
              v-model="localRolForm.nombre"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': validationErrors.nombre }"
              placeholder="Ej: Administrador, Usuario, Supervisor"
              maxlength="50"
              @input="updateParentForm"
          />
          <div v-if="validationErrors.nombre" class="invalid-feedback">
            {{ validationErrors.nombre }}
          </div>
          <div class="form-hint">
            El nombre debe ser único y descriptivo
          </div>
        </div>

        <div class="form-group">
          <label for="descripcion">Descripción</label>
          <textarea
              id="descripcion"
              v-model="localRolForm.descripcion"
              class="form-control"
              placeholder="Describe las responsabilidades y alcance de este rol"
              rows="3"
              maxlength="255"
              @input="updateParentForm"
          ></textarea>
          <div class="character-count">
            {{ localRolForm.descripcion.length }}/255 caracteres
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="closeModal" class="btn-cancel">
          <X size="16" class="btn-icon" />
          Cancelar
        </button>
        <button @click="saveRol" class="btn-save" :disabled="savingRol || !isFormValid">
          <Loader v-if="savingRol" size="16" class="btn-icon spinner" />
          <Save v-else size="16" class="btn-icon" />
          {{ showEditModal ? 'Actualizar' : 'Crear Rol' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal para gestionar permisos -->
  <div v-if="showPermisosModal" class="modal-overlay">
    <div class="modal-container modal-xl">
      <div class="modal-header">
        <div class="modal-title">
          <h3>Gestionar Permisos</h3>
          <span class="role-badge">{{ currentRol?.nombre }}</span>
        </div>
        <button @click="closeModal" class="btn-close">
          <X size="18" />
        </button>
      </div>

      <div class="modal-body permissions-body">
        <div v-if="loadingPermisos" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando permisos...</p>
        </div>

        <div v-else class="permissions-container">
          <!-- Panel lateral de navegación -->
          <div class="permissions-sidebar">
            <div class="sidebar-header">
              <h4>Módulos</h4>
              <button class="btn-select-all" @click="toggleSelectAll">
                {{ isAllSelected ? 'Deseleccionar todo' : 'Seleccionar todo' }}
              </button>
            </div>

            <div class="sidebar-content">
              <ul class="module-list">
                <li
                    v-for="(permisos, nombre) in permisosAgrupados"
                    :key="nombre"
                    :class="{ 'active': activeModule === nombre }"
                    @click="setActiveModule(nombre)"
                >
                  <span class="module-name">{{ nombre }}</span>
                  <div class="module-stats">
                    <span class="module-count">{{ getSelectedCount(permisos) }}/{{ permisos.length }}</span>
                    <div class="progress-bar">
                      <div class="progress" :style="{ width: `${getProgressPercentage(permisos)}%` }"></div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div class="sidebar-footer">
              <div class="permissions-summary">
                <div class="summary-item">
                  <span class="summary-label">Total seleccionados:</span>
                  <span class="summary-value">{{ selectedPermisos.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Total disponibles:</span>
                  <span class="summary-value">{{ getTotalPermissions() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel principal de permisos -->
          <div class="permissions-main">
            <div class="main-header">
              <h4>{{ activeModule }}</h4>
              <div class="header-actions">
                <div class="search-permissions">
                  <input
                      v-model="searchPermission"
                      type="text"
                      placeholder="Buscar permisos..."
                      class="search-input"
                  />
                  <Search size="16" class="search-icon" />
                </div>
                <button
                    class="btn-module-select"
                    @click="toggleModuleSelection(activeModule)"
                >
                  {{ isModuleFullySelected(activeModule) ? 'Deseleccionar módulo' : 'Seleccionar módulo' }}
                </button>
              </div>
            </div>

            <div class="main-content">
              <div class="permissions-grid">
                <div
                    v-for="permiso in filteredActiveModulePermissions"
                    :key="permiso.id_permiso"
                    class="permission-card"
                    :class="{ 'selected': isPermisoSelected(permiso.id_permiso) }"
                    @click="togglePermiso(permiso.id_permiso, !isPermisoSelected(permiso.id_permiso))"
                >
                  <div class="permission-header">
                    <div class="permission-checkbox">
                      <input
                          type="checkbox"
                          :checked="isPermisoSelected(permiso.id_permiso)"
                          @click.stop
                          @change="togglePermiso(permiso.id_permiso, $event.target.checked)"
                      />
                      <span class="checkmark"></span>
                    </div>
                    <span class="permission-name">{{ permiso.nombre }}</span>
                    <span class="permission-type" :class="permiso.tipo === 'Lectura' ? 'type-read' : 'type-write'">
                      {{ permiso.tipo }}
                    </span>
                  </div>
                  <div class="permission-description">
                    {{ getPermissionDescription(permiso) }}
                  </div>
                </div>
              </div>

              <div v-if="filteredActiveModulePermissions.length === 0" class="no-permissions">
                <FolderX size="32" />
                <p>No se encontraron permisos que coincidan con la búsqueda</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer permissions-footer">
        <div class="footer-info">
          <Shield size="16" />
          <span>Los cambios en los permisos se aplicarán inmediatamente</span>
        </div>
        <div class="footer-actions">
          <button @click="closeModal" class="btn-cancel">
            <X size="16" class="btn-icon" />
            Cancelar
          </button>
          <button @click="savePermisos" class="btn-save" :disabled="savingPermisos">
            <Loader v-if="savingPermisos" size="16" class="btn-icon spinner" />
            <Save v-else size="16" class="btn-icon" />
            Guardar Permisos
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación de eliminación -->
  <div v-if="showDeleteModal" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header delete-header">
        <h3>Confirmar eliminación</h3>
        <button @click="closeModal" class="btn-close">
          <X size="18" />
        </button>
      </div>
      <div class="modal-body">
        <div class="delete-confirmation">
          <div class="delete-icon">
            <AlertTriangle size="48" />
          </div>
          <p>¿Está seguro de que desea eliminar el rol <strong>{{ rolToDelete?.nombre }}</strong>?</p>
          <p class="text-danger">Esta acción no se puede deshacer y puede afectar a los usuarios asignados a este rol.</p>

          <div class="warning-box">
            <div class="warning-header">
              <AlertTriangle size="16" />
              <span>Advertencia</span>
            </div>
            <ul class="warning-list">
              <li>Los usuarios con este rol perderán sus permisos asociados</li>
              <li>Se recomienda reasignar usuarios antes de eliminar</li>
              <li>Esta acción es irreversible</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="closeModal" class="btn-cancel">
          <X size="16" class="btn-icon" />
          Cancelar
        </button>
        <button @click="deleteRol" class="btn-delete" :disabled="deletingRol">
          <Loader v-if="deletingRol" size="16" class="btn-icon spinner" />
          <Trash2 v-else size="16" class="btn-icon" />
          Eliminar Definitivamente
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Save, X, Loader, Trash2, AlertTriangle, Shield, Search, FolderX } from 'lucide-vue-next';

export default {
  name: 'RolesModals',
  components: {
    Save, X, Loader, Trash2, AlertTriangle, Shield, Search, FolderX
  },
  props: {
    showCreateModal: Boolean,
    showEditModal: Boolean,
    showPermisosModal: Boolean,
    showDeleteModal: Boolean,
    rolForm: {
      type: Object,
      default: () => ({ nombre: '', descripcion: '' })
    },
    validationErrors: {
      type: Object,
      default: () => ({})
    },
    currentRol: {
      type: Object,
      default: null
    },
    rolToDelete: {
      type: Object,
      default: null
    },
    selectedPermisos: {
      type: Array,
      default: () => []
    },
    savingRol: Boolean,
    savingPermisos: Boolean,
    deletingRol: Boolean,
    loadingPermisos: Boolean,
    permisosAgrupados: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'save-rol', 'save-permisos', 'delete-rol', 'update:selected-permisos', 'update-rol-form'],
  data() {
    return {
      localRolForm: { nombre: '', descripcion: '' },
      activeModule: '',
      searchPermission: ''
    };
  },
  computed: {
    isFormValid() {
      return this.localRolForm.nombre && this.localRolForm.nombre.trim().length > 0;
    },
    isAllSelected() {
      const allPermisos = Object.values(this.permisosAgrupados).flat();
      return allPermisos.length > 0 && allPermisos.every(p => this.isPermisoSelected(p.id_permiso));
    },
    filteredActiveModulePermissions() {
      const modulePermisos = this.permisosAgrupados[this.activeModule] || [];

      if (!this.searchPermission) {
        return modulePermisos;
      }

      const search = this.searchPermission.toLowerCase();
      return modulePermisos.filter(p =>
          p.nombre.toLowerCase().includes(search) ||
          p.tipo.toLowerCase().includes(search)
      );
    }
  },
  watch: {
    rolForm: {
      handler(newVal) {
        this.localRolForm = { ...newVal };
      },
      immediate: true,
      deep: true
    },
    permisosAgrupados: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0 && !this.activeModule) {
          this.activeModule = Object.keys(newVal)[0];
        }
      },
      immediate: true
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },

    updateParentForm() {
      this.$emit('update-rol-form', this.localRolForm);
    },

    saveRol() {
      if (!this.localRolForm.nombre || !this.localRolForm.nombre.trim()) {
        return;
      }

      this.$emit('save-rol');
    },

    savePermisos() {
      this.$emit('save-permisos');
    },

    deleteRol() {
      this.$emit('delete-rol');
    },

    isPermisoSelected(id) {
      return this.selectedPermisos.includes(id);
    },

    togglePermiso(id, checked) {
      let newSelected = [...this.selectedPermisos];

      if (checked) {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      } else {
        newSelected = newSelected.filter(permId => permId !== id);
      }

      this.$emit('update:selected-permisos', newSelected);
    },

    setActiveModule(moduleName) {
      this.activeModule = moduleName;
    },

    getSelectedCount(permisos) {
      return permisos.filter(p => this.isPermisoSelected(p.id_permiso)).length;
    },

    getProgressPercentage(permisos) {
      if (permisos.length === 0) return 0;
      return (this.getSelectedCount(permisos) / permisos.length) * 100;
    },

    isModuleFullySelected(moduleName) {
      const modulePermisos = this.permisosAgrupados[moduleName] || [];
      return modulePermisos.length > 0 && this.getSelectedCount(modulePermisos) === modulePermisos.length;
    },

    toggleModuleSelection(moduleName) {
      const modulePermisos = this.permisosAgrupados[moduleName] || [];
      const isFullySelected = this.isModuleFullySelected(moduleName);

      let newSelected = [...this.selectedPermisos];

      if (isFullySelected) {
        newSelected = newSelected.filter(id =>
            !modulePermisos.some(p => p.id_permiso === id)
        );
      } else {
        modulePermisos.forEach(permiso => {
          if (!newSelected.includes(permiso.id_permiso)) {
            newSelected.push(permiso.id_permiso);
          }
        });
      }

      this.$emit('update:selected-permisos', newSelected);
    },

    toggleSelectAll() {
      const allPermisos = Object.values(this.permisosAgrupados).flat();

      if (this.isAllSelected) {
        this.$emit('update:selected-permisos', []);
      } else {
        this.$emit('update:selected-permisos', allPermisos.map(p => p.id_permiso));
      }
    },

    getTotalPermissions() {
      return Object.values(this.permisosAgrupados).flat().length;
    },

    getPermissionDescription(permiso) {
      const descriptions = {
        'Usuarios': 'Acceso a la gestión de usuarios del sistema',
        'Roles': 'Acceso a la gestión de roles y permisos',
        'Empleados': 'Acceso a la información de empleados',
        'Departamentos': 'Acceso a la gestión de departamentos',
        'Reportes': 'Acceso a la generación de reportes',
        'Configuración': 'Acceso a la configuración del sistema'
      };

      const baseDesc = descriptions[permiso.nombre.split(' ')[0]] || 'Permiso del sistema';
      return permiso.tipo === 'Lectura'
          ? `${baseDesc} (solo visualización)`
          : `${baseDesc} (creación, edición y eliminación)`;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

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
  backdrop-filter: blur(4px);
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  font-family: 'Poppins', sans-serif;
}

.modal-xl {
  max-width: 1000px;
  height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.role-badge {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.delete-header {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-bottom: 1px solid #fecaca;
}

.btn-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #111827;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.permissions-body {
  padding: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.permissions-footer {
  justify-content: space-between;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 13px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: 'Poppins', sans-serif;
  background-color: #fafafa;
}

.form-control:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  background-color: white;
}

.form-control.is-invalid {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 6px;
  font-size: 13px;
  color: #dc2626;
  font-weight: 500;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

.character-count {
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
}

.form-preview {
  margin-top: 20px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.form-preview h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.role-preview-card {
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e5e7eb;
}

.role-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.role-preview-name {
  font-weight: 600;
  color: #111827;
}

.role-preview-badge {
  background-color: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.role-preview-description {
  font-size: 13px;
  color: #6b7280;
}

.warning-box {
  margin-top: 16px;
  padding: 16px;
  background-color: #fef3cd;
  border: 1px solid #fbbf24;
  border-radius: 8px;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #92400e;
}

.warning-list {
  margin: 0;
  padding-left: 20px;
  color: #92400e;
}

.warning-list li {
  margin-bottom: 4px;
  font-size: 13px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  height: 100%;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.permissions-container {
  display: flex;
  height: 100%;
}

/* Sidebar de permisos */
.permissions-sidebar {
  width: 280px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.btn-select-all {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-select-all:hover {
  background-color: #fef2f2;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.module-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.module-list li {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.module-list li:hover {
  background-color: #f3f4f6;
}

.module-list li.active {
  background-color: #fef2f2;
  border-left: 3px solid #dc2626;
}

.module-name {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.module-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.progress-bar {
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  width: 100px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
  transition: width 0.3s ease;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.permissions-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.summary-value {
  font-weight: 600;
  color: #374151;
}

/* Panel principal de permisos */
.permissions-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-permissions {
  position: relative;
}

.search-input {
  padding: 8px 12px 8px 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  width: 200px;
  font-family: 'Poppins', sans-serif;
}

.search-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.btn-module-select {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  color: #dc2626;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Poppins', sans-serif;
}

.btn-module-select:hover {
  background-color: #fee2e2;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.permission-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: white;
}

.permission-card:hover {
  border-color: #dc2626;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.permission-card.selected {
  background-color: #fef2f2;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.permission-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.permission-checkbox {
  position: relative;
  width: 18px;
  height: 18px;
  margin-right: 12px;
}

.permission-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  transition: all 0.2s;
}

.permission-card.selected .checkmark {
  background-color: #dc2626;
  border-color: #dc2626;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.permission-card.selected .checkmark:after {
  display: block;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.permission-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

.permission-type {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.type-read {
  background-color: #dbeafe;
  color: #1e40af;
}

.type-write {
  background-color: #fee2e2;
  color: #b91c1c;
}

.permission-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

.no-permissions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #9ca3af;
  text-align: center;
}

.no-permissions p {
  margin-top: 12px;
  font-size: 14px;
}

.btn-save, .btn-cancel, .btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Poppins', sans-serif;
  border: none;
}

.btn-save {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

.btn-cancel {
  background-color: white;
  color: #4b5563;
  border: 2px solid #d1d5db;
}

.btn-cancel:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-delete {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

.btn-delete:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

.btn-save:disabled, .btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-icon {
  margin-right: 8px;
}

.spinner {
  animation: spin 1s linear infinite;
}

.delete-confirmation {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 16px;
}

.delete-icon {
  color: #dc2626;
  margin-bottom: 16px;
  background-color: #fee2e2;
  padding: 16px;
  border-radius: 50%;
}

.text-danger {
  color: #dc2626;
  font-weight: 500;
  margin-top: 8px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .modal-xl {
    max-width: 100%;
    height: 100vh;
    border-radius: 0;
  }

  .permissions-container {
    flex-direction: column;
  }

  .permissions-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .permissions-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .search-input {
    width: 100%;
  }
}
</style>