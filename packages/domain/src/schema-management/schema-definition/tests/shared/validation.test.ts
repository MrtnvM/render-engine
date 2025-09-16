import { describe, it, expect } from 'vitest'
import { ValidationRule, ValidationResult } from '../../shared/validation.js'

describe('Validation System', () => {
  describe('ValidationResult', () => {
    it('should create success result', () => {
      const result = ValidationResult.success()

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
      expect(result.info).toHaveLength(0)
    })

    it('should create failure result', () => {
      const errors = [{ message: 'Test error', type: 'error' as const }]
      const result = ValidationResult.failure(errors)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toBe('Test error')
    })

    it('should create result from items', () => {
      const items = [
        { message: 'Error', type: 'error' as const },
        { message: 'Warning', type: 'warning' as const },
        { message: 'Info', type: 'info' as const },
      ]

      const result = ValidationResult.create(items)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.warnings).toHaveLength(1)
      expect(result.info).toHaveLength(1)
    })
  })

  describe('ValidationRule', () => {
    describe('required', () => {
      it('should validate required fields', () => {
        const rule = ValidationRule.required()

        expect(rule.validate(null).isValid).toBe(false)
        expect(rule.validate(undefined).isValid).toBe(false)
        expect(rule.validate('').isValid).toBe(true)
        expect(rule.validate(0).isValid).toBe(true)
        expect(rule.validate(false).isValid).toBe(true)
      })

      it('should use custom message', () => {
        const rule = ValidationRule.required('Custom required message')
        const result = rule.validate(null)

        expect(result.errors[0].message).toBe('Custom required message')
      })
    })

    describe('type', () => {
      it('should validate string type', () => {
        const rule = ValidationRule.type('string')

        expect(rule.validate('test').isValid).toBe(true)
        expect(rule.validate(123).isValid).toBe(false)
        expect(rule.validate(null).isValid).toBe(false)
      })

      it('should validate number type', () => {
        const rule = ValidationRule.type('number')

        expect(rule.validate(123).isValid).toBe(true)
        expect(rule.validate('123').isValid).toBe(false)
        expect(rule.validate(NaN).isValid).toBe(false)
      })

      it('should validate boolean type', () => {
        const rule = ValidationRule.type('boolean')

        expect(rule.validate(true).isValid).toBe(true)
        expect(rule.validate(false).isValid).toBe(true)
        expect(rule.validate('true').isValid).toBe(false)
      })

      it('should validate array type', () => {
        const rule = ValidationRule.type('array')

        expect(rule.validate([1, 2, 3]).isValid).toBe(true)
        expect(rule.validate({}).isValid).toBe(false)
      })

      it('should validate object type', () => {
        const rule = ValidationRule.type('object')

        expect(rule.validate({}).isValid).toBe(true)
        expect(rule.validate([]).isValid).toBe(false)
        expect(rule.validate(null).isValid).toBe(false)
      })
    })

    describe('min', () => {
      it('should validate minimum value', () => {
        const rule = ValidationRule.min(10)

        expect(rule.validate(10).isValid).toBe(true)
        expect(rule.validate(15).isValid).toBe(true)
        expect(rule.validate(5).isValid).toBe(false)
        expect(rule.validate('string').isValid).toBe(true) // Non-numbers pass
      })

      it('should use custom message', () => {
        const rule = ValidationRule.min(18, 'Must be at least 18')
        const result = rule.validate(16)

        expect(result.errors[0].message).toBe('Must be at least 18')
      })
    })

    describe('max', () => {
      it('should validate maximum value', () => {
        const rule = ValidationRule.max(100)

        expect(rule.validate(100).isValid).toBe(true)
        expect(rule.validate(50).isValid).toBe(true)
        expect(rule.validate(150).isValid).toBe(false)
        expect(rule.validate('string').isValid).toBe(true) // Non-numbers pass
      })
    })

    describe('minLength', () => {
      it('should validate minimum length', () => {
        const rule = ValidationRule.minLength(5)

        expect(rule.validate('hello').isValid).toBe(true)
        expect(rule.validate('hello world').isValid).toBe(true)
        expect(rule.validate('hi').isValid).toBe(false)
        expect(rule.validate([1, 2, 3, 4, 5]).isValid).toBe(true)
        expect(rule.validate([1, 2]).isValid).toBe(false)
      })
    })

    describe('maxLength', () => {
      it('should validate maximum length', () => {
        const rule = ValidationRule.maxLength(10)

        expect(rule.validate('hello').isValid).toBe(true)
        expect(rule.validate('hi').isValid).toBe(true)
        expect(rule.validate('this is too long').isValid).toBe(false)
        expect(rule.validate([1, 2, 3, 4, 5]).isValid).toBe(true)
        expect(rule.validate([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).isValid).toBe(false)
      })
    })

    describe('pattern', () => {
      it('should validate regex pattern', () => {
        const rule = ValidationRule.pattern('^[a-zA-Z]+$')

        expect(rule.validate('hello').isValid).toBe(true)
        expect(rule.validate('Hello').isValid).toBe(true)
        expect(rule.validate('hello123').isValid).toBe(false)
        expect(rule.validate(123).isValid).toBe(true) // Non-strings pass
      })
    })

    describe('email', () => {
      it('should validate email format', () => {
        const rule = ValidationRule.email()

        expect(rule.validate('test@example.com').isValid).toBe(true)
        expect(rule.validate('user.name@domain.co.uk').isValid).toBe(true)
        expect(rule.validate('invalid-email').isValid).toBe(false)
        expect(rule.validate('@example.com').isValid).toBe(false)
        expect(rule.validate('test@').isValid).toBe(false)
      })
    })

    describe('url', () => {
      it('should validate URL format', () => {
        const rule = ValidationRule.url()

        expect(rule.validate('https://example.com').isValid).toBe(true)
        expect(rule.validate('http://localhost:3000').isValid).toBe(true)
        expect(rule.validate('ftp://example.com').isValid).toBe(true)
        expect(rule.validate('not-a-url').isValid).toBe(false)
        expect(rule.validate('http://').isValid).toBe(false)
      })
    })

    describe('enum', () => {
      it('should validate enum values', () => {
        const rule = ValidationRule.enum(['red', 'green', 'blue'])

        expect(rule.validate('red').isValid).toBe(true)
        expect(rule.validate('green').isValid).toBe(true)
        expect(rule.validate('yellow').isValid).toBe(false)
        expect(rule.validate('RED').isValid).toBe(false) // Case sensitive
      })
    })

    describe('range', () => {
      it('should validate numeric range', () => {
        const rule = ValidationRule.range(0, 100)

        expect(rule.validate(0).isValid).toBe(true)
        expect(rule.validate(50).isValid).toBe(true)
        expect(rule.validate(100).isValid).toBe(true)
        expect(rule.validate(-1).isValid).toBe(false)
        expect(rule.validate(101).isValid).toBe(false)
      })
    })

    describe('positive', () => {
      it('should validate positive numbers', () => {
        const rule = ValidationRule.positive()

        expect(rule.validate(1).isValid).toBe(true)
        expect(rule.validate(0.5).isValid).toBe(true)
        expect(rule.validate(0).isValid).toBe(false)
        expect(rule.validate(-1).isValid).toBe(false)
      })
    })

    describe('negative', () => {
      it('should validate negative numbers', () => {
        const rule = ValidationRule.negative()

        expect(rule.validate(-1).isValid).toBe(true)
        expect(rule.validate(-0.5).isValid).toBe(true)
        expect(rule.validate(0).isValid).toBe(false)
        expect(rule.validate(1).isValid).toBe(false)
      })
    })

    describe('uuid', () => {
      it('should validate UUID format', () => {
        const rule = ValidationRule.uuid()

        expect(rule.validate('123e4567-e89b-12d3-a456-426614174000').isValid).toBe(true)
        expect(rule.validate('123e4567-e89b-12d3-a456-426614174000').isValid).toBe(true)
        expect(rule.validate('not-a-uuid').isValid).toBe(false)
        expect(rule.validate('123e4567-e89b-12d3-a456').isValid).toBe(false)
      })
    })

    describe('error handling', () => {
      it('should handle validation errors gracefully', () => {
        const rule = ValidationRule.pattern('[invalid-regex')
        const result = rule.validate('test')

        expect(result.isValid).toBe(false)
        expect(result.errors[0].message).toContain('Validation failed')
      })

      it('should use default messages when not provided', () => {
        const rule = ValidationRule.required()
        const result = rule.validate(null)

        expect(result.errors[0].message).toBe('This field is required')
      })

      it('should interpolate parameters in messages', () => {
        const rule = ValidationRule.min(18, 'Must be at least {{min}} years old')
        const result = rule.validate(16)

        expect(result.errors[0].message).toBe('Must be at least 18 years old')
      })
    })
  })
})
