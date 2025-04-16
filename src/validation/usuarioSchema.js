import * as yup from 'yup';

// Esquema para crear un usuario
export const createUserSchema = yup.object().shape({
    nombre_usuario: yup
        .string()
        .required("El nombre de usuario es requerido")
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(50, "El nombre de usuario no puede exceder los 50 caracteres")
        .matches(
            /^[a-zA-Z0-9._-]+$/,
            "El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos",
        ),

    email: yup
        .string()
        .required("El email es requerido")
        .email("Debe ser un email válido")
        .max(100, "El email no puede exceder los 100 caracteres"),

    password_hash: yup
        .string()
        .required("La contraseña es requerida")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(255, "La contraseña no puede exceder los 255 caracteres"),

    nombre: yup
        .string()
        .required("El nombre es requerido")
        .max(50, "El nombre no puede exceder los 50 caracteres"),

    apellidos: yup
        .string()
        .required("Los apellidos son requeridos")
        .max(100, "Los apellidos no pueden exceder los 100 caracteres"),

    id_rol: yup
        .number()
        .required("El rol es requerido")
        .positive("El ID del rol debe ser un número positivo")
        .integer("El ID del rol debe ser un número entero"),

    activo: yup.boolean().default(true),
});

// Esquema para actualizar un usuario (similar pero sin requerir todos los campos)
export const updateUserSchema = yup.object().shape({
    nombre_usuario: yup
        .string()
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(50, "El nombre de usuario no puede exceder los 50 caracteres")
        .matches(
            /^[a-zA-Z0-9._-]+$/,
            "El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos",
        ),

    email: yup
        .string()
        .email("Debe ser un email válido")
        .max(100, "El email no puede exceder los 100 caracteres"),

    nombre: yup
        .string()
        .max(50, "El nombre no puede exceder los 50 caracteres"),

    apellidos: yup
        .string()
        .max(100, "Los apellidos no pueden exceder los 100 caracteres"),

    id_rol: yup
        .number()
        .positive("El ID del rol debe ser un número positivo")
        .integer("El ID del rol debe ser un número entero"),

    activo: yup.boolean(),
});

// Esquema para cambiar contraseña
export const changePasswordSchema = yup.object().shape({
    currentPassword: yup
        .string()
        .required("La contraseña actual es requerida"),

    newPassword: yup
        .string()
        .required("La nueva contraseña es requerida")
        .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
        .max(255, "La nueva contraseña no puede exceder los 255 caracteres")
        .notOneOf([yup.ref("currentPassword")], "La nueva contraseña debe ser diferente a la actual"),
});

// Esquema para resetear contraseña
export const resetPasswordSchema = yup.object().shape({
    newPassword: yup
        .string()
        .required("La nueva contraseña es requerida")
        .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
        .max(255, "La nueva contraseña no puede exceder los 255 caracteres"),
});

// Esquema para cambiar el estado de un usuario
export const changeStatusSchema = yup.object().shape({
    activo: yup
        .boolean()
        .required("El estado (activo) es requerido"),
});

export const validateCreateUser = async (userData) => {
    try {
        const validatedData = await createUserSchema.validate(userData, { abortEarly: false });
        return { isValid: true, data: validatedData, errors: {} };
    } catch (error) {
        const errors = {};
        if (error.inner) {
            error.inner.forEach((err) => {
                errors[err.path] = err.message;
            });
        }
        return { isValid: false, data: userData, errors };
    }
};

export const validateUpdateUser = async (userData) => {
    try {
        const validatedData = await updateUserSchema.validate(userData, { abortEarly: false });
        return { isValid: true, data: validatedData, errors: {} };
    } catch (error) {
        const errors = {};
        if (error.inner) {
            error.inner.forEach((err) => {
                errors[err.path] = err.message;
            });
        }
        return { isValid: false, data: userData, errors };
    }
};

export const validateChangePassword = async (passwordData) => {
    try {
        const validatedData = await changePasswordSchema.validate(passwordData, { abortEarly: false });
        return { isValid: true, data: validatedData, errors: {} };
    } catch (error) {
        const errors = {};
        if (error.inner) {
            error.inner.forEach((err) => {
                errors[err.path] = err.message;
            });
        }
        return { isValid: false, data: passwordData, errors };
    }
};

export const validateResetPassword = async (passwordData) => {
    try {
        const validatedData = await resetPasswordSchema.validate(passwordData, { abortEarly: false });
        return { isValid: true, data: validatedData, errors: {} };
    } catch (error) {
        const errors = {};
        if (error.inner) {
            error.inner.forEach((err) => {
                errors[err.path] = err.message;
            });
        }
        return { isValid: false, data: passwordData, errors };
    }
};