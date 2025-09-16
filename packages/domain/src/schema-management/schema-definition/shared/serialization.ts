export interface SerializationOptions {
  includeMetadata?: boolean
  includeValidation?: boolean
  maxDepth?: number
  pretty?: boolean
}

export interface SerializedSchema {
  id: string
  name: string
  version: string
  description?: string
  components: SerializedComponent[]
  globalProperties?: SerializedProperty[]
  validationRules?: SerializedValidationRule[]
  metadata?: {
    createdAt: string
    updatedAt: string
    [key: string]: unknown
  }
}

export interface SerializedComponent {
  id: string
  name: string
  type: string
  description?: string
  properties: SerializedProperty[]
  children?: SerializedComponent[]
  parentId?: string
  validationRules?: SerializedValidationRule[]
  events?: ComponentEvent[]
  styles?: ComponentStyle[]
}

export interface SerializedProperty {
  name: string
  type: SerializedDataType
  displayName: string
  description?: string
  defaultValue?: unknown
  isRequired: boolean
  isReadOnly: boolean
  validationRules?: SerializedValidationRule[]
  bindingOptions?: BindingOptions
  uiHint?: UIHint
}

export interface SerializedDataType {
  type: string
  subtype?: string
  constraints?: Record<string, unknown>
}

export interface SerializedValidationRule {
  name: string
  type: string
  displayName: string
  description?: string
  parameters: Record<string, unknown>
  errorMessage?: string
  severity: 'error' | 'warning' | 'info'
}

export interface ComponentEvent {
  name: string
  type: string
  handler: string
  parameters?: SerializedProperty[]
}

export interface ComponentStyle {
  property: string
  value: string | number
}

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

export class SchemaSerializer {
  private static defaultOptions: SerializationOptions = {
    includeMetadata: true,
    includeValidation: true,
    maxDepth: 10,
    pretty: false,
  }

  static serialize(schema: any, options?: SerializationOptions): string {
    const opts = { ...this.defaultOptions, ...options }
    const serialized = this.serializeToObj(schema, opts)

    return opts.pretty ? JSON.stringify(serialized, null, 2) : JSON.stringify(serialized)
  }

  static serializeToObj(schema: any, options: SerializationOptions): SerializedSchema {
    const seen = new WeakSet()
    return this.serializeSchema(schema, options, seen)
  }

  private static serializeSchema(schema: any, options: SerializationOptions, seen: WeakSet<any>): SerializedSchema {
    if (seen.has(schema)) {
      throw new Error('Circular reference detected')
    }
    seen.add(schema)

    const serialized: SerializedSchema = {
      id: schema.id?.toPrimitive?.() || schema.id,
      name: schema.name,
      version: `${schema.version?.major || 0}.${schema.version?.minor || 0}.${schema.version?.patch || 0}`,
      description: schema.description,
      components: schema.components?.map((c: any) => this.serializeComponent(c, options, seen)) || [],
    }

    if (options.includeMetadata && schema.metadata) {
      serialized.metadata = {
        createdAt: schema.metadata.createdAt?.toISOString?.() || schema.metadata.createdAt,
        updatedAt: schema.metadata.updatedAt?.toISOString?.() || schema.metadata.updatedAt,
        ...schema.metadata,
      }
    }

    // Check for any circular references in the schema object itself
    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === 'object' && value !== null && seen.has(value)) {
        throw new Error('Circular reference detected')
      }
    }

    if (schema.globalProperties) {
      serialized.globalProperties = schema.globalProperties?.map((p: any) => this.serializeProperty(p, options, seen))
    }

    if (options.includeValidation && schema.validationRules) {
      serialized.validationRules = schema.validationRules?.map((r: any) =>
        this.serializeValidationRule(r, options, seen),
      )
    }

    return serialized
  }

  private static serializeComponent(
    component: any,
    options: SerializationOptions,
    seen: WeakSet<any>,
  ): SerializedComponent {
    if (seen.has(component)) {
      throw new Error('Circular reference detected')
    }
    seen.add(component)

    const serialized: SerializedComponent = {
      id: component.id?.toPrimitive?.() || component.id,
      name: component.name,
      type: component.type,
      description: component.description,
      properties: component.properties?.map((p: any) => this.serializeProperty(p, options, seen)) || [],
    }

    if (component.children) {
      serialized.children = component.children?.map((c: any) => this.serializeComponent(c, options, seen))
    }

    if (component.parentId) {
      serialized.parentId = component.parentId?.toPrimitive?.() || component.parentId
    }

    if (options.includeValidation && component.validationRules) {
      serialized.validationRules = component.validationRules?.map((r: any) =>
        this.serializeValidationRule(r, options, seen),
      )
    }

    if (component.events) {
      serialized.events = component.events?.map((e: any) => this.serializeEvent(e, options, seen))
    }

    if (component.styles) {
      serialized.styles = component.styles?.map((s: any) => this.serializeStyle(s, options, seen))
    }

    return serialized
  }

  private static serializeProperty(
    property: any,
    options: SerializationOptions,
    seen: WeakSet<any>,
  ): SerializedProperty {
    if (seen.has(property)) {
      throw new Error('Circular reference detected')
    }
    seen.add(property)

    const serialized: SerializedProperty = {
      name: property.name,
      type: this.serializeDataType(property.type, options, seen),
      displayName: property.displayName,
      description: property.description,
      defaultValue: property.defaultValue,
      isRequired: property.isRequired || false,
      isReadOnly: property.isReadOnly || false,
    }

    if (options.includeValidation && property.validationRules) {
      serialized.validationRules = property.validationRules?.map((r: any) =>
        this.serializeValidationRule(r, options, seen),
      )
    }

    if (property.bindingOptions) {
      serialized.bindingOptions = {
        expression: property.bindingOptions.expression,
        type: property.bindingOptions.type,
      }
    }

    if (property.uiHint) {
      serialized.uiHint = property.uiHint
    }

    return serialized
  }

  private static serializeDataType(
    dataType: any,
    options: SerializationOptions,
    seen: WeakSet<any>,
  ): SerializedDataType {
    if (seen.has(dataType)) {
      throw new Error('Circular reference detected')
    }
    seen.add(dataType)

    const serialized: SerializedDataType = {
      type: dataType.type,
    }

    if (dataType.subtype) {
      serialized.subtype = dataType.subtype
    }

    if (dataType.constraints) {
      serialized.constraints = dataType.constraints
    }

    return serialized
  }

  private static serializeValidationRule(
    rule: any,
    options: SerializationOptions,
    seen: WeakSet<any>,
  ): SerializedValidationRule {
    if (seen.has(rule)) {
      throw new Error('Circular reference detected')
    }
    seen.add(rule)

    const serialized: SerializedValidationRule = {
      name: rule.name,
      type: rule.type,
      displayName: rule.displayName,
      description: rule.description,
      parameters: this.serializeParameters(rule.parameters, options, seen),
      errorMessage: rule.errorMessage,
      severity: rule.severity || 'error',
    }

    return serialized
  }

  private static serializeParameters(
    parameters: any[],
    options: SerializationOptions,
    seen: WeakSet<any>,
  ): Record<string, unknown> {
    const serialized: Record<string, unknown> = {}

    for (const param of parameters) {
      if (typeof param === 'object' && param !== null) {
        serialized[param.name] = param.value
      }
    }

    return serialized
  }

  private static serializeEvent(event: any, options: SerializationOptions, seen: WeakSet<any>): ComponentEvent {
    if (seen.has(event)) {
      throw new Error('Circular reference detected')
    }
    seen.add(event)

    const serialized: ComponentEvent = {
      name: event.name,
      type: event.type,
      handler: event.handler,
    }

    if (event.parameters) {
      serialized.parameters = event.parameters?.map((p: any) => this.serializeProperty(p, options, seen))
    }

    return serialized
  }

  private static serializeStyle(style: any, options: SerializationOptions, seen: WeakSet<any>): ComponentStyle {
    if (seen.has(style)) {
      throw new Error('Circular reference detected')
    }
    seen.add(style)

    return {
      property: style.property,
      value: style.value,
    }
  }

  static deserialize(json: string): any {
    try {
      const obj = JSON.parse(json)
      return this.deserializeFromObj(obj)
    } catch (error) {
      throw new Error(`Failed to deserialize schema: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static deserializeFromObj(obj: SerializedSchema): any {
    // This would be implemented to reconstruct the schema object
    // For now, return the object as-is
    return obj
  }
}
