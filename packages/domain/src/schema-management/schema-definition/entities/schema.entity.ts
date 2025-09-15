import { Entity } from '../../../kernel/entities/base.entity.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { Name, Description } from '../../schema-definition/value-objects/index.js'
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
  SchemaValidationRuleInterface,
} from '../../shared/types/schema-types.js'
import { SchemaStatus } from '../../shared/enums/schema-status.enum.js'
import {
  SchemaValidationError,
  SchemaValidationInfo,
  SchemaValidationResult,
  SchemaValidationWarning,
} from '../../schema-validation/value-objects/validation-result.vo.js'
import { SchemaValidationSeverity } from 'src/schema-management/shared/enums/validation-severity.enum.js'
import { ComponentType } from 'src/schema-management/shared/enums/component-type.enum.js'

export class Schema extends Entity<ID> {
  private readonly _props: SchemaProps
  private readonly _name: Name
  private readonly _description: Description

  private constructor(props: SchemaProps) {
    super(props.id || ID.generate())
    this._props = props
    this._name = Name.create(props.name)
    this._description = Description.create(props.description)
  }

  get name(): string {
    return this._name.value
  }

  get version(): SemanticVersion {
    return this._props.version
  }

  get description(): string {
    return this._description.value
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

    this._props.components.push(component)
    this.updateMetadata()
  }

  public removeComponent(componentId: ID): void {
    if (this.status === SchemaStatus.PUBLISHED) {
      throw new Error('Cannot remove components from published schemas. Create a new version instead.')
    }

    const componentIndex = this.components.findIndex((c) => c.id.equals(componentId))
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

  public updateComponent(componentId: ID, updates: Partial<Component>): void {
    if (this.status === SchemaStatus.PUBLISHED) {
      throw new Error('Cannot update components in published schemas. Create a new version instead.')
    }

    const componentIndex = this.components.findIndex((c) => c.id.equals(componentId))
    if (componentIndex === -1) {
      throw new Error(`Component with ID '${componentId}' not found in schema`)
    }

    // Apply updates (this is a simplified version - in practice you'd need more sophisticated merging)
    Object.assign(this._props.components[componentIndex], updates)
    this.updateMetadata()
  }

  public addComponentHierarchy(parentId: ID, childId: ID): void {
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

  public validate(): SchemaValidationResult {
    const errors: SchemaValidationError[] = []
    const warnings: SchemaValidationWarning[] = []
    const info: SchemaValidationInfo[] = []

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

    if (isValid) {
      return SchemaValidationResult.success({
        isValid,
        warnings,
        info,
        timestamp: new Date(),
        metadata: {
          validator: 'Schema',
        },
      })
    }

    return SchemaValidationResult.failure(errors, {
      isValid,
      warnings,
      info,
      timestamp: new Date(),
      validator: 'Schema',
    })
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

    const schemaProps: SchemaProps = {
      name: this.name,
      version: newVersion,
      description: this.description,
      components: newComponents,
      globalProperties: newGlobalProperties,
      validationRules: newValidationRules,
      metadata: newMetadata,
    }

    return new Schema(schemaProps)
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

  public findComponent(id: ID): Component | null {
    return this.components.find((c) => c.id.equals(id)) || null
  }

  public findComponentById(id: ID): Component | null {
    return this.components.find((c) => c.id.equals(id)) || null
  }

  public getComponentsByType(type: ComponentType): Component[] {
    return this.components.filter((c) => {
      return c.type === type
    })
  }

  public getComponentHierarchy(componentId: ID): Component[] {
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
      description: this.description,
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

  private validateSchemaStructure(
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[],
    info: SchemaValidationInfo[],
  ): void {
    // Validate components
    if (this.components.length === 0) {
      errors.push({
        id: ID.create().toPrimitive(),
        code: 'EMPTY_SCHEMA',
        message: 'Schema must have at least one component',
        severity: SchemaValidationSeverity.ERROR,
        timestamp: new Date(),
      })
    }
  }

  private validateComponents(
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[],
    info: SchemaValidationInfo[],
  ): void {
    // Validate each component
    this.components.forEach((component) => {
      // This would delegate to component validation
      // For now, just basic checks
      if (!component.name || component.name.trim() === '') {
        errors.push({
          id: ID.create().toPrimitive(),
          code: 'INVALID_COMPONENT_NAME',
          message: 'Component name cannot be empty',
          severity: SchemaValidationSeverity.ERROR,
          timestamp: new Date(),
        })
      }
    })
  }

  private validateGlobalProperties(
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[],
    info: SchemaValidationInfo[],
  ): void {
    // Validate global properties
    const propertyNames = new Set<string>()
    this.globalProperties.forEach((property) => {
      if (propertyNames.has(property.name)) {
        errors.push({
          id: ID.create().toPrimitive(),
          code: 'DUPLICATE_PROPERTY_NAME',
          message: `Duplicate global property name: ${property.name}`,
          severity: SchemaValidationSeverity.ERROR,
          timestamp: new Date(),
        })
      }
      propertyNames.add(property.name)
    })
  }

  private validateComponentRelationships(
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[],
    info: SchemaValidationInfo[],
  ): void {
    // Validate component relationships
    // This would check parent-child relationships, references, etc.
  }

  private validateNoCircularDependencies(
    errors: SchemaValidationError[],
    warnings: SchemaValidationWarning[],
    info: SchemaValidationInfo[],
  ): void {
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

  private isComponentReferenced(componentId: ID): boolean {
    // Check if any components reference this component
    // This would require analyzing component relationships
    return false // Simplified for now
  }

  private wouldCreateCircularDependency(parentId: ID, childId: ID): boolean {
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
    validationRules: SchemaValidationRuleInterface[],
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

  private applyValidationChange(change: SchemaChange, rules: SchemaValidationRuleInterface[]): void {
    // Apply validation rule changes
  }

  private updateMetadata(): void {
    this._props.metadata.updatedAt = new Date()
  }

  public static create(props: Omit<SchemaProps, 'id'> & { id?: ID }): Schema {
    const metadata: SchemaMetadata = {
      ...props.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const schemaProps: SchemaProps = {
      ...props,
      metadata,
    }

    return new Schema(schemaProps)
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
      id,
      name: json.name,
      version,
      description: json.description,
      components: json.components, // In practice, you'd deserialize these properly
      globalProperties: json.globalProperties || [],
      validationRules: json.validationRules || [],
      metadata,
    }

    return new Schema(schemaProps)
  }

  public static duplicate(original: Schema, newName: string, newVersion: SemanticVersion): Schema {
    const schemaProps: SchemaProps = {
      name: newName,
      version: newVersion,
      description: original.description,
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

    return new Schema(schemaProps)
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
      'Schema must have at least one component',
      'Published schemas cannot be modified',
      'Schema versions must be incremented for changes',
    ]
  }

  public validateInvariants(): void {
    const validation = this.validate()

    if (!validation.isValid) {
      throw new Error(
        `Schema validation failed: ${validation.errors.map((e: SchemaValidationError) => e.message).join(', ')}`,
      )
    }

    // Check specific invariants
    if (this.components.length === 0) {
      throw new Error('Schema must have at least one component')
    }
  }
}
