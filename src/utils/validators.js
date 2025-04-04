/**
 * Valida un email
 */
export function validateEmail(email) {
    if (!email) {
        return "El email es requerido"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return "Ingrese un email válido"
    }

    return null
}

/**
 * Valida un nombre
 */
export function validateName(name) {
    if (!name) {
        return "El nombre es requerido"
    }

    if (name.length < 2) {
        return "El nombre debe tener al menos 2 caracteres"
    }

    return null
}

/**
 * Valida un número de teléfono
 */
export function validatePhone(phone) {
    if (!phone) {
        return "El teléfono es requerido"
    }

    const phoneRegex = /^\d{9,15}$/
    if (!phoneRegex.test(phone.replace(/\s+/g, ""))) {
        return "Ingrese un número de teléfono válido"
    }

    return null
}

