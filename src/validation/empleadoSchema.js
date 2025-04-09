import * as yup from 'yup';

export const empleadoSchema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder los 100 caracteres"),

    apellidos: yup
        .string()
        .required("Los apellidos son requeridos")
        .min(2, "Los apellidos deben tener al menos 2 caracteres")
        .max(100, "Los apellidos no pueden exceder los 100 caracteres"),

    dni_nie: yup
        .string()
        .required("El DNI/NIE es requerido")
        .matches(/^[0-9XYZ][0-9]{7}[A-Z]$/, "El formato del DNI/NIE no es válido"),

    fecha_nacimiento: yup
        .date()
        .max(new Date(), "La fecha de nacimiento no puede ser futura")
        .nullable()
        .transform((value) => (value === '' ? null : value)),

    direccion: yup
        .string()
        .max(200, "La dirección no puede exceder los 200 caracteres")
        .nullable(),

    telefono: yup
        .string()
        .matches(/^[0-9+\s()-]{6,20}$/, "El formato del teléfono no es válido")
        .nullable(),

    email: yup
        .string()
        .email("Debe ser un email válido")
        .max(100, "El email no puede exceder los 100 caracteres")
        .nullable(),

    estado_civil: yup
        .string()
        .oneOf(["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Otro"], "Estado civil no válido")
        .nullable(),

    id_departamento: yup
        .number()
        .transform((value) => (isNaN(value) ? null : value))
        .positive("El ID del departamento debe ser un número positivo")
        .integer("El ID del departamento debe ser un número entero")
        .nullable(),

    id_centro: yup
        .number()
        .transform((value) => (isNaN(value) ? null : value))
        .positive("El ID del centro debe ser un número positivo")
        .integer("El ID del centro debe ser un número entero")
        .nullable(),

    puesto_actual: yup
        .string()
        .max(100, "El puesto actual no puede exceder los 100 caracteres")
        .nullable(),

    fecha_incorporacion: yup
        .date()
        .max(new Date(), "La fecha de incorporación no puede ser futura")
        .nullable()
        .transform((value) => (value === '' ? null : value)),

    activo: yup
        .boolean()
        .default(true),
});

export const validateEmpleado = async (empleado) => {
    try {
        const empleadoNormalizado = {
            ...empleado,
            fecha_nacimiento: empleado.fecha_nacimiento || null,
            fecha_incorporacion: empleado.fecha_incorporacion || null,
            id_departamento: empleado.id_departamento === '' ? null :
                typeof empleado.id_departamento === 'string' ?
                    parseInt(empleado.id_departamento, 10) :
                    empleado.id_departamento,
            id_centro: empleado.id_centro === '' ? null :
                typeof empleado.id_centro === 'string' ?
                    parseInt(empleado.id_centro, 10) :
                    empleado.id_centro,
        };

        await empleadoSchema.validate(empleadoNormalizado, { abortEarly: false });
        return { isValid: true, errors: {} };
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};
            error.inner.forEach((err) => {
                errors[err.path] = err.message;
            });
            return { isValid: false, errors };
        }
        throw error;
    }
};

export const normalizeEmpleado = (empleadoData) => {
    return {
        ...empleadoData,
        id_departamento: empleadoData.id_departamento === '' ? null :
            typeof empleadoData.id_departamento === 'string' ?
                parseInt(empleadoData.id_departamento, 10) :
                empleadoData.id_departamento,
        id_centro: empleadoData.id_centro === '' ? null :
            typeof empleadoData.id_centro === 'string' ?
                parseInt(empleadoData.id_centro, 10) :
                empleadoData.id_centro,
    };
};