import { Entity } from '../../../kernel/entities/base.entity.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'
import {
  SchemaProps,
  SchemaJSON,
  SemanticVersion,
  SchemaMetadata,
  CompatibilityResult,
  SchemaChange,
  Component,
  PropertyType as PropertyInterface,
  SchemaValidationRuleInterface as SchemaValidationRuleInterfaceType,
} from '../../shared/types/schema-types.js'
import { SchemaStatus } from '../../shared/enums/schema-status.enum.js'
import { SchemaValidationError } from '../../schema-validation/value-objects/validation-result.vo.js'
import { v4 as uuidv4 } from 'uuid'

export class Schema extends Entity<ID> {
  private readonly _props: SchemaProps

  private constructor(id: ID, props: SchemaProps) {
    super(id)
    this._props = props
  }

  get name(): string {
    return this._props.name
  }

  get version(): SemanticVersion {
    return this._props.version
  }

  get description(): string | null {
    return this._props.description || null
  }

  get components(): Component[] {
    return this._props.components
  }

  get globalProperties(): PropertyInterface[] {
    return this._props.globalProperties || []
  }

  get validationRules(): SchemaValidationRuleInterfaceType[] {
    return this._props.validationRules || []
  }

  get componentCount(): number {
    return this.components.length
  }

  get metadata(): SchemaMetadata {
    return this._props.metadata
  }

  isValid(): boolean {
    return this.validate().isValid
  }

  get lastModified(): Date {
    return this.metadata.updatedAt
  }

  get status(): SchemaStatus {
    // Simple status determination based on metadata and validation
    if (this.metadata.tags?.includes('deprecated')) {
      return SchemaStatus.DEPRECATED
    }
    if (this.metadata.tags?.includes('published')) {
      return SchemaStatus.PUBLISHED
    }
    return SchemaStatus.DRAFT
  }

  public addComponent(component: Component): void {
    if (this.status === SchemaStatus.PUBLISHED) {
      throw new Error('Cannot add components to published schemas. Create a new version instead.')
    }

    // Check for component name conflicts
    if (this.components.some((c) => c.name === component.name)) {
      throw new Error(`Component with name '${component.name}' already exists in schema`)
    }

    this._props.components.push(component)
    this.updateMetadata()
  }

  public removeComponent(componentId: string): void {
    if (this.status === SchemaStatus.PUBLISHED) {
      throw new Error('Cannot remove components from published schemas. Create a new version instead.')
    }

    const componentIndex = this.components.findIndex((c) => c.id.value === componentId)
    if (componentIndex === -1) {
      throw new Error(`Component with ID '${componentId}' not found in schema`)
    }

    // Check if component is referenced by other components
    if (this.isComponentReferenced(componentId)) {
      throw new Error(`Cannot remove component '${componentId}' as it is referenced by other components`)
    }

    this._props.components.splice(componentIndex, 1)
    this.updateMetadata()
  }

  public updateComponent(componentId: string, updates: Partial<Component>): void {
    if (this.status === SchemaStatus.PUBLISHED) {
      throw new Error('Cannot update components in published schemas. Create a new version instead.')
    }

    const componentIndex = this.components.findIndex((c) => c.id.value === componentId)
    if (componentIndex === -1) {
      throw new Error(`Component with ID '${componentId}' not found in schema`)
    }

    // Apply updates (this is a simplified version - in practice you'd need more sophisticated merging)
    Object.assign(this._props.components[componentIndex], updates)
    this.updateMetadata()
  }

  public addComponentHierarchy(parentId: string, childId: string): void {
    const parent = this.findComponent(parentId)
    const child = this.findComponent(childId)

    if (!parent || !child) {
      throw new Error('Parent or child component not found')
    }

    // Check for circular dependencies
    if (this.wouldCreateCircularDependency(parentId, childId)) {
      throw new Error('Cannot create circular component dependencies')
    }

    // Add child to parent (this would be implemented in the Component class)
    // For now, we'll just validate the relationship
    this.validateComponentRelationship(parent, child)
    this.updateMetadata()
  }

  public validate(): any {
    const errors: SchemaValidationError[] = []
    const warnings: any[] = []
    const info: any[] = []

    // Validate schema structure
    this.validateSchemaStructure(errors, warnings, info)

    // Validate all components
    this.validateComponents(errors, warnings, info)

    // Validate global properties
    this.validateGlobalProperties(errors, warnings, info)

    // Validate component relationships
    this.validateComponentRelationships(errors, warnings, info)

    // Check for circular dependencies
    this.validateNoCircularDependencies(errors, warnings, info)

    const isValid = errors.length === 0

    // Create a simple validation result for now
    // In a complete implementation, we would use the proper factory methods
    return {
      isValid,
      errors,
      warnings,
      info,
      metadata: {
        timestamp: new Date(),
        validator: 'Schema',
        version: '1.0.0',
      },
    } as any
  }

  public validateBackwardCompatibility(previousVersion: Schema): CompatibilityResult {
    const issues: string[] = []
    const breakingChanges: string[] = []

    // Check for removed components
    const currentComponentNames = new Set(this.components.map((c) => c.name))
    const previousComponentNames = new Set(previousVersion.components.map((c) => c.name))

    previousComponentNames.forEach((name) => {
      if (!currentComponentNames.has(name)) {
        breakingChanges.push(`Removed component: ${name}`)
      }
    })

    // Check for breaking property changes
    this.validatePropertyCompatibility(previousVersion, breakingChanges, issues)

    // Check version increment
    if (!this.isValidVersionIncrement(previousVersion.version)) {
      issues.push('Version should be incremented based on changes')
      if (breakingChanges.length > 0 && this.version.major <= previousVersion.version.major) {
        breakingChanges.push('Major version should be incremented for breaking changes')
      }
    }

    return {
      isCompatible: breakingChanges.length === 0,
      issues,
      breakingChanges,
    }
  }

  public createNewVersion(newVersion: SemanticVersion, changes: SchemaChange[]): Schema {
    if (!this.isValidVersionIncrement(newVersion)) {
      throw new Error('New version must be greater than current version')
    }

    // Apply changes to create new schema
    const newComponents = [...this.components]
    const newGlobalProperties = [...this.globalProperties]
    const newValidationRules = [...this.validationRules]

    // Apply changes (simplified - in practice you'd have more sophisticated change application)
    changes.forEach((change) => {
      this.applyChange(change, newComponents, newGlobalProperties, newValidationRules)
    })

    const newMetadata: SchemaMetadata = {
      ...this.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [...(this.metadata.tags || []), 'new-version'],
    }

    const id = ID.create()
    const schemaProps: SchemaProps = {
      name: this.name,
      version: newVersion,
      description: this.description || '',
      components: newComponents,
      globalProperties: newGlobalProperties,
      validationRules: newValidationRules,
      metadata: newMetadata,
    }

    return new Schema(id, schemaProps)
  }

  public publish(): void {
    const validation = this.validate()
    if (!validation.isValid) {
      throw new Error('Cannot publish invalid schema. Fix all errors first.')
    }

    if (this.components.length === 0) {
      throw new Error('Cannot publish schema with no components.')
    }

    this.metadata.tags = [...(this.metadata.tags || []), 'published']
    this.updateMetadata()
  }

  public deprecate(): void {
    if (this.status === SchemaStatus.DEPRECATED) {
      throw new Error('Schema is already deprecated.')
    }

    this.metadata.tags = [...(this.metadata.tags || []), 'deprecated']
    this.updateMetadata()
  }

  public findComponent(name: string): Component | null {
    return this.components.find((c) => c.name === name) || null
  }

  public findComponentById(id: string): Component | null {
    return this.components.find((c) => c.id.value === id) || null
  }

  public getComponentsByType(type: string): Component[] {
    return this.components.filter((c) => {
      // This would check component type - simplified for now
      return true // In practice, you'd check c.type === type
    })
  }

  public getComponentHierarchy(componentId: string): Component[] {
    const component = this.findComponentById(componentId)
    if (!component) {
      return []
    }

    // Simplified hierarchy traversal
    return [component] // In practice, you'd build the complete hierarchy
  }

  public toJSON(): SchemaJSON {
    return {
      id: this.id.toPrimitive(),
      name: this.name,
      version: `${this.version.major}.${this.version.minor}.${this.version.patch}`,
      description: this.description || '',
      components: this.components.map((c) => c.toJSON()),
      globalProperties: this.globalProperties.map((p) => p.toJSON()),
      validationRules: this.validationRules.map((r) => r.toJSON()),
      metadata: {
        ...this.metadata,
        createdAt: this.metadata.createdAt.toISOString(),
        updatedAt: this.metadata.updatedAt.toISOString(),
      },
      status: this.status,
    }
  }

  private validateSchemaStructure(errors: any[], warnings: any[], info: any[]): void {
    // Validate name
    if (this.name.length < 3 || this.name.length > 100) {
      errors.push({
        id: uuidv4(),
        code: 'INVALID_SCHEMA_NAME',
        message: 'Schema name must be between 3 and 100 characters',
        severity: 'error' as const,
        timestamp: new Date(),
      })
    }

    // Validate components
    if (this.components.length === 0) {
      errors.push({
        id: uuidv4(),
        code: 'EMPTY_SCHEMA',
        message: 'Schema must have at least one component',
        severity: 'error' as const,
        timestamp: new Date(),
      })
    }

    // Validate component name uniqueness
    const componentNames = new Set<string>()
    this.components.forEach((component) => {
      if (componentNames.has(component.name)) {
        errors.push({
          id: uuidv4(),
          code: 'DUPLICATE_COMPONENT_NAME',
          message: `Duplicate component name: ${component.name}`,
          severity: 'error' as const,
          timestamp: new Date(),
        })
      }
      componentNames.add(component.name)
    })
  }

  private validateComponents(errors: any[], warnings: any[], info: any[]): void {
    // Validate each component
    this.components.forEach((component) => {
      // This would delegate to component validation
      // For now, just basic checks
      if (!component.name || component.name.trim() === '') {
        errors.push({
          id: uuidv4(),
          code: 'INVALID_COMPONENT_NAME',
          message: 'Component name cannot be empty',
          severity: 'error' as const,
          timestamp: new Date(),
        })
      }
    })
  }

  private validateGlobalProperties(errors: any[], warnings: any[], info: any[]): void {
    // Validate global properties
    const propertyNames = new Set<string>()
    this.globalProperties.forEach((property) => {
      if (propertyNames.has(property.name)) {
        errors.push({
          id: uuidv4(),
          code: 'DUPLICATE_PROPERTY_NAME',
          message: `Duplicate global property name: ${property.name}`,
          severity: 'error' as const,
          timestamp: new Date(),
        })
      }
      propertyNames.add(property.name)
    })
  }

  private validateComponentRelationships(errors: any[], warnings: any[], info: any[]): void {
    // Validate component relationships
    // This would check parent-child relationships, references, etc.
  }

  private validateNoCircularDependencies(errors: any[], warnings: any[], info: any[]): void {
    // Check for circular dependencies
    // This would require graph traversal algorithms
  }

  private validatePropertyCompatibility(previousVersion: Schema, breakingChanges: string[], issues: string[]): void {
    // Check for breaking property changes
    // This would compare property types, required status, etc.
  }

  private isValidVersionIncrement(newVersion: SemanticVersion): boolean {
    const current = this.version

    if (newVersion.major > current.major) return true
    if (newVersion.major < current.major) return false

    if (newVersion.minor > current.minor) return true
    if (newVersion.minor < current.minor) return false

    return newVersion.patch > current.patch
  }

  private isComponentReferenced(componentId: string): boolean {
    // Check if any components reference this component
    // This would require analyzing component relationships
    return false // Simplified for now
  }

  private wouldCreateCircularDependency(parentId: string, childId: string): boolean {
    // Check if adding this relationship would create a cycle
    // This would require graph traversal
    return false // Simplified for now
  }

  private validateComponentRelationship(parent: Component, child: Component): void {
    // Validate that parent-child relationship is valid
    // This would check component types, constraints, etc.
  }

  private applyChange(
    change: SchemaChange,
    components: Component[],
    globalProperties: PropertyInterface[],
    validationRules: any[],
  ): void {
    // Apply the change to the appropriate arrays
    // This is a simplified implementation
    switch (change.target) {
      case 'component':
        this.applyComponentChange(change, components)
        break
      case 'property':
        this.applyPropertyChange(change, globalProperties)
        break
      case 'validation':
        this.applyValidationChange(change, validationRules)
        break
    }
  }

  private applyComponentChange(change: SchemaChange, components: Component[]): void {
    // Apply component-specific changes
    // This would handle add, remove, update, rename operations
  }

  private applyPropertyChange(change: SchemaChange, properties: PropertyInterface[]): void {
    // Apply property-specific changes
  }

  private applyValidationChange(change: SchemaChange, rules: any[]): void {
    // Apply validation rule changes
  }

  private updateMetadata(): void {
    this._props.metadata.updatedAt = new Date()
  }

  public static create(props: SchemaProps): Schema {
    const id = ID.create()
    const metadata: SchemaMetadata = {
      ...props.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const schemaProps: SchemaProps = {
      ...props,
      metadata,
    }

    return new Schema(id, schemaProps)
  }

  public static fromJSON(json: SchemaJSON): Schema {
    // Parse version
    const versionParts = json.version.split('.').map(Number)
    const version: SemanticVersion = {
      major: versionParts[0] || 0,
      minor: versionParts[1] || 0,
      patch: versionParts[2] || 0,
    }

    // Parse metadata dates
    const metadata: SchemaMetadata = {
      ...json.metadata,
      createdAt: new Date(json.metadata.createdAt),
      updatedAt: new Date(json.metadata.updatedAt),
    }

    const id = ID.create(json.id)
    const schemaProps: SchemaProps = {
      name: json.name,
      version,
      description: json.description,
      components: json.components, // In practice, you'd deserialize these properly
      globalProperties: json.globalProperties || [],
      validationRules: json.validationRules || [],
      metadata,
    }

    return new Schema(id, schemaProps)
  }

  public static duplicate(original: Schema, newName: string, newVersion: SemanticVersion): Schema {
    const id = ID.create()
    const schemaProps: SchemaProps = {
      name: newName,
      version: newVersion,
      description: original.description || undefined,
      components: [...original.components],
      globalProperties: [...original.globalProperties],
      validationRules: [...original.validationRules],
      metadata: {
        ...original.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [...(original.metadata.tags || []), 'duplicate'],
      },
    }

    return new Schema(id, schemaProps)
  }

  // Required abstract method implementations
  public toPrimitive(): object {
    return {
      id: this.id.toPrimitive(),
      name: this.name,
      version: `${this.version.major}.${this.version.minor}.${this.version.patch}`,
      description: this.description,
      components: this.components.map((c) => c.toJSON()),
      metadata: this.metadata,
      status: this.status,
    }
  }

  public getBusinessRules(): string[] {
    return [
      'Schema name must be between 3 and 100 characters',
      'Schema must have at least one component',
      'Component names must be unique within a schema',
      'Published schemas cannot be modified',
      'Schema versions must be incremented for changes',
    ]
  }

  public validateInvariants(): void {
    const validation = this.validate()

    if (!validation.isValid) {
      throw new Error(`Schema validation failed: ${validation.errors.map((e: any) => e.message).join(', ')}`)
    }

    // Check specific invariants
    if (this.name.length < 3 || this.name.length > 100) {
      throw new Error('Schema name must be between 3 and 100 characters')
    }

    if (this.components.length === 0) {
      throw new Error('Schema must have at least one component')
    }

    const componentNames = new Set(this.components.map((c) => c.name))
    if (componentNames.size !== this.components.length) {
      throw new Error('Component names must be unique within a schema')
    }
  }
}
