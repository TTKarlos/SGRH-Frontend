export const formatUtils = {
    /**
     * Formatea una fecha en formato legible
     */
    formatearFecha(fechaString, opciones = {}) {
        if (!fechaString) return "Fecha desconocida"

        const opcionesDefault = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...opciones
        }

        try {
            const fecha = new Date(fechaString)
            return fecha.toLocaleDateString('es-ES', opcionesDefault)
        } catch (error) {
            console.error("Error al formatear fecha:", error)
            return "Fecha inválida"
        }
    },

    /**
     * Formatea un tamaño en bytes a una unidad legible
     */
    formatearTamano(bytes) {
        if (!bytes || bytes === 0) return "0 B"

        const unidades = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))

        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${unidades[i]}`
    },

}