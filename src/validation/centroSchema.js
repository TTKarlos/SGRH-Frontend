import * as yup from "yup"

export const createCentroSchema = yup.object().shape({
  nombre: yup
    .string()
    .required("El nombre del centro es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),

  direccion: yup.string().nullable().max(255, "La dirección no puede exceder 255 caracteres").trim(),

  telefono: yup
    .string()
    .nullable()
    .matches(/^[+]?[\d\s\-()]+$/, "El teléfono debe contener solo números, espacios, guiones y paréntesis")
    .min(9, "El teléfono debe tener al menos 9 caracteres")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .trim(),

  email: yup
    .string()
    .nullable()
    .email("El email debe tener un formato válido")
    .max(100, "El email no puede exceder 100 caracteres")
    .trim(),

  id_zona: yup
    .number()
    .nullable()
    .typeError("La zona debe ser un número válido")
    .positive("La zona debe ser un número positivo"),
})

export const updateCentroSchema = createCentroSchema.clone()

export const validateCentro = async (values, isUpdate = false) => {
  try {
    const schema = isUpdate ? updateCentroSchema : createCentroSchema
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
    const schema = isUpdate ? updateCentroSchema : createCentroSchema
    const tempValues = { ...values }
    tempValues[field] = value
    await schema.validateAt(field, tempValues)
    return { isValid: true, error: null }
  } catch (error) {
    return { isValid: false, error: error.message }
  }
}

export default {
  createCentroSchema,
  updateCentroSchema,
  validateCentro,
  validateField,
}
