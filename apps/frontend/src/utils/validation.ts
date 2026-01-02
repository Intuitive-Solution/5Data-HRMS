import { useState, useCallback } from 'react'

// Validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+\d{1,4}[\s-]?\d{4,14}$/

// Types
export type ValidationRule = {
  type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'pattern'
  value?: number | RegExp
  message: string
}

export type FieldRules = Record<string, ValidationRule[]>
export type FieldErrors = Record<string, string | undefined>
export type TouchedFields = Record<string, boolean>

// Validators
export const validators = {
  required: (value: string | undefined | null): boolean => {
    return value !== undefined && value !== null && value.toString().trim() !== ''
  },
  email: (value: string | undefined | null): boolean => {
    if (!value || value.trim() === '') return true // Allow empty for optional
    return EMAIL_REGEX.test(value)
  },
  phone: (value: string | undefined | null): boolean => {
    if (!value || value.trim() === '') return true // Allow empty for optional
    return PHONE_REGEX.test(value)
  },
  minLength: (value: string | undefined | null, min: number): boolean => {
    if (!value) return true
    return value.trim().length >= min
  },
  maxLength: (value: string | undefined | null, max: number): boolean => {
    if (!value) return true
    return value.trim().length <= max
  },
  pattern: (value: string | undefined | null, regex: RegExp): boolean => {
    if (!value || value.trim() === '') return true
    return regex.test(value)
  },
}

// Validate a single field
export function validateField(
  value: string | undefined | null,
  rules: ValidationRule[]
): string | undefined {
  for (const rule of rules) {
    let isValid = true

    switch (rule.type) {
      case 'required':
        isValid = validators.required(value)
        break
      case 'email':
        isValid = validators.email(value)
        break
      case 'phone':
        isValid = validators.phone(value)
        break
      case 'minLength':
        isValid = validators.minLength(value, rule.value as number)
        break
      case 'maxLength':
        isValid = validators.maxLength(value, rule.value as number)
        break
      case 'pattern':
        isValid = validators.pattern(value, rule.value as RegExp)
        break
    }

    if (!isValid) {
      return rule.message
    }
  }

  return undefined
}

// Validate all fields
export function validateAllFields<T extends Record<string, any>>(
  data: T,
  rules: FieldRules
): FieldErrors {
  const errors: FieldErrors = {}

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = data[fieldName]
    const error = validateField(value, fieldRules)
    if (error) {
      errors[fieldName] = error
    }
  }

  return errors
}

// Hook for form validation
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  rules: FieldRules
) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<TouchedFields>({})

  const validateSingleField = useCallback(
    (fieldName: string, value: string | undefined | null) => {
      const fieldRules = rules[fieldName]
      if (!fieldRules) return undefined
      return validateField(value, fieldRules)
    },
    [rules]
  )

  const handleChange = useCallback(
    (fieldName: keyof T, value: any) => {
      setData((prev) => ({ ...prev, [fieldName]: value }))

      // Clear error on change if field was touched
      if (touched[fieldName as string]) {
        const error = validateSingleField(fieldName as string, value)
        setErrors((prev) => ({ ...prev, [fieldName]: error }))
      }
    },
    [touched, validateSingleField]
  )

  const handleBlur = useCallback(
    (fieldName: keyof T) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }))
      const error = validateSingleField(fieldName as string, data[fieldName])
      setErrors((prev) => ({ ...prev, [fieldName]: error }))
    },
    [data, validateSingleField]
  )

  const validateAll = useCallback((): boolean => {
    const allErrors = validateAllFields(data, rules)
    setErrors(allErrors)

    // Mark all fields as touched
    const allTouched: TouchedFields = {}
    Object.keys(rules).forEach((key) => {
      allTouched[key] = true
    })
    setTouched(allTouched)

    return Object.keys(allErrors).length === 0
  }, [data, rules])

  const resetForm = useCallback(
    (newData?: T) => {
      setData(newData ?? initialData)
      setErrors({})
      setTouched({})
    },
    [initialData]
  )

  const setFormData = useCallback((newData: T) => {
    setData(newData)
    setErrors({})
    setTouched({})
  }, [])

  // ARIA helpers
  const getFieldProps = useCallback(
    (fieldName: keyof T) => ({
      'aria-invalid': !!errors[fieldName as string],
      'aria-describedby': errors[fieldName as string]
        ? `${String(fieldName)}-error`
        : undefined,
    }),
    [errors]
  )

  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setFormData,
    getFieldProps,
  }
}

