import { describe, it, expect, beforeEach } from 'vitest'
import { Component } from '../../entities/component.entity.js'
import { ID } from '../../../../kernel/value-objects/id.value-object.js'
import { Name } from '../../../../kernel/value-objects/name.value-object.js'
import { Description } from '../../../../kernel/value-objects/description.value-object.js'
import { ComponentType } from '../../../shared/enums/component-type.enum.js'
import { Property } from '../../value-objects/property.value-object.js'
import { DataType } from '../../value-objects/data-type.value-object.js'
import { ValidationError } from 'src/kernel/index.js'

describe('Component Entity', () => {
  let mockProperty: Property
  let mockProps: any

  beforeEach(() => {
    mockProperty = Property.fromType(DataType.primitive('string'), 'testProperty', 'Test Property')

    mockProps = {
      name: Name.create('testComponent'),
      type: ComponentType.BUTTON,
      description: Description.create('Test component description'),
      properties: [mockProperty],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      },
    }
  })

  describe('create', () => {
    it('should create a component with valid props', () => {
      const component = Component.create(mockProps)

      expect(component).toBeInstanceOf(Component)
      expect(component.name.toString()).toBe('testComponent')
      expect(component.type).toBe(ComponentType.BUTTON)
      expect(component.description.toString()).toBe('Test component description')
      expect(component.properties).toHaveLength(1)
      expect(component.propertyCount).toBe(1)
    })

    it('should generate ID if not provided', () => {
      const component = Component.create(mockProps)
      expect(component.id).toBeInstanceOf(ID)
    })

    it('should use provided ID if available', () => {
      const testId = ID.generate()
      const propsWithId = { ...mockProps, id: testId }
      const component = Component.create(propsWithId)

      expect(component.id.toPrimitive()).toBe(testId.toPrimitive())
    })
  })

  describe('properties', () => {
    it('should return correct properties', () => {
      const component = Component.create(mockProps)

      expect(component.properties).toHaveLength(1)
      expect(component.properties[0].name).toBe('testProperty')
    })

    it('should add property correctly', () => {
      const component = Component.create(mockProps)
      const newProperty = Property.fromType(DataType.primitive('number'), 'age', 'Age')

      component.addProperty(newProperty)

      expect(component.properties).toHaveLength(2)
      expect(component.getProperty('age')).toBe(newProperty)
    })

    it('should throw error when adding duplicate property', () => {
      const component = Component.create(mockProps)

      expect(() => {
        component.addProperty(mockProperty)
      }).toThrow("Property 'testProperty' already exists")
    })

    it('should remove property correctly', () => {
      const component = Component.create(mockProps)

      component.removeProperty('testProperty')

      expect(component.properties).toHaveLength(0)
    })

    it('should throw error when removing non-existent property', () => {
      const component = Component.create(mockProps)

      expect(() => {
        component.removeProperty('nonExistent')
      }).toThrow("Property 'nonExistent' not found")
    })

    it('should check property existence', () => {
      const component = Component.create(mockProps)

      expect(component.hasProperty('testProperty')).toBe(true)
      expect(component.hasProperty('nonExistent')).toBe(false)
    })
  })

  describe('component hierarchy', () => {
    let parentComponent: Component
    let childComponent: Component

    beforeEach(() => {
      parentComponent = Component.create({
        ...mockProps,
        name: Name.create('parent'),
        type: ComponentType.CONTAINER,
      })

      childComponent = Component.create({
        ...mockProps,
        name: Name.create('child'),
        type: ComponentType.BUTTON,
      })
    })

    it('should allow adding child to container', () => {
      parentComponent.addChild(childComponent)

      expect(parentComponent.children).toHaveLength(1)
      expect(parentComponent.childCount).toBe(1)
      expect(childComponent.parentId?.toPrimitive()).toBe(parentComponent.id.toPrimitive())
    })

    it('should throw error when adding child to non-container', () => {
      const nonContainer = Component.create(mockProps)

      expect(() => {
        nonContainer.addChild(childComponent)
      }).toThrow('Cannot add child to non-container component')
    })

    it('should remove child correctly', () => {
      parentComponent.addChild(childComponent)
      parentComponent.removeChild(childComponent.id)

      expect(parentComponent.children).toHaveLength(0)
    })

    it('should throw error when removing non-existent child', () => {
      const parentComponent = Component.create({
        ...mockProps,
        name: Name.create('parent'),
        type: ComponentType.CONTAINER,
      })

      expect(() => {
        parentComponent.removeChild(ID.generate())
      }).toThrow('Child with ID')
    })
  })

  describe('component types', () => {
    it('should identify container components', () => {
      const container = Component.create({
        ...mockProps,
        name: Name.create('container'),
        type: ComponentType.CONTAINER,
      })

      expect(container.isContainer).toBe(true)
      expect(container.isLeaf).toBe(false)
    })

    it('should identify leaf components', () => {
      const button = Component.create({
        ...mockProps,
        name: Name.create('button'),
        type: ComponentType.BUTTON,
      })

      expect(button.isContainer).toBe(false)
      expect(button.isLeaf).toBe(true)
    })

    it('should return children by type', () => {
      const container = Component.create({
        ...mockProps,
        name: Name.create('parent'),
        type: ComponentType.CONTAINER,
      })

      const button = Component.create({
        ...mockProps,
        name: Name.create('button'),
        type: ComponentType.BUTTON,
      })

      const text = Component.create({
        ...mockProps,
        name: Name.create('text'),
        type: ComponentType.TEXT,
      })

      container.addChild(button)
      container.addChild(text)

      const buttons = container.getChildrenByType(ComponentType.BUTTON)
      expect(buttons).toHaveLength(1)
      expect(buttons[0].name).toBe('button')
    })
  })

  describe('validation', () => {
    it('should validate invariants on create', () => {
      expect(() => {
        Name.create('')
      }).toThrow()
    })

    it('should validate name format', () => {
      expect(() => {
        Name.create('123invalid')
      }).toThrow()
    })

    it('should validate name length', () => {
      const longName = 'a'.repeat(101)
      expect(() => {
        Name.create(longName)
      }).toThrow()
    })

    it('should validate duplicate property names', () => {
      const component = Component.create(mockProps)
      const duplicateProperty = Property.fromType(DataType.primitive('string'), 'testProperty', 'Duplicate Property')

      expect(() => {
        component.addProperty(duplicateProperty)
      }).toThrow(ValidationError as any)
    })
  })

  describe('serialization', () => {
    it('should convert to JSON correctly', () => {
      const component = Component.create(mockProps)
      const json = component.toJSON()

      expect(json.id).toEqual(component.id.toJSON())
      expect(json.name).toBe(component.name)
      expect(json.type).toBe(component.type)
      expect(json.description).toBe(component.description)
      expect(json.properties).toHaveLength(1)
    })

    it('should convert to primitive correctly', () => {
      const component = Component.create(mockProps)
      const primitive = component.toJSON()

      expect(primitive.id).toEqual(component.id.toJSON())
      expect(primitive.name).toBe(component.name.toString())
      expect(primitive.type).toBe(component.type.toString())
    })
  })
})
