import { SchemaValidationResult, SchemaValidationError, SchemaValidationContext } from './value-objects/validation-result.vo.js'
import { ValidationSchema } from './validation-engine.js'
import { SchemaValidationSeverity } from '../shared/enums/index.js'

export interface ClientValidationOptions {
  strict?: boolean
  lenient?: boolean
  skipWarnings?: boolean
  maxDepth?: number
  timeout?: number
}

export interface ValidationRule {
  type: 'required' | 'type' | 'min' | 'max' | 'pattern' | 'enum' | 'custom'
  value?: unknown
  message?: string
}

export interface ComponentValidation {
  type: string
  required?: boolean
  properties?: Record<string, ValidationRule[]>
  children?: ComponentValidation
}

export interface ClientSchema {
  version: string
  components: Record<string, ComponentValidation>
  scenarioData?: Record<string, ValidationRule[]>
}

export class ClientValidator {
  private schema: ClientSchema
  private options: Required<ClientValidationOptions>

  constructor(schema: ClientSchema, options: ClientValidationOptions = {}) {
    this.schema = schema
    this.options = {
      strict: options.strict ?? false,
      lenient: options.lenient ?? true,
      skipWarnings: options.skipWarnings ?? false,
      maxDepth: options.maxDepth ?? 5,
      timeout: options.timeout ?? 5000,
    }
  }

  public validate(data: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(
          SchemaValidationResult.failure([
            this.createError('Validation timeout exceeded', '$', context),
          ]),
        )
      }, this.options.timeout)

      try {
        const result = this.validateInternal(data, context)
        clearTimeout(timeout)
        resolve(result)
      } catch (error) {
        clearTimeout(timeout)
        resolve(
          SchemaValidationResult.failure([
            this.createError(
              `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              '$',
              context,
            ),
          ]),
        )
      }
    })
  }

  public validateSync(data: unknown, context?: SchemaValidationContext): SchemaValidationResult {
    try {
      return this.validateInternal(data, context)
    } catch (error) {
      return SchemaValidationResult.failure([
        this.createError(
          `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          '$',
          context,
        ),
      ])
    }
  }

  public validateComponent(component: unknown, context?: SchemaValidationContext): SchemaValidationResult {
    if (typeof component !== 'object' || component === null || Array.isArray(component)) {
      return SchemaValidationResult.failure([
        this.createError('Component must be an object', '$', context),
      ])
    }

    const comp = component as Record<string, unknown>
    const componentType = comp.type as string

    if (!componentType) {
      return SchemaValidationResult.failure([
        this.createError('Component must have a type', '$.type', context),
      ])
    }

    const validation = this.schema.components[componentType]
    if (!validation) {
      if (this.options.strict) {
        return SchemaValidationResult.failure([
          this.createError(`Unknown component type: ${componentType}`, '$.type', context),
        ])
      } else {
        // In lenient mode, allow unknown component types
        return SchemaValidationResult.success(context)
      }
    }

    let result = SchemaValidationResult.success(context)

    // Validate required properties
    if (validation.required) {
      const requiredProps = this.getRequiredProperties(validation)
      for (const prop of requiredProps) {
        if (!(prop in comp)) {
          result = SchemaValidationResult.failure([
            this.createError(`Required property missing: ${prop}`, `$.${prop}`, context),
          ])
        }
      }
    }

    // Validate properties
    if (comp.props && typeof comp.props === 'object') {
      const propsResult = this.validateProperties(comp.props as Record<string, unknown>, validation, context)
      result = result.merge(propsResult)
    }

    // Validate children recursively
    if (comp.children && Array.isArray(comp.children)) {
      const childrenResult = this.validateChildren(comp.children, validation.children, context)
      result = result.merge(childrenResult)
    }

    return result
  }

  public validateScenarioData(data: Record<string, unknown>, context?: SchemaValidationContext): SchemaValidationResult {
    let result = SchemaValidationResult.success(context)

    for (const [key, value] of Object.entries(data)) {
      const rules = this.schema.scenarioData?.[key]
      if (rules) {
        const valueResult = this.validateValue(value, rules, context)
        result = result.merge(valueResult)
      }
    }

    return result
  }

  public sanitizeData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data
    }

    if (typeof data === 'string') {
      return this.sanitizeString(data)
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item))
    }

    if (typeof data === 'object') {
      const sanitized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value)
      }
      return sanitized
    }

    return data
  }

  public getDefaultValue(componentType: string, property: string): unknown {
    const validation = this.schema.components[componentType]
    if (!validation?.properties?.[property]) {
      return undefined
    }

    const rules = validation.properties[property]
    for (const rule of rules) {
      if (rule.type === 'required' && rule.value !== undefined) {
        return rule.value
      }
    }

    return undefined
  }

  public isValidComponentType(componentType: string): boolean {
    return componentType in this.schema.components
  }

  public getSupportedComponentTypes(): string[] {
    return Object.keys(this.schema.components)
  }

  public getComponentSchema(componentType: string): ComponentValidation | null {
    return this.schema.components[componentType] || null
  }

  private validateInternal(data: unknown, context?: SchemaValidationContext): SchemaValidationResult {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return SchemaValidationResult.failure([
        this.createError('Data must be an object', '$', context),
      ])
    }

    const config = data as Record<string, unknown>
    let result = SchemaValidationResult.success(context)

    // Validate version
    if (config.version) {
      if (typeof config.version !== 'string') {
        result = SchemaValidationResult.failure([
          this.createError('Version must be a string', '$.version', context),
        ])
      }
    }

    // Validate components
    if (config.components && Array.isArray(config.components)) {
      const componentsResult = this.validateComponents(config.components, context)
      result = result.merge(componentsResult)
    } else {
      result = SchemaValidationResult.failure([
        this.createError('Components must be an array', '$.components', context),
      ])
    }

    // Validate scenario data
    if (config.scenarioData && typeof config.scenarioData === 'object') {
      const scenarioResult = this.validateScenarioData(config.scenarioData as Record<string, unknown>, context)
      result = result.merge(scenarioResult)
    }

    return result
  }

  private validateComponents(components: unknown[], context?: SchemaValidationContext): SchemaValidationResult {
    let result = SchemaValidationResult.success(context)

    for (let i = 0; i < components.length; i++) {
      const componentResult = this.validateComponent(components[i], {
        ...context,
        path: `$.components[${i}]`,
      })
      result = result.merge(componentResult)
    }

    return result
  }

  private validateProperties(
    props: Record<string, unknown>,
    validation: ComponentValidation,
    context?: SchemaValidationContext,
  ): SchemaValidationResult {
    let result = SchemaValidationResult.success(context)

    for (const [propName, propValue] of Object.entries(props)) {
      const rules = validation.properties?.[propName]
      if (rules) {
        const valueResult = this.validateValue(propValue, rules, context)
        result = result.merge(valueResult)
      }
    }

    return result
  }

  private validateChildren(
    children: unknown[],
    childValidation?: ComponentValidation,
    context?: SchemaValidationContext,
  ): SchemaValidationResult {
    let result = SchemaValidationResult.success(context)

    for (let i = 0; i < children.length; i++) {
      const childResult = this.validateComponent(children[i], {
        ...context,
        path: context?.path ? `${context.path}.children[${i}]` : `$.children[${i}]`,
      })
      result = result.merge(childResult)
    }

    return result
  }

  private validateValue(value: unknown, rules: ValidationRule[], context?: SchemaValidationContext): SchemaValidationResult {
    let result = SchemaValidationResult.success(context)

    for (const rule of rules) {
      const ruleResult = this.applyRule(value, rule, context)
      if (!ruleResult.isValid) {
        result = result.merge(ruleResult)
      }
    }

    return result
  }

  private applyRule(value: unknown, rule: ValidationRule, context?: SchemaValidationContext): SchemaValidationResult {
    switch (rule.type) {
      case 'required':
        if (value === null || value === undefined) {
          return SchemaValidationResult.failure([
            this.createError(rule.message || 'Value is required', context?.path || '$', context),
          ])
        }
        break

      case 'type':
        if (rule.value && typeof value !== rule.value) {
          return SchemaValidationResult.failure([
            this.createError(
              rule.message || `Value must be of type ${rule.value}`,
              context?.path || '$',
              context,
            ),
          ])
        }
        break

      case 'min':
        if (typeof value === 'number' && typeof rule.value === 'number' && value < rule.value) {
          return SchemaValidationResult.failure([
            this.createError(
              rule.message || `Value must be at least ${rule.value}`,
              context?.path || '$',
              context,
            ),
          ])
        }
        if (typeof value === 'string' && typeof rule.value === 'number' && value.length < rule.value) {
          return SchemaValidationResult.failure([
            this.createError(
              rule.message || `String must be at least ${rule.value} characters`,
              context?.path || '$',
              context,
            ),
          ])
        }
        break

      case 'max':
        if (typeof value === 'number' && typeof rule.value === 'number' && value > rule.value) {
          return SchemaValidationResult.failure([
            this.createError(
              rule.message || `Value must be at most ${rule.value}`,
              context?.path || '$',
              context,
            ),
          ])
        }
        if (typeof value === 'string' && typeof rule.value === 'number' && value.length > rule.value) {
          return SchemaValidationResult.failure([
            this.createError(
              rule.message || `String must be at most ${rule.value} characters`,
              context?.path || '$',
              context,
            ),
          ])
        }
        break

      case 'pattern':
        if (typeof value === 'string' && rule.value && typeof rule.value === 'string') {
          const regex = new RegExp(rule.value)
          if (!regex.test(value)) {
            return SchemaValidationResult.failure([
              this.createError(
                rule.message || `Value does not match pattern ${rule.value}`,
                context?.path || '$',
                context,
              ),
            ])
          }
        }
        break

      case 'enum':
        if (rule.value && Array.isArray(rule.value) && !rule.value.includes(value)) {
          return SchemaValidationResult.failure([
            this.createError(
              rule.message || `Value must be one of: ${rule.value.join(', ')}`,
              context?.path || '$',
              context,
            ),
          ])
        }
        break

      case 'custom':
        // Custom validation would require a callback function
        break
    }

    return SchemaValidationResult.success(context)
  }

  private getRequiredProperties(validation: ComponentValidation): string[] {
    const required: string[] = []

    if (validation.properties) {
      for (const [propName, rules] of Object.entries(validation.properties)) {
        for (const rule of rules) {
          if (rule.type === 'required') {
            required.push(propName)
            break
          }
        }
      }
    }

    return required
  }

  private sanitizeString(input: string): string {
    // Basic sanitization for client-side
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }

  private createError(message: string, path: string, context?: SchemaValidationContext): SchemaValidationError {
    return {
      id: `client_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code: 'CLIENT_VALIDATION_ERROR',
      message,
      path,
      severity: SchemaValidationSeverity.ERROR,
      timestamp: new Date(),
    }
  }

  public static create(schema: ClientSchema, options?: ClientValidationOptions): ClientValidator {
    return new ClientValidator(schema, options)
  }

  public static createFromJSONSchema(jsonSchema: ValidationSchema): ClientValidator {
    const clientSchema: ClientSchema = {
      version: '1.0.0',
      components: {},
    }

    // Convert JSON schema to client schema format
    if (jsonSchema.definitions?.component) {
      // This is a simplified conversion - in practice you'd need more comprehensive mapping
      clientSchema.components = {
        Button: {
          required: true,
          properties: {
            text: [{ type: 'required' }],
            type: [{ type: 'type', value: 'string' }],
          },
        },
        Label: {
          required: true,
          properties: {
            text: [{ type: 'required' }],
            type: [{ type: 'type', value: 'string' }],
          },
        },
      }
    }

    return new ClientValidator(clientSchema)
  }
}