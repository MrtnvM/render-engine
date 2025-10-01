/**
 * ScenarioAssembler class for building the final transpiled scenario.
 * Validates components, finds main component, and assembles the result.
 */

import type {
  ScenarioAssembler as IScenarioAssembler,
  AssemblyInput,
  TranspiledScenario,
  ComponentMetadata,
  JsonNode,
} from '../types.js'
import { AssemblyError, ValidationError } from '../errors.js'
import { generateComponentKey } from '../ast/ast-utils.js'

/**
 * Assembles the final transpiled scenario from component metadata.
 * Handles validation, component organization, and key generation.
 */
export class ScenarioAssembler implements IScenarioAssembler {
  /**
   * Assemble the final transpiled scenario
   * @throws {AssemblyError} if assembly fails
   * @throws {ValidationError} if validation fails
   */
  assemble(input: AssemblyInput): TranspiledScenario {
    // Validate input
    this.validateInput(input)

    // Validate components
    this.validateComponents(input.components)

    // Find main component (default export)
    const mainComponent = this.findMainComponent(input.components)
    if (!mainComponent) {
      throw new AssemblyError('No default export found', {
        availableComponents: input.components.map(c => `${c.name} (${c.exportType})`),
      })
    }

    // Extract named components
    const namedComponents = this.extractNamedComponents(input.components)

    // Generate or use provided key
    const key = input.key || this.generateKey()

    // Validate final scenario key
    this.validateScenarioKey(key)

    return {
      key,
      version: input.metadata.version,
      main: mainComponent.jsonNode,
      components: namedComponents,
    }
  }

  /**
   * Validate assembly input
   */
  private validateInput(input: AssemblyInput): void {
    if (!input) {
      throw new AssemblyError('Assembly input is required')
    }

    if (!input.metadata) {
      throw new AssemblyError('Metadata is required')
    }

    if (!input.metadata.version) {
      throw new AssemblyError('Version is required in metadata')
    }

    if (!Array.isArray(input.components)) {
      throw new AssemblyError('Components must be an array')
    }

    if (input.components.length === 0) {
      throw new AssemblyError('At least one component is required')
    }
  }

  /**
   * Validate component metadata array
   */
  private validateComponents(components: readonly ComponentMetadata[]): void {
    const violations: string[] = []
    const componentNames = new Set<string>()
    let hasDefaultExport = false

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const prefix = `Component[${i}]`

      // Check required fields
      if (!component.name) {
        violations.push(`${prefix}: name is required`)
      } else {
        // Check for duplicate names
        if (componentNames.has(component.name)) {
          violations.push(`${prefix}: duplicate component name '${component.name}'`)
        } else {
          componentNames.add(component.name)
        }
      }

      if (!component.exportType) {
        violations.push(`${prefix}: exportType is required`)
      } else if (!['default', 'named', 'helper'].includes(component.exportType)) {
        violations.push(`${prefix}: exportType must be 'default', 'named', or 'helper'`)
      }

      if (component.exportType === 'default') {
        if (hasDefaultExport) {
          violations.push(`${prefix}: multiple default exports found`)
        }
        hasDefaultExport = true
      }

      if (!component.jsonNode) {
        violations.push(`${prefix}: jsonNode is required`)
      } else {
        this.validateJsonNode(component.jsonNode, prefix)
      }
    }

    if (violations.length > 0) {
      throw new ValidationError('Component validation failed', violations.map(msg => ({
        field: 'components',
        message: msg,
        severity: 'error' as const,
      })))
    }
  }

  /**
   * Validate JSON node structure
   */
  private validateJsonNode(node: JsonNode, prefix: string): void {
    if (!node.type) {
      throw new AssemblyError(`${prefix}: JSON node must have a type`)
    }

    if (typeof node.type !== 'string') {
      throw new AssemblyError(`${prefix}: JSON node type must be a string`)
    }

    // Validate optional properties
    if (node.style && (typeof node.style !== 'object' || Array.isArray(node.style))) {
      throw new AssemblyError(`${prefix}: style must be an object`)
    }

    if (node.properties && (typeof node.properties !== 'object' || Array.isArray(node.properties))) {
      throw new AssemblyError(`${prefix}: properties must be an object`)
    }

    if (node.data && (typeof node.data !== 'object' || Array.isArray(node.data))) {
      throw new AssemblyError(`${prefix}: data must be an object`)
    }

    if (node.children) {
      if (!Array.isArray(node.children)) {
        throw new AssemblyError(`${prefix}: children must be an array`)
      }

      // Recursively validate children
      for (let i = 0; i < node.children.length; i++) {
        this.validateJsonNode(node.children[i], `${prefix}.children[${i}]`)
      }
    }
  }

  /**
   * Find the main component (default export)
   */
  private findMainComponent(components: readonly ComponentMetadata[]): ComponentMetadata | null {
    return components.find(c => c.exportType === 'default') || null
  }

  /**
   * Extract named components into a record
   */
  private extractNamedComponents(components: readonly ComponentMetadata[]): Record<string, JsonNode> {
    const namedComponents: Record<string, JsonNode> = {}

    for (const component of components) {
      if (component.exportType === 'named' || component.exportType === 'helper') {
        namedComponents[component.name] = component.jsonNode
      }
    }

    return namedComponents
  }

  /**
   * Generate a scenario key
   */
  private generateKey(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `scenario-${timestamp}-${random}`
  }

  /**
   * Validate scenario key format
   */
  private validateScenarioKey(key: string): void {
    if (!key || typeof key !== 'string') {
      throw new AssemblyError('Scenario key must be a non-empty string')
    }

    if (key.length < 1 || key.length > 100) {
      throw new AssemblyError('Scenario key must be between 1 and 100 characters')
    }

    // Allow alphanumeric characters, hyphens, and underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      throw new AssemblyError('Scenario key can only contain letters, numbers, hyphens, and underscores')
    }
  }

  /**
   * Get assembly statistics
   */
  getAssemblyStats(input: AssemblyInput): {
    totalComponents: number
    defaultExports: number
    namedExports: number
    helperFunctions: number
    hasScenarioKey: boolean
  } {
    const stats = {
      totalComponents: input.components.length,
      defaultExports: 0,
      namedExports: 0,
      helperFunctions: 0,
      hasScenarioKey: Boolean(input.key),
    }

    for (const component of input.components) {
      switch (component.exportType) {
        case 'default':
          stats.defaultExports++
          break
        case 'named':
          stats.namedExports++
          break
        case 'helper':
          stats.helperFunctions++
          break
      }
    }

    return stats
  }
}

/**
 * Create a default scenario assembler
 */
export function createScenarioAssembler(): ScenarioAssembler {
  return new ScenarioAssembler()
}