/**
 * DTO для ошибки валидации
 */
export interface ValidationErrorDto {
  code: string
  message: string
  field?: string
  severity: 'error' | 'warning' | 'info'
  line?: number
  column?: number
}

/**
 * DTO для результата валидации
 */
export interface ValidationResultDto {
  isValid: boolean
  errors: ValidationErrorDto[]
  warnings: ValidationErrorDto[]
  info: ValidationErrorDto[]
}
