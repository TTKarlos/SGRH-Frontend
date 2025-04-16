import { useAuthStore } from '../../stores/auth.js'

export function setupPermissionGuard(router) {
    router.beforeEach(async (to, from, next) => {
        const authStore = useAuthStore()

        if (to.meta.public) {
            next()
            return
        }

        if (authStore.initializing) {
            let waitTime = 0
            const maxWaitTime = 2000
            const checkInterval = 100

            while (authStore.initializing && waitTime < maxWaitTime) {
                await new Promise(resolve => setTimeout(resolve, checkInterval))
                waitTime += checkInterval
            }
        }

        if (!authStore.isAuthenticated) {
            next({ name: 'login', query: { redirect: to.fullPath } })
            return
        }

        if (!authStore.permissionsLoaded && !authStore.isLoadingPermissions) {
            try {
                await authStore.loadUserRoleAndPermissions()
            } catch (error) {
                authStore.permissionsLoaded = true
            }
        }

        if (to.name === 'unauthorized') {
            next()
            return
        }

        const requiredPermission = to.meta.requiredPermission

        if (requiredPermission) {
            if (authStore.isAdmin) {
                next()
                return
            }

            if (requiredPermission.tipo === 'Escritura') {
                const hasPermission = authStore.hasPermission(requiredPermission);

                if (!hasPermission) {
                    next({ name: 'unauthorized' })
                    return
                }
            } else if (requiredPermission.tipo === 'Lectura') {
                const hasReadPermission = authStore.hasPermission(requiredPermission);
                const hasWritePermission = authStore.hasPermission({
                    ...requiredPermission,
                    tipo: 'Escritura'
                });

                if (!hasReadPermission && !hasWritePermission) {
                    next({ name: 'unauthorized' })
                    return
                }
            }
        }

        next()
    })
}