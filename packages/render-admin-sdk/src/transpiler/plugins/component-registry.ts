/**
 * Component Registry
 *
 * Central registry for tracking both base UI components (from ui.tsx)
 * and local scenario components (defined in scenario files).
 */

export type ComponentSource = 'base' | 'local'

export interface ComponentMetadata {
  name: string
  source: ComponentSource
}

/**
 * ComponentRegistry manages all available components for JSX transpilation.
 * It tracks both base UI components and local scenario components.
 */
export class ComponentRegistry {
  private baseComponents = new Set<string>()
  private localComponents = new Set<string>()

  /**
   * Register a base UI component from ui.tsx
   */
  registerBase(componentName: string): void {
    this.baseComponents.add(componentName)
  }

  /**
   * Register multiple base UI components
   */
  registerBaseComponents(componentNames: string[]): void {
    componentNames.forEach((name) => this.registerBase(name))
  }

  /**
   * Register a local scenario component
   */
  registerLocal(componentName: string): void {
    this.localComponents.add(componentName)
  }

  /**
   * Register multiple local scenario components
   */
  registerLocalComponents(componentNames: string[]): void {
    componentNames.forEach((name) => this.registerLocal(name))
  }

  /**
   * Check if a component is registered (either base or local)
   */
  isValid(componentName: string): boolean {
    return this.baseComponents.has(componentName) || this.localComponents.has(componentName)
  }

  /**
   * Check if a component is a base UI component
   */
  isBase(componentName: string): boolean {
    return this.baseComponents.has(componentName)
  }

  /**
   * Check if a component is a local scenario component
   */
  isLocal(componentName: string): boolean {
    return this.localComponents.has(componentName)
  }

  /**
   * Get all registered component names
   */
  getAllComponents(): ComponentMetadata[] {
    const components: ComponentMetadata[] = []

    for (const name of this.baseComponents) {
      components.push({ name, source: 'base' })
    }

    for (const name of this.localComponents) {
      components.push({ name, source: 'local' })
    }

    return components
  }

  /**
   * Get all base component names
   */
  getBaseComponents(): string[] {
    return Array.from(this.baseComponents)
  }

  /**
   * Get all local component names
   */
  getLocalComponents(): string[] {
    return Array.from(this.localComponents)
  }

  /**
   * Clear all registered components (useful for testing)
   */
  clear(): void {
    this.baseComponents.clear()
    this.localComponents.clear()
  }

  /**
   * Get formatted error message for unknown component
   */
  getUnknownComponentError(componentName: string): string {
    const base = Array.from(this.baseComponents).sort()
    const local = Array.from(this.localComponents).sort()

    let message = `Unknown component: <${componentName}>.`

    if (base.length > 0) {
      message += `\nBase UI components: ${base.join(', ')}`
    }

    if (local.length > 0) {
      message += `\nLocal components: ${local.join(', ')}`
    }

    if (base.length === 0 && local.length === 0) {
      message += '\nNo components are registered.'
    }

    return message
  }
}
