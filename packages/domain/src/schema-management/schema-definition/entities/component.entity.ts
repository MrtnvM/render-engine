import { Entity, EntityData } from '../../../kernel/entities/base.entity.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { ComponentType } from '../../shared/enums/component-type.enum.js'
import { Property } from '../value-objects/property.value-object.js'
import { SchemaValidationRule } from '../value-objects/validation-rule.value-object.js'
import { Description, Name, SemanticVersion, ValidationError } from '../../../kernel/index.js'

export interface ComponentEvent {
  name: string
  type: string
  handler: string
  parameters?: Property[]
}

export interface ComponentStyle {
  property: string
  value: string | number
}

export interface ComponentData extends EntityData {
  name: Name
  type: ComponentType
  description: Description
  version: SemanticVersion
  properties: Property[]
  children: Component[]
  parentId: ID | null
  validationRules: SchemaValidationRule[]
  events: ComponentEvent[]
  styles: ComponentStyle[]
}

export class Component extends Entity<ComponentData> {
  private constructor(props: ComponentData) {
    super(props)
  }

  public static create(
    props: Omit<ComponentData, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID; createdAt?: Date; updatedAt?: Date },
  ): Component {
    // Validate name
    if (!props.name || !props.name.toString().trim()) {
      throw ValidationError.emptyValue('name')
    }

    const nameStr = props.name.toString()
    if (!/^[a-z]/i.test(nameStr)) {
      throw ValidationError.invalidFormat('name', nameStr, 'must start with a letter')
    }

    if (nameStr.length < 1 || nameStr.length > 100) {
      throw ValidationError.invalidFormat('name', nameStr, 'must be between 1 and 100 characters')
    }

    const data: ComponentData = {
      ...props,
      id: props.id ?? ID.generate(),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }

    const component = new Component(data)
    component.validateInvariants()
    return component
  }

  get name(): Name {
    return this.data.name
  }

  get type(): ComponentType {
    return this.data.type
  }

  get description(): Description {
    return this.data.description
  }

  get properties(): readonly Property[] {
    return this.data.properties
  }

  get children(): Component[] {
    return this.data.children || []
  }

  get parentId(): ID | null {
    return this.data.parentId
  }

  get validationRules(): SchemaValidationRule[] {
    return (this.data.validationRules as SchemaValidationRule[]) || []
  }

  get events(): ComponentEvent[] {
    return this.data.events || []
  }

  get styles(): ComponentStyle[] {
    return this.data.styles || []
  }

  get childCount(): number {
    return this.children.length
  }

  get propertyCount(): number {
    return this.properties.length
  }

  get isContainer(): boolean {
    return [
      ComponentType.CONTAINER,
      ComponentType.ROW,
      ComponentType.COLUMN,
      ComponentType.GRID,
      ComponentType.STACK,
      ComponentType.CARD,
      ComponentType.FORM,
    ].includes(this.type)
  }

  get isLeaf(): boolean {
    return !this.isContainer
  }

  public addChild(child: Component): void {
    if (!this.isContainer) {
      throw new Error(`Cannot add child to non-container component '${this.name}'`)
    }

    child.data.parentId = ID.create(this.id.toPrimitive())

    if (!this.data.children) {
      this.data.children = []
    }

    this.data.children.push(child)
    this.touch()
  }

  public removeChild(childId: ID): void {
    if (!this.data.children || this.data.children.length === 0) {
      throw new Error(`Child with ID '${childId}' not found in component '${this.name}'`)
    }

    const childIndex = this.data.children.findIndex((c) => c.id.equals(childId))
    if (childIndex === -1) {
      throw new Error(`Child with ID '${childId}' not found in component '${this.name}'`)
    }

    this.data.children.splice(childIndex, 1)
    this.touch()
  }

  public addProperty(property: Property): void {
    const existingProperty = this.properties.find((p) => p.name.toString() === property.name.toString())
    if (existingProperty) {
      throw ValidationError.duplicate(
        property.name.toString(),
        `Property '${property.name}' already exists in component '${this.name}'`,
      )
    }

    this.data.properties.push(property)
    this.touch()
  }

  public removeProperty(propertyName: string): void {
    const propertyIndex = this.data.properties.findIndex((p) => p.name.toString() === propertyName)
    if (propertyIndex === -1) {
      throw new Error(`Property '${propertyName}' not found in component '${this.name}'`)
    }

    this.data.properties.splice(propertyIndex, 1)
    this.touch()
  }

  public updateProperty(propertyName: string, updates: Partial<Property>): void {
    const property = this.properties.find((p) => p.name.toString() === propertyName)
    if (!property) {
      throw new Error(`Property '${propertyName}' not found in component '${this.name}'`)
    }

    const propertyIndex = this.data.properties.findIndex((p) => p.name.toString() === propertyName)
    if (propertyIndex === -1) {
      throw new Error(`Property '${propertyName}' not found in component '${this.name}'`)
    }

    this.data.properties[propertyIndex] = { ...property, ...updates } as Property
    this.touch()
  }

  public addValidationRule(rule: SchemaValidationRule): void {
    if (!this.data.validationRules) {
      this.data.validationRules = []
    }

    this.data.validationRules.push(rule)
    this.touch()
  }

  public removeValidationRule(ruleName: string): void {
    if (!this.data.validationRules) {
      return
    }

    const ruleIndex = this.data.validationRules.findIndex((r) => r.name.toString() === ruleName)
    if (ruleIndex === -1) {
      throw new Error(`Validation rule '${ruleName}' not found in component '${this.name}'`)
    }

    this.data.validationRules.splice(ruleIndex, 1)
    this.touch()
  }

  public addStyle(style: ComponentStyle): void {
    if (!this.data.styles) {
      this.data.styles = []
    }

    this.data.styles.push(style)
    this.touch()
  }

  public removeStyle(property: string): void {
    if (!this.data.styles) {
      return
    }

    const styleIndex = this.data.styles.findIndex((s) => s.property === property)
    if (styleIndex === -1) {
      throw new Error(`Style '${property}' not found in component '${this.name}'`)
    }

    this.data.styles.splice(styleIndex, 1)
    this.touch()
  }

  public addEvent(event: ComponentEvent): void {
    if (!this.data.events) {
      this.data.events = []
    }

    this.data.events.push(event)
    this.touch()
  }

  public removeEvent(eventName: string): void {
    if (!this.data.events) {
      return
    }

    const eventIndex = this.data.events.findIndex((e) => e.name === eventName)
    if (eventIndex === -1) {
      throw new Error(`Event '${eventName}' not found in component '${this.name}'`)
    }

    this.data.events.splice(eventIndex, 1)
    this.touch()
  }

  public getProperty(propertyName: string): Property | null {
    return this.properties.find((p) => p.name.toString() === propertyName) || null
  }

  public hasProperty(propertyName: string): boolean {
    return this.properties.some((p) => p.name.toString() === propertyName)
  }

  public getChildrenByType(type: ComponentType): Component[] {
    return this.children.filter((c) => c.type === type)
  }

  private touch(): void {
    this.data.updatedAt = new Date()
  }

  public toJSON(): Record<string, unknown> {
    const json = super.toJSON()

    // Convert Name and Description value objects to strings for JSON serialization
    if (json.name && typeof json.name === 'object' && 'value' in json.name) {
      json.name = (json.name as { value: string }).value
    }

    if (json.description && typeof json.description === 'object' && 'value' in json.description) {
      json.description = (json.description as { value: string }).value
    }

    return json
  }

  public validateInvariants(): void {
    const propertyNames = new Set<string>()

    for (const property of this.properties) {
      const propertyName = property.name.toString()
      if (propertyNames.has(propertyName)) {
        throw ValidationError.duplicate(
          property.name.toString(),
          `Duplicate property name '${propertyName}' in component '${this.name}'`,
        )
      }
      propertyNames.add(propertyName)
    }
  }
}
