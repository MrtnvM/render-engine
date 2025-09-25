import { readFileSync } from 'fs'
import { resolve } from 'path'
import { SchemaValidationResult, SchemaValidationContext } from './value-objects/validation-result.vo.js'
import { ValidationEngine, ValidationSchema } from './validation-engine.js'
import { CustomValidatorsRegistry } from './custom-validators.js'
import { ErrorFormatter } from './error-formatter.js'
import { SchemaValidationSeverity } from '../shared/enums/index.js'

export interface ValidationServiceOptions {
  schemaPath?: string
  customValidators?: Map<string, any>
  strict?: boolean
  maxDepth?: number
  maxErrors?: number
}

export interface ValidationRequest {
  data: unknown
  context?: SchemaValidationContext
  options?: {
    strict?: boolean
    includeWarnings?: boolean
    includeInfo?: boolean
    customValidators?: string[]
  }
}

export interface BatchValidationRequest {
  items: Array<{
    id: string
    data: unknown
    context?: SchemaValidationContext
  }>
  options?: ValidationServiceOptions
}

export interface BatchValidationResult {
  total: number
  valid: number
  invalid: number
  results: Array<{
    id: string
    result: SchemaValidationResult
  }>
  summary: {
    totalErrors: number
    totalWarnings: number
    totalInfo: number
    averageDuration: number
  }
}

export class ValidationService {
  private engine: ValidationEngine
  private schema: ValidationSchema
  private customValidators: CustomValidatorsRegistry
  private errorFormatter: ErrorFormatter

  constructor(options: ValidationServiceOptions = {}) {
    this.schema = this.loadSchema(options.schemaPath)
    this.customValidators = new CustomValidatorsRegistry()
    this.engine = ValidationEngine.create(this.schema, {
      customValidators: this.customValidators.getAll(),
      maxDepth: options.maxDepth || 10,
      maxErrors: options.maxErrors || 100,
    })
    this.errorFormatter = ErrorFormatter.create()
  }

  public async validate(request: ValidationRequest): Promise<SchemaValidationResult> {
    const context = {
      ...request.context,
      timestamp: new Date(),
      validator: 'ValidationService',
    }

    const result = await this.engine.validate(request.data, context)

    // Apply custom validations if specified
    if (request.options?.customValidators) {
      for (const validatorName of request.options.customValidators) {
        const validator = this.customValidators.get(validatorName)
        if (validator) {
          const customResult = await validator.validate(request.data, context)
          result = result.merge(customResult)
        }
      }
    }

    return result
  }

  public async validateWithSchema(
    data: unknown,
    schema: ValidationSchema,
    context?: SchemaValidationContext,
  ): Promise<SchemaValidationResult> {
    const customEngine = ValidationEngine.create(schema, {
      customValidators: this.customValidators.getAll(),
    })

    return customEngine.validate(data, context)
  }

  public async batchValidate(request: BatchValidationRequest): Promise<BatchValidationResult> {
    const startTime = Date.now()
    const results: Array<{ id: string; result: SchemaValidationResult }> = []
    let totalErrors = 0
    let totalWarnings = 0
    let totalInfo = 0
    let totalDuration = 0

    for (const item of request.items) {
      const itemStartTime = Date.now()
      const result = await this.validate({
        data: item.data,
        context: item.context,
        options: request.options,
      })
      const itemDuration = Date.now() - itemStartTime

      results.push({
        id: item.id,
        result: {
          ...result,
          duration: itemDuration,
        },
      })

      totalErrors += result.errorCount
      totalWarnings += result.warningCount
      totalInfo += result.infoCount
      totalDuration += itemDuration
    }

    const valid = results.filter((r) => r.result.isValid).length
    const invalid = results.length - valid
    const averageDuration = results.length > 0 ? totalDuration / results.length : 0
    const totalTime = Date.now() - startTime

    return {
      total: results.length,
      valid,
      invalid,
      results,
      summary: {
        totalErrors,
        totalWarnings,
        totalInfo,
        averageDuration,
      },
    }
  }

  public validateSync(request: ValidationRequest): SchemaValidationResult {
    // For synchronous validation, we'll use a simplified approach
    // In a real implementation, you might want to have a sync version of the engine
    const context = {
      ...request.context,
      timestamp: new Date(),
      validator: 'ValidationService',
    }

    // This is a simplified sync version - in practice you'd want a proper sync engine
    return this.runSyncValidation(request.data, context)
  }

  public formatErrors(result: SchemaValidationResult): any {
    return this.errorFormatter.formatReport(result)
  }

  public formatForAdminUI(result: SchemaValidationResult): any {
    return this.errorFormatter.formatForAdminUI(result)
  }

  public formatForClient(result: SchemaValidationResult): any {
    return this.errorFormatter.formatForClientRuntime(result)
  }

  public generateReport(result: SchemaValidationResult): string {
    return this.errorFormatter.generateJSONReport(result)
  }

  public generateHTMLReport(result: SchemaValidationResult): string {
    return this.errorFormatter.generateHTMLReport(result)
  }

  public getSchema(): ValidationSchema {
    return { ...this.schema }
  }

  public updateSchema(schema: ValidationSchema): void {
    this.schema = schema
    this.engine = ValidationEngine.create(schema, {
      customValidators: this.customValidators.getAll(),
    })
  }

  public addCustomValidator(name: string, validator: any): void {
    this.customValidators.register(name, validator)
    this.engine = ValidationEngine.create(this.schema, {
      customValidators: this.customValidators.getAll(),
    })
  }

  public removeCustomValidator(name: string): void {
    // Note: The current architecture doesn't support removing validators from the engine
    // You would need to recreate the engine without that validator
  }

  public getCustomValidators(): string[] {
    return Array.from(this.customValidators.getAll().keys())
  }

  public validateComponentType(componentType: string): boolean {
    const allowedTypes = [
      'Button', 'Label', 'Text', 'Image', 'List', 'Banner', 'Container', 'Row', 'Column', 'Card',
      'Form', 'Input', 'Select', 'Checkbox', 'Radio', 'Modal', 'Alert', 'Progress', 'Icon'
    ]
    return allowedTypes.includes(componentType)
  }

  public validateScenarioDataKey(key: string): boolean {
    // Scenario data keys should follow specific patterns
    const validKeyPattern = /^[a-zA-Z][a-zA-Z0-9_.]*$/
    return validKeyPattern.test(key) && key.length <= 100
  }

  public sanitizeInput(input: string): string {
    // Basic input sanitization
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }

  public validateSecurityConstraints(data: unknown): SchemaValidationResult {
    const context: SchemaValidationContext = {
      timestamp: new Date(),
      validator: 'SecurityValidator',
    }

    const securityValidator = this.customValidators.get('security')
    if (securityValidator) {
      return securityValidator.validate(data, context) as any
    }

    return SchemaValidationResult.success(context)
  }

  public createValidationContext(
    path?: string,
    metadata?: Record<string, unknown>,
  ): SchemaValidationContext {
    return {
      path,
      ...metadata,
      timestamp: new Date(),
    }
  }

  private loadSchema(schemaPath?: string): ValidationSchema {
    if (schemaPath) {
      try {
        const fullPath = resolve(schemaPath)
        const schemaContent = readFileSync(fullPath, 'utf-8')
        return JSON.parse(schemaContent)
      } catch (error) {
        console.error('Failed to load schema:', error)
      }
    }

    // Return the default master schema
    const defaultSchemaPath = resolve(__dirname, 'master.schema.json')
    try {
      const schemaContent = readFileSync(defaultSchemaPath, 'utf-8')
      return JSON.parse(schemaContent)
    } catch {
      // Return a minimal schema if file doesn't exist
      return {
        type: 'object',
        additionalProperties: true,
      }
    }
  }

  private runSyncValidation(data: unknown, context: SchemaValidationContext): SchemaValidationResult {
    // Simplified synchronous validation for basic cases
    // This is a placeholder - in a real implementation you'd have proper sync validation

    const errors: any[] = []

    // Basic type validation
    if (typeof data !== 'object' || data === null) {
      errors.push({
        id: `sync_error_${Date.now()}`,
        code: 'INVALID_TYPE',
        message: 'Data must be an object',
        path: '$',
        severity: SchemaValidationSeverity.ERROR,
        timestamp: new Date(),
      })
    }

    if (errors.length > 0) {
      return SchemaValidationResult.failure(errors)
    }

    return SchemaValidationResult.success(context)
  }

  public static create(options?: ValidationServiceOptions): ValidationService {
    return new ValidationService(options)
  }

  public static createWithCustomSchema(schema: ValidationSchema, options?: ValidationServiceOptions): ValidationService {
    const service = new ValidationService({ ...options, schemaPath: undefined })
    service.updateSchema(schema)
    return service
  }
}