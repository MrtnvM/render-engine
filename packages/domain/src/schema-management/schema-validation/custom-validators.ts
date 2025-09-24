import { SchemaValidationResult, SchemaValidationError, SchemaValidationContext } from './value-objects/validation-result.vo.js'
import { CustomValidator, ValidationEngine } from './validation-engine.js'
import { SchemaValidationSeverity } from '../shared/enums/index.js'

export class SecurityValidator implements CustomValidator {
  public async validate(value: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> {
    const errors: SchemaValidationError[] = []

    if (typeof value === 'string') {
      // Check for potentially dangerous content
      const dangerousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload\s*=/gi,
        /onerror\s*=/gi,
        /onclick\s*=/gi,
      ]

      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          errors.push({
            id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            code: 'SECURITY_THREAT',
            message: 'Potentially dangerous content detected',
            path: context?.path || '',
            severity: SchemaValidationSeverity.ERROR,
            details: { pattern: pattern.toString(), value: value.substring(0, 100) },
            timestamp: new Date(),
          })
        }
      }

      // Check for SQL injection patterns
      const sqlPatterns = [
        /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b|\bscript\b)/gi,
      ]

      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          errors.push({
            id: `sql_injection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            code: 'SQL_INJECTION_RISK',
            message: 'Potential SQL injection pattern detected',
            path: context?.path || '',
            severity: SchemaValidationSeverity.WARNING,
            details: { pattern: pattern.toString(), value: value.substring(0, 100) },
            timestamp: new Date(),
          })
        }
      }
    }

    if (errors.length > 0) {
      return SchemaValidationResult.failure(errors)
    }

    return SchemaValidationResult.success(context)
  }
}

export class ComponentTypeValidator implements CustomValidator {
  private allowedTypes: Set<string>

  constructor(allowedTypes: string[]) {
    this.allowedTypes = new Set(allowedTypes)
  }

  public async validate(value: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return SchemaValidationResult.success(context)
    }

    const component = value as Record<string, unknown>
    const componentType = component.type as string

    if (!componentType || !this.allowedTypes.has(componentType)) {
      return SchemaValidationResult.failure([
        {
          id: `component_type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code: 'INVALID_COMPONENT_TYPE',
          message: `Component type '${componentType}' is not allowed. Allowed types: ${Array.from(this.allowedTypes).join(', ')}`,
          path: context?.path || '',
          severity: SchemaValidationSeverity.ERROR,
          details: { componentType, allowedTypes: Array.from(this.allowedTypes) },
          timestamp: new Date(),
        },
      ])
    }

    return SchemaValidationResult.success(context)
  }
}

export class URLValidator implements CustomValidator {
  private allowedProtocols: Set<string>
  private requireHttps: boolean

  constructor(options: { allowedProtocols?: string[]; requireHttps?: boolean } = {}) {
    this.allowedProtocols = new Set(options.allowedProtocols || ['https:', 'http:'])
    this.requireHttps = options.requireHttps || false
  }

  public async validate(value: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> {
    if (typeof value !== 'string') {
      return SchemaValidationResult.success(context)
    }

    try {
      const url = new URL(value)

      if (!this.allowedProtocols.has(url.protocol)) {
        return SchemaValidationResult.failure([
          {
            id: `url_protocol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            code: 'INVALID_URL_PROTOCOL',
            message: `URL protocol '${url.protocol}' is not allowed. Allowed protocols: ${Array.from(this.allowedProtocols).join(', ')}`,
            path: context?.path || '',
            severity: SchemaValidationSeverity.ERROR,
            details: { url: value, protocol: url.protocol, allowedProtocols: Array.from(this.allowedProtocols) },
            timestamp: new Date(),
          },
        ])
      }

      if (this.requireHttps && url.protocol !== 'https:') {
        return SchemaValidationResult.failure([
          {
            id: `url_https_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            code: 'HTTPS_REQUIRED',
            message: 'URL must use HTTPS protocol',
            path: context?.path || '',
            severity: SchemaValidationSeverity.ERROR,
            details: { url: value, protocol: url.protocol },
            timestamp: new Date(),
          },
        ])
      }

      return SchemaValidationResult.success(context)
    } catch {
      return SchemaValidationResult.failure([
        {
          id: `url_format_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code: 'INVALID_URL_FORMAT',
          message: 'Invalid URL format',
          path: context?.path || '',
          severity: SchemaValidationSeverity.ERROR,
          details: { url: value },
          timestamp: new Date(),
        },
      ])
    }
  }
}

export class ColorValidator implements CustomValidator {
  public async validate(value: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> {
    if (typeof value !== 'string') {
      return SchemaValidationResult.success(context)
    }

    // Check hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/
    const isValidHex = hexColorRegex.test(value)

    if (!isValidHex) {
      return SchemaValidationResult.failure([
        {
          id: `color_format_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code: 'INVALID_COLOR_FORMAT',
          message: 'Color must be in hex format (#RRGGBB or #RRGGBBAA)',
          path: context?.path || '',
          severity: SchemaValidationSeverity.ERROR,
          details: { color: value },
          timestamp: new Date(),
        },
      ])
    }

    return SchemaValidationResult.success(context)
  }
}

export class BusinessLogicValidator implements CustomValidator {
  private rules: Array<{
    condition: (value: unknown, context?: SchemaValidationContext) => boolean
    message: string
    severity: SchemaValidationSeverity
  }>

  constructor(rules: Array<{
    condition: (value: unknown, context?: SchemaValidationContext) => boolean
    message: string
    severity?: SchemaValidationSeverity
  }>) {
    this.rules = rules.map((rule) => ({
      ...rule,
      severity: rule.severity || SchemaValidationSeverity.ERROR,
    }))
  }

  public async validate(value: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> {
    const errors: SchemaValidationError[] = []

    for (const rule of this.rules) {
      if (!rule.condition(value, context)) {
        errors.push({
          id: `business_logic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code: 'BUSINESS_LOGIC_VIOLATION',
          message: rule.message,
          path: context?.path || '',
          severity: rule.severity,
          details: { value, context },
          timestamp: new Date(),
        })
      }
    }

    if (errors.length > 0) {
      return SchemaValidationResult.failure(errors)
    }

    return SchemaValidationResult.success(context)
  }

  public static createButtonLogicValidator(): BusinessLogicValidator {
    return new BusinessLogicValidator([
      {
        condition: (value: unknown) => {
          if (typeof value !== 'object' || value === null || Array.isArray(value)) return true
          const component = value as Record<string, unknown>
          return !!(component.type === 'Button' && component.props && typeof component.props === 'object' && 'text' in component.props)
        },
        message: 'Button component must have a text property',
        severity: SchemaValidationSeverity.ERROR,
      },
      {
        condition: (value: unknown) => {
          if (typeof value !== 'object' || value === null || Array.isArray(value)) return true
          const component = value as Record<string, unknown>
          if (component.type !== 'Button') return true

          const props = component.props as Record<string, unknown> | undefined
          if (!props || !('onClick' in props)) return true

          const onClick = props.onClick as string
          return onClick.startsWith('action:')
        },
        message: 'Button onClick must start with "action:"',
        severity: SchemaValidationSeverity.ERROR,
      },
    ])
  }

  public static createImageLogicValidator(): BusinessLogicValidator {
    return new BusinessLogicValidator([
      {
        condition: (value: unknown) => {
          if (typeof value !== 'object' || value === null || Array.isArray(value)) return true
          const component = value as Record<string, unknown>
          if (component.type !== 'Image') return true

          const props = component.props as Record<string, unknown> | undefined
          if (!props || !('src' in props)) return true

          const src = props.src as string
          try {
            const url = new URL(src)
            return url.protocol === 'https:'
          } catch {
            return false
          }
        },
        message: 'Image src must use HTTPS protocol',
        severity: SchemaValidationSeverity.ERROR,
      },
    ])
  }
}

export class CrossFieldValidator implements CustomValidator {
  public async validate(value: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> {
    const errors: SchemaValidationError[] = []

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const component = value as Record<string, unknown>

      // Validate Button component cross-field rules
      if (component.type === 'Button') {
        const props = component.props as Record<string, unknown> | undefined

        if (props) {
          // If disabled is true, should not have onClick
          if (props.disabled === true && props.onClick) {
            errors.push({
              id: `cross_field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              code: 'BUTTON_DISABLED_WITH_ONCLICK',
              message: 'Disabled button should not have onClick handler',
              path: context?.path || '',
              severity: SchemaValidationSeverity.WARNING,
              details: { disabled: true, hasOnClick: true },
              timestamp: new Date(),
            })
          }

          // If variant is 'ghost', should have appropriate styling
          if (props.variant === 'ghost' && (!props.styles || typeof props.styles !== 'object')) {
            errors.push({
              id: `cross_field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              code: 'BUTTON_GHOST_NEEDS_STYLES',
              message: 'Ghost button variant typically requires custom styling',
              path: context?.path || '',
              severity: SchemaValidationSeverity.INFO,
              details: { variant: 'ghost', hasStyles: false },
              timestamp: new Date(),
            })
          }
        }
      }

      // Validate List component cross-field rules
      if (component.type === 'List') {
        const props = component.props as Record<string, unknown> | undefined

        if (props && props.items && Array.isArray(props.items)) {
          if (props.items.length === 0 && props.direction) {
            errors.push({
              id: `cross_field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              code: 'LIST_EMPTY_WITH_DIRECTION',
              message: 'Empty list does not need direction property',
              path: context?.path || '',
              severity: SchemaValidationSeverity.INFO,
              details: { itemCount: 0, hasDirection: true },
              timestamp: new Date(),
            })
          }
        }
      }
    }

    if (errors.length > 0) {
      return SchemaValidationResult.failure(errors)
    }

    return SchemaValidationResult.success(context)
  }
}

export class CustomValidatorsRegistry {
  private validators: Map<string, CustomValidator> = new Map()

  constructor() {
    this.register('security', new SecurityValidator())
    this.register('componentType', new ComponentTypeValidator([
      'Button', 'Label', 'Text', 'Image', 'List', 'Banner', 'Container', 'Row', 'Column', 'Card',
      'Form', 'Input', 'Select', 'Checkbox', 'Radio', 'Modal', 'Alert', 'Progress', 'Icon'
    ]))
    this.register('url', new URLValidator({ requireHttps: true }))
    this.register('color', new ColorValidator())
    this.register('buttonLogic', BusinessLogicValidator.createButtonLogicValidator())
    this.register('imageLogic', BusinessLogicValidator.createImageLogicValidator())
    this.register('crossField', new CrossFieldValidator())
  }

  public register(name: string, validator: CustomValidator): void {
    this.validators.set(name, validator)
  }

  public get(name: string): CustomValidator | null {
    return this.validators.get(name) || null
  }

  public getAll(): Map<string, CustomValidator> {
    return new Map(this.validators)
  }

  public createValidatorEngine(schema: ValidationEngine['schema']): ValidationEngine {
    return ValidationEngine.create(schema, { customValidators: this.validators })
  }
}