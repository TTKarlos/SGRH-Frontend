import { useAuthStore } from '../stores/auth'

export function usePermission() {
    const authStore = useAuthStore()

    /**
     * Verifica si el usuario tiene el permiso Master
     */
    const isMaster = () => {
        return authStore.hasPermission({ nombre: 'Master', tipo: 'Escritura' });
    }

    /**
     * Verifica si el usuario tiene un permiso específico
     */
    const hasPermission = (permiso) => {
        if (authStore.isAdmin || isMaster()) {
            return true
        }

        if (permiso.tipo === 'Escritura') {
            const result = authStore.hasPermission(permiso);
            return result;
        } else if (permiso.tipo === 'Lectura') {
            const readResult = authStore.hasPermission(permiso);
            const writeResult = authStore.hasPermission({ ...permiso, tipo: 'Escritura' });
            return readResult || writeResult;
        }

        return false
    }

    /**
     * Verifica si el usuario tiene permiso de escritura para un módulo específico
     */
    const canWrite = (moduleName) => {
        return hasPermission({ nombre: moduleName, tipo: 'Escritura' })
    }

    /**
     * Verifica si el usuario tiene permiso de lectura para un módulo específico
     */
    const canRead = (moduleName) => {
        return (
            hasPermission({ nombre: moduleName, tipo: 'Lectura' }) ||
            hasPermission({ nombre: moduleName, tipo: 'Escritura' })
        )
    }

    return {
        hasPermission,
        canWrite,
        canRead,
        isMaster
    }
}