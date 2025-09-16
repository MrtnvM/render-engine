import { DomainError } from './domain.error.js'

export interface FieldError {
  name: string
  value: unknown
  rule: string
}

export class ValidationError extends DomainError {
  readonly fields: FieldError[]

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.fields = (params.metadata?.fields as FieldError[]) || []
  }

  static forField(fieldName: string, fieldValue: unknown, rule: string): ValidationError {
    const fieldError: FieldError = { name: fieldName, value: fieldValue, rule }
    return new ValidationError({
      message: `Field '${fieldName}' failed validation: ${rule}`,
      code: 'VALIDATION_ERROR',
      metadata: { fields: [fieldError] },
    })
  }

  static forFields(fields: FieldError[]): ValidationError {
    const fieldNames = fields.map((f) => f.name).join(', ')
    const message =
      fields.length === 1
        ? `Field '${fields[0].name}' failed validation: ${fields[0].rule}`
        : `Multiple fields failed validation: ${fieldNames}`

    return new ValidationError({
      message,
      code: 'VALIDATION_ERROR',
      metadata: { fields },
    })
  }

  static invalidFormat(fieldName: string, fieldValue: unknown, expectedFormat: string): ValidationError {
    const fieldError: FieldError = {
      name: fieldName,
      value: fieldValue,
      rule: `format must be ${expectedFormat}`,
    }
    return new ValidationError({
      message: `Field '${fieldName}' has invalid format. Expected: ${expectedFormat}, Got: ${String(fieldValue)}`,
      code: 'VALIDATION_ERROR',
      metadata: { fields: [fieldError] },
    })
  }

  static emptyValue(fieldName: string): ValidationError {
    const fieldError: FieldError = {
      name: fieldName,
      value: undefined,
      rule: 'field cannot be empty',
    }
    return new ValidationError({
      message: `Field '${fieldName}' cannot be empty`,
      code: 'VALIDATION_ERROR',
      metadata: { fields: [fieldError] },
    })
  }

  static invalidType(fieldName: string, fieldValue: unknown, expectedType: string): ValidationError {
    const fieldError: FieldError = {
      name: fieldName,
      value: fieldValue,
      rule: `type must be ${expectedType}`,
    }
    return new ValidationError({
      message: `Field '${fieldName}' must be of type ${expectedType}, got ${typeof fieldValue}`,
      code: 'VALIDATION_ERROR',
      metadata: { fields: [fieldError] },
    })
  }

  static multipleEmptyFields(fieldNames: string[]): ValidationError {
    const fields: FieldError[] = fieldNames.map((name) => ({
      name,
      value: undefined,
      rule: 'field cannot be empty',
    }))
    return ValidationError.forFields(fields)
  }

  static multipleInvalidTypes(fieldTypes: { name: string; value: unknown; expectedType: string }[]): ValidationError {
    const fields: FieldError[] = fieldTypes.map(({ name, value, expectedType }) => ({
      name,
      value,
      rule: `type must be ${expectedType}`,
    }))
    return ValidationError.forFields(fields)
  }

  static multipleInvalidFormats(
    fieldFormats: { name: string; value: unknown; expectedFormat: string }[],
  ): ValidationError {
    const fields: FieldError[] = fieldFormats.map(({ name, value, expectedFormat }) => ({
      name,
      value,
      rule: `format must be ${expectedFormat}`,
    }))
    return ValidationError.forFields(fields)
  }

  static duplicate(fieldName: string, message: string): ValidationError {
    return new ValidationError({
      message: `Field '${fieldName}' has duplicate value: ${message}`,
      code: 'VALIDATION_ERROR',
      metadata: { fields: [{ name: fieldName, value: undefined, rule: 'duplicate' }] },
    })
  }
}
