import { describe, it, expect } from 'vitest'
import { ValidationError, FieldError } from '../../errors/validation.error.js'

describe('ValidationError', () => {
  describe('single field validation', () => {
    it('should create error for single field', () => {
      const error = ValidationError.forField('email', 'invalid-email', 'must be valid email format')

      expect(error.fields).toEqual([{ name: 'email', value: 'invalid-email', rule: 'must be valid email format' }])
      expect(error.message).toBe("Field 'email' failed validation: must be valid email format")
    })

    it('should create error for empty field', () => {
      const error = ValidationError.emptyValue('name')

      expect(error.fields).toEqual([{ name: 'name', value: undefined, rule: 'field cannot be empty' }])
      expect(error.message).toBe("Field 'name' cannot be empty")
    })

    it('should create error for invalid type', () => {
      const error = ValidationError.invalidType('age', 'not-a-number', 'number')

      expect(error.fields).toEqual([{ name: 'age', value: 'not-a-number', rule: 'type must be number' }])
      expect(error.message).toBe("Field 'age' must be of type number, got string")
    })

    it('should create error for invalid format', () => {
      const error = ValidationError.invalidFormat('phone', '123', 'XXX-XXX-XXXX')

      expect(error.fields).toEqual([{ name: 'phone', value: '123', rule: 'format must be XXX-XXX-XXXX' }])
      expect(error.message).toBe("Field 'phone' has invalid format. Expected: XXX-XXX-XXXX, Got: 123")
    })
  })

  describe('multiple fields validation', () => {
    it('should create error for multiple fields', () => {
      const fields: FieldError[] = [
        { name: 'email', value: 'invalid-email', rule: 'must be valid email format' },
        { name: 'phone', value: '123', rule: 'must be valid phone format' },
        { name: 'age', value: -5, rule: 'must be positive number' },
      ]

      const error = ValidationError.forFields(fields)

      expect(error.fields).toEqual(fields)
      expect(error.message).toBe('Multiple fields failed validation: email, phone, age')
    })

    it('should create error for single field using forFields', () => {
      const fields: FieldError[] = [{ name: 'email', value: 'invalid-email', rule: 'must be valid email format' }]

      const error = ValidationError.forFields(fields)

      expect(error.fields).toEqual(fields)
      expect(error.message).toBe("Field 'email' failed validation: must be valid email format")
    })

    it('should create error for multiple empty fields', () => {
      const error = ValidationError.multipleEmptyFields(['name', 'email', 'phone'])

      expect(error.fields).toEqual([
        { name: 'name', value: undefined, rule: 'field cannot be empty' },
        { name: 'email', value: undefined, rule: 'field cannot be empty' },
        { name: 'phone', value: undefined, rule: 'field cannot be empty' },
      ])
      expect(error.message).toBe('Multiple fields failed validation: name, email, phone')
    })

    it('should create error for multiple invalid types', () => {
      const fieldTypes: { name: string; value: unknown; expectedType: string }[] = [
        { name: 'age', value: 'not-a-number', expectedType: 'number' },
        { name: 'isActive', value: 'yes', expectedType: 'boolean' },
      ]

      const error = ValidationError.multipleInvalidTypes(fieldTypes)

      expect(error.fields).toEqual([
        { name: 'age', value: 'not-a-number', rule: 'type must be number' },
        { name: 'isActive', value: 'yes', rule: 'type must be boolean' },
      ])
      expect(error.message).toBe('Multiple fields failed validation: age, isActive')
    })

    it('should create error for multiple invalid formats', () => {
      const fieldFormats: { name: string; value: unknown; expectedFormat: string }[] = [
        { name: 'email', value: 'invalid-email', expectedFormat: 'user@domain.com' },
        { name: 'phone', value: '123', expectedFormat: 'XXX-XXX-XXXX' },
      ]

      const error = ValidationError.multipleInvalidFormats(fieldFormats)

      expect(error.fields).toEqual([
        { name: 'email', value: 'invalid-email', rule: 'format must be user@domain.com' },
        { name: 'phone', value: '123', rule: 'format must be XXX-XXX-XXXX' },
      ])
      expect(error.message).toBe('Multiple fields failed validation: email, phone')
    })
  })

  describe('error properties', () => {
    it('should have correct error code', () => {
      const error = ValidationError.forField('test', 'value', 'rule')
      expect(error.code).toBe('VALIDATION_ERROR')
    })

    it('should have correct error name', () => {
      const error = ValidationError.forField('test', 'value', 'rule')
      expect(error.name).toBe('ValidationError')
    })

    it('should serialize to JSON correctly', () => {
      const error = ValidationError.forFields([
        { name: 'email', value: 'invalid', rule: 'must be valid email' },
        { name: 'phone', value: '123', rule: 'must be valid phone' },
      ])

      const json = error.toJSON()

      expect(json.name).toBe('ValidationError')
      expect(json.code).toBe('VALIDATION_ERROR')
      expect(json.message).toBe('Multiple fields failed validation: email, phone')
      expect(json.metadata.fields).toEqual([
        { name: 'email', value: 'invalid', rule: 'must be valid email' },
        { name: 'phone', value: '123', rule: 'must be valid phone' },
      ])
    })

    it('should have correct string representation', () => {
      const error = ValidationError.forField('test', 'value', 'rule')
      expect(error.toString()).toBe("[VALIDATION_ERROR] Field 'test' failed validation: rule")
    })
  })
})
