import { SchemaValidationResult, SchemaValidationError, SchemaValidationContext } from './value-objects/validation-result.vo.js'
import { ValidationService, ValidationRequest } from './validation.service.js'
import { SchemaValidationSeverity } from '../shared/enums/index.js'
import { DataTypeCategory } from '../schema-definition/value-objects/data-type.value-object.js'

export interface StoreValidationRule {
  kind: DataTypeCategory
  required: boolean
  defaultValue?: unknown
  min?: number
  max?: number
  pattern?: string
}

export interface StoreValidationOptions {
  mode: 'strict' | 'lenient'
  schema: Record<string, StoreValidationRule>
}

export interface StoreValue {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'color' | 'url' | 'array' | 'object' | 'null'
  value: unknown
}

export interface StorePatch {
  op: 'set' | 'remove' | 'merge'
  keyPath: string
  oldValue?: StoreValue
  newValue?: StoreValue
}

export interface StoreChange {
  scenarioID: string
  patches: StorePatch[]
  transactionID?: string
}

export class StoreValidationAdapter {
  private validationService: ValidationService
  private options: StoreValidationOptions

  constructor(validationService: ValidationService, options: StoreValidationOptions) {
    this.validationService = validationService
    this.options = options
  }

  public validateWrite(keyPath: string, value: StoreValue): { isValid: boolean; reason?: string } {
    const rule = this.options.schema[keyPath]
    if (!rule) {
      // No validation rule defined, allow any value
      return { isValid: true }
    }

    const validationContext: SchemaValidationContext = {
      path: keyPath,
      timestamp: new Date(),
      validator: 'StoreValidationAdapter',
    }

    // Convert StoreValue to validation format
    const validationValue = this.storeValueToValidationValue(value)

    // Create a temporary schema for this specific validation
    const tempSchema = this.createSchemaForRule(keyPath, rule)

    const result = this.validationService.validateWithSchema(validationValue, tempSchema, validationContext)

    if (result.isValid) {
      return { isValid: true }
    }

    const errorMessage = result.errors[0]?.message || 'Validation failed'
    return { isValid: false, reason: errorMessage }
  }

  public validateWriteLenient(keyPath: string, value: StoreValue): StoreValue {
    const rule = this.options.schema[keyPath]
    if (!rule) {
      return value
    }

    const validationContext: SchemaValidationContext = {
      path: keyPath,
      timestamp: new Date(),
      validator: 'StoreValidationAdapter',
    }

    const validationValue = this.storeValueToValidationValue(value)
    const tempSchema = this.createSchemaForRule(keyPath, rule)

    const result = this.validationService.validateWithSchema(validationValue, tempSchema, validationContext)

    if (result.isValid) {
      return value
    }

    // In lenient mode, try to coerce or use default value
    if (this.options.mode === 'lenient') {
      // Try to coerce the value
      const coercedValue = this.coerceValue(validationValue, rule)
      if (coercedValue !== undefined) {
        return this.validationValueToStoreValue(coercedValue)
      }

      // Use default value if available
      if (rule.defaultValue !== undefined) {
        return this.validationValueToStoreValue(rule.defaultValue)
      }

      // Return original value with a warning logged
      console.warn(`Validation failed for ${keyPath}: ${result.errors[0]?.message || 'Unknown error'}`)
    }

    return value
  }

  public validateScenarioData(scenarioData: Record<string, StoreValue>): SchemaValidationResult {
    const context: SchemaValidationContext = {
      timestamp: new Date(),
      validator: 'StoreValidationAdapter',
    }

    // Create a schema for the entire scenario data
    const scenarioSchema = this.createScenarioDataSchema(scenarioData)

    const result = this.validationService.validateWithSchema(scenarioData, scenarioSchema, context)

    return result
  }

  public validatePatch(patch: StorePatch): { isValid: boolean; reason?: string } {
    const rule = this.options.schema[patch.keyPath]

    if (!rule) {
      return { isValid: true }
    }

    if (!patch.newValue) {
      return { isValid: true } // Remove operation doesn't need validation
    }

    return this.validateWrite(patch.keyPath, patch.newValue)
  }

  public validateChange(change: StoreChange): SchemaValidationResult {
    const context: SchemaValidationContext = {
      timestamp: new Date(),
      validator: 'StoreValidationAdapter',
    }

    let result = SchemaValidationResult.success(context)

    for (const patch of change.patches) {
      const patchValidation = this.validatePatch(patch)

      if (!patchValidation.isValid) {
        result = SchemaValidationResult.failure([
          {
            id: `patch_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            code: 'PATCH_VALIDATION_ERROR',
            message: patchValidation.reason || 'Patch validation failed',
            path: patch.keyPath,
            severity: SchemaValidationSeverity.ERROR,
            details: { patch },
            timestamp: new Date(),
          },
        ])
      }
    }

    return result
  }

  public createValidationSchema(scenarioData: Record<string, StoreValue>): any {
    const schema: Record<string, any> = {}

    for (const [keyPath, storeValue] of Object.entries(scenarioData)) {
      const rule = this.options.schema[keyPath]
      if (rule) {
        schema[keyPath] = this.createSchemaForRule(keyPath, rule)
      } else {
        // Create a schema based on the actual value type
        schema[keyPath] = this.createSchemaFromStoreValue(storeValue)
      }
    }

    return {
      type: 'object',
      properties: schema,
      additionalProperties: false,
    }
  }

  public mergeValidationOptions(newOptions: StoreValidationOptions): StoreValidationOptions {
    return {
      mode: newOptions.mode,
      schema: {
        ...this.options.schema,
        ...newOptions.schema,
      },
    }
  }

  public getValidationOptions(): StoreValidationOptions {
    return { ...this.options }
  }

  public updateValidationOptions(options: StoreValidationOptions): void {
    this.options = options
  }

  private storeValueToValidationValue(storeValue: StoreValue): unknown {
    switch (storeValue.type) {
      case 'string':
        return storeValue.value
      case 'number':
      case 'integer':
        return Number(storeValue.value)
      case 'boolean':
        return Boolean(storeValue.value)
      case 'color':
        return storeValue.value // Color is already a string
      case 'url':
        return storeValue.value // URL is already a string
      case 'array':
        if (Array.isArray(storeValue.value)) {
          return storeValue.value.map((item) => {
            if (typeof item === 'object' && item !== null && 'type' in item && 'value' in item) {
              return this.storeValueToValidationValue(item as StoreValue)
            }
            return item
          })
        }
        return []
      case 'object':
        if (typeof storeValue.value === 'object' && storeValue.value !== null && !Array.isArray(storeValue.value)) {
          const result: Record<string, unknown> = {}
          for (const [key, value] of Object.entries(storeValue.value)) {
            if (typeof value === 'object' && value !== null && 'type' in value && 'value' in value) {
              result[key] = this.storeValueToValidationValue(value as StoreValue)
            } else {
              result[key] = value
            }
          }
          return result
        }
        return {}
      case 'null':
        return null
      default:
        return storeValue.value
    }
  }

  private validationValueToStoreValue(value: unknown): StoreValue {
    if (value === null) {
      return { type: 'null', value: null }
    }

    switch (typeof value) {
      case 'string':
        // Check if it's a color (hex format)
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(value)) {
          return { type: 'color', value }
        }
        // Check if it's a URL
        try {
          new URL(value)
          return { type: 'url', value }
        } catch {
          return { type: 'string', value }
        }
      case 'number':
        return Number.isInteger(value)
          ? { type: 'integer', value }
          : { type: 'number', value }
      case 'boolean':
        return { type: 'boolean', value }
      case 'object':
        if (Array.isArray(value)) {
          return {
            type: 'array',
            value: value.map((item) => this.validationValueToStoreValue(item)),
          }
        } else {
          const obj: Record<string, StoreValue> = {}
          for (const [key, val] of Object.entries(value)) {
            obj[key] = this.validationValueToStoreValue(val)
          }
          return { type: 'object', value: obj }
        }
      default:
        return { type: 'string', value: String(value) }
    }
  }

  private createSchemaForRule(keyPath: string, rule: StoreValidationRule): any {
    const baseSchema: any = {
      type: this.getJsonSchemaType(rule.kind),
    }

    if (rule.required) {
      // This would be handled at a higher level in the schema
    }

    if (rule.min !== undefined) {
      if (rule.kind === DataTypeCategory.STRING) {
        baseSchema.minLength = rule.min
      } else {
        baseSchema.minimum = rule.min
      }
    }

    if (rule.max !== undefined) {
      if (rule.kind === DataTypeCategory.STRING) {
        baseSchema.maxLength = rule.max
      } else {
        baseSchema.maximum = rule.max
      }
    }

    if (rule.pattern) {
      baseSchema.pattern = rule.pattern
    }

    return baseSchema
  }

  private createSchemaFromStoreValue(storeValue: StoreValue): any {
    const baseSchema: any = {
      type: this.getJsonSchemaType(storeValue.type),
    }

    // Add specific constraints based on the value
    switch (storeValue.type) {
      case 'color':
        baseSchema.pattern = '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$'
        break
      case 'url':
        baseSchema.format = 'uri'
        break
      case 'array':
        baseSchema.items = { type: 'unknown' } // Could be refined further
        break
      case 'object':
        baseSchema.additionalProperties = true
        break
    }

    return baseSchema
  }

  private createScenarioDataSchema(scenarioData: Record<string, StoreValue>): any {
    const properties: Record<string, any> = {}

    for (const [key, value] of Object.entries(scenarioData)) {
      properties[key] = this.createSchemaFromStoreValue(value)
    }

    return {
      type: 'object',
      properties,
      additionalProperties: false,
    }
  }

  private getJsonSchemaType(kind: DataTypeCategory | string): string {
    switch (kind) {
      case DataTypeCategory.STRING:
      case 'color':
      case 'url':
        return 'string'
      case DataTypeCategory.NUMBER:
      case DataTypeCategory.FLOAT:
        return 'number'
      case DataTypeCategory.INTEGER:
        return 'integer'
      case DataTypeCategory.BOOLEAN:
        return 'boolean'
      case DataTypeCategory.ARRAY:
        return 'array'
      case DataTypeCategory.OBJECT:
        return 'object'
      case 'null':
        return 'null'
      default:
        return 'string'
    }
  }

  private coerceValue(value: unknown, rule: StoreValidationRule): unknown {
    if (value === null || value === undefined) {
      return rule.defaultValue
    }

    switch (rule.kind) {
      case DataTypeCategory.STRING:
        return String(value)
      case DataTypeCategory.NUMBER:
      case DataTypeCategory.FLOAT:
        const num = Number(value)
        return Number.isNaN(num) ? rule.defaultValue : num
      case DataTypeCategory.INTEGER:
        const int = Math.floor(Number(value))
        return Number.isNaN(int) ? rule.defaultValue : int
      case DataTypeCategory.BOOLEAN:
        if (typeof value === 'boolean') return value
        if (typeof value === 'string') {
          const lower = value.toLowerCase()
          if (lower === 'true' || lower === '1' || lower === 'yes') return true
          if (lower === 'false' || lower === '0' || lower === 'no') return false
        }
        if (typeof value === 'number') return value !== 0
        return rule.defaultValue
      default:
        return value
    }
  }

  public static create(validationService: ValidationService, options: StoreValidationOptions): StoreValidationAdapter {
    return new StoreValidationAdapter(validationService, options)
  }
}