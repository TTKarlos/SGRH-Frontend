<template>
  <div class="permission-debugger">
    <div class="debugger-header">
      <h3>Depurador de Permisos</h3>
      <button @click="reloadPermissions" class="reload-button">
        Recargar Permisos
      </button>
    </div>

    <div class="debugger-content">
      <div class="debug-section">
        <h4>Estado de Autenticación</h4>
        <div class="debug-item">
          <span class="debug-label">Autenticado:</span>
          <span class="debug-value" :class="{'value-true': authStore.isAuthenticated, 'value-false': !authStore.isAuthenticated}">
            {{ authStore.isAuthenticated ? 'Sí' : 'No' }}
          </span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Permisos Cargados:</span>
          <span class="debug-value" :class="{'value-true': authStore.permissionsLoaded, 'value-false': !authStore.permissionsLoaded}">
            {{ authStore.permissionsLoaded ? 'Sí' : 'No' }}
          </span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Cargando Permisos:</span>
          <span class="debug-value" :class="{'value-true': authStore.isLoadingPermissions, 'value-false': !authStore.isLoadingPermissions}">
            {{ authStore.isLoadingPermissions ? 'Sí' : 'No' }}
          </span>
        </div>
      </div>

      <div class="debug-section">
        <h4>Información de Usuario</h4>
        <div class="debug-item">
          <span class="debug-label">ID:</span>
          <span class="debug-value">{{ authStore.user?.id || 'N/A' }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Nombre:</span>
          <span class="debug-value">{{ authStore.user?.nombre || 'N/A' }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Rol ID:</span>
          <span class="debug-value">{{ authStore.user?.id_rol || 'N/A' }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Rol Nombre:</span>
          <span class="debug-value">{{ authStore.user?.Rol?.nombre || 'N/A' }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Es Admin:</span>
          <span class="debug-value" :class="{'value-true': authStore.isAdmin, 'value-false': !authStore.isAdmin}">
            {{ authStore.isAdmin ? 'Sí' : 'No' }}
          </span>
        </div>
      </div>

      <div class="debug-section">
        <h4>Permisos ({{ authStore.user?.Rol?.Permisos?.length || 0 }})</h4>
        <div v-if="!authStore.user?.Rol?.Permisos?.length" class="no-permissions">
          No hay permisos cargados
        </div>
        <div v-else class="permissions-list">
          <div v-for="(permiso, index) in authStore.user?.Rol?.Permisos" :key="index" class="permission-item">
            <span class="permission-name">{{ permiso.nombre }}</span>
            <span class="permission-type" :class="{'type-read': permiso.tipo === 'Lectura', 'type-write': permiso.tipo === 'Escritura'}">
              {{ permiso.tipo }}
            </span>
          </div>
        </div>
      </div>

      <div class="debug-section">
        <h4>Verificación de Permisos</h4>
        <div class="permission-check">
          <div class="check-item">
            <span class="check-label">Empleados (Lectura):</span>
            <span class="check-value" :class="{'value-true': hasPermission({nombre: 'Empleados', tipo: 'Lectura'}), 'value-false': !hasPermission({nombre: 'Empleados', tipo: 'Lectura'})}">
              {{ hasPermission({nombre: 'Empleados', tipo: 'Lectura'}) ? '✓' : '✗' }}
            </span>
          </div>
          <div class="check-item">
            <span class="check-label">Empleados (Escritura):</span>
            <span class="check-value" :class="{'value-true': hasPermission({nombre: 'Empleados', tipo: 'Escritura'}), 'value-false': !hasPermission({nombre: 'Empleados', tipo: 'Escritura'})}">
              {{ hasPermission({nombre: 'Empleados', tipo: 'Escritura'}) ? '✓' : '✗' }}
            </span>
          </div>
          <div class="check-item">
            <span class="check-label">Usuarios (Lectura):</span>
            <span class="check-value" :class="{'value-true': hasPermission({nombre: 'Usuarios', tipo: 'Lectura'}), 'value-false': !hasPermission({nombre: 'Usuarios', tipo: 'Lectura'})}">
              {{ hasPermission({nombre: 'Usuarios', tipo: 'Lectura'}) ? '✓' : '✗' }}
            </span>
          </div>
          <div class="check-item">
            <span class="check-label">Usuarios (Escritura):</span>
            <span class="check-value" :class="{'value-true': hasPermission({nombre: 'Usuarios', tipo: 'Escritura'}), 'value-false': !hasPermission({nombre: 'Usuarios', tipo: 'Escritura'})}">
              {{ hasPermission({nombre: 'Usuarios', tipo: 'Escritura'}) ? '✓' : '✗' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'PermissionDebugger',
  setup() {
    const authStore = useAuthStore()

    const hasPermission = (permission) => {
      if (authStore.isAdmin) {
        return true
      }

      if (permission.tipo === 'Escritura') {
        return authStore.hasPermission(permission)
      } else if (permission.tipo === 'Lectura') {
        return (
            authStore.hasPermission(permission) ||
            authStore.hasPermission({ ...permission, tipo: 'Escritura' })
        )
      }

      return false
    }

    const reloadPermissions = async () => {
      console.log('Recargando permisos desde el depurador...')
      await authStore.loadUserRoleAndPermissions()
    }

    return {
      authStore,
      hasPermission,
      reloadPermissions
    }
  }
}
</script>

<style scoped>
.permission-debugger {
  position: fixed;
  bottom: 50px;
  right: 10px;
  width: 350px;
  max-height: 500px;
  background-color: #1e293b;
  color: #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 9998;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.debugger-header {
  padding: 12px 16px;
  background-color: #0f172a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #334155;
}

.debugger-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.reload-button {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.debugger-content {
  padding: 12px 16px;
  overflow-y: auto;
  flex: 1;
}

.debug-section {
  margin-bottom: 16px;
}

.debug-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
}

.debug-item, .check-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}

.debug-label, .check-label {
  color: #cbd5e1;
}

.debug-value, .check-value {
  font-weight: 500;
}

.value-true {
  color: #22c55e;
}

.value-false {
  color: #ef4444;
}

.no-permissions {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
}

.permissions-list {
  max-height: 120px;
  overflow-y: auto;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  background-color: #334155;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 12px;
}

.permission-type {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.type-read {
  background-color: #0369a1;
  color: white;
}

.type-write {
  background-color: #15803d;
  color: white;
}

.permission-check {
  background-color: #334155;
  padding: 8px;
  border-radius: 4px;
}
</style>