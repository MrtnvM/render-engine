/**
 * Validator class for validating JSON nodes and scenarios.
 * Provides comprehensive validation with clear violation messages.
 */

import type {
  TranspilerValidator as ITranspilerValidator,
  JsonNode,
  ComponentDefinition,
  ValidationResult,
  ValidationViolation,
  TranspiledScenario,
  ComponentRegistry,
} from '../types.js'

/**
 * Validates transpiled components and scenarios against component definitions.
 */
export class TranspilerValidator implements ITranspilerValidator {
  constructor(private readonly registry?: ComponentRegistry) {}

  /**
   * Validate a JSON node against its component definition
   */
  validateJsonNode(node: JsonNode, definition: ComponentDefinition): ValidationResult {
    const violations: ValidationViolation[] = []

    // Validate basic structure
    this.validateNodeStructure(node, violations)

    // Validate component type
    this.validateComponentType(node, definition, violations)

    // Validate props against definition
    this.validateProps(node, definition, violations)

    // Validate children
    this.validateChildren(node, definition, violations)

    // Validate style properties
    this.validateStyle(node, violations)

    return {
      valid: violations.length === 0,
      violations,
    }
  }

  /**
   * Validate a complete transpiled scenario
   */
  validateScenario(scenario: TranspiledScenario): ValidationResult {
    const violations: ValidationViolation[] = []

    // Validate scenario structure
    this.validateScenarioStructure(scenario, violations)

    // Validate main component
    if (scenario.main) {
      const mainResult = this.validateJsonNodeWithRegistry(scenario.main, 'main')
      violations.push(...mainResult.violations)
    }

    // Validate named components
    this.validateNamedComponents(scenario.components, violations)

    return {
      valid: violations.length === 0,
      violations,
    }
  }

  /**
   * Validate JSON node structure
   */
  private validateNodeStructure(node: JsonNode, violations: ValidationViolation[]): void {
    if (!node) {
      violations.push({
        field: 'node',
        message: 'Node is required',
        severity: 'error',
      })
      return
    }

    if (!node.type || typeof node.type !== 'string') {
      violations.push({
        field: 'type',
        message: 'Node type is required and must be a string',
        severity: 'error',
      })
    }

    // Validate optional properties have correct types
    if (node.style && (typeof node.style !== 'object' || Array.isArray(node.style))) {
      violations.push({
        field: 'style',
        message: 'Style must be an object',
        severity: 'error',
      })
    }

    if (node.properties && (typeof node.properties !== 'object' || Array.isArray(node.properties))) {
      violations.push({
        field: 'properties',
        message: 'Properties must be an object',
        severity: 'error',
      })
    }

    if (node.data && (typeof node.data !== 'object' || Array.isArray(node.data))) {
      violations.push({
        field: 'data',
        message: 'Data must be an object',
        severity: 'error',
      })
    }

    if (node.children && !Array.isArray(node.children)) {
      violations.push({
        field: 'children',
        message: 'Children must be an array',
        severity: 'error',
      })
    }
  }

  /**
   * Validate component type
   */
  private validateComponentType(node: JsonNode, definition: ComponentDefinition, violations: ValidationViolation[]): void {
    if (node.type !== definition.name) {
      violations.push({
        field: 'type',
        message: `Component type mismatch: expected '${definition.name}', got '${node.type}'`,
        severity: 'error',
      })
    }
  }

  /**
   * Validate props against component definition
   */
  private validateProps(node: JsonNode, definition: ComponentDefinition, violations: ValidationViolation[]): void {
    if (!node.data) {
      return
    }

    for (const propName of Object.keys(node.data)) {
      if (!definition.supportedProps.includes(propName)) {
        violations.push({
          field: `data.${propName}`,
          message: `Unsupported prop '${propName}' for component '${definition.name}'`,
          severity: 'warning',
        })
      }

      // Validate prop value types
      const propValue = node.data[propName]
      this.validatePropValue(propName, propValue, violations)
    }

    // Check for required props (this would need to be extended in ComponentDefinition)
    this.validateRequiredProps(node, definition, violations)
  }

  /**
   * Validate children
   */
  private validateChildren(node: JsonNode, definition: ComponentDefinition, violations: ValidationViolation[]): void {
    if (node.children && node.children.length > 0) {
      if (!definition.childrenAllowed) {
        violations.push({
          field: 'children',
          message: `Component '${definition.name}' does not allow children`,
          severity: 'error',
        })
      } else {
        // Recursively validate child nodes
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i]
          const childResult = this.validateJsonNodeWithRegistry(child, `children[${i}]`)
          violations.push(...childResult.violations)

          // Check for text children
          if (child.type === 'TextContent' && !definition.textChildrenAllowed) {
            violations.push({
              field: `children[${i}]`,
              message: `Component '${definition.name}' does not allow text children`,
              severity: 'error',
            })
          }
        }
      }
    }
  }

  /**
   * Validate style properties
   */
  private validateStyle(node: JsonNode, violations: ValidationViolation[]): void {
    if (!node.style) {
      return
    }

    for (const [styleProp, styleValue] of Object.entries(node.style)) {
      // Basic style validation
      if (styleValue === undefined) {
        violations.push({
          field: `style.${styleProp}`,
          message: `Style property '${styleProp}' has undefined value`,
          severity: 'warning',
        })
      }

      // Validate specific style properties
      this.validateStyleProperty(styleProp, styleValue, violations)
    }
  }

  /**
   * Validate specific style property
   */
  private validateStyleProperty(prop: string, value: unknown, violations: ValidationViolation[]): void {
    // Validate flex direction
    if (prop === 'flexDirection' && typeof value === 'string') {
      const validValues = ['row', 'column', 'row-reverse', 'column-reverse']
      if (!validValues.includes(value)) {
        violations.push({
          field: `style.${prop}`,
          message: `Invalid flexDirection value: '${value}'. Valid values: ${validValues.join(', ')}`,
          severity: 'error',
        })
      }
    }

    // Validate numeric properties
    const numericProps = ['width', 'height', 'flex', 'padding', 'margin', 'fontSize']
    if (numericProps.includes(prop) && typeof value !== 'number') {
      violations.push({
        field: `style.${prop}`,
        message: `Style property '${prop}' must be a number`,
        severity: 'error',
      })
    }

    // Validate color properties
    const colorProps = ['color', 'backgroundColor', 'borderColor']
    if (colorProps.includes(prop) && typeof value === 'string') {
      if (!this.isValidColor(value)) {
        violations.push({
          field: `style.${prop}`,
          message: `Invalid color value: '${value}'`,
          severity: 'warning',
        })
      }
    }
  }

  /**
   * Validate prop value type and format
   */
  private validatePropValue(propName: string, value: unknown, violations: ValidationViolation[]): void {
    // Handle prop references
    if (typeof value === 'object' && value !== null && (value as any).type === 'prop') {
      const propRef = value as { type: 'prop'; key: string }
      if (!propRef.key || typeof propRef.key !== 'string') {
        violations.push({
          field: `data.${propName}`,
          message: 'Prop reference must have a valid key',
          severity: 'error',
        })
      }
      return
    }

    // Validate specific prop types based on prop name
    if (propName === 'source' && typeof value !== 'string' && typeof value !== 'object') {
      violations.push({
        field: `data.${propName}`,
        message: 'Image source must be a string or object',
        severity: 'error',
      })
    }

    if (propName === 'title' && typeof value !== 'string' && typeof value !== 'object') {
      violations.push({
        field: `data.${propName}`,
        message: 'Button title must be a string or prop reference',
        severity: 'error',
      })
    }
  }

  /**
   * Validate required props (extensible in the future)
   */
  private validateRequiredProps(node: JsonNode, definition: ComponentDefinition, violations: ValidationViolation[]): void {
    // Example: Button component requires title
    if (definition.name === 'Button') {
      if (!node.data?.title && !node.properties?.title) {
        violations.push({
          field: 'data.title',
          message: 'Button component requires a title prop',
          severity: 'error',
        })
      }
    }

    // Example: Image component requires source
    if (definition.name === 'Image') {
      if (!node.data?.source && !node.properties?.source) {
        violations.push({
          field: 'data.source',
          message: 'Image component requires a source prop',
          severity: 'error',
        })
      }
    }
  }

  /**
   * Validate JSON node using registry
   */
  private validateJsonNodeWithRegistry(node: JsonNode, fieldPrefix: string): ValidationResult {
    if (!this.registry) {
      return { valid: true, violations: [] }
    }

    if (!this.registry.isRegistered(node.type)) {
      return {
        valid: false,
        violations: [{
          field: fieldPrefix,
          message: `Unknown component type: '${node.type}'`,
          severity: 'error',
        }],
      }
    }

    const definition = this.registry.getDefinition(node.type)
    const result = this.validateJsonNode(node, definition)
    
    // Add field prefix to all violations
    return {
      valid: result.valid,
      violations: result.violations.map(v => ({
        ...v,
        field: fieldPrefix ? `${fieldPrefix}.${v.field}` : v.field,
      })),
    }
  }

  /**
   * Validate scenario structure
   */
  private validateScenarioStructure(scenario: TranspiledScenario, violations: ValidationViolation[]): void {
    if (!scenario.key || typeof scenario.key !== 'string') {
      violations.push({
        field: 'key',
        message: 'Scenario key is required and must be a string',
        severity: 'error',
      })
    }

    if (!scenario.version || typeof scenario.version !== 'string') {
      violations.push({
        field: 'version',
        message: 'Scenario version is required and must be a string',
        severity: 'error',
      })
    }

    if (!scenario.main) {
      violations.push({
        field: 'main',
        message: 'Main component is required',
        severity: 'error',
      })
    }

    if (!scenario.components || typeof scenario.components !== 'object' || Array.isArray(scenario.components)) {
      violations.push({
        field: 'components',
        message: 'Components must be an object',
        severity: 'error',
      })
    }
  }

  /**
   * Validate named components
   */
  private validateNamedComponents(components: Record<string, JsonNode>, violations: ValidationViolation[]): void {
    if (!components) {
      return
    }

    for (const [componentName, componentNode] of Object.entries(components)) {
      if (!componentName || typeof componentName !== 'string') {
        violations.push({
          field: `components.${componentName}`,
          message: 'Component name must be a non-empty string',
          severity: 'error',
        })
        continue
      }

      const componentResult = this.validateJsonNodeWithRegistry(componentNode, `components.${componentName}`)
      violations.push(...componentResult.violations)
    }
  }

  /**
   * Basic color validation (can be extended)
   */
  private isValidColor(color: string): boolean {
    // Basic validation for common color formats
    const colorPatterns = [
      /^#[0-9A-Fa-f]{3}$/, // #rgb
      /^#[0-9A-Fa-f]{6}$/, // #rrggbb
      /^#[0-9A-Fa-f]{8}$/, // #rrggbbaa
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // rgb(r, g, b)
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-1]?\.?\d+\s*\)$/, // rgba(r, g, b, a)
    ]

    const namedColors = [
      'transparent', 'white', 'black', 'red', 'green', 'blue',
      'yellow', 'orange', 'purple', 'pink', 'gray', 'grey'
    ]

    return colorPatterns.some(pattern => pattern.test(color)) || namedColors.includes(color.toLowerCase())
  }
}

/**
 * Create a validator with component registry
 */
export function createValidator(registry?: ComponentRegistry): TranspilerValidator {
  return new TranspilerValidator(registry)
}