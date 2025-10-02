import { describe, it, expect } from 'vitest'
import {
  SchemaError,
  ValidationError,
  NotFoundError,
  InvalidOperationError,
  ConfigurationError,
} from '../../shared/errors.js'

describe('Error Handling', () => {
  describe('SchemaError', () => {
    it('should create error with message and code', () => {
      const error = new SchemaError('Test message', 'TEST_CODE')

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test message')
      expect(error.code).toBe('TEST_CODE')
      expect(error.name).toBe('SchemaError')
      expect(error.context).toBeUndefined()
    })

    it('should include context when provided', () => {
      const context = { field: 'name', value: 'test' }
      const error = new SchemaError('Test message', 'TEST_CODE', context)

      expect(error.context).toBe(context)
    })

    it('should have stack trace', () => {
      const error = new SchemaError('Test message', 'TEST_CODE')

      expect(error.stack).toBeDefined()
      expect(typeof error.stack).toBe('string')
    })
  })

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input')

      expect(error).toBeInstanceOf(SchemaError)
      expect(error.message).toBe('Invalid input')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.name).toBe('ValidationError')
    })

    it('should include context', () => {
      const context = { field: 'email', value: 'invalid-email' }
      const error = new ValidationError('Invalid email', context)

      expect(error.context).toBe(context)
    })
  })

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError('Resource not found')

      expect(error).toBeInstanceOf(SchemaError)
      expect(error.message).toBe('Resource not found')
      expect(error.code).toBe('NOT_FOUND_ERROR')
      expect(error.name).toBe('NotFoundError')
    })

    it('should include context with resource details', () => {
      const context = { resource: 'Component', id: '123' }
      const error = new NotFoundError('Component not found', context)

      expect(error.context).toBe(context)
    })
  })

  describe('InvalidOperationError', () => {
    it('should create invalid operation error', () => {
      const error = new InvalidOperationError('Operation not allowed')

      expect(error).toBeInstanceOf(SchemaError)
      expect(error.message).toBe('Operation not allowed')
      expect(error.code).toBe('INVALID_OPERATION_ERROR')
      expect(error.name).toBe('InvalidOperationError')
    })

    it('should include context with operation details', () => {
      const context = { operation: 'delete', entity: 'Schema' }
      const error = new InvalidOperationError('Cannot delete published schema', context)

      expect(error.context).toBe(context)
    })
  })

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Invalid configuration')

      expect(error).toBeInstanceOf(SchemaError)
      expect(error.message).toBe('Invalid configuration')
      expect(error.code).toBe('CONFIGURATION_ERROR')
      expect(error.name).toBe('ConfigurationError')
    })

    it('should include context with configuration details', () => {
      const context = { section: 'database', setting: 'host' }
      const error = new ConfigurationError('Missing database host', context)

      expect(error.context).toBe(context)
    })
  })

  describe('error inheritance', () => {
    it('should maintain proper inheritance chain', () => {
      const validationError = new ValidationError('Test')
      const notFoundError = new NotFoundError('Test')
      const invalidOperationError = new InvalidOperationError('Test')
      const configurationError = new ConfigurationError('Test')

      expect(validationError).toBeInstanceOf(SchemaError)
      expect(validationError).toBeInstanceOf(Error)

      expect(notFoundError).toBeInstanceOf(SchemaError)
      expect(notFoundError).toBeInstanceOf(Error)

      expect(invalidOperationError).toBeInstanceOf(SchemaError)
      expect(invalidOperationError).toBeInstanceOf(Error)

      expect(configurationError).toBeInstanceOf(SchemaError)
      expect(configurationError).toBeInstanceOf(Error)
    })

    it('should allow instanceof checks for specific error types', () => {
      const error = new ValidationError('Test')

      expect(error instanceof ValidationError).toBe(true)
      expect(error instanceof SchemaError).toBe(true)
      expect(error instanceof Error).toBe(true)
      expect(error instanceof NotFoundError).toBe(false)
    })
  })

  describe('error serialization', () => {
    it('should be serializable to JSON', () => {
      const error = new ValidationError('Test error', { field: 'name' })
      const serialized = JSON.stringify(error, null, 2)
      const parsed = JSON.parse(serialized)

      expect(parsed.name).toBe('ValidationError')
      expect(parsed.message).toBe('Test error')
      expect(parsed.code).toBe('VALIDATION_ERROR')
      expect(parsed.context).toEqual({ field: 'name' })
    })

    it('should handle circular references in context', () => {
      const context: any = { field: 'test' }
      context.circular = context

      const error = new SchemaError('Test', 'TEST_CODE', context)

      // Use a replacer function to handle circular references
      const getCircularReplacer = () => {
        const seen = new WeakSet()
        return (key: string, value: unknown) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]'
            }
            seen.add(value)
          }
          return value
        }
      }

      const serialized = JSON.stringify(error, getCircularReplacer())

      expect(serialized).toBeDefined()
      expect(typeof serialized).toBe('string')
      expect(serialized).toContain('[Circular]')
    })
  })

  describe('error codes consistency', () => {
    it('should use consistent error code format', () => {
      const errors = [
        new ValidationError('Test'),
        new NotFoundError('Test'),
        new InvalidOperationError('Test'),
        new ConfigurationError('Test'),
      ]

      errors.forEach((error) => {
        expect(error.code).toMatch(/^[A-Z_]+_ERROR$/)
      })
    })

    it('should have unique error codes', () => {
      const codes = [
        new ValidationError('Test').code,
        new NotFoundError('Test').code,
        new InvalidOperationError('Test').code,
        new ConfigurationError('Test').code,
      ]

      const uniqueCodes = new Set(codes)
      expect(uniqueCodes.size).toBe(codes.length)
    })
  })
})
