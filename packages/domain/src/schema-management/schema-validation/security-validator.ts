import { SchemaValidationResult, SchemaValidationError, SchemaValidationContext } from './value-objects/validation-result.vo.js'
import { CustomValidator } from './validation-engine.js'
import { SchemaValidationSeverity } from '../shared/enums/index.js'

export interface SecurityConfig {
  allowedProtocols: string[]
  blockedDomains: string[]
  allowedImageDomains: string[]
  maxStringLength: number
  maxArrayLength: number
  maxObjectDepth: number
  allowHtml: boolean
  allowJavaScript: boolean
  allowBase64Data: boolean
  requireHttps: boolean
  allowedComponentTypes: string[]
}

export interface SecurityViolation {
  type: 'xss' | 'sql_injection' | 'path_traversal' | 'protocol_violation' | 'domain_blocked' | 'data_size' | 'component_type'
  message: string
  path: string
  value: unknown
  severity: SchemaValidationSeverity
}

export class SecurityValidator implements CustomValidator {
  private config: SecurityConfig

  constructor(config: SecurityConfig = {}) {
    this.config = {
      allowedProtocols: ['https:', 'http:'],
      blockedDomains: [],
      allowedImageDomains: [],
      maxStringLength: 10000,
      maxArrayLength: 1000,
      maxObjectDepth: 10,
      allowHtml: false,
      allowJavaScript: false,
      allowBase64Data: true,
      requireHttps: true,
      allowedComponentTypes: [
        'Button', 'Label', 'Text', 'Image', 'List', 'Banner', 'Container', 'Row', 'Column', 'Card',
        'Form', 'Input', 'Select', 'Checkbox', 'Radio', 'Modal', 'Alert', 'Progress', 'Icon'
      ],
      ...config,
    }
  }

  public async validate(value: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> {
    const violations: SecurityViolation[] = []

    try {
      this.scanValue(value, '$', violations, 0)

      if (violations.length > 0) {
        const errors: SchemaValidationError[] = violations.map((violation) => ({
          id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code: 'SECURITY_VIOLATION',
          message: `${violation.type.toUpperCase()}: ${violation.message}`,
          path: violation.path,
          severity: violation.severity,
          details: {
            type: violation.type,
            value: violation.value,
          },
          timestamp: new Date(),
        }))

        return SchemaValidationResult.failure(errors)
      }

      return SchemaValidationResult.success(context)
    } catch (error) {
      return SchemaValidationResult.failure([
        {
          id: `security_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code: 'SECURITY_VALIDATION_ERROR',
          message: `Security validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          path: context?.path || '$',
          severity: SchemaValidationSeverity.ERROR,
          timestamp: new Date(),
        },
      ])
    }
  }

  public validateURL(url: string, context?: SchemaValidationContext): SchemaValidationResult {
    try {
      const parsedUrl = new URL(url)
      const violations: SecurityViolation[] = []

      // Check protocol
      if (!this.config.allowedProtocols.includes(parsedUrl.protocol)) {
        violations.push({
          type: 'protocol_violation',
          message: `Protocol '${parsedUrl.protocol}' is not allowed`,
          path: context?.path || '$',
          value: url,
          severity: SchemaValidationSeverity.ERROR,
        })
      }

      // Require HTTPS if configured
      if (this.config.requireHttps && parsedUrl.protocol !== 'https:') {
        violations.push({
          type: 'protocol_violation',
          message: 'HTTPS is required for security',
          path: context?.path || '$',
          value: url,
          severity: SchemaValidationSeverity.ERROR,
        })
      }

      // Check blocked domains
      if (this.config.blockedDomains.some((domain) => parsedUrl.hostname.includes(domain))) {
        violations.push({
          type: 'domain_blocked',
          message: `Domain '${parsedUrl.hostname}' is blocked`,
          path: context?.path || '$',
          value: url,
          severity: SchemaValidationSeverity.ERROR,
        })
      }

      if (violations.length > 0) {
        const errors: SchemaValidationError[] = violations.map((violation) => ({
          id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code: 'SECURITY_VIOLATION',
          message: violation.message,
          path: violation.path,
          severity: violation.severity,
          details: violation,
          timestamp: new Date(),
        }))

        return SchemaValidationResult.failure(errors)
      }

      return SchemaValidationResult.success(context)
    } catch {
      return SchemaValidationResult.failure([
        {
          id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code: 'INVALID_URL',
          message: 'Invalid URL format',
          path: context?.path || '$',
          severity: SchemaValidationSeverity.ERROR,
          timestamp: new Date(),
        },
      ])
    }
  }

  public validateImageURL(url: string, context?: SchemaValidationContext): SchemaValidationResult {
    const baseResult = this.validateURL(url, context)

    if (!baseResult.isValid) {
      return baseResult
    }

    try {
      const parsedUrl = new URL(url)

      // Check if it's an image URL (basic check)
      if (!this.isImageUrl(parsedUrl.pathname)) {
        return SchemaValidationResult.failure([
          {
            id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            code: 'NOT_AN_IMAGE',
            message: 'URL does not point to an image file',
            path: context?.path || '$',
            severity: SchemaValidationSeverity.WARNING,
            timestamp: new Date(),
          },
        ])
      }

      // Check allowed image domains
      if (this.config.allowedImageDomains.length > 0) {
        const isAllowed = this.config.allowedImageDomains.some((domain) =>
          parsedUrl.hostname.includes(domain),
        )

        if (!isAllowed) {
          return SchemaValidationResult.failure([
            {
              id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              code: 'IMAGE_DOMAIN_NOT_ALLOWED',
              message: `Image domain '${parsedUrl.hostname}' is not in the allowed list`,
              path: context?.path || '$',
              severity: SchemaValidationSeverity.ERROR,
              timestamp: new Date(),
            },
          ])
        }
      }

      return SchemaValidationResult.success(context)
    } catch {
      return SchemaValidationResult.failure([
        {
          id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          code: 'INVALID_IMAGE_URL',
          message: 'Invalid image URL',
          path: context?.path || '$',
          severity: SchemaValidationSeverity.ERROR,
          timestamp: new Date(),
        },
      ])
    }
  }

  public sanitizeInput(input: string): string {
    let sanitized = input

    // Remove potentially dangerous patterns
    if (!this.config.allowHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '')
    }

    if (!this.config.allowJavaScript) {
      sanitized = sanitized
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/vbscript:/gi, '')
    }

    // Limit length
    if (sanitized.length > this.config.maxStringLength) {
      sanitized = sanitized.substring(0, this.config.maxStringLength)
    }

    return sanitized.trim()
  }

  public validateComponentType(componentType: string, context?: SchemaValidationContext): SchemaValidationResult {
    if (this.config.allowedComponentTypes.includes(componentType)) {
      return SchemaValidationResult.success(context)
    }

    return SchemaValidationResult.failure([
      {
        id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        code: 'COMPONENT_TYPE_NOT_ALLOWED',
        message: `Component type '${componentType}' is not allowed`,
        path: context?.path || '$',
        severity: SchemaValidationSeverity.ERROR,
        details: {
          componentType,
          allowedTypes: this.config.allowedComponentTypes,
        },
        timestamp: new Date(),
      },
    ])
  }

  public updateConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config }
  }

  public getConfig(): SecurityConfig {
    return { ...this.config }
  }

  private scanValue(value: unknown, path: string, violations: SecurityViolation[], depth: number): void {
    if (depth > this.config.maxObjectDepth) {
      violations.push({
        type: 'data_size',
        message: 'Maximum object depth exceeded',
        path,
        value,
        severity: SchemaValidationSeverity.ERROR,
      })
      return
    }

    if (typeof value === 'string') {
      this.scanString(value, path, violations)
    } else if (Array.isArray(value)) {
      this.scanArray(value, path, violations, depth)
    } else if (typeof value === 'object' && value !== null) {
      this.scanObject(value, path, violations, depth)
    }
  }

  private scanString(value: string, path: string, violations: SecurityViolation[]): void {
    // Check for XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
    ]

    if (!this.config.allowJavaScript) {
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          violations.push({
            type: 'xss',
            message: 'Potential XSS attack detected',
            path,
            value,
            severity: SchemaValidationSeverity.ERROR,
          })
          break
        }
      }
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b|\bscript\b)/gi,
      /(--|#|\/\*|\*\/)/g,
      /(\bor\s+\d+\s*=\s*\d+|\band\s+\d+\s*=\s*\d+)/gi,
    ]

    for (const pattern of sqlPatterns) {
      if (pattern.test(value)) {
        violations.push({
          type: 'sql_injection',
          message: 'Potential SQL injection detected',
          path,
          value,
          severity: SchemaValidationSeverity.WARNING,
        })
        break
      }
    }

    // Check for path traversal
    const pathTraversalPatterns = [
      /\.\./g,
      /%2e%2e/gi,
      /%c0%ae%c0%ae/gi,
    ]

    for (const pattern of pathTraversalPatterns) {
      if (pattern.test(value)) {
        violations.push({
          type: 'path_traversal',
          message: 'Potential path traversal attack detected',
          path,
          value,
          severity: SchemaValidationSeverity.ERROR,
        })
        break
      }
    }

    // Check string length
    if (value.length > this.config.maxStringLength) {
      violations.push({
        type: 'data_size',
        message: `String length (${value.length}) exceeds maximum allowed (${this.config.maxStringLength})`,
        path,
        value,
        severity: SchemaValidationSeverity.WARNING,
      })
    }

    // Check for Base64 encoded content (if not allowed)
    if (!this.config.allowBase64Data && this.isBase64(value)) {
      violations.push({
        type: 'data_size',
        message: 'Base64 encoded content not allowed',
        path,
        value,
        severity: SchemaValidationSeverity.WARNING,
      })
    }
  }

  private scanArray(value: unknown[], path: string, violations: SecurityViolation[], depth: number): void {
    if (value.length > this.config.maxArrayLength) {
      violations.push({
        type: 'data_size',
        message: `Array length (${value.length}) exceeds maximum allowed (${this.config.maxArrayLength})`,
        path,
        value,
        severity: SchemaValidationSeverity.WARNING,
      })
    }

    for (let i = 0; i < Math.min(value.length, this.config.maxArrayLength); i++) {
      this.scanValue(value[i], `${path}[${i}]`, violations, depth + 1)
    }
  }

  private scanObject(value: Record<string, unknown>, path: string, violations: SecurityViolation[], depth: number): void {
    for (const [key, val] of Object.entries(value)) {
      // Check for suspicious key names
      if (this.isSuspiciousKey(key)) {
        violations.push({
          type: 'xss',
          message: `Suspicious key name: ${key}`,
          path: `${path}.${key}`,
          value: val,
          severity: SchemaValidationSeverity.WARNING,
        })
      }

      this.scanValue(val, `${path}.${key}`, violations, depth + 1)
    }
  }

  private isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str
    } catch {
      return false
    }
  }

  private isImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
    return imageExtensions.some((ext) => url.toLowerCase().includes(ext))
  }

  private isSuspiciousKey(key: string): boolean {
    const suspiciousKeys = [
      'onerror',
      'onload',
      'onclick',
      'onmouseover',
      'onmouseout',
      'onkeydown',
      'onkeyup',
      'onkeypress',
      'onchange',
      'onsubmit',
      'onreset',
      'onfocus',
      'onblur',
      'onselect',
      'onscroll',
      'javascript',
      'vbscript',
      'script',
      'eval',
      'function',
      'innerHTML',
      'outerHTML',
    ]

    return suspiciousKeys.some((suspicious) =>
      key.toLowerCase().includes(suspicious.toLowerCase()),
    )
  }

  public static create(config?: SecurityConfig): SecurityValidator {
    return new SecurityValidator(config)
  }

  public static createStrict(): SecurityValidator {
    return new SecurityValidator({
      allowedProtocols: ['https:'],
      blockedDomains: ['localhost', '127.0.0.1', '0.0.0.0'],
      allowedImageDomains: [],
      maxStringLength: 5000,
      maxArrayLength: 100,
      maxObjectDepth: 5,
      allowHtml: false,
      allowJavaScript: false,
      allowBase64Data: false,
      requireHttps: true,
      allowedComponentTypes: [
        'Button', 'Label', 'Text', 'Image', 'List', 'Banner', 'Container', 'Row', 'Column', 'Card',
        'Form', 'Input', 'Select', 'Checkbox', 'Radio', 'Modal', 'Alert', 'Progress', 'Icon'
      ],
    })
  }

  public static createLenient(): SecurityValidator {
    return new SecurityValidator({
      allowedProtocols: ['https:', 'http:'],
      blockedDomains: [],
      allowedImageDomains: [],
      maxStringLength: 20000,
      maxArrayLength: 5000,
      maxObjectDepth: 20,
      allowHtml: true,
      allowJavaScript: false,
      allowBase64Data: true,
      requireHttps: false,
      allowedComponentTypes: [
        'Button', 'Label', 'Text', 'Image', 'List', 'Banner', 'Container', 'Row', 'Column', 'Card',
        'Form', 'Input', 'Select', 'Checkbox', 'Radio', 'Modal', 'Alert', 'Progress', 'Icon',
        'Custom'
      ],
    })
  }
}