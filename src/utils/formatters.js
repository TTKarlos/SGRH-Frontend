/**
 * Formatea una fecha a formato local
 * @param {string|Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export function formatDate(date, options = {}) {
    if (!date) return '';

    const defaultOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };

    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('es-ES', { ...defaultOptions, ...options });
}

/**
 * Formatea un número como moneda
 * @param {number} value - Valor a formatear
 * @param {string} currency - Moneda (EUR, USD, etc.)
 * @returns {string} Valor formateado como moneda
 */
export function formatCurrency(value, currency = 'EUR') {
    if (value === null || value === undefined) return '';

    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency
    }).format(value);
}

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto con la primera letra en mayúscula
 */
export function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @param {string} suffix - Sufijo a añadir si se trunca
 * @returns {string} Texto truncado
 */
export function truncate(text, length = 100, suffix = '...') {
    if (!text) return '';

    if (text.length <= length) {
        return text;
    }

    return text.substring(0, length).trim() + suffix;
}