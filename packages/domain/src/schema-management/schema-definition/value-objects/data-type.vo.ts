import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import { DataTypeCategory, PlatformSupport } from '../../shared/enums/index.js'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

export interface DataTypeConstraint {
  name: string
  value: unknown
  type: string
}

export interface DataTypeMetadata {
  createdAt: Date
  updatedAt: Date
  version: string
  [key: string]: unknown
}

export interface DataTypeProps {
  name: string
  type: DataTypeCategory
  baseType?: DataType | null
  constraints?: DataTypeConstraint[]
  defaultValue?: unknown | null
  isBuiltIn?: boolean
  isAbstract?: boolean
  platformSupport: PlatformSupport[]
  metadata: DataTypeMetadata
}

export interface DataTypeJSON {
  name: string
  type: string
  baseType?: string
  constraints?: DataTypeConstraint[]
  defaultValue?: unknown
  isBuiltIn: boolean
  isAbstract: boolean
  platformSupport: string[]
  metadata: {
    createdAt: string
    updatedAt: string
    version: string
    [key: string]: unknown
  }
}

export interface TypeValidationResult {
  isValid: boolean
  errors: string[]
}

export class DataType extends ValueObject<DataTypeProps> {
  private constructor(props: DataTypeProps) {
    super(props)
  }

  get name(): string {
    return this.props.name
  }

  get type(): DataTypeCategory {
    return this.props.type
  }

  get baseType(): DataType | null {
    return this.props.baseType || null
  }

  get constraints(): DataTypeConstraint[] {
    return this.props.constraints || []
  }

  get defaultValue(): unknown | null {
    return this.props.defaultValue || null
  }

  get isBuiltIn(): boolean {
    return this.props.isBuiltIn || false
  }

  get isAbstract(): boolean {
    return this.props.isAbstract || false
  }

  get platformSupport(): PlatformSupport[] {
    return this.props.platformSupport
  }

  get metadata(): DataTypeMetadata {
    return this.props.metadata
  }

  get constraintCount(): number {
    return this.constraints.length
  }

  get hasConstraints(): boolean {
    return this.constraints.length > 0
  }

  get hasDefaultValue(): boolean {
    return this.props.defaultValue !== null && this.props.defaultValue !== undefined
  }

  get isPrimitive(): boolean {
    return [
      DataTypeCategory.STRING,
      DataTypeCategory.NUMBER,
      DataTypeCategory.BOOLEAN,
      DataTypeCategory.INTEGER,
      DataTypeCategory.FLOAT,
      DataTypeCategory.DATE,
      DataTypeCategory.TIME,
      DataTypeCategory.DATETIME
    ].includes(this.type)
  }

  get isComplex(): boolean {
    return !this.isPrimitive
  }

  get isPlatformSpecific(): boolean {
    return this.platformSupport.length < 3
  }

  get supportedOnWeb(): boolean {
    return this.platformSupport.includes(PlatformSupport.WEB)
  }

  get supportedOnIOS(): boolean {
    return this.platformSupport.includes(PlatformSupport.IOS)
  }

  get supportedOnAndroid(): boolean {
    return this.platformSupport.includes(PlatformSupport.ANDROID)
  }

  public validateValue(value: unknown): TypeValidationResult {
    const errors: string[] = []

    // Basic type validation
    if (!this.isValidType(value)) {
      errors.push(`Value ${value} is not valid for type ${this.type}`)
      return { isValid: false, errors }
    }

    // Validate constraints
    for (const constraint of this.constraints) {
      const constraintError = this.validateConstraint(value, constraint)
      if (constraintError) {
        errors.push(constraintError)
      }
    }

    // Validate default value if present
    if (value === null || value === undefined) {
      if (this.hasDefaultValue) {
        return this.validateValue(this.defaultValue)
      }
      // Allow null/undefined for optional properties
      return { isValid: true, errors: [] }
    }

    return { isValid: errors.length === 0, errors }
  }

  public isValidValue(value: unknown): boolean {
    return this.validateValue(value).isValid
  }

  public isCompatibleWith(other: DataType): boolean {
    // Same type is always compatible
    if (this.type === other.type) {
      return true
    }

    // Check inheritance
    if (this.baseType === other || other.baseType === this) {
      return true
    }

    // Check platform support overlap
    const hasPlatformOverlap = this.platformSupport.some(platform =>
      other.platformSupport.includes(platform)
    )

    if (!hasPlatformOverlap) {
      return false
    }

    // Check constraint compatibility
    // This is a simplified check - in practice, you'd need more sophisticated logic
    return true
  }

  public coerceValue(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value
    }

    try {
      switch (this.type) {
        case DataTypeCategory.STRING:
          return String(value)
        case DataTypeCategory.NUMBER:
        case DataTypeCategory.FLOAT:
          return Number(value)
        case DataTypeCategory.INTEGER:
          return Math.floor(Number(value))
        case DataTypeCategory.BOOLEAN:
          return Boolean(value)
        case DataTypeCategory.DATE:
        case DataTypeCategory.DATETIME:
          return new Date(value as string | number | Date)
        default:
          return value
      }
    } catch {
      return value
    }
  }

  public convertFromString(value: string): unknown {
    try {
      switch (this.type) {
        case DataTypeCategory.STRING:
          return value
        case DataTypeCategory.NUMBER:
        case DataTypeCategory.FLOAT:
          return parseFloat(value)
        case DataTypeCategory.INTEGER:
          return parseInt(value, 10)
        case DataTypeCategory.BOOLEAN:
          return value.toLowerCase() === 'true'
        case DataTypeCategory.DATE:
        case DataTypeCategory.DATETIME:
          return new Date(value)
        default:
          return value
      }
    } catch {
      return null
    }
  }

  public convertToString(value: unknown): string {
    if (value === null || value === undefined) {
      return ''
    }

    if (value instanceof Date) {
      return value.toISOString()
    }

    return String(value)
  }

  public addConstraint(constraint: DataTypeConstraint): DataType {
    if (!this.isConstraintValid(constraint)) {
      throw new Error(`Invalid constraint: ${constraint.name}`)
    }

    const newConstraints = [...this.constraints, constraint]
    const newMetadata = {
      ...this.metadata,
      updatedAt: new Date()
    }

    return new DataType({
      ...this.props,
      constraints: newConstraints,
      metadata: newMetadata
    })
  }

  public removeConstraint(name: string): DataType {
    const newConstraints = this.constraints.filter(c => c.name !== name)
    const newMetadata = {
      ...this.metadata,
      updatedAt: new Date()
    }

    return new DataType({
      ...this.props,
      constraints: newConstraints,
      metadata: newMetadata
    })
  }

  public getConstraint(name: string): DataTypeConstraint | null {
    return this.constraints.find(c => c.name === name) || null
  }

  public hasConstraint(name: string): boolean {
    return this.constraints.some(c => c.name === name)
  }

  public isSupportedOn(platform: PlatformSupport): boolean {
    return this.platformSupport.includes(platform)
  }

  public getUnsupportedPlatforms(): PlatformSupport[] {
    const allPlatforms = Object.values(PlatformSupport)
    return allPlatforms.filter(platform => !this.platformSupport.includes(platform))
  }

  public addPlatformSupport(platform: PlatformSupport): DataType {
    if (this.platformSupport.includes(platform)) {
      return this
    }

    const newPlatformSupport = [...this.platformSupport, platform]
    const newMetadata = {
      ...this.metadata,
      updatedAt: new Date()
    }

    return new DataType({
      ...this.props,
      platformSupport: newPlatformSupport,
      metadata: newMetadata
    })
  }

  public toJSON(): DataTypeJSON {
    return {
      name: this.name,
      type: this.type,
      baseType: this.baseType?.name,
      constraints: this.constraints,
      defaultValue: this.defaultValue,
      isBuiltIn: this.isBuiltIn,
      isAbstract: this.isAbstract,
      platformSupport: this.platformSupport,
      metadata: {
        ...this.metadata,
        createdAt: this.metadata.createdAt.toISOString(),
        updatedAt: this.metadata.updatedAt.toISOString()
      }
    }
  }

  private isValidType(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true
    }

    switch (this.type) {
      case DataTypeCategory.STRING:
        return typeof value === 'string'
      case DataTypeCategory.NUMBER:
      case DataTypeCategory.FLOAT:
        return typeof value === 'number' && !isNaN(value)
      case DataTypeCategory.INTEGER:
        return typeof value === 'number' && Number.isInteger(value) && !isNaN(value)
      case DataTypeCategory.BOOLEAN:
        return typeof value === 'boolean'
      case DataTypeCategory.DATE:
      case DataTypeCategory.DATETIME:
        return value instanceof Date && !isNaN(value.getTime())
      case DataTypeCategory.ARRAY:
        return Array.isArray(value)
      case DataTypeCategory.OBJECT:
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      case DataTypeCategory.ANY:
        return true
      default:
        return true
    }
  }

  private validateConstraint(value: unknown, constraint: DataTypeConstraint): string | null {
    switch (constraint.name) {
      case 'minLength':
        if (typeof value === 'string' && value.length < (constraint.value as number)) {
          return `Value must be at least ${constraint.value} characters long`
        }
        break
      case 'maxLength':
        if (typeof value === 'string' && value.length > (constraint.value as number)) {
          return `Value must be at most ${constraint.value} characters long`
        }
        break
      case 'min':
        if (typeof value === 'number' && value < (constraint.value as number)) {
          return `Value must be at least ${constraint.value}`
        }
        break
      case 'max':
        if (typeof value === 'number' && value > (constraint.value as number)) {
          return `Value must be at most ${constraint.value}`
        }
        break
      case 'pattern':
        if (typeof value === 'string' && !new RegExp(constraint.value as string).test(value)) {
          return `Value does not match required pattern`
        }
        break
    }
    return null
  }

  private isConstraintValid(constraint: DataTypeConstraint): boolean {
    return (
      typeof constraint.name === 'string' &&
      constraint.name.length > 0 &&
      constraint.value !== undefined &&
      typeof constraint.type === 'string'
    )
  }

  public static create(props: Omit<DataTypeProps, 'metadata'>): DataType {
    const metadata: DataTypeMetadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0'
    }

    return new DataType({
      ...props,
      metadata
    })
  }

  public static primitive(name: string, defaultValue?: unknown): DataType {
    const type = this.getPrimitiveType(name)
    if (!type) {
      throw new Error(`Invalid primitive type: ${name}`)
    }

    return DataType.create({
      name,
      type,
      defaultValue,
      isBuiltIn: true,
      platformSupport: [PlatformSupport.WEB, PlatformSupport.IOS, PlatformSupport.ANDROID]
    })
  }

  public static complex(name: string, baseType?: DataType): DataType {
    return DataType.create({
      name,
      type: DataTypeCategory.OBJECT,
      baseType,
      platformSupport: baseType?.platformSupport || [PlatformSupport.WEB, PlatformSupport.IOS, PlatformSupport.ANDROID]
    })
  }

  public static custom(
    name: string,
    category: DataTypeCategory,
    validator: (value: unknown) => boolean,
    platformSupport: PlatformSupport[] = [PlatformSupport.WEB, PlatformSupport.IOS, PlatformSupport.ANDROID]
  ): DataType {
    return DataType.create({
      name,
      type: category,
      platformSupport
    })
  }

  private static getPrimitiveType(name: string): DataTypeCategory | null {
    const primitiveMap: Record<string, DataTypeCategory> = {
      string: DataTypeCategory.STRING,
      number: DataTypeCategory.NUMBER,
      boolean: DataTypeCategory.BOOLEAN,
      integer: DataTypeCategory.INTEGER,
      float: DataTypeCategory.FLOAT,
      date: DataTypeCategory.DATE,
      datetime: DataTypeCategory.DATETIME,
      time: DataTypeCategory.TIME
    }

    return primitiveMap[name] || null
  }
}