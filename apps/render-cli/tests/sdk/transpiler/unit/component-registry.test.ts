/**
 * Unit tests for ComponentRegistry class
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ComponentRegistry, createDefaultRegistry, createEmptyRegistry } from '@/sdk/transpiler/core/component-registry.js'
import { ComponentNotFoundError, RegistrationError } from '@/sdk/transpiler/errors.js'
import { createMockComponentDefinition } from '../test-utils.js'
import type { ComponentDefinition } from '@/sdk/transpiler/types.js'

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry

  beforeEach(() => {
    registry = createEmptyRegistry()
  })

  describe('registerComponent()', () => {
    it('should register a valid component', () => {
      const definition = createMockComponentDefinition('TestComponent')
      
      registry.registerComponent(definition)
      
      expect(registry.isRegistered('TestComponent')).toBe(true)
      expect(registry.size()).toBe(1)
    })

    it('should throw error for duplicate component registration', () => {
      const definition = createMockComponentDefinition('TestComponent')
      
      registry.registerComponent(definition)
      
      expect(() => registry.registerComponent(definition)).toThrow(RegistrationError)
      expect(() => registry.registerComponent(definition)).toThrow("Component 'TestComponent' is already registered")
    })

    it('should validate component name format', () => {
      const invalidDefinition = createMockComponentDefinition('invalid-component')
      
      expect(() => registry.registerComponent(invalidDefinition)).toThrow(RegistrationError)
      expect(() => registry.registerComponent(invalidDefinition)).toThrow('must be PascalCase')
    })

    it('should reject empty component name', () => {
      const invalidDefinition = createMockComponentDefinition('')
      
      expect(() => registry.registerComponent(invalidDefinition)).toThrow(RegistrationError)
      expect(() => registry.registerComponent(invalidDefinition)).toThrow('must be a non-empty string')
    })

    it('should validate childrenAllowed property', () => {
      const invalidDefinition = {
        ...createMockComponentDefinition('TestComponent'),
        childrenAllowed: 'invalid' as any,
      }
      
      expect(() => registry.registerComponent(invalidDefinition)).toThrow(RegistrationError)
      expect(() => registry.registerComponent(invalidDefinition)).toThrow('childrenAllowed must be a boolean')
    })

    it('should validate textChildrenAllowed property', () => {
      const invalidDefinition = {
        ...createMockComponentDefinition('TestComponent'),
        textChildrenAllowed: 'invalid' as any,
      }
      
      expect(() => registry.registerComponent(invalidDefinition)).toThrow(RegistrationError)
      expect(() => registry.registerComponent(invalidDefinition)).toThrow('textChildrenAllowed must be a boolean')
    })

    it('should validate supportedProps property', () => {
      const invalidDefinition = {
        ...createMockComponentDefinition('TestComponent'),
        supportedProps: 'invalid' as any,
      }
      
      expect(() => registry.registerComponent(invalidDefinition)).toThrow(RegistrationError)
      expect(() => registry.registerComponent(invalidDefinition)).toThrow('supportedProps must be an array')
    })

    it('should validate defaultStyles property', () => {
      const invalidDefinition = {
        ...createMockComponentDefinition('TestComponent'),
        defaultStyles: null as any,
      }
      
      expect(() => registry.registerComponent(invalidDefinition)).toThrow(RegistrationError)
      expect(() => registry.registerComponent(invalidDefinition)).toThrow('defaultStyles must be an object')
    })

    it('should accept valid PascalCase names', () => {
      const validNames = ['Component', 'MyComponent', 'UIButton', 'HTMLElement', 'Component123']
      
      for (const name of validNames) {
        const definition = createMockComponentDefinition(name)
        expect(() => registry.registerComponent(definition)).not.toThrow()
      }
    })

    it('should reject invalid component names', () => {
      const invalidNames = ['component', 'myComponent', 'my-component', '123Component', '', 'component-name', 'Component_Name']
      
      for (const name of invalidNames) {
        const registry = createEmptyRegistry() // Fresh registry for each test
        const definition = createMockComponentDefinition(name)
        expect(() => registry.registerComponent(definition)).toThrow(RegistrationError)
      }
    })
  })

  describe('isRegistered()', () => {
    it('should return true for registered component', () => {
      const definition = createMockComponentDefinition('TestComponent')
      registry.registerComponent(definition)
      
      expect(registry.isRegistered('TestComponent')).toBe(true)
    })

    it('should return false for unregistered component', () => {
      expect(registry.isRegistered('NonExistentComponent')).toBe(false)
    })

    it('should be case sensitive', () => {
      const definition = createMockComponentDefinition('TestComponent')
      registry.registerComponent(definition)
      
      expect(registry.isRegistered('testcomponent')).toBe(false)
      expect(registry.isRegistered('TESTCOMPONENT')).toBe(false)
    })
  })

  describe('getDefinition()', () => {
    it('should return definition for registered component', () => {
      const definition = createMockComponentDefinition('TestComponent', {
        defaultStyles: { color: 'red' },
        supportedProps: ['title', 'onClick'],
      })
      registry.registerComponent(definition)
      
      const retrieved = registry.getDefinition('TestComponent')
      
      expect(retrieved).toEqual(definition)
      expect(retrieved.defaultStyles).toEqual({ color: 'red' })
      expect(retrieved.supportedProps).toEqual(['title', 'onClick'])
    })

    it('should throw error for unregistered component', () => {
      expect(() => registry.getDefinition('NonExistentComponent')).toThrow(ComponentNotFoundError)
    })

    it('should include available components in error', () => {
      registry.registerComponent(createMockComponentDefinition('ComponentA'))
      registry.registerComponent(createMockComponentDefinition('ComponentB'))
      
      try {
        registry.getDefinition('NonExistentComponent')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeInstanceOf(ComponentNotFoundError)
        const componentError = error as ComponentNotFoundError
        expect(componentError.context?.availableComponents).toContain('ComponentA')
        expect(componentError.context?.availableComponents).toContain('ComponentB')
      }
    })
  })

  describe('getDefaultStyles()', () => {
    it('should return default styles for component', () => {
      const definition = createMockComponentDefinition('TestComponent', {
        defaultStyles: { backgroundColor: 'blue', padding: 16 },
      })
      registry.registerComponent(definition)
      
      const styles = registry.getDefaultStyles('TestComponent')
      
      expect(styles).toEqual({ backgroundColor: 'blue', padding: 16 })
    })

    it('should return copy of default styles (immutable)', () => {
      const definition = createMockComponentDefinition('TestComponent', {
        defaultStyles: { color: 'red' },
      })
      registry.registerComponent(definition)
      
      const styles1 = registry.getDefaultStyles('TestComponent')
      const styles2 = registry.getDefaultStyles('TestComponent')
      
      styles1.color = 'blue'
      
      expect(styles2.color).toBe('red') // Should not be affected
      expect(registry.getDefinition('TestComponent').defaultStyles.color).toBe('red')
    })

    it('should return empty object for component with no default styles', () => {
      const definition = createMockComponentDefinition('TestComponent', {
        defaultStyles: {},
      })
      registry.registerComponent(definition)
      
      const styles = registry.getDefaultStyles('TestComponent')
      
      expect(styles).toEqual({})
    })

    it('should throw error for unregistered component', () => {
      expect(() => registry.getDefaultStyles('NonExistentComponent')).toThrow(ComponentNotFoundError)
    })
  })

  describe('getAllComponentNames()', () => {
    it('should return empty array for empty registry', () => {
      expect(registry.getAllComponentNames()).toEqual([])
    })

    it('should return all registered component names', () => {
      registry.registerComponent(createMockComponentDefinition('ComponentA'))
      registry.registerComponent(createMockComponentDefinition('ComponentB'))
      registry.registerComponent(createMockComponentDefinition('ComponentC'))
      
      const names = registry.getAllComponentNames()
      
      expect(names).toHaveLength(3)
      expect(names).toContain('ComponentA')
      expect(names).toContain('ComponentB')
      expect(names).toContain('ComponentC')
    })

    it('should return sorted component names', () => {
      registry.registerComponent(createMockComponentDefinition('ZComponent'))
      registry.registerComponent(createMockComponentDefinition('AComponent'))
      registry.registerComponent(createMockComponentDefinition('MComponent'))
      
      const names = registry.getAllComponentNames()
      
      expect(names).toEqual(['AComponent', 'MComponent', 'ZComponent'])
    })
  })

  describe('supportsProp()', () => {
    it('should return true for supported prop', () => {
      const definition = createMockComponentDefinition('TestComponent', {
        supportedProps: ['title', 'onClick', 'disabled'],
      })
      registry.registerComponent(definition)
      
      expect(registry.supportsProp('TestComponent', 'title')).toBe(true)
      expect(registry.supportsProp('TestComponent', 'onClick')).toBe(true)
      expect(registry.supportsProp('TestComponent', 'disabled')).toBe(true)
    })

    it('should return false for unsupported prop', () => {
      const definition = createMockComponentDefinition('TestComponent', {
        supportedProps: ['title'],
      })
      registry.registerComponent(definition)
      
      expect(registry.supportsProp('TestComponent', 'unsupported')).toBe(false)
    })

    it('should throw error for unregistered component', () => {
      expect(() => registry.supportsProp('NonExistentComponent', 'title')).toThrow(ComponentNotFoundError)
    })
  })

  describe('size()', () => {
    it('should return 0 for empty registry', () => {
      expect(registry.size()).toBe(0)
    })

    it('should return correct count of registered components', () => {
      expect(registry.size()).toBe(0)
      
      registry.registerComponent(createMockComponentDefinition('ComponentA'))
      expect(registry.size()).toBe(1)
      
      registry.registerComponent(createMockComponentDefinition('ComponentB'))
      expect(registry.size()).toBe(2)
    })
  })

  describe('clear()', () => {
    it('should remove all registered components', () => {
      registry.registerComponent(createMockComponentDefinition('ComponentA'))
      registry.registerComponent(createMockComponentDefinition('ComponentB'))
      
      expect(registry.size()).toBe(2)
      
      registry.clear()
      
      expect(registry.size()).toBe(0)
      expect(registry.isRegistered('ComponentA')).toBe(false)
      expect(registry.isRegistered('ComponentB')).toBe(false)
    })
  })

  describe('registerComponents()', () => {
    it('should register multiple components at once', () => {
      const components = [
        createMockComponentDefinition('ComponentA'),
        createMockComponentDefinition('ComponentB'),
        createMockComponentDefinition('ComponentC'),
      ]
      
      registry.registerComponents(components)
      
      expect(registry.size()).toBe(3)
      expect(registry.isRegistered('ComponentA')).toBe(true)
      expect(registry.isRegistered('ComponentB')).toBe(true)
      expect(registry.isRegistered('ComponentC')).toBe(true)
    })

    it('should stop at first duplicate and throw error', () => {
      const components = [
        createMockComponentDefinition('ComponentA'),
        createMockComponentDefinition('ComponentB'),
        createMockComponentDefinition('ComponentA'), // Duplicate
      ]
      
      expect(() => registry.registerComponents(components)).toThrow(RegistrationError)
      
      // Should have registered the first one but not the rest
      expect(registry.isRegistered('ComponentA')).toBe(true)
      expect(registry.isRegistered('ComponentB')).toBe(true)
    })
  })

  describe('createDefaultRegistry()', () => {
    it('should create registry with standard UI components', () => {
      const defaultRegistry = createDefaultRegistry()
      
      expect(defaultRegistry.size()).toBeGreaterThan(0)
      
      // Check for common UI components
      expect(defaultRegistry.isRegistered('View')).toBe(true)
      expect(defaultRegistry.isRegistered('Text')).toBe(true)
      expect(defaultRegistry.isRegistered('Button')).toBe(true)
      expect(defaultRegistry.isRegistered('Image')).toBe(true)
    })

    it('should have correct default styles for Row component', () => {
      const defaultRegistry = createDefaultRegistry()
      
      const rowStyles = defaultRegistry.getDefaultStyles('Row')
      
      expect(rowStyles.flexDirection).toBe('row')
    })

    it('should have correct default styles for Column component', () => {
      const defaultRegistry = createDefaultRegistry()
      
      const columnStyles = defaultRegistry.getDefaultStyles('Column')
      
      expect(columnStyles.flexDirection).toBe('column')
    })

    it('should configure Text component to allow text children', () => {
      const defaultRegistry = createDefaultRegistry()
      
      const textDefinition = defaultRegistry.getDefinition('Text')
      
      expect(textDefinition.textChildrenAllowed).toBe(true)
      expect(textDefinition.childrenAllowed).toBe(true)
    })

    it('should configure Button component to not allow children', () => {
      const defaultRegistry = createDefaultRegistry()
      
      const buttonDefinition = defaultRegistry.getDefinition('Button')
      
      expect(buttonDefinition.childrenAllowed).toBe(false)
      expect(buttonDefinition.textChildrenAllowed).toBe(false)
    })

    it('should configure Image component with source prop support', () => {
      const defaultRegistry = createDefaultRegistry()
      
      const imageDefinition = defaultRegistry.getDefinition('Image')
      
      expect(imageDefinition.supportedProps).toContain('source')
      expect(imageDefinition.childrenAllowed).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle components with readonly arrays', () => {
      const definition: ComponentDefinition = {
        name: 'ReadonlyComponent',
        defaultStyles: {},
        supportedProps: ['prop1', 'prop2'] as readonly string[],
        childrenAllowed: true,
        textChildrenAllowed: false,
      }
      
      registry.registerComponent(definition)
      
      expect(registry.supportsProp('ReadonlyComponent', 'prop1')).toBe(true)
      expect(registry.supportsProp('ReadonlyComponent', 'prop2')).toBe(true)
    })

    it('should handle components with complex default styles', () => {
      const complexStyles = {
        position: 'absolute',
        top: 0,
        left: 0,
        transform: [{ translateX: 10 }, { translateY: 20 }],
        shadowOffset: { width: 2, height: 2 },
      }
      
      const definition = createMockComponentDefinition('ComplexComponent', {
        defaultStyles: complexStyles,
      })
      
      registry.registerComponent(definition)
      
      const retrievedStyles = registry.getDefaultStyles('ComplexComponent')
      expect(retrievedStyles).toEqual(complexStyles)
      
      // Should be a deep copy
      retrievedStyles.top = 100
      expect(registry.getDefaultStyles('ComplexComponent').top).toBe(0)
    })
  })
})