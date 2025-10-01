/**
 * Component registry for managing component definitions.
 * No filesystem dependencies, type-safe component definitions.
 */

import type { ComponentDefinition, ComponentRegistry as IComponentRegistry } from '../types.js'
import { ComponentNotFoundError, RegistrationError } from '../errors.js'

/**
 * Registry for component definitions.
 * Manages component metadata and validation rules.
 */
export class ComponentRegistry implements IComponentRegistry {
  private readonly components = new Map<string, ComponentDefinition>()

  /**
   * Register a component definition
   * @throws {RegistrationError} if component already registered
   */
  registerComponent(definition: ComponentDefinition): void {
    if (this.components.has(definition.name)) {
      throw new RegistrationError(`Component '${definition.name}' is already registered`)
    }

    // Validate definition
    this.validateDefinition(definition)
    
    this.components.set(definition.name, definition)
  }

  /**
   * Check if a component is registered
   */
  isRegistered(name: string): boolean {
    return this.components.has(name)
  }

  /**
   * Get component definition
   * @throws {ComponentNotFoundError} if component not found
   */
  getDefinition(name: string): ComponentDefinition {
    const definition = this.components.get(name)

    if (!definition) {
      throw new ComponentNotFoundError(name, {
        availableComponents: Array.from(this.components.keys()),
      })
    }

    return definition
  }

  /**
   * Get default styles for a component
   */
  getDefaultStyles(name: string): Record<string, unknown> {
    const definition = this.getDefinition(name)
    return { ...definition.defaultStyles }
  }

  /**
   * Get all registered component names
   */
  getAllComponentNames(): string[] {
    return Array.from(this.components.keys()).sort()
  }

  /**
   * Check if a component supports a specific prop
   */
  supportsProp(componentName: string, propName: string): boolean {
    const definition = this.getDefinition(componentName)
    return definition.supportedProps.includes(propName)
  }

  /**
   * Get number of registered components
   */
  size(): number {
    return this.components.size
  }

  /**
   * Clear all registered components (useful for testing)
   */
  clear(): void {
    this.components.clear()
  }

  /**
   * Register multiple components at once
   */
  registerComponents(definitions: ComponentDefinition[]): void {
    for (const definition of definitions) {
      this.registerComponent(definition)
    }
  }

  /**
   * Validate a component definition
   */
  private validateDefinition(definition: ComponentDefinition): void {
    if (!definition.name || typeof definition.name !== 'string') {
      throw new RegistrationError('Component name must be a non-empty string')
    }

    if (!definition.name.match(/^[A-Z][a-zA-Z0-9]*$/)) {
      throw new RegistrationError(
        `Component name '${definition.name}' must be PascalCase (start with uppercase letter)`
      )
    }

    if (typeof definition.childrenAllowed !== 'boolean') {
      throw new RegistrationError('childrenAllowed must be a boolean')
    }

    if (typeof definition.textChildrenAllowed !== 'boolean') {
      throw new RegistrationError('textChildrenAllowed must be a boolean')
    }

    if (!Array.isArray(definition.supportedProps)) {
      throw new RegistrationError('supportedProps must be an array')
    }

    if (typeof definition.defaultStyles !== 'object' || definition.defaultStyles === null) {
      throw new RegistrationError('defaultStyles must be an object')
    }
  }
}

/**
 * Create a registry with default UI components
 */
export function createDefaultRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry()

  // Core layout components
  registry.registerComponents([
    // View - basic container
    {
      name: 'View',
      defaultStyles: {},
      supportedProps: ['id'],
      childrenAllowed: true,
      textChildrenAllowed: false,
    },

    // Row - horizontal layout
    {
      name: 'Row',
      defaultStyles: { flexDirection: 'row' },
      supportedProps: ['id'],
      childrenAllowed: true,
      textChildrenAllowed: false,
    },

    // Column - vertical layout
    {
      name: 'Column',
      defaultStyles: { flexDirection: 'column' },
      supportedProps: ['id'],
      childrenAllowed: true,
      textChildrenAllowed: false,
    },

    // Stack - layered layout
    {
      name: 'Stack',
      defaultStyles: {},
      supportedProps: ['id'],
      childrenAllowed: true,
      textChildrenAllowed: false,
    },

    // Text - text display
    {
      name: 'Text',
      defaultStyles: {},
      supportedProps: ['text'],
      childrenAllowed: true,
      textChildrenAllowed: true,
    },

    // Image - image display
    {
      name: 'Image',
      defaultStyles: {},
      supportedProps: ['source', 'resizeMode'],
      childrenAllowed: false,
      textChildrenAllowed: false,
    },

    // Button - interactive button
    {
      name: 'Button',
      defaultStyles: {},
      supportedProps: ['title', 'image', 'titleStyle'],
      childrenAllowed: false,
      textChildrenAllowed: false,
    },

    // Touchable - touchable area
    {
      name: 'Touchable',
      defaultStyles: {},
      supportedProps: ['onPress'],
      childrenAllowed: true,
      textChildrenAllowed: false,
    },

    // ScrollView - scrollable container
    {
      name: 'ScrollView',
      defaultStyles: {},
      supportedProps: ['horizontal', 'showsScrollIndicator'],
      childrenAllowed: true,
      textChildrenAllowed: false,
    },

    // SafeArea - safe area container
    {
      name: 'SafeArea',
      defaultStyles: {},
      supportedProps: ['edges'],
      childrenAllowed: true,
      textChildrenAllowed: false,
    },

    // Spacer - flexible space
    {
      name: 'Spacer',
      defaultStyles: { flex: 1 },
      supportedProps: [],
      childrenAllowed: false,
      textChildrenAllowed: false,
    },

    // Divider - visual separator
    {
      name: 'Divider',
      defaultStyles: {},
      supportedProps: ['color', 'thickness'],
      childrenAllowed: false,
      textChildrenAllowed: false,
    },
  ])

  return registry
}

/**
 * Create an empty registry (useful for testing or custom setups)
 */
export function createEmptyRegistry(): ComponentRegistry {
  return new ComponentRegistry()
}