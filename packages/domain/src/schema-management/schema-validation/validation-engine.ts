import { SchemaValidationResult, SchemaValidationError, SchemaValidationContext } from './value-objects/validation-result.vo.js'
import { SchemaValidationRule, SchemaValidationRuleType } from '../schema-definition/value-objects/validation-rule.value-object.js'
import { DataType, DataTypeCategory } from '../schema-definition/value-objects/data-type.value-object.js'

export interface ValidationOptions {
  strict?: boolean
  context?: SchemaValidationContext
  customValidators?: Map<string, CustomValidator>
  maxDepth?: number
  maxErrors?: number
}

export interface CustomValidator {
  validate(value: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> | SchemaValidationResult
}

export interface SchemaNode {
  type: string
  required?: string[]
  properties?: Record<string, SchemaNode>
  items?: SchemaNode
  enum?: unknown[]
  const?: unknown
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  format?: string
  allOf?: SchemaNode[]
  anyOf?: SchemaNode[]
  oneOf?: SchemaNode[]
  not?: SchemaNode
  $ref?: string
  definitions?: Record<string, SchemaNode>
  [key: string]: unknown
}

export interface ValidationSchema {
  $schema?: string
  $id?: string
  type: string
  required?: string[]
  properties?: Record<string, SchemaNode>
  items?: SchemaNode
  enum?: unknown[]
  const?: unknown
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  format?: string
  allOf?: SchemaNode[]
  anyOf?: SchemaNode[]
  oneOf?: SchemaNode[]
  not?: SchemaNode
  $ref?: string
  definitions?: Record<string, SchemaNode>
  [key: string]: unknown
}

export class ValidationEngine {
  private schema: ValidationSchema
  private customValidators: Map<string, CustomValidator>
  private maxDepth: number
  private maxErrors: number
  private currentDepth: number = 0
  private errorCount: number = 0

  constructor(schema: ValidationSchema, options: ValidationOptions = {}) {
    this.schema = schema
    this.customValidators = options.customValidators || new Map()
    this.maxDepth = options.maxDepth || 10
    this.maxErrors = options.maxErrors || 100
    this.currentDepth = 0
    this.errorCount = 0
  }

  public async validate(data: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> {
    this.currentDepth = 0
    this.errorCount = 0

    const startTime = Date.now()
    const result = await this.validateNode(data, this.schema, context || { timestamp: new Date() })

    const duration = Date.now() - startTime
    const metadata = {
      timestamp: new Date(),
      validator: 'ValidationEngine',
      version: '1.0.0',
      duration,
    }

    return new SchemaValidationResult({
      ...result.value,
      metadata,
    })
  }

  private async validateNode(
    data: unknown,
    schema: SchemaNode,
    context: SchemaValidationContext,
    path: string = '$',
  ): Promise<SchemaValidationResult> {
    if (this.currentDepth > this.maxDepth) {
      return SchemaValidationResult.failure([
        this.createError('Maximum validation depth exceeded', path, context),
      ])
    }

    if (this.errorCount >= this.maxErrors) {
      return SchemaValidationResult.failure([
        this.createError('Maximum error count exceeded', path, context),
      ])
    }

    this.currentDepth++

    try {
      let result = SchemaValidationResult.success(context)

      // Handle $ref
      if (schema.$ref) {
        const resolvedSchema = this.resolveRef(schema.$ref, schema)
        if (resolvedSchema) {
          result = await this.validateNode(data, resolvedSchema, context, path)
        } else {
          result = SchemaValidationResult.failure([
            this.createError(`Unable to resolve reference: ${schema.$ref}`, path, context),
          ])
        }
      }
      // Handle type validation
      else if (schema.type) {
        result = this.validateType(data, schema, context, path)
      }
      // Handle enum validation
      else if (schema.enum) {
        result = this.validateEnum(data, schema, context, path)
      }
      // Handle const validation
      else if (schema.const !== undefined) {
        result = this.validateConst(data, schema, context, path)
      }
      // Handle combined schemas
      else if (schema.allOf || schema.anyOf || schema.oneOf) {
        result = await this.validateCombinedSchemas(data, schema, context, path)
      } else {
        // Default: accept any value
        result = SchemaValidationResult.success(context)
      }

      // Handle additional validations
      if (result.isValid) {
        result = this.applyAdditionalValidations(data, schema, context, path, result)
      }

      return result
    } finally {
      this.currentDepth--
    }
  }

  private validateType(
    data: unknown,
    schema: SchemaNode,
    context: SchemaValidationContext,
    path: string,
  ): SchemaValidationResult {
    const expectedType = schema.type
    let isValid = false

    switch (expectedType) {
      case 'null':
        isValid = data === null
        break
      case 'boolean':
        isValid = typeof data === 'boolean'
        break
      case 'number':
      case 'integer':
        isValid = typeof data === 'number' && !Number.isNaN(data)
        if (isValid && expectedType === 'integer') {
          isValid = Number.isInteger(data)
        }
        break
      case 'string':
        isValid = typeof data === 'string'
        break
      case 'array':
        isValid = Array.isArray(data)
        break
      case 'object':
        isValid = typeof data === 'object' && data !== null && !Array.isArray(data)
        break
      default:
        isValid = true // Unknown types are considered valid
    }

    if (!isValid) {
      return SchemaValidationResult.failure([
        this.createError(
          `Expected type ${expectedType}, got ${this.getTypeName(data)}`,
          path,
          context,
          { expected: expectedType, received: this.getTypeName(data) },
        ),
      ])
    }

    return SchemaValidationResult.success(context)
  }

  private validateEnum(
    data: unknown,
    schema: SchemaNode,
    context: SchemaValidationContext,
    path: string,
  ): SchemaValidationResult {
    if (!schema.enum || !Array.isArray(schema.enum)) {
      return SchemaValidationResult.success(context)
    }

    const isValid = schema.enum.includes(data)

    if (!isValid) {
      return SchemaValidationResult.failure([
        this.createError(
          `Value must be one of: ${schema.enum.map((v) => JSON.stringify(v)).join(', ')}`,
          path,
          context,
          { expected: schema.enum, received: data },
        ),
      ])
    }

    return SchemaValidationResult.success(context)
  }

  private validateConst(
    data: unknown,
    schema: SchemaNode,
    context: SchemaValidationContext,
    path: string,
  ): SchemaValidationResult {
    if (schema.const === undefined) {
      return SchemaValidationResult.success(context)
    }

    const isValid = this.deepEqual(data, schema.const)

    if (!isValid) {
      return SchemaValidationResult.failure([
        this.createError(
          `Value must be ${JSON.stringify(schema.const)}`,
          path,
          context,
          { expected: schema.const, received: data },
        ),
      ])
    }

    return SchemaValidationResult.success(context)
  }

  private async validateCombinedSchemas(
    data: unknown,
    schema: SchemaNode,
    context: SchemaValidationContext,
    path: string,
  ): Promise<SchemaValidationResult> {
    let result = SchemaValidationResult.success(context)

    // allOf: all schemas must be valid
    if (schema.allOf) {
      for (let i = 0; i < schema.allOf.length; i++) {
        const subResult = await this.validateNode(data, schema.allOf[i], context, `${path}/allOf[${i}]`)
        result = result.merge(subResult)

        if (!subResult.isValid) {
          // For allOf, we continue validating all schemas even if one fails
        }
      }
    }

    // anyOf: at least one schema must be valid
    if (schema.anyOf) {
      let anyValid = false
      const anyOfErrors: SchemaValidationError[] = []

      for (let i = 0; i < schema.anyOf.length; i++) {
        const subResult = await this.validateNode(data, schema.anyOf[i], context, `${path}/anyOf[${i}]`)

        if (subResult.isValid) {
          anyValid = true
          break
        } else {
          anyOfErrors.push(...subResult.errors)
        }
      }

      if (!anyValid) {
        return SchemaValidationResult.failure([
          this.createError('Value must match at least one of the anyOf schemas', path, context, {
            errors: anyOfErrors,
          }),
        ])
      }
    }

    // oneOf: exactly one schema must be valid
    if (schema.oneOf) {
      let validCount = 0
      const oneOfErrors: SchemaValidationError[] = []

      for (let i = 0; i < schema.oneOf.length; i++) {
        const subResult = await this.validateNode(data, schema.oneOf[i], context, `${path}/oneOf[${i}]`)

        if (subResult.isValid) {
          validCount++
          if (validCount > 1) {
            return SchemaValidationResult.failure([
              this.createError('Value must match exactly one of the oneOf schemas', path, context),
            ])
          }
        } else {
          oneOfErrors.push(...subResult.errors)
        }
      }

      if (validCount === 0) {
        return SchemaValidationResult.failure([
          this.createError('Value must match one of the oneOf schemas', path, context, {
            errors: oneOfErrors,
          }),
        ])
      }
    }

    return result
  }

  private applyAdditionalValidations(
    data: unknown,
    schema: SchemaNode,
    context: SchemaValidationContext,
    path: string,
    baseResult: SchemaValidationResult,
  ): SchemaValidationResult {
    let result = baseResult

    // String validations
    if (typeof data === 'string') {
      result = this.validateStringConstraints(data, schema, context, path, result)
    }

    // Number validations
    if (typeof data === 'number') {
      result = this.validateNumberConstraints(data, schema, context, path, result)
    }

    // Array validations
    if (Array.isArray(data)) {
      result = this.validateArrayConstraints(data, schema, context, path, result)
    }

    // Object validations
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      result = this.validateObjectConstraints(data as Record<string, unknown>, schema, context, path, result)
    }

    return result
  }

  private validateStringConstraints(
    data: string,
    schema: SchemaNode,
    context: SchemaValidationContext,
    path: string,
    result: SchemaValidationResult,
  ): SchemaValidationResult {
    let currentResult = result

    // minLength
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      currentResult = SchemaValidationResult.failure([
        this.createError(
          `String length must be at least ${schema.minLength}`,
          path,
          context,
          { expected: schema.minLength, received: data.length },
        ),
      ])
    }

    // maxLength
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      currentResult = SchemaValidationResult.failure([
        this.createError(
          `String length must be at most ${schema.maxLength}`,
          path,
          context,
          { expected: schema.maxLength, received: data.length },
        ),
      ])
    }

    // pattern
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      currentResult = SchemaValidationResult.failure([
        this.createError(`String does not match pattern: ${schema.pattern}`, path, context, {
          pattern: schema.pattern,
        }),
      ])
    }

    // format
    if (schema.format) {
      const formatResult = this.validateFormat(data, schema.format, context, path)
      if (!formatResult.isValid) {
        currentResult = formatResult
      }
    }

    return currentResult
  }

  private validateNumberConstraints(
    data: number,
    schema: SchemaNode,
    context: SchemaValidationContext,
    path: string,
    result: SchemaValidationResult,
  ): SchemaValidationResult {
    let currentResult = result

    // minimum
    if (schema.minimum !== undefined && data < schema.minimum) {
      currentResult = SchemaValidationResult.failure([
        this.createError(
          `Number must be at least ${schema.minimum}`,
          path,
          context,
          { expected: schema.minimum, received: data },
        ),
      ])
    }

    // maximum
    if (schema.maximum !== undefined && data > schema.maximum) {
      currentResult = SchemaValidationResult.failure([
        this.createError(
          `Number must be at most ${schema.maximum}`,
          path,
          context,
          { expected: schema.maximum, received: data },
        ),
      ])
    }

    return currentResult
  }

  private validateArrayConstraints(
    data: unknown[],
    schema: SchemaNode,
    context: SchemaValidationContext,
    path: string,
    result: SchemaValidationResult,
  ): SchemaValidationResult {
    let currentResult = result

    // minItems
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      currentResult = SchemaValidationResult.failure([
        this.createError(
          `Array must have at least ${schema.minItems} items`,
          path,
          context,
          { expected: schema.minItems, received: data.length },
        ),
      ])
    }

    // maxItems
    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      currentResult = SchemaValidationResult.failure([
        this.createError(
          `Array must have at most ${schema.maxItems} items`,
          path,
          context,
          { expected: schema.maxItems, received: data.length },
        ),
      ])
    }

    // items validation
    if (schema.items) {
      for (let i = 0; i < data.length; i++) {
        const itemResult = this.validateNode(data[i], schema.items, context, `${path}[${i}]`)
        if (!itemResult.isValid) {
          currentResult = currentResult.merge(itemResult)
        }
      }
    }

    return currentResult
  }

  private validateObjectConstraints(
    data: Record<string, unknown>,
    schema: SchemaNode,
    context: SchemaValidationContext,
    path: string,
    result: SchemaValidationResult,
  ): SchemaValidationResult {
    let currentResult = result

    // required properties
    if (schema.required && Array.isArray(schema.required)) {
      for (const prop of schema.required) {
        if (!(prop in data)) {
          currentResult = SchemaValidationResult.failure([
            this.createError(`Missing required property: ${prop}`, `${path}.${prop}`, context),
          ])
        }
      }
    }

    // properties validation
    if (schema.properties) {
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (prop in data) {
          const propResult = this.validateNode(data[prop], propSchema, context, `${path}.${prop}`)
          if (!propResult.isValid) {
            currentResult = currentResult.merge(propResult)
          }
        }
      }
    }

    // additional properties
    if (schema.additionalProperties === false) {
      if (schema.properties) {
        const allowedProps = Object.keys(schema.properties)
        const extraProps = Object.keys(data).filter((prop) => !allowedProps.includes(prop))
        for (const prop of extraProps) {
          currentResult = SchemaValidationResult.failure([
            this.createError(`Additional property not allowed: ${prop}`, `${path}.${prop}`, context),
          ])
        }
      }
    }

    return currentResult
  }

  private validateFormat(
    data: string,
    format: string,
    context: SchemaValidationContext,
    path: string,
  ): SchemaValidationResult {
    switch (format) {
      case 'date-time':
        return this.validateDateTime(data, path, context)
      case 'email':
        return this.validateEmail(data, path, context)
      case 'hostname':
        return this.validateHostname(data, path, context)
      case 'ipv4':
        return this.validateIPv4(data, path, context)
      case 'ipv6':
        return this.validateIPv6(data, path, context)
      case 'uri':
        return this.validateURI(data, path, context)
      case 'uuid':
        return this.validateUUID(data, path, context)
      default:
        return SchemaValidationResult.success(context)
    }
  }

  private validateDateTime(
    data: string,
    path: string,
    context: SchemaValidationContext,
  ): SchemaValidationResult {
    const date = new Date(data)
    const isValid = !Number.isNaN(date.getTime()) && data === date.toISOString()

    if (!isValid) {
      return SchemaValidationResult.failure([
        this.createError('Invalid date-time format', path, context, {
          received: data,
          expected: 'ISO 8601 date-time format',
        }),
      ])
    }

    return SchemaValidationResult.success(context)
  }

  private validateEmail(data: string, path: string, context: SchemaValidationContext): SchemaValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(data)

    if (!isValid) {
      return SchemaValidationResult.failure([
        this.createError('Invalid email format', path, context, {
          received: data,
        }),
      ])
    }

    return SchemaValidationResult.success(context)
  }

  private validateHostname(
    data: string,
    path: string,
    context: SchemaValidationContext,
  ): SchemaValidationResult {
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
    const isValid = hostnameRegex.test(data) && data.length <= 253

    if (!isValid) {
      return SchemaValidationResult.failure([
        this.createError('Invalid hostname format', path, context, {
          received: data,
        }),
      ])
    }

    return SchemaValidationResult.success(context)
  }

  private validateIPv4(data: string, path: string, context: SchemaValidationContext): SchemaValidationResult {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const isValid = ipv4Regex.test(data)

    if (!isValid) {
      return SchemaValidationResult.failure([
        this.createError('Invalid IPv4 format', path, context, {
          received: data,
        }),
      ])
    }

    return SchemaValidationResult.success(context)
  }

  private validateIPv6(data: string, path: string, context: SchemaValidationContext): SchemaValidationResult {
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
    const isValid = ipv6Regex.test(data)

    if (!isValid) {
      return SchemaValidationResult.failure([
        this.createError('Invalid IPv6 format', path, context, {
          received: data,
        }),
      ])
    }

    return SchemaValidationResult.success(context)
  }

  private validateURI(data: string, path: string, context: SchemaValidationContext): SchemaValidationResult {
    try {
      new URL(data)
      return SchemaValidationResult.success(context)
    } catch {
      return SchemaValidationResult.failure([
        this.createError('Invalid URI format', path, context, {
          received: data,
        }),
      ])
    }
  }

  private validateUUID(data: string, path: string, context: SchemaValidationContext): SchemaValidationResult {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const isValid = uuidRegex.test(data)

    if (!isValid) {
      return SchemaValidationResult.failure([
        this.createError('Invalid UUID format', path, context, {
          received: data,
        }),
      ])
    }

    return SchemaValidationResult.success(context)
  }

  private resolveRef(ref: string, schema: SchemaNode): SchemaNode | null {
    if (ref.startsWith('#/')) {
      const path = ref.substring(2).split('/')
      return this.navigateSchema(schema, path)
    }

    return null
  }

  private navigateSchema(schema: SchemaNode, path: string[]): SchemaNode | null {
    let current: SchemaNode = schema

    for (const segment of path) {
      if (segment === 'definitions' && current.definitions) {
        current = current.definitions as SchemaNode
      } else if (current.properties && segment in current.properties) {
        current = current.properties[segment]
      } else {
        return null
      }
    }

    return current
  }

  private createError(
    message: string,
    path: string,
    context: SchemaValidationContext,
    details?: Record<string, unknown>,
  ): SchemaValidationError {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      id,
      code: 'VALIDATION_ERROR',
      message,
      path,
      severity: 'error' as const,
      details,
      timestamp: new Date(),
    }
  }

  private getTypeName(value: unknown): string {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (a == null || b == null) return a === b
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object') return a === b
    if (Array.isArray(a) !== Array.isArray(b)) return false

    const keysA = Object.keys(a as Record<string, unknown>)
    const keysB = Object.keys(b as Record<string, unknown>)

    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      if (!this.deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false
    }

    return true
  }

  public static create(schema: ValidationSchema, options?: ValidationOptions): ValidationEngine {
    return new ValidationEngine(schema, options)
  }
}