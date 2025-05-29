import * as yup from 'yup';

export const verificarSolapamiento = (nuevaAusencia, ausenciasExistentes = []) => {
    if (!ausenciasExistentes || ausenciasExistentes.length === 0) {
        return { haySolapamiento: false, mensaje: '' };
    }

    if (!nuevaAusencia.fecha_inicio) {
        return { haySolapamiento: false, mensaje: '' };
    }

    const fechaInicio = new Date(nuevaAusencia.fecha_inicio);
    const fechaFin = nuevaAusencia.fecha_fin ? new Date(nuevaAusencia.fecha_fin) : new Date();

    const ausenciasAComparar = ausenciasExistentes.filter(
        a => a.id_ausencia !== nuevaAusencia.id_ausencia
    );

    for (const ausencia of ausenciasAComparar) {
        if (ausencia.id_ausencia === nuevaAusencia.id_ausencia) {
            continue;
        }

        const ausenciaInicio = new Date(ausencia.fecha_inicio);
        const ausenciaFin = ausencia.fecha_fin ? new Date(ausencia.fecha_fin) : new Date();

        const hayConflicto = (
            (fechaInicio >= ausenciaInicio && fechaInicio <= ausenciaFin) ||
            (fechaFin >= ausenciaInicio && fechaFin <= ausenciaFin) ||
            (fechaInicio <= ausenciaInicio && fechaFin >= ausenciaFin)
        );

        if (hayConflicto) {
            return {
                haySolapamiento: true,
                mensaje: 'El empleado ya tiene una ausencia registrada en ese período'
            };
        }
    }

    return { haySolapamiento: false, mensaje: '' };
};

export const createAusenciaSchema = yup.object().shape({
    id_tipo_ausencia: yup
        .number()
        .required('El tipo de ausencia es requerido')
        .typeError('El tipo de ausencia debe ser un número'),

    fecha_inicio: yup
        .date()
        .required('La fecha de inicio es requerida')
        .typeError('La fecha de inicio debe ser una fecha válida'),

    fecha_fin: yup
        .date()
        .nullable()
        .typeError('La fecha de fin debe ser una fecha válida')
        .test(
            'fecha-fin-valida',
            'La fecha de fin debe ser igual o posterior a la fecha de inicio',
            function(value) {
                if (!value) return true;

                const fecha_inicio = this.parent.fecha_inicio;
                if (!fecha_inicio) return true;

                return new Date(value) >= new Date(fecha_inicio);
            }
        )
});

export const updateAusenciaSchema = createAusenciaSchema.clone();

export const validateAusencia = async (values, ausenciasExistentes = [], isUpdate = false) => {
    try {
        const schema = isUpdate ? updateAusenciaSchema : createAusenciaSchema;
        await schema.validate(values, { abortEarly: false });

        const { haySolapamiento, mensaje } = verificarSolapamiento(values, ausenciasExistentes);

        if (haySolapamiento) {
            return {
                isValid: false,
                errors: {
                    solapamiento: mensaje,
                    general: mensaje
                }
            };
        }

        return { isValid: true, errors: {} };
    } catch (error) {
        const errors = {};
        if (error.inner && error.inner.length > 0) {
            error.inner.forEach((err) => {
                errors[err.path] = err.message;
            });
        } else {
            errors.general = error.message;
        }
        return { isValid: false, errors };
    }
};

export const validateField = async (field, value, values, ausenciasExistentes = [], isUpdate = false) => {
    try {
        const schema = isUpdate ? updateAusenciaSchema : createAusenciaSchema;

        const tempValues = { ...values };
        tempValues[field] = value;

        await schema.validateAt(field, tempValues);

        return { isValid: true, error: null };
    } catch (error) {
        return { isValid: false, error: error.message };
    }
};

export default {
    createAusenciaSchema,
    updateAusenciaSchema,
    validateAusencia,
    validateField,
    verificarSolapamiento
};