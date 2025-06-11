import * as yup from "yup"

export const createConvenioSchema = yup.object().shape({
  nombre: yup
    .string()
    .required("El nombre del convenio es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),

  codigo: yup
    .string()
    .required("El código del convenio es requerido")
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "El código no puede exceder 20 caracteres")
    .matches(/^[A-Z0-9_-]+$/, "El código solo puede contener letras mayúsculas, números, guiones y guiones bajos")
    .trim(),

  descripcion: yup.string().nullable().max(500, "La descripción no puede exceder 500 caracteres").trim(),
})

export const updateConvenioSchema = createConvenioSchema.clone()

export const validateConvenio = async (values, isUpdate = false) => {
  try {
    const schema = isUpdate ? updateConvenioSchema : createConvenioSchema
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
    const schema = isUpdate ? updateConvenioSchema : createConvenioSchema
    const tempValues = { ...values }
    tempValues[field] = value
    await schema.validateAt(field, tempValues)
    return { isValid: true, error: null }
  } catch (error) {
    return { isValid: false, error: error.message }
  }
}

export default {
  createConvenioSchema,
  updateConvenioSchema,
  validateConvenio,
  validateField,
}
