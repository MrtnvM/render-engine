import { SchemaValidationRuleType } from '../../shared/enums/validation-rule-type.enum.js'

export interface ValidationResultItem {
  message: string
  type: 'debug' | 'info' | 'warning' | 'error'
  code?: string
  path?: string
}

export class ValidationResult {
  private constructor(
    public readonly isValid: boolean,
    public readonly errors: ValidationResultItem[],
    public readonly warnings: ValidationResultItem[],
    public readonly info: ValidationResultItem[],
  ) {}

  static create(items: ValidationResultItem[]): ValidationResult {
    const errors = items.filter((item) => item.type === 'error')
    const warnings = items.filter((item) => item.type === 'warning')
    const info = items.filter((item) => item.type === 'info')

    return new ValidationResult(errors.length === 0, errors, warnings, info)
  }

  static success(): ValidationResult {
    return new ValidationResult(true, [], [], [])
  }

  static failure(errors: ValidationResultItem[]): ValidationResult {
    return new ValidationResult(false, errors, [], [])
  }
}

export class ValidationRule {
  constructor(
    public readonly type: SchemaValidationRuleType,
    public readonly message?: string,
    public readonly parameters?: Record<string, unknown>,
  ) {}

  public validate(value: unknown): ValidationResult {
    const items: ValidationResultItem[] = []

    try {
      const result = this.executeValidation(value)
      if (!result) {
        items.push({
          message: this.interpolateMessage(this.message || this.getDefaultMessage()),
          type: 'error',
          code: this.type,
        })
      }
    } catch (error) {
      items.push({
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        code: this.type,
      })
    }

    return ValidationResult.create(items)
  }

  private executeValidation(value: unknown): boolean {
    switch (this.type) {
      case SchemaValidationRuleType.REQUIRED:
        return value !== null && value !== undefined

      case SchemaValidationRuleType.TYPE:
        return this.validateType(value)

      case SchemaValidationRuleType.MIN:
        return this.validateMin(value)

      case SchemaValidationRuleType.MAX:
        return this.validateMax(value)

      case SchemaValidationRuleType.MIN_LENGTH:
        return this.validateMinLength(value)

      case SchemaValidationRuleType.MAX_LENGTH:
        return this.validateMaxLength(value)

      case SchemaValidationRuleType.PATTERN:
        return this.validatePattern(value)

      case SchemaValidationRuleType.EMAIL:
        return this.validateEmail(value)

      case SchemaValidationRuleType.URL:
        return this.validateURL(value)

      case SchemaValidationRuleType.ENUM:
        return this.validateEnum(value)

      case SchemaValidationRuleType.RANGE:
        return this.validateRange(value)

      case SchemaValidationRuleType.POSITIVE:
        return this.validatePositive(value)

      case SchemaValidationRuleType.NEGATIVE:
        return this.validateNegative(value)

      case SchemaValidationRuleType.UUID:
        return this.validateUUID(value)

      default:
        return true
    }
  }

  private validateType(value: unknown): boolean {
    const expectedType = this.parameters?.type as string
    if (!expectedType) return true

    switch (expectedType) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !Number.isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      default:
        return true
    }
  }

  private validateMin(value: unknown): boolean {
    const min = this.parameters?.min as number
    if (typeof min !== 'number' || typeof value !== 'number') return true
    return value >= min
  }

  private validateMax(value: unknown): boolean {
    const max = this.parameters?.max as number
    if (typeof max !== 'number' || typeof value !== 'number') return true
    return value <= max
  }

  private validateMinLength(value: unknown): boolean {
    const minLength = this.parameters?.minLength as number
    if (typeof minLength !== 'number') return true

    if (typeof value === 'string') return value.length >= minLength
    if (Array.isArray(value)) return value.length >= minLength
    return true
  }

  private validateMaxLength(value: unknown): boolean {
    const maxLength = this.parameters?.maxLength as number
    if (typeof maxLength !== 'number') return true

    if (typeof value === 'string') return value.length <= maxLength
    if (Array.isArray(value)) return value.length <= maxLength
    return true
  }

  private validatePattern(value: unknown): boolean {
    const pattern = this.parameters?.pattern as string
    if (typeof pattern !== 'string' || typeof value !== 'string') return true

    const regex = new RegExp(pattern)
    return regex.test(value)
  }

  private validateEmail(value: unknown): boolean {
    if (typeof value !== 'string') return false
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    return emailRegex.test(value)
  }

  private validateURL(value: unknown): boolean {
    if (typeof value !== 'string') return false
    try {
      const url = new URL(value)
      return url !== null
    } catch {
      return false
    }
  }

  private validateEnum(value: unknown): boolean {
    const enumValues = this.parameters?.values as unknown[]
    if (!Array.isArray(enumValues)) return true
    return enumValues.includes(value)
  }

  private validateRange(value: unknown): boolean {
    const min = this.parameters?.min as number
    const max = this.parameters?.max as number
    if (typeof min !== 'number' || typeof max !== 'number' || typeof value !== 'number') return true
    return value >= min && value <= max
  }

  private validatePositive(value: unknown): boolean {
    if (typeof value !== 'number') return true
    return value > 0
  }

  private validateNegative(value: unknown): boolean {
    if (typeof value !== 'number') return true
    return value < 0
  }

  private validateUUID(value: unknown): boolean {
    if (typeof value !== 'string') return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
  }

  private getDefaultMessage(): string {
    const messages: Record<SchemaValidationRuleType, string> = {
      [SchemaValidationRuleType.REQUIRED]: 'This field is required',
      [SchemaValidationRuleType.TYPE]: 'Invalid type',
      [SchemaValidationRuleType.MIN]: 'Value must be at least {{min}}',
      [SchemaValidationRuleType.MAX]: 'Value must be at most {{max}}',
      [SchemaValidationRuleType.MIN_LENGTH]: 'Value must be at least {{minLength}} characters long',
      [SchemaValidationRuleType.MAX_LENGTH]: 'Value must be at most {{maxLength}} characters long',
      [SchemaValidationRuleType.PATTERN]: 'Value does not match the required pattern',
      [SchemaValidationRuleType.EMAIL]: 'Please enter a valid email address',
      [SchemaValidationRuleType.URL]: 'Please enter a valid URL',
      [SchemaValidationRuleType.ENUM]: 'Please select a valid value',
      [SchemaValidationRuleType.MIN_DATE]: 'Date must be after {{minDate}}',
      [SchemaValidationRuleType.MAX_DATE]: 'Date must be before {{maxDate}}',
      [SchemaValidationRuleType.FUTURE_DATE]: 'Date must be in the future',
      [SchemaValidationRuleType.PAST_DATE]: 'Date must be in the past',
      [SchemaValidationRuleType.MIN_ITEMS]: 'Array must have at least {{minItems}} items',
      [SchemaValidationRuleType.MAX_ITEMS]: 'Array must have at most {{maxItems}} items',
      [SchemaValidationRuleType.UNIQUE_ITEMS]: 'Array items must be unique',
      [SchemaValidationRuleType.POSITIVE]: 'Value must be positive',
      [SchemaValidationRuleType.NEGATIVE]: 'Value must be negative',
      [SchemaValidationRuleType.INTEGER]: 'Value must be an integer',
      [SchemaValidationRuleType.NUMBER]: 'Value must be a number',
      [SchemaValidationRuleType.FLOAT]: 'Value must be a float',
      [SchemaValidationRuleType.MULTIPLE_OF]: 'Value must be a multiple of {{multipleOf}}',
      [SchemaValidationRuleType.MIN_PROPERTIES]: 'Object must have at least {{minProperties}} properties',
      [SchemaValidationRuleType.MAX_PROPERTIES]: 'Object must have at most {{maxProperties}} properties',
      [SchemaValidationRuleType.FORMAT]: 'Value format is invalid',
      [SchemaValidationRuleType.CUSTOM_FORMAT]: 'Value custom format is invalid',
      [SchemaValidationRuleType.BUSINESS_RULE]: 'Business rule validation failed',
      [SchemaValidationRuleType.CUSTOM]: 'Custom validation failed',
      [SchemaValidationRuleType.ASYNC]: 'Async validation failed',
      [SchemaValidationRuleType.REFERENCE]: 'Reference validation failed',
      [SchemaValidationRuleType.EXISTS]: 'Value must exist',
      [SchemaValidationRuleType.UNIQUE]: 'Value must be unique',
      [SchemaValidationRuleType.CONDITIONAL]: 'Conditional validation failed',
      [SchemaValidationRuleType.IF_THEN_ELSE]: 'If-then-else validation failed',
      [SchemaValidationRuleType.ALL_OF]: 'All of validation failed',
      [SchemaValidationRuleType.ANY_OF]: 'Any of validation failed',
      [SchemaValidationRuleType.ONE_OF]: 'One of validation failed',
      [SchemaValidationRuleType.NOT]: 'Not validation failed',
      [SchemaValidationRuleType.PHONE]: 'Please enter a valid phone number',
      [SchemaValidationRuleType.ZIP_CODE]: 'Please enter a valid zip code',
      [SchemaValidationRuleType.UUID]: 'Please enter a valid UUID',
      [SchemaValidationRuleType.RANGE]: 'Value must be between {{min}} and {{max}}',
      [SchemaValidationRuleType.CONTAINS]: 'Array must contain {{contains}}',
      [SchemaValidationRuleType.REQUIRED_PROPERTIES]: 'Required properties are missing',
      [SchemaValidationRuleType.DEPENDENT_PROPERTIES]: 'Dependent properties validation failed',
    }

    return messages[this.type] || 'Validation failed'
  }

  private interpolateMessage(message: string): string {
    if (this.parameters) {
      Object.entries(this.parameters).forEach(([key, value]) => {
        message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
      })
    }

    return message
  }

  static required(message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.REQUIRED, message)
  }

  static type(expectedType: string, message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.TYPE, message, { type: expectedType })
  }

  static min(min: number, message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.MIN, message, { min })
  }

  static max(max: number, message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.MAX, message, { max })
  }

  static minLength(minLength: number, message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.MIN_LENGTH, message, { minLength })
  }

  static maxLength(maxLength: number, message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.MAX_LENGTH, message, { maxLength })
  }

  static pattern(pattern: string, message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.PATTERN, message, { pattern })
  }

  static email(message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.EMAIL, message)
  }

  static url(message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.URL, message)
  }

  static enum(values: unknown[], message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.ENUM, message, { values })
  }

  // Additional essential validation rules
  static range(min: number, max: number, message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.RANGE, message, { min, max })
  }

  static positive(message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.POSITIVE, message)
  }

  static negative(message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.NEGATIVE, message)
  }

  static uuid(message?: string): ValidationRule {
    return new ValidationRule(SchemaValidationRuleType.UUID, message)
  }
}
