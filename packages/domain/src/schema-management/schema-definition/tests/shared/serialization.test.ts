import { describe, it, expect } from 'vitest'
import { SchemaSerializer } from '../../shared/serialization.js'
import { ID } from '../../../../kernel/value-objects/id.value-object.js'

describe('SchemaSerializer', () => {
  describe('serialize', () => {
    it('should serialize simple schema to JSON string', () => {
      const mockSchema = {
        id: ID.generate(),
        name: 'Test Schema',
        version: { major: 1, minor: 0, patch: 0 },
        description: 'Test description',
        components: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const serialized = SchemaSerializer.serialize(mockSchema)

      expect(typeof serialized).toBe('string')
      expect(serialized).toContain('"name":"Test Schema"')
      expect(serialized).toContain('"version":"1.0.0"')
    })

    it('should serialize with pretty formatting', () => {
      const mockSchema = {
        id: ID.generate(),
        name: 'Test Schema',
        version: { major: 1, minor: 0, patch: 0 },
        components: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const serialized = SchemaSerializer.serialize(mockSchema, { pretty: true })

      expect(serialized).toContain('\n')
      expect(serialized).toContain('  ')
    })

    it('should serialize to object', () => {
      const mockSchema = {
        id: ID.generate(),
        name: 'Test Schema',
        version: { major: 1, minor: 0, patch: 0 },
        description: 'Test description',
        components: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const serialized = SchemaSerializer.serializeToObj(mockSchema, {
        includeMetadata: true,
        includeValidation: true,
        maxDepth: 10,
        pretty: false,
      })

      expect(serialized.id).toBe(mockSchema.id.toPrimitive())
      expect(serialized.name).toBe('Test Schema')
      expect(serialized.version).toBe('1.0.0')
      expect(serialized.description).toBe('Test description')
      expect(serialized.components).toEqual([])
      expect(serialized.metadata).toBeDefined()
    })

    it('should handle circular references', () => {
      const schema: any = {
        id: ID.generate(),
        name: 'Test Schema',
        version: { major: 1, minor: 0, patch: 0 },
        components: [],
      }

      schema.circular = schema

      const defaultOptions = {
        includeMetadata: false,
        includeValidation: false,
        maxDepth: 10,
        pretty: false,
      }

      expect(() => {
        SchemaSerializer.serializeToObj(schema, defaultOptions)
      }).toThrow('Circular reference detected')
    })

    it('should exclude metadata when option is false', () => {
      const mockSchema = {
        id: ID.generate(),
        name: 'Test Schema',
        version: { major: 1, minor: 0, patch: 0 },
        components: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const serialized = SchemaSerializer.serializeToObj(mockSchema, {
        includeMetadata: false,
        includeValidation: false,
        maxDepth: 10,
        pretty: false,
      })

      expect(serialized.metadata).toBeUndefined()
    })

    it('should serialize components', () => {
      const mockComponent = {
        id: ID.generate(),
        name: 'Test Component',
        type: 'button',
        properties: [],
      }

      const mockSchema = {
        id: ID.generate(),
        name: 'Test Schema',
        version: { major: 1, minor: 0, patch: 0 },
        components: [mockComponent],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const serialized = SchemaSerializer.serializeToObj(mockSchema, {
        includeMetadata: false,
        includeValidation: false,
        maxDepth: 10,
        pretty: false,
      })

      expect(serialized.components).toHaveLength(1)
      expect(serialized.components[0].name).toBe('Test Component')
      expect(serialized.components[0].type).toBe('button')
    })

    it('should serialize component hierarchy', () => {
      const childComponent = {
        id: ID.generate(),
        name: 'Child Component',
        type: 'text',
        properties: [],
      }

      const parentComponent = {
        id: ID.generate(),
        name: 'Parent Component',
        type: 'container',
        properties: [],
        children: [childComponent],
      }

      const mockSchema = {
        id: ID.generate(),
        name: 'Test Schema',
        version: { major: 1, minor: 0, patch: 0 },
        components: [parentComponent],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const serialized = SchemaSerializer.serializeToObj(mockSchema, {
        includeMetadata: false,
        includeValidation: false,
        maxDepth: 10,
        pretty: false,
      })

      expect(serialized.components[0].children).toHaveLength(1)
      expect(serialized.components[0].children?.[0].name).toBe('Child Component')
    })
  })

  describe('deserialize', () => {
    it('should deserialize from JSON string', () => {
      const jsonStr = JSON.stringify({
        id: '123',
        name: 'Test Schema',
        version: '1.0.0',
        components: [],
      })

      const deserialized = SchemaSerializer.deserialize(jsonStr)

      expect(deserialized).toEqual({
        id: '123',
        name: 'Test Schema',
        version: '1.0.0',
        components: [],
      })
    })

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{ invalid json }'

      expect(() => {
        SchemaSerializer.deserialize(invalidJson)
      }).toThrow('Failed to deserialize schema')
    })

    it('should deserialize from object', () => {
      const obj = {
        id: '123',
        name: 'Test Schema',
        version: '1.0.0',
        components: [],
      }

      const deserialized = SchemaSerializer.deserializeFromObj(obj)

      expect(deserialized).toEqual(obj)
    })
  })

  describe('serialization options', () => {
    it('should respect max depth option', () => {
      const createDeepComponent = (depth: number): any => {
        if (depth <= 0) {
          return {
            id: ID.generate(),
            name: 'Leaf Component',
            type: 'text',
            properties: [],
          }
        }

        return {
          id: ID.generate(),
          name: `Component ${depth}`,
          type: 'container',
          properties: [],
          children: [createDeepComponent(depth - 1)],
        }
      }

      const deepSchema = {
        id: ID.generate(),
        name: 'Deep Schema',
        version: { major: 1, minor: 0, patch: 0 },
        components: [createDeepComponent(5)],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const serialized = SchemaSerializer.serializeToObj(deepSchema, {
        maxDepth: 3,
        includeMetadata: false,
        includeValidation: false,
        pretty: false,
      })

      // Should still serialize correctly with depth limit
      expect(serialized.components).toHaveLength(1)
    })

    it('should include validation rules when option is true', () => {
      const mockValidationRule = {
        name: 'required',
        type: 'required',
        displayName: 'Required',
        parameters: [],
      }

      const mockProperty = {
        name: 'testProperty',
        type: { type: 'string' },
        displayName: 'Test Property',
        validationRules: [mockValidationRule],
      }

      const mockComponent = {
        id: ID.generate(),
        name: 'Test Component',
        type: 'button',
        properties: [mockProperty],
      }

      const mockSchema = {
        id: ID.generate(),
        name: 'Test Schema',
        version: { major: 1, minor: 0, patch: 0 },
        components: [mockComponent],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const serialized = SchemaSerializer.serializeToObj(mockSchema, {
        includeValidation: true,
        includeMetadata: false,
        maxDepth: 10,
        pretty: false,
      })

      expect(serialized.components[0].properties[0].validationRules).toHaveLength(1)
      expect(serialized.components[0].properties[0].validationRules?.[0].name).toBe('required')
    })

    it('should exclude validation rules when option is false', () => {
      const mockProperty = {
        name: 'testProperty',
        type: { type: 'string' },
        displayName: 'Test Property',
        validationRules: [{ name: 'required', type: 'required' }],
      }

      const mockComponent = {
        id: ID.generate(),
        name: 'Test Component',
        type: 'button',
        properties: [mockProperty],
      }

      const mockSchema = {
        id: ID.generate(),
        name: 'Test Schema',
        version: { major: 1, minor: 0, patch: 0 },
        components: [mockComponent],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      const serialized = SchemaSerializer.serializeToObj(mockSchema, {
        includeValidation: false,
        includeMetadata: false,
        maxDepth: 10,
        pretty: false,
      })

      expect(serialized.components[0].properties[0].validationRules).toBeUndefined()
    })
  })
})
