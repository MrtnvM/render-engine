import { describe, it, expect, beforeEach } from 'vitest'
import { ComponentRegistry } from '../../src/transpiler/plugins/component-registry'

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry

  beforeEach(() => {
    registry = new ComponentRegistry()
  })

  describe('registerBase', () => {
    it('should register a single base component', () => {
      registry.registerBase('View')

      expect(registry.isValid('View')).toBe(true)
      expect(registry.isBase('View')).toBe(true)
      expect(registry.isLocal('View')).toBe(false)
    })

    it('should register multiple base components', () => {
      registry.registerBaseComponents(['View', 'Row', 'Column', 'Text'])

      expect(registry.getBaseComponents()).toEqual(['View', 'Row', 'Column', 'Text'])
      expect(registry.isValid('View')).toBe(true)
      expect(registry.isValid('Text')).toBe(true)
    })
  })

  describe('registerLocal', () => {
    it('should register a single local component', () => {
      registry.registerLocal('CartItem')

      expect(registry.isValid('CartItem')).toBe(true)
      expect(registry.isLocal('CartItem')).toBe(true)
      expect(registry.isBase('CartItem')).toBe(false)
    })

    it('should register multiple local components', () => {
      registry.registerLocalComponents(['TopRow', 'BottomBar', 'CartItem'])

      expect(registry.getLocalComponents()).toEqual(['TopRow', 'BottomBar', 'CartItem'])
      expect(registry.isValid('TopRow')).toBe(true)
      expect(registry.isValid('BottomBar')).toBe(true)
    })
  })

  describe('isValid', () => {
    it('should return true for registered base components', () => {
      registry.registerBase('View')
      expect(registry.isValid('View')).toBe(true)
    })

    it('should return true for registered local components', () => {
      registry.registerLocal('CustomComponent')
      expect(registry.isValid('CustomComponent')).toBe(true)
    })

    it('should return false for unregistered components', () => {
      expect(registry.isValid('UnknownComponent')).toBe(false)
    })

    it('should return true for components in either base or local', () => {
      registry.registerBase('View')
      registry.registerLocal('CustomView')

      expect(registry.isValid('View')).toBe(true)
      expect(registry.isValid('CustomView')).toBe(true)
    })
  })

  describe('getAllComponents', () => {
    it('should return all components with their sources', () => {
      registry.registerBase('View')
      registry.registerBase('Row')
      registry.registerLocal('CartItem')

      const components = registry.getAllComponents()

      expect(components).toHaveLength(3)
      expect(components).toContainEqual({ name: 'View', source: 'base' })
      expect(components).toContainEqual({ name: 'Row', source: 'base' })
      expect(components).toContainEqual({ name: 'CartItem', source: 'local' })
    })

    it('should return empty array when no components registered', () => {
      expect(registry.getAllComponents()).toEqual([])
    })
  })

  describe('getUnknownComponentError', () => {
    it('should generate error message with base components', () => {
      registry.registerBaseComponents(['View', 'Row', 'Column'])

      const error = registry.getUnknownComponentError('InvalidComponent')

      expect(error).toContain('Unknown component: <InvalidComponent>')
      expect(error).toContain('Base UI components: Column, Row, View')
    })

    it('should generate error message with local components', () => {
      registry.registerLocalComponents(['CartItem', 'TopRow'])

      const error = registry.getUnknownComponentError('InvalidComponent')

      expect(error).toContain('Local components: CartItem, TopRow')
    })

    it('should generate error message with both base and local components', () => {
      registry.registerBase('View')
      registry.registerLocal('CartItem')

      const error = registry.getUnknownComponentError('InvalidComponent')

      expect(error).toContain('Base UI components: View')
      expect(error).toContain('Local components: CartItem')
    })

    it('should indicate when no components are registered', () => {
      const error = registry.getUnknownComponentError('InvalidComponent')

      expect(error).toContain('No components are registered')
    })
  })

  describe('clear', () => {
    it('should clear all registered components', () => {
      registry.registerBase('View')
      registry.registerLocal('CartItem')

      expect(registry.isValid('View')).toBe(true)
      expect(registry.isValid('CartItem')).toBe(true)

      registry.clear()

      expect(registry.isValid('View')).toBe(false)
      expect(registry.isValid('CartItem')).toBe(false)
      expect(registry.getAllComponents()).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle duplicate registrations in base components', () => {
      registry.registerBase('View')
      registry.registerBase('View')

      expect(registry.getBaseComponents()).toEqual(['View'])
    })

    it('should handle duplicate registrations in local components', () => {
      registry.registerLocal('CartItem')
      registry.registerLocal('CartItem')

      expect(registry.getLocalComponents()).toEqual(['CartItem'])
    })

    it('should handle component registered as both base and local', () => {
      registry.registerBase('SharedComponent')
      registry.registerLocal('SharedComponent')

      // Should be valid
      expect(registry.isValid('SharedComponent')).toBe(true)

      // Should be in both lists
      expect(registry.isBase('SharedComponent')).toBe(true)
      expect(registry.isLocal('SharedComponent')).toBe(true)
    })
  })
})
