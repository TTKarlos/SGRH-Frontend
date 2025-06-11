const yup = require("yup")

const createContratoSchema = yup.object().shape({
    id_empleado: yup
        .number()
        .required("El ID del empleado es requerido")
        .positive("El ID del empleado debe ser un número positivo")
        .integer("El ID del empleado debe ser un número entero"),

    id_tipo_contrato: yup
        .number()
        .required("El tipo de contrato es requerido")
        .positive("El ID del tipo de contrato debe ser un número positivo")
        .integer("El ID del tipo de contrato debe ser un número entero"),

    id_empresa: yup
        .number()
        .required("La empresa es requerida")
        .positive("El ID de la empresa debe ser un número positivo")
        .integer("El ID de la empresa debe ser un número entero"),

    id_convenio: yup
        .number()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .positive("El ID del convenio debe ser un número positivo")
        .integer("El ID del convenio debe ser un número entero"),

    id_categoria: yup
        .number()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .positive("El ID de la categoría debe ser un número positivo")
        .integer("El ID de la categoría debe ser un número entero"),

    fecha_inicio: yup.date().required("La fecha de inicio es requerida"),

    fecha_fin: yup
        .date()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .min(yup.ref("fecha_inicio"), "La fecha de fin debe ser posterior a la fecha de inicio"),

    fin_periodo_prueba: yup
        .date()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .min(yup.ref("fecha_inicio"), "La fecha de fin del periodo de prueba debe ser posterior a la fecha de inicio")
        .test(
            "fin_periodo_prueba",
            "La fecha de fin del periodo de prueba debe ser anterior a la fecha de fin",
            function (value) {
                const { fecha_fin } = this.parent
                if (!value || !fecha_fin) return true
                return new Date(value) <= new Date(fecha_fin)
            },
        ),

    antiguedad_contrato: yup
        .number()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .integer("La antigüedad debe ser un número entero")
        .min(0, "La antigüedad no puede ser negativa"),

    observaciones: yup
        .string()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .max(1000, "Las observaciones no pueden exceder los 1000 caracteres"),
})

const updateContratoSchema = yup.object().shape({
    id_empleado: yup
        .number()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .positive("El ID del empleado debe ser un número positivo")
        .integer("El ID del empleado debe ser un número entero"),

    id_tipo_contrato: yup
        .number()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .positive("El ID del tipo de contrato debe ser un número positivo")
        .integer("El ID del tipo de contrato debe ser un número entero"),

    id_empresa: yup
        .number()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .positive("El ID de la empresa debe ser un número positivo")
        .integer("El ID de la empresa debe ser un número entero"),

    id_convenio: yup
        .number()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .positive("El ID del convenio debe ser un número positivo")
        .integer("El ID del convenio debe ser un número entero"),

    id_categoria: yup
        .number()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .positive("El ID de la categoría debe ser un número positivo")
        .integer("El ID de la categoría debe ser un número entero"),

    fecha_inicio: yup.date(),

    fecha_fin: yup
        .date()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .min(yup.ref("fecha_inicio"), "La fecha de fin debe ser posterior a la fecha de inicio"),

    fin_periodo_prueba: yup
        .date()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .min(yup.ref("fecha_inicio"), "La fecha de fin del periodo de prueba debe ser posterior a la fecha de inicio")
        .test(
            "fin_periodo_prueba",
            "La fecha de fin del periodo de prueba debe ser anterior a la fecha de fin",
            function (value) {
                const { fecha_fin } = this.parent
                if (!value || !fecha_fin) return true
                return new Date(value) <= new Date(fecha_fin)
            },
        ),

    antiguedad_contrato: yup
        .number()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .integer("La antigüedad debe ser un número entero")
        .min(0, "La antigüedad no puede ser negativa"),

    observaciones: yup
        .string()
        .nullable()
        .transform((value, originalValue) => {
            return originalValue === "" || originalValue === null || originalValue === undefined ? null : value
        })
        .max(1000, "Las observaciones no pueden exceder los 1000 caracteres"),
})

module.exports = {
    createContratoSchema,
    updateContratoSchema,
}
