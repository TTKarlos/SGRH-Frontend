import * as yup from "yup"

export const createFormacionSchema = yup.object().shape({
  nombre: yup
    .string()
    .required("El nombre de la formación es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),

  es_interna: yup.boolean().default(false),

  fecha_inicio: yup
    .date()
    .required("La fecha de inicio es requerida")
    .typeError("La fecha de inicio debe ser una fecha válida")
    .max(new Date(), "La fecha de inicio no puede ser futura"),

  fecha_fin: yup
    .date()
    .nullable()
    .typeError("La fecha de fin debe ser una fecha válida")
    .test("fecha-fin-valida", "La fecha de fin debe ser igual o posterior a la fecha de inicio", function (value) {
      if (!value) return true

      const fecha_inicio = this.parent.fecha_inicio
      if (!fecha_inicio) return true

      return new Date(value) >= new Date(fecha_inicio)
    })
    .test("fecha-fin-no-futura", "La fecha de fin no puede ser futura", (value) => {
      if (!value) return true
      return new Date(value) <= new Date()
    }),
})

export const updateFormacionSchema = createFormacionSchema.clone()

export const validateFormacion = async (values, isUpdate = false) => {
  try {
    const schema = isUpdate ? updateFormacionSchema : createFormacionSchema
    await schema.validate(values, { abortEarly: false })
    return { isValid: true, errors: {} }
  } catch (error) {
    const errors = {}
    if (error.inner && error.inner.length > 0) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message
      })
    } else {
      errors.general = error.message
    }
    return { isValid: false, errors }
  }
}

export const validateField = async (field, value, values, isUpdate = false) => {
  try {
    const schema = isUpdate ? updateFormacionSchema : createFormacionSchema
    const tempValues = { ...values }
    tempValues[field] = value
    await schema.validateAt(field, tempValues)
    return { isValid: true, error: null }
  } catch (error) {
    return { isValid: false, error: error.message }
  }
}

export default {
  createFormacionSchema,
  updateFormacionSchema,
  validateFormacion,
  validateField,
}
