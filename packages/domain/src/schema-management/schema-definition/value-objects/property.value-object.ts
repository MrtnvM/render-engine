import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import { DataType } from './data-type.value-object.js'
import { SchemaValidationRule } from './validation-rule.value-object.js'

export interface BindingOptions {
  expression: string
  type: 'one-way' | 'two-way'
  transform?: (value: unknown) => unknown
}

export interface UIHint {
  widget?: string
  placeholder?: string
  helpText?: string
  group?: string
  order?: number
  visible?: boolean
  editable?: boolean
}

export interface PropertyMetadata {
  createdAt: Date
  updatedAt: Date
  version: string
  [key: string]: unknown
}

export interface PropertyProps {
  name: string
  type: DataType
  displayName: string
  description?: string | null
  defaultValue?: unknown | null
  isRequired?: boolean
  isReadOnly?: boolean
  validationRules?: SchemaValidationRule[]
  bindingOptions?: BindingOptions | null
  uiHint?: UIHint | null
  metadata: PropertyMetadata
}

export interface PropertyJSON {
  name: string
  type: any
  displayName: string
  description?: string
  defaultValue?: unknown
  isRequired: boolean
  isReadOnly: boolean
  validationRules?: any[]
  bindingOptions?: BindingOptions
  uiHint?: UIHint
  metadata: {
    createdAt: string
    updatedAt: string
    version: string
    [key: string]: unknown
  }
}

export interface PropertyValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class Property extends ValueObject<PropertyProps> {
  private constructor(props: PropertyProps) {
    super(props)
  }

  get name(): string {
    return this.value.name
  }

  get type(): DataType {
    return this.value.type
  }

  get displayName(): string {
    return this.value.displayName
  }

  get description(): string | null {
    return this.value.description || null
  }

  get defaultValue(): unknown | null {
    return this.value.defaultValue || null
  }

  get isRequired(): boolean {
    return this.value.isRequired || false
  }

  get isReadOnly(): boolean {
    return this.value.isReadOnly || false
  }

  get validationRules(): SchemaValidationRule[] {
    return this.value.validationRules || []
  }

  get bindingOptions(): BindingOptions | null {
    return this.value.bindingOptions || null
  }

  get uiHint(): UIHint | null {
    return this.value.uiHint || null
  }

  get metadata(): PropertyMetadata {
    return this.value.metadata
  }

  get hasDefaultValue(): boolean {
    return this.value.defaultValue !== null && this.value.defaultValue !== undefined
  }

  get validationRuleCount(): number {
    return this.validationRules.length
  }

  get isBindable(): boolean {
    return this.bindingOptions !== null
  }

  get isComplex(): boolean {
    return this.type.isComplex
  }

  get isPrimitive(): boolean {
    return this.type.isPrimitive
  }

  public validateValue(value: unknown): PropertyValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if value is provided for required property
    if (this.isRequired && (value === null || value === undefined)) {
      errors.push(`Property '${this.name}' is required`)
      return { isValid: false, errors, warnings }
    }

    // Skip further validation for null/undefined values (unless required)
    if (value === null || value === undefined) {
      return { isValid: true, errors, warnings }
    }

    // Type validation
    const typeValidation = this.type.validateValue(value)
    if (!typeValidation.isValid) {
      errors.push(...typeValidation.errors.map((err) => `Property '${this.name}': ${err}`))
    }

    // Validation rules
    for (const rule of this.validationRules) {
      const ruleValidation = rule.validate(value)
      if (!ruleValidation.isValid) {
        errors.push(...ruleValidation.errors)
      }
      if (ruleValidation.warnings) {
        warnings.push(...ruleValidation.warnings)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  public validateDefaultValue(): boolean {
    if (!this.hasDefaultValue) {
      return true
    }

    const validation = this.validateValue(this.defaultValue)
    return validation.isValid
  }

  public isCompatibleWith(other: Property): boolean {
    // Types must be compatible
    if (!this.type.isCompatibleWith(other.type)) {
      return false
    }

    // Required properties can become required but not vice versa
    if (this.isRequired && !other.isRequired) {
      return false
    }

    // Read-only properties can become read-only but not vice versa
    if (this.isReadOnly && !other.isReadOnly) {
      return false
    }

    // Validation rules must be compatible
    // This is a simplified check - in practice, you'd need more sophisticated logic
    return true
  }

  public coerceValue(value: unknown): unknown {
    return this.type.coerceValue(value)
  }

  public getEffectiveValue(value: unknown | null): unknown {
    if (value !== null && value !== undefined) {
      return value
    }

    if (this.hasDefaultValue) {
      return this.defaultValue
    }

    return null
  }

  public supportsBinding(): boolean {
    return this.bindingOptions !== null
  }

  public getBindingExpression(): string | null {
    return this.bindingOptions?.expression || null
  }

  public setBindingExpression(expression: string): Property {
    if (!this.supportsBinding()) {
      throw new Error(`Property '${this.name}' does not support data binding`)
    }

    const newBindingOptions: BindingOptions = {
      ...this.bindingOptions!,
      expression,
    }

    const newMetadata = {
      ...this.metadata,
      updatedAt: new Date(),
    }

    return new Property({
      ...this.value,
      bindingOptions: newBindingOptions,
      metadata: newMetadata,
    })
  }

  public hasValidationRule(ruleName: string): boolean {
    return this.validationRules.some((rule) => rule.name === ruleName)
  }

  public getValidationRule(ruleName: string): SchemaValidationRule | null {
    return this.validationRules.find((rule) => rule.name === ruleName) || null
  }

  public getRequiredValidationRules(): SchemaValidationRule[] {
    return this.validationRules.filter((rule) => rule.isRequiredFor(this.type))
  }

  public getOptionalValidationRules(): SchemaValidationRule[] {
    return this.validationRules.filter((rule) => !rule.isRequiredFor(this.type))
  }

  public toPrimitive(): PropertyProps {
    return this.value
  }

  private static validateName(name: string): void {
    const nameRegex = /^[a-z][\w-]*$/i
    if (!nameRegex.test(name)) {
      throw new Error(
        `Property name '${name}' is invalid. Must start with a letter and contain only letters, numbers, underscores, and hyphens.`,
      )
    }

    if (name.length < 1 || name.length > 50) {
      throw new Error(`Property name '${name}' must be between 1 and 50 characters long`)
    }
  }

  private static validateDisplayName(displayName: string): void {
    if (displayName.length < 3 || displayName.length > 100) {
      throw new Error(`Display name must be between 3 and 100 characters long`)
    }
  }

  private static validateDefaultValue(defaultValue: unknown, type: DataType): void {
    const typeValidation = type.validateValue(defaultValue)
    if (!typeValidation.isValid) {
      throw new Error(`Default value is invalid for type ${type.name}: ${typeValidation.errors.join(', ')}`)
    }
  }

  public static create(props: Omit<PropertyProps, 'metadata'>): Property {
    const { name, displayName, type, defaultValue } = props

    Property.validateName(name)
    Property.validateDisplayName(displayName)
    Property.validateDefaultValue(defaultValue, type)

    const metadata: PropertyMetadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
    }

    return new Property({
      ...props,
      metadata,
    })
  }

  public static fromType(type: DataType, name: string, displayName: string): Property {
    const defaultValue = type.defaultValue
    const uiHint: UIHint = {
      widget: this.getDefaultWidget(type.type),
      group: 'General',
    }

    return Property.create({
      name,
      type,
      displayName,
      defaultValue,
      uiHint,
    })
  }

  private static getDefaultWidget(type: string): string {
    const widgetMap: Record<string, string> = {
      string: 'text',
      number: 'number',
      integer: 'number',
      float: 'number',
      boolean: 'checkbox',
      date: 'date',
      datetime: 'datetime',
      time: 'time',
    }

    return widgetMap[type] || 'text'
  }
}
