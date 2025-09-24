import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { SemanticVersion } from '../../../kernel/value-objects/semantic-version.value-object.js'
import { Platform } from '../../shared/enums/platform-support.enum.js'

interface ConfigurationData {
  id: ID
  scenarioId: string
  platform: Platform
  minRenderEngineVersion: SemanticVersion
  maxRenderEngineVersion: SemanticVersion
  schema: Record<string, unknown>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class Configuration {
  private constructor(private readonly data: ConfigurationData) {}

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

  get id(): ID {
    return this.data.id
  }

  get scenarioId(): string {
    return this.data.scenarioId
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

  get schema(): Record<string, unknown> {
    return this.data.schema
  }

  get isActive(): boolean {
    return this.data.isActive
  }

  get createdAt(): Date {
    return this.data.createdAt
  }

  get updatedAt(): Date {
    return this.data.updatedAt
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

  public updateSchema(newSchema: Record<string, unknown>): void {
    this.data.schema = newSchema
    this.data.updatedAt = new Date()
  }

  public updateRenderEngineVersionRange(minVersion: SemanticVersion, maxVersion: SemanticVersion): void {
    this.data.minRenderEngineVersion = minVersion
    this.data.maxRenderEngineVersion = maxVersion
    this.data.updatedAt = new Date()
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.data.id.toString(),
      scenario_id: this.scenarioId,
      platform: this.platform,
      min_render_engine_version: this.minRenderEngineVersion.toString(),
      max_render_engine_version: this.maxRenderEngineVersion.toString(),
      schema_version: '1.0.0', // TODO: Extract from schema when schema entity is available
      config: this.schema,
      is_active: this.isActive,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    }
  }
}