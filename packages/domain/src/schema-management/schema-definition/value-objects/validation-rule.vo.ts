import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import { DataType } from './data-type.vo.js'
import { SchemaValidationRuleType, SchemaValidationSeverity } from '../../shared/enums/index.js'

export interface SchemaValidationRuleParameter {
  name: string
  value: unknown
  type: string
  description?: string
  required?: boolean
}

export interface SchemaValidationRuleMetadata {
  createdAt: Date
  updatedAt: Date
  version: string
  [key: string]: unknown
}

export interface SchemaValidationRuleProps {
  name: string
  type: SchemaValidationRuleType
  displayName: string
  description?: string | null
  parameters: SchemaValidationRuleParameter[]
  errorMessage?: string | null
  severity?: SchemaValidationSeverity
  isBuiltIn?: boolean
  metadata: SchemaValidationRuleMetadata
}

export interface SchemaValidationRuleJSON {
  name: string
  type: string
  displayName: string
  description?: string
  parameters: SchemaValidationRuleParameter[]
  errorMessage?: string
  severity: 'error' | 'warning' | 'info'
  isBuiltIn: boolean
  metadata: {
    createdAt: string
    updatedAt: string
    version: string
    [key: string]: unknown
  }
}

export interface SchemaValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface SchemaValidationContext {
  path?: string
  target?: any
  [key: string]: unknown
}

export class SchemaValidationRule extends ValueObject<SchemaValidationRuleProps> {
  private constructor(props: SchemaValidationRuleProps) {
    super(props)
  }

  get name(): string {
    return this.value.name
  }

  get type(): SchemaValidationRuleType {
    return this.value.type
  }

  get displayName(): string {
    return this.value.displayName
  }

  get description(): string | null {
    return this.value.description || null
  }

  get parameters(): SchemaValidationRuleParameter[] {
    return this.value.parameters
  }

  get errorMessage(): string | null {
    return this.value.errorMessage || null
  }

  get severity(): SchemaValidationSeverity {
    return this.value.severity || SchemaValidationSeverity.ERROR
  }

  get isBuiltIn(): boolean {
    return this.value.isBuiltIn || false
  }

  get metadata(): SchemaValidationRuleMetadata {
    return this.value.metadata
  }

  get parameterCount(): number {
    return this.parameters.length
  }

  get hasParameters(): boolean {
    return this.parameters.length > 0
  }

  get hasCustomMessage(): boolean {
    return this.value.errorMessage !== null && this.value.errorMessage !== undefined
  }

  get isErrorSeverity(): boolean {
    return this.severity === SchemaValidationSeverity.ERROR
  }

  get isWarningSeverity(): boolean {
    return this.severity === SchemaValidationSeverity.WARNING
  }

  get isInfoSeverity(): boolean {
    return this.severity === SchemaValidationSeverity.INFO
  }

  public validate(value: unknown, context?: SchemaValidationContext): SchemaValidationResult {
    try {
      const result = this.executeValidation(value, context)

      if (result.isValid) {
        return { isValid: true, errors: [] }
      }

      const errorMessage = this.getErrorMessage(value, context)
      return {
        isValid: false,
        errors: [errorMessage],
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `Validation rule '${this.name}' failed to execute: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      }
    }
  }

  public async validateAsync(value: unknown, context?: SchemaValidationContext): Promise<SchemaValidationResult> {
    try {
      const result = await this.executeValidationAsync(value, context)

      if (result.isValid) {
        return { isValid: true, errors: [] }
      }

      const errorMessage = this.getErrorMessage(value, context)
      return {
        isValid: false,
        errors: [errorMessage],
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `Validation rule '${this.name}' failed to execute: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      }
    }
  }

  public isApplicableTo(dataType: DataType): boolean {
    return this.isRuleApplicableToType(this.type, dataType.type)
  }

  public getParameter(name: string): SchemaValidationRuleParameter | null {
    return this.parameters.find((param) => param.name === name) || null
  }

  public hasParameter(name: string): boolean {
    return this.parameters.some((param) => param.name === name)
  }

  public setParameter(name: string, value: unknown): SchemaValidationRule {
    const parameter = this.getParameter(name)
    if (!parameter) {
      throw new Error(`Parameter '${name}' not found in rule '${this.name}'`)
    }

    if (!this.isParameterValueValid(parameter, value)) {
      throw new Error(`Invalid value for parameter '${name}' in rule '${this.name}'`)
    }

    const newParameters = this.parameters.map((param) => (param.name === name ? { ...param, value } : param))

    const newMetadata = {
      ...this.metadata,
      updatedAt: new Date(),
    }

    return new SchemaValidationRule({
      ...this.value,
      parameters: newParameters,
      metadata: newMetadata,
    })
  }

  public addParameter(parameter: SchemaValidationRuleParameter): SchemaValidationRule {
    if (this.hasParameter(parameter.name)) {
      throw new Error(`Parameter '${parameter.name}' already exists in rule '${this.name}'`)
    }

    if (!this.isParameterValidForRuleType(parameter, this.type)) {
      throw new Error(`Parameter '${parameter.name}' is not valid for rule type '${this.type}'`)
    }

    const newParameters = [...this.parameters, parameter]
    const newMetadata = {
      ...this.metadata,
      updatedAt: new Date(),
    }

    return new SchemaValidationRule({
      ...this.value,
      parameters: newParameters,
      metadata: newMetadata,
    })
  }

  public removeParameter(name: string): SchemaValidationRule {
    const parameter = this.getParameter(name)
    if (!parameter) {
      throw new Error(`Parameter '${name}' not found in rule '${this.name}'`)
    }

    if (parameter.required) {
      throw new Error(`Cannot remove required parameter '${name}' from rule '${this.name}'`)
    }

    const newParameters = this.parameters.filter((param) => param.name !== name)
    const newMetadata = {
      ...this.metadata,
      updatedAt: new Date(),
    }

    return new SchemaValidationRule({
      ...this.value,
      parameters: newParameters,
      metadata: newMetadata,
    })
  }

  public getErrorMessage(value: unknown, context?: SchemaValidationContext): string {
    if (this.errorMessage) {
      return this.formatMessage(this.errorMessage, value, context)
    }

    return this.getDefaultErrorMessage(value, context)
  }

  public formatMessage(template: string, value: unknown, context?: SchemaValidationContext): string {
    let message = template

    // Replace parameter placeholders
    for (const param of this.parameters) {
      const placeholder = `{{${param.name}}}`
      const valueStr = String(param.value)
      message = message.replace(new RegExp(placeholder, 'g'), valueStr)
    }

    // Replace value placeholder
    message = message.replace('{{value}}', String(value))

    // Replace context placeholders
    if (context) {
      message = message.replace('{{path}}', context.path || '')
    }

    return message
  }

  public isRequiredFor(dataType: DataType): boolean {
    // Some rules are required for certain data types
    const requiredRules: Record<string, SchemaValidationRuleType[]> = {
      string: [SchemaValidationRuleType.TYPE],
      number: [SchemaValidationRuleType.TYPE, SchemaValidationRuleType.NUMBER],
      integer: [SchemaValidationRuleType.TYPE, SchemaValidationRuleType.INTEGER],
      date: [SchemaValidationRuleType.TYPE],
      array: [SchemaValidationRuleType.TYPE],
    }

    return requiredRules[dataType.type]?.includes(this.type) || false
  }

  public getSupportedDataTypes(): string[] {
    const map = new Map<SchemaValidationRuleType, string[]>([
      [SchemaValidationRuleType.REQUIRED, ['string', 'number', 'boolean', 'date', 'array', 'object']],
      [SchemaValidationRuleType.TYPE, ['string', 'number', 'boolean', 'date', 'array', 'object']],
      [SchemaValidationRuleType.MIN, ['number', 'integer', 'float', 'string']],
      [SchemaValidationRuleType.MAX, ['number', 'integer', 'float', 'string']],
      [SchemaValidationRuleType.MIN_LENGTH, ['string', 'array']],
      [SchemaValidationRuleType.MAX_LENGTH, ['string', 'array']],
      [SchemaValidationRuleType.PATTERN, ['string']],
      [SchemaValidationRuleType.EMAIL, ['string']],
      [SchemaValidationRuleType.URL, ['string']],
      [SchemaValidationRuleType.UUID, ['string']],
      [SchemaValidationRuleType.ENUM, ['string', 'number']],
      [SchemaValidationRuleType.CUSTOM, ['string', 'number', 'boolean', 'date', 'array', 'object']],
    ])

    return map.get(this.type) || []
  }

  public toJSON(): SchemaValidationRuleJSON {
    return {
      name: this.name,
      type: this.type,
      displayName: this.displayName,
      description: this.description || undefined,
      parameters: this.parameters,
      errorMessage: this.errorMessage || undefined,
      severity: this.severity,
      isBuiltIn: this.isBuiltIn,
      metadata: {
        ...this.metadata,
        createdAt: this.metadata.createdAt.toISOString(),
        updatedAt: this.metadata.updatedAt.toISOString(),
      },
    }
  }

  public toPrimitive(): SchemaValidationRuleProps {
    return this.value
  }

  private executeValidation(value: unknown, context?: SchemaValidationContext): SchemaValidationResult {
    switch (this.type) {
      case SchemaValidationRuleType.REQUIRED:
        return { isValid: value !== null && value !== undefined, errors: [] }

      case SchemaValidationRuleType.TYPE:
        return this.validateType(value)

      case SchemaValidationRuleType.MIN:
        return this.validateMin(value)

      case SchemaValidationRuleType.MAX:
        return this.validateMax(value)

      case SchemaValidationRuleType.MIN_LENGTH:
        return this.validateMinLength(value)

      case SchemaValidationRuleType.MAX_LENGTH:
        return this.validateMaxLength(value)

      case SchemaValidationRuleType.PATTERN:
        return this.validatePattern(value)

      case SchemaValidationRuleType.EMAIL:
        return this.validateEmail(value)

      case SchemaValidationRuleType.URL:
        return this.validateURL(value)

      case SchemaValidationRuleType.ENUM:
        return this.validateEnum(value)

      case SchemaValidationRuleType.CUSTOM:
        return this.validateCustom(value, context)

      default:
        return { isValid: true, errors: [] }
    }
  }

  private async executeValidationAsync(
    value: unknown,
    context?: SchemaValidationContext,
  ): Promise<SchemaValidationResult> {
    // For async validation rules (future extension)
    return this.executeValidation(value, context)
  }

  private validateType(value: unknown): SchemaValidationResult {
    const typeParam = this.getParameter('type')
    if (!typeParam) {
      return { isValid: true, errors: [] }
    }

    const expectedType = typeParam.value as string
    let isValid = false

    switch (expectedType) {
      case 'string':
        isValid = typeof value === 'string'
        break
      case 'number':
        isValid = typeof value === 'number' && !Number.isNaN(value)
        break
      case 'boolean':
        isValid = typeof value === 'boolean'
        break
      case 'date':
        isValid = value instanceof Date && !Number.isNaN(value.getTime())
        break
      case 'array':
        isValid = Array.isArray(value)
        break
      case 'object':
        isValid = typeof value === 'object' && value !== null && !Array.isArray(value)
        break
    }

    return { isValid, errors: [] }
  }

  private validateMin(value: unknown): SchemaValidationResult {
    const minParam = this.getParameter('min')
    if (!minParam || typeof value !== 'number') {
      return { isValid: true, errors: [] }
    }

    const minValue = minParam.value as number
    return { isValid: value >= minValue, errors: [] }
  }

  private validateMax(value: unknown): SchemaValidationResult {
    const maxParam = this.getParameter('max')
    if (!maxParam || typeof value !== 'number') {
      return { isValid: true, errors: [] }
    }

    const maxValue = maxParam.value as number
    return { isValid: value <= maxValue, errors: [] }
  }

  private validateMinLength(value: unknown): SchemaValidationResult {
    const minLengthParam = this.getParameter('minLength')
    if (!minLengthParam) {
      return { isValid: true, errors: [] }
    }

    const minLength = minLengthParam.value as number

    if (typeof value === 'string') {
      return { isValid: value.length >= minLength, errors: [] }
    }

    if (Array.isArray(value)) {
      return { isValid: value.length >= minLength, errors: [] }
    }

    return { isValid: true, errors: [] }
  }

  private validateMaxLength(value: unknown): SchemaValidationResult {
    const maxLengthParam = this.getParameter('maxLength')
    if (!maxLengthParam) {
      return { isValid: true, errors: [] }
    }

    const maxLength = maxLengthParam.value as number

    if (typeof value === 'string') {
      return { isValid: value.length <= maxLength, errors: [] }
    }

    if (Array.isArray(value)) {
      return { isValid: value.length <= maxLength, errors: [] }
    }

    return { isValid: true, errors: [] }
  }

  private validatePattern(value: unknown): SchemaValidationResult {
    const patternParam = this.getParameter('pattern')
    if (!patternParam || typeof value !== 'string') {
      return { isValid: true, errors: [] }
    }

    const pattern = new RegExp(patternParam.value as string)
    return { isValid: pattern.test(value), errors: [] }
  }

  private validateEmail(value: unknown): SchemaValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: [] }
    }

    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    return { isValid: emailRegex.test(value), errors: [] }
  }

  private validateURL(value: unknown): SchemaValidationResult {
    if (typeof value !== 'string') {
      return { isValid: false, errors: [] }
    }

    try {
      // eslint-disable-next-line no-new
      new URL(value)
      return { isValid: true, errors: [] }
    } catch {
      return { isValid: false, errors: [] }
    }
  }

  private validateEnum(value: unknown): SchemaValidationResult {
    const enumParam = this.getParameter('values')
    if (!enumParam || !Array.isArray(enumParam.value)) {
      return { isValid: true, errors: [] }
    }

    const enumValues = enumParam.value as unknown[]
    return { isValid: enumValues.includes(value), errors: [] }
  }

  private validateCustom(value: unknown, context?: SchemaValidationContext): SchemaValidationResult {
    const validatorParam = this.getParameter('validator')
    if (!validatorParam || typeof validatorParam.value !== 'function') {
      return { isValid: true, errors: [] }
    }

    try {
      const validator = validatorParam.value as (value: unknown, context?: SchemaValidationContext) => boolean
      const isValid = validator(value, context)
      return { isValid, errors: [] }
    } catch {
      return { isValid: false, errors: [] }
    }
  }

  private getDefaultErrorMessage(value: unknown, context?: SchemaValidationContext): string {
    const map = new Map<SchemaValidationRuleType, string>([
      [SchemaValidationRuleType.REQUIRED, 'This field is required'],
      [SchemaValidationRuleType.TYPE, 'Invalid type'],
      [SchemaValidationRuleType.MIN, 'Value must be at least {{min}}'],
      [SchemaValidationRuleType.MAX, 'Value must be at most {{max}}'],
      [SchemaValidationRuleType.MIN_LENGTH, 'Value must be at least {{minLength}} characters long'],
      [SchemaValidationRuleType.MAX_LENGTH, 'Value must be at most {{maxLength}} characters long'],
      [SchemaValidationRuleType.PATTERN, 'Value does not match the required pattern'],
      [SchemaValidationRuleType.EMAIL, 'Please enter a valid email address'],
      [SchemaValidationRuleType.URL, 'Please enter a valid URL'],
      [SchemaValidationRuleType.UUID, 'Please enter a valid UUID'],
      [SchemaValidationRuleType.ENUM, 'Please select a valid value'],
      [SchemaValidationRuleType.CUSTOM, 'Validation failed'],
    ])

    return this.formatMessage(map.get(this.type) || 'Validation failed', value, context)
  }

  private isParameterValueValid(parameter: SchemaValidationRuleParameter, value: unknown): boolean {
    // Basic type checking for parameter values
    switch (parameter.type) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !Number.isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'function':
        return typeof value === 'function'
      default:
        return true
    }
  }

  private isParameterValidForRuleType(
    parameter: SchemaValidationRuleParameter,
    ruleType: SchemaValidationRuleType,
  ): boolean {
    // Define which parameters are valid for each rule type

    const validParameters = new Map<SchemaValidationRuleType, string[]>([
      [SchemaValidationRuleType.REQUIRED, []],
      [SchemaValidationRuleType.TYPE, ['type']],
      [SchemaValidationRuleType.MIN, ['min']],
      [SchemaValidationRuleType.MAX, ['max']],
      [SchemaValidationRuleType.MIN_LENGTH, ['minLength']],
      [SchemaValidationRuleType.MAX_LENGTH, ['maxLength']],
      [SchemaValidationRuleType.PATTERN, ['pattern']],
      [SchemaValidationRuleType.EMAIL, []],
      [SchemaValidationRuleType.URL, []],
      [SchemaValidationRuleType.ENUM, ['values']],
      [SchemaValidationRuleType.CUSTOM, ['validator']],
    ])

    return validParameters.get(ruleType)?.includes(parameter.name) || false
  }

  private isRuleApplicableToType(ruleType: SchemaValidationRuleType, dataType: string): boolean {
    const applicableTypes = new Map<SchemaValidationRuleType, string[]>([
      [SchemaValidationRuleType.REQUIRED, ['string', 'number', 'boolean', 'date', 'array', 'object']],
      [SchemaValidationRuleType.TYPE, ['string', 'number', 'boolean', 'date', 'array', 'object']],
      [SchemaValidationRuleType.MIN, ['number', 'string']],
      [SchemaValidationRuleType.MAX, ['number', 'string']],
      [SchemaValidationRuleType.MIN_LENGTH, ['string', 'array']],
      [SchemaValidationRuleType.MAX_LENGTH, ['string', 'array']],
      [SchemaValidationRuleType.PATTERN, ['string']],
      [SchemaValidationRuleType.EMAIL, ['string']],
      [SchemaValidationRuleType.URL, ['string']],
      [SchemaValidationRuleType.ENUM, ['string', 'number']],
      [SchemaValidationRuleType.CUSTOM, ['string', 'number', 'boolean', 'date', 'array', 'object']],
    ])

    return applicableTypes.get(ruleType)?.includes(dataType) || false
  }

  public static create(props: Omit<SchemaValidationRuleProps, 'metadata'>): SchemaValidationRule {
    const metadata: SchemaValidationRuleMetadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
    }

    return new SchemaValidationRule({
      ...props,
      metadata,
    })
  }

  public static builtIn(
    name: string,
    type: SchemaValidationRuleType,
    displayName: string,
    parameters: SchemaValidationRuleParameter[] = [],
  ): SchemaValidationRule {
    return SchemaValidationRule.create({
      name,
      type,
      displayName,
      parameters,
      isBuiltIn: true,
    })
  }

  public static custom(
    name: string,
    type: SchemaValidationRuleType,
    displayName: string,
    validator: (value: unknown) => boolean,
    parameters: SchemaValidationRuleParameter[] = [],
  ): SchemaValidationRule {
    const allParameters = [
      ...parameters,
      {
        name: 'validator',
        value: validator,
        type: 'function',
        required: true,
        description: 'Custom validation function',
      },
    ]

    return SchemaValidationRule.create({
      name,
      type,
      displayName,
      parameters: allParameters,
    })
  }
}
