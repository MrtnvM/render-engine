import { Entity, EntityData } from '../../../kernel/entities/base.entity.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { Name, Description, SemanticVersion } from '../../../kernel/value-objects/index.js'
import { Platform } from '../../shared/enums/platform-support.enum.js'
import { Schema } from '../../schema-definition/entities/schema.entity.js'

interface ConfigurationData extends EntityData {
  scenarioId: string
  name: Name
  description: Description
  platform: Platform
  minRenderEngineVersion: SemanticVersion
  maxRenderEngineVersion: SemanticVersion
  schema: Schema
  isActive: boolean
}

export class Configuration extends Entity<ConfigurationData> {
  private constructor(props: ConfigurationData) {
    super(props)
  }

  public static create(
    props: Omit<ConfigurationData, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID; createdAt?: Date; updatedAt?: Date },
  ): Configuration {
    const data: ConfigurationData = {
      ...props,
      id: props.id ?? ID.generate(),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }

    return new Configuration(data)
  }

  get scenarioId(): string {
    return this.data.scenarioId
  }

  get name(): Name {
    return this.data.name
  }

  get description(): Description {
    return this.data.description
  }

  get platform(): Platform {
    return this.data.platform
  }

  get minRenderEngineVersion(): SemanticVersion {
    return this.data.minRenderEngineVersion
  }

  get maxRenderEngineVersion(): SemanticVersion {
    return this.data.maxRenderEngineVersion
  }

  get schema(): Schema {
    return this.data.schema
  }

  get isActive(): boolean {
    return this.data.isActive
  }

  public isCompatibleWith(renderEngineVersion: SemanticVersion): boolean {
    const minVersion = this.minRenderEngineVersion
    const maxVersion = this.maxRenderEngineVersion

    // Check if render engine version is within the supported range
    const isGreaterThanOrEqualMin = renderEngineVersion.compareTo(minVersion) >= 0
    const isLessThanOrEqualMax = renderEngineVersion.compareTo(maxVersion) <= 0

    return isGreaterThanOrEqualMin && isLessThanOrEqualMax
  }

  public deactivate(): void {
    this.data.isActive = false
    this.data.updatedAt = new Date()
  }

  public activate(): void {
    this.data.isActive = true
    this.data.updatedAt = new Date()
  }

  public updateSchema(newSchema: Schema): void {
    this.data.schema = newSchema
    this.data.updatedAt = new Date()
  }

  public updateRenderEngineVersionRange(minVersion: SemanticVersion, maxVersion: SemanticVersion): void {
    this.data.minRenderEngineVersion = minVersion
    this.data.maxRenderEngineVersion = maxVersion
    this.data.updatedAt = new Date()
  }

  public toJSON(): Record<string, unknown> {
    const json = super.toJSON()

    return {
      ...json,
      scenario_id: this.scenarioId,
      platform: this.platform,
      min_render_engine_version: this.minRenderEngineVersion.toString(),
      max_render_engine_version: this.maxRenderEngineVersion.toString(),
      schema_version: this.schema.version.toString(),
      config: this.schema.toJSON(),
    }
  }
}