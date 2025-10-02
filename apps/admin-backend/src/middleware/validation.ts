import { Context, Next } from 'hono'

// Request validation schemas
export const scenarioValidationRules = {
  create: {
    key: { required: true, type: 'string', minLength: 1 },
    mainComponent: { required: true, type: 'object' },
    components: { required: false, type: 'object', default: {} },
    version: { required: false, type: 'string', default: '1.0.0' },
    metadata: { required: false, type: 'object', default: {} },
  },
  update: {
    key: { required: false, type: 'string', minLength: 1 },
    mainComponent: { required: false, type: 'object' },
    components: { required: false, type: 'object' },
    version: { required: false, type: 'string' },
    metadata: { required: false, type: 'object' },
  }
}

export const analyticsValidationRules = {
  view: {
    platform: { required: false, type: 'string' },
    userAgent: { required: false, type: 'string' },
    sessionId: { required: false, type: 'string' },
  },
  interaction: {
    componentId: { required: true, type: 'string' },
    interactionType: { required: true, type: 'string' },
    platform: { required: false, type: 'string' },
    userAgent: { required: false, type: 'string' },
    sessionId: { required: false, type: 'string' },
    metadata: { required: false, type: 'object' },
  }
}

type ValidationRule = {
  required: boolean
  type: 'string' | 'object' | 'number' | 'boolean' | 'array'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  default?: any
}

type ValidationSchema = Record<string, ValidationRule>

// Validation middleware factory
export function validateRequest(schema: ValidationSchema) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json()
      const errors: string[] = []
      const validatedData: any = {}

      // Check required fields and validate types
      for (const [fieldName, rule] of Object.entries(schema)) {
        const value = body[fieldName]

        // Handle required fields
        if (rule.required && (value === undefined || value === null)) {
          errors.push(`${fieldName} is required`)
          continue
        }

        // Skip validation if field is not provided and not required
        if (value === undefined || value === null) {
          if (rule.default !== undefined) {
            validatedData[fieldName] = rule.default
          }
          continue
        }

        // Type validation
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${fieldName} must be a string`)
              continue
            }
            if (rule.minLength && value.length < rule.minLength) {
              errors.push(`${fieldName} must be at least ${rule.minLength} characters long`)
              continue
            }
            if (rule.maxLength && value.length > rule.maxLength) {
              errors.push(`${fieldName} must be no more than ${rule.maxLength} characters long`)
              continue
            }
            break

          case 'object':
            if (typeof value !== 'object' || Array.isArray(value)) {
              errors.push(`${fieldName} must be an object`)
              continue
            }
            break

          case 'number':
            if (typeof value !== 'number') {
              errors.push(`${fieldName} must be a number`)
              continue
            }
            if (rule.min !== undefined && value < rule.min) {
              errors.push(`${fieldName} must be at least ${rule.min}`)
              continue
            }
            if (rule.max !== undefined && value > rule.max) {
              errors.push(`${fieldName} must be no more than ${rule.max}`)
              continue
            }
            break

          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${fieldName} must be a boolean`)
              continue
            }
            break

          case 'array':
            if (!Array.isArray(value)) {
              errors.push(`${fieldName} must be an array`)
              continue
            }
            break
        }

        validatedData[fieldName] = value
      }

      if (errors.length > 0) {
        return c.json({
          error: 'Validation failed',
          details: errors,
          timestamp: new Date().toISOString()
        }, 400)
      }

      // Attach validated data to context for use in route handlers
      c.set('validatedData', validatedData)
      await next()
    } catch (error: any) {
      return c.json({
        error: 'Invalid JSON payload',
        message: error.message,
        timestamp: new Date().toISOString()
      }, 400)
    }
  }
}

// Pagination validation middleware
export function validatePagination() {
  return async (c: Context, next: Next) => {
    const page = c.req.query('page') || '1'
    const limit = c.req.query('limit') || '10'

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    if (isNaN(pageNum) || pageNum < 1) {
      return c.json({
        error: 'Invalid page parameter. Must be a positive integer.',
        timestamp: new Date().toISOString()
      }, 400)
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return c.json({
        error: 'Invalid limit parameter. Must be between 1 and 100.',
        timestamp: new Date().toISOString()
      }, 400)
    }

    c.set('pagination', { page: pageNum, limit: limitNum })
    await next()
  }
}

// UUID validation middleware
export function validateUUID(paramName: string = 'id') {
  return async (c: Context, next: Next) => {
    const id = c.req.param(paramName)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(id)) {
      return c.json({
        error: `Invalid ${paramName} format. Must be a valid UUID.`,
        timestamp: new Date().toISOString()
      }, 400)
    }

    await next()
  }
}

// Component schema validation
export function validateComponentSchema() {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json()
      const { mainComponent } = body

      if (mainComponent) {
        // Basic component structure validation
        if (!mainComponent.type) {
          return c.json({
            error: 'mainComponent must have a type field',
            timestamp: new Date().toISOString()
          }, 400)
        }

        // Validate component structure recursively
        const validateComponent = (component: any, path: string = 'mainComponent'): string[] => {
          const errors: string[] = []

          if (!component.type || typeof component.type !== 'string') {
            errors.push(`${path}.type is required and must be a string`)
          }

          if (component.children && Array.isArray(component.children)) {
            component.children.forEach((child: any, index: number) => {
              const childPath = `${path}.children[${index}]`
              errors.push(...validateComponent(child, childPath))
            })
          }

          return errors
        }

        const validationErrors = validateComponent(mainComponent)
        if (validationErrors.length > 0) {
          return c.json({
            error: 'Component schema validation failed',
            details: validationErrors,
            timestamp: new Date().toISOString()
          }, 400)
        }
      }

      await next()
    } catch (error: any) {
      return c.json({
        error: 'Invalid JSON payload',
        message: error.message,
        timestamp: new Date().toISOString()
      }, 400)
    }
  }
}