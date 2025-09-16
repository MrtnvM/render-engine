import { Entity, EntityData } from '../../../kernel/entities/base.entity.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { CompatibilityResult, SchemaChange, SchemaValidationRuleInterface } from '../../shared/types/schema-types.js'
import { SchemaStatus } from '../../shared/enums/schema-status.enum.js'
import {
  SchemaValidationError,
  SchemaValidationInfo,
  SchemaValidationResult,
  SchemaValidationWarning,
} from '../../schema-validation/value-objects/validation-result.vo.js'
import { SchemaValidationSeverity } from 'src/schema-management/shared/enums/validation-severity.enum.js'
import { ComponentType } from 'src/schema-management/shared/enums/component-type.enum.js'
import { Name, Description, SemanticVersion } from '../../../kernel/value-objects/index.js'
import { Component } from './component.entity.js'
import { Property } from '../value-objects/property.value-object.js'
import { SchemaValidationRule } from '../value-objects/validation-rule.value-object.js'

interface SchemaData extends EntityData {
  id: ID
  name: Name
  description: Description
  version: SemanticVersion
  status: SchemaStatus
  components: Component[]
  globalProperties?: Property[]
  validationRules?: SchemaValidationRule[]
}

export class Schema extends Entity<SchemaData> {
  private constructor(props: SchemaData) {
    super(props)
  }

  public static create(
    props: Omit<SchemaData, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID; createdAt?: Date; updatedAt?: Date },
  ): Schema {
    const schemaData: SchemaData = {
      ...props,
      id: props.id ?? ID.generate(),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }

    return new Schema(schemaData)
  }

  get name(): Name {
    return this.data.name
  }

  get version(): SemanticVersion {
    return this.data.version
  }

  get description(): Description {
    return this.data.description
  }

  get components(): Component[] {
    return this.data.components
  }

  get globalProperties(): readonly Property[] {
    return this.data.globalProperties || []
  }

  get validationRules(): readonly SchemaValidationRule[] {
    return this.data.validationRules || []
  }

  get componentCount(): number {
    return this.components.length
  }

  isValid(): boolean {
    return this.validate().isValid
  }

  get status(): SchemaStatus {
    return this.data.status
  }

  public addComponent(component: Component): void {
    if (this.status === SchemaStatus.PUBLISHED) {
      throw new Error('Cannot add components to published schemas. Create a new version instead.')
    }

    this.data.components.push(component)
    this.data.updatedAt = new Date()
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

    this.data.components.splice(componentIndex, 1)
    this.data.updatedAt = new Date()
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
    Object.assign(this.data.components[componentIndex], updates)
    this.data.updatedAt = new Date()
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
    this.data.updatedAt = new Date()
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

    const schemaData: SchemaData = {
      id: this.id,
      name: this.name,
      version: newVersion,
      status: this.status,
      description: this.description,
      components: newComponents,
      globalProperties: newGlobalProperties,
      validationRules: newValidationRules,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return new Schema(schemaData)
  }

  public publish(): void {
    const validation = this.validate()
    if (!validation.isValid) {
      throw new Error('Cannot publish invalid schema. Fix all errors first.')
    }

    if (this.components.length === 0) {
      throw new Error('Cannot publish schema with no components.')
    }

    if (this.status === SchemaStatus.PUBLISHED) {
      throw new Error('Schema is already published.')
    }

    if (this.status === SchemaStatus.DEPRECATED) {
      throw new Error('Cannot publish deprecated schema.')
    }

    this.data.status = SchemaStatus.PUBLISHED
    this.data.updatedAt = new Date()
  }

  public deprecate(): void {
    if (this.status === SchemaStatus.DEPRECATED) {
      throw new Error('Schema is already deprecated.')
    }

    this.data.status = SchemaStatus.DEPRECATED
    this.data.updatedAt = new Date()
  }

  public findComponent(id: ID): Component | null {
    return this.components.find((c) => c.id.equals(id)) || null
  }

  public getComponentsByType(type: ComponentType): Component[] {
    return this.components.filter((c) => {
      return c.type === type
    })
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
    // TODO: Validate each component
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
    globalProperties: Property[],
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

  private applyPropertyChange(change: SchemaChange, properties: Property[]): void {
    // Apply property-specific changes
  }

  private applyValidationChange(change: SchemaChange, rules: SchemaValidationRuleInterface[]): void {
    // Apply validation rule changes
  }
}
