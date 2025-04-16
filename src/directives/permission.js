import { useAuthStore } from "../stores/auth"

export const vPermission = {
    mounted(el, binding) {
        const { value } = binding
        const authStore = useAuthStore()

        if (!value || !value.nombre || !value.tipo) {
            return
        }

        if (authStore.isAuthenticated && !authStore.permissionsLoaded) {
            el.style.display = "none"

            const unwatch = authStore.$subscribe((mutation, state) => {
                if (state.permissionsLoaded) {
                    checkAndUpdateVisibility(el, value, authStore)
                    unwatch()
                }
            })

            return
        }

        checkAndUpdateVisibility(el, value, authStore)
    },

    updated(el, binding) {
        const { value } = binding
        const authStore = useAuthStore()

        if (!value || !value.nombre || !value.tipo) {
            return
        }

        checkAndUpdateVisibility(el, value, authStore)
    }
}

function checkAndUpdateVisibility(el, permission, authStore) {
    if (authStore.isAdmin) {
        el.style.display = ""
        return
    }

    if (!authStore.isAuthenticated || !authStore.permissionsLoaded) {
        el.style.display = "none"
        return
    }

    let hasPermission = false

    if (permission.tipo === 'Escritura') {
        hasPermission = authStore.hasPermission(permission)
    } else if (permission.tipo === 'Lectura') {
        hasPermission = (
            authStore.hasPermission(permission) ||
            authStore.hasPermission({ ...permission, tipo: 'Escritura' })
        )
    }

    el.style.display = hasPermission ? "" : "none"
}