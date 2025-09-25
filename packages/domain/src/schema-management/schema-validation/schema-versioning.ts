import { ValidationSchema } from './validation-engine.js'

export interface SchemaVersion {
  major: number
  minor: number
  patch: number
  build?: string
}

export interface SchemaMigration {
  fromVersion: SchemaVersion
  toVersion: SchemaVersion
  description: string
  breaking: boolean
  migrationFn: (data: unknown) => unknown
}

export interface SchemaVersionHistory {
  currentVersion: SchemaVersion
  migrations: SchemaMigration[]
  supportedVersions: SchemaVersion[]
}

export interface VersionedSchema {
  version: SchemaVersion
  schema: ValidationSchema
  metadata: {
    createdAt: Date
    createdBy: string
    description?: string
    breakingChanges: string[]
    deprecationNotes?: string[]
  }
}

export class SchemaVersionManager {
  private versionHistory: SchemaVersionHistory
  private schemas: Map<string, VersionedSchema>
  private migrations: Map<string, SchemaMigration>

  constructor(versionHistory: SchemaVersionHistory) {
    this.versionHistory = versionHistory
    this.schemas = new Map()
    this.migrations = new Map()
    this.initializeMigrations()
  }

  public getCurrentVersion(): SchemaVersion {
    return this.versionHistory.currentVersion
  }

  public getSupportedVersions(): SchemaVersion[] {
    return [...this.versionHistory.supportedVersions]
  }

  public isVersionSupported(version: SchemaVersion): boolean {
    const versionKey = this.versionToString(version)
    return this.versionHistory.supportedVersions.some((v) => this.versionToString(v) === versionKey)
  }

  public isBreakingChange(fromVersion: SchemaVersion, toVersion: SchemaVersion): boolean {
    if (fromVersion.major !== toVersion.major) {
      return toVersion.major > fromVersion.major
    }

    // Check if there's a breaking migration between versions
    const migrations = this.getMigrationsBetweenVersions(fromVersion, toVersion)
    return migrations.some((m) => m.breaking)
  }

  public async migrateData(
    data: unknown,
    fromVersion: SchemaVersion,
    toVersion: SchemaVersion,
  ): Promise<unknown> {
    if (this.versionsEqual(fromVersion, toVersion)) {
      return data
    }

    const migrations = this.getMigrationsBetweenVersions(fromVersion, toVersion)

    if (migrations.length === 0) {
      throw new Error(`No migration path found from ${this.versionToString(fromVersion)} to ${this.versionToString(toVersion)}`)
    }

    let migratedData = data

    for (const migration of migrations) {
      try {
        migratedData = await migration.migrationFn(migratedData)
      } catch (error) {
        throw new Error(
          `Migration failed: ${migration.description}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
    }

    return migratedData
  }

  public getSchemaForVersion(version: SchemaVersion): VersionedSchema | null {
    const versionKey = this.versionToString(version)
    return this.schemas.get(versionKey) || null
  }

  public registerSchema(schema: VersionedSchema): void {
    const versionKey = this.versionToString(schema.version)
    this.schemas.set(versionKey, schema)
  }

  public addMigration(migration: SchemaMigration): void {
    const key = `${this.versionToString(migration.fromVersion)}->${this.versionToString(migration.toVersion)}`
    this.migrations.set(key, migration)
  }

  public getMigrationsBetweenVersions(fromVersion: SchemaVersion, toVersion: SchemaVersion): SchemaMigration[] {
    const migrations: SchemaMigration[] = []

    // Simple approach: find direct migration path
    const key = `${this.versionToString(fromVersion)}->${this.versionToString(toVersion)}`
    const directMigration = this.migrations.get(key)

    if (directMigration) {
      migrations.push(directMigration)
    } else {
      // For more complex version paths, we'd need a graph traversal algorithm
      // For now, we'll throw an error for unsupported migration paths
      throw new Error(`No direct migration path from ${this.versionToString(fromVersion)} to ${this.versionToString(toVersion)}`)
    }

    return migrations
  }

  public createVersionedSchema(
    version: SchemaVersion,
    schema: ValidationSchema,
    metadata: Omit<VersionedSchema['metadata'], 'createdAt'>,
  ): VersionedSchema {
    return {
      version,
      schema,
      metadata: {
        ...metadata,
        createdAt: new Date(),
      },
    }
  }

  public parseVersion(versionString: string): SchemaVersion {
    const parts = versionString.split(/[-.]/)
    if (parts.length < 3) {
      throw new Error('Invalid version string format. Expected: major.minor.patch[-build]')
    }

    const major = parseInt(parts[0], 10)
    const minor = parseInt(parts[1], 10)
    const patch = parseInt(parts[2], 10)
    const build = parts[3] || undefined

    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      throw new Error('Invalid version string: numeric parts required')
    }

    return { major, minor, patch, build }
  }

  public versionToString(version: SchemaVersion): string {
    let versionStr = `${version.major}.${version.minor}.${version.patch}`
    if (version.build) {
      versionStr += `-${version.build}`
    }
    return versionStr
  }

  public compareVersions(v1: SchemaVersion, v2: SchemaVersion): number {
    if (v1.major !== v2.major) {
      return v1.major - v2.major
    }
    if (v1.minor !== v2.minor) {
      return v1.minor - v2.minor
    }
    if (v1.patch !== v2.patch) {
      return v1.patch - v2.patch
    }
    return 0
  }

  public isVersionGreater(v1: SchemaVersion, v2: SchemaVersion): boolean {
    return this.compareVersions(v1, v2) > 0
  }

  public isVersionLess(v1: SchemaVersion, v2: SchemaVersion): boolean {
    return this.compareVersions(v1, v2) < 0
  }

  public isVersionEqual(v1: SchemaVersion, v2: SchemaVersion): boolean {
    return this.compareVersions(v1, v2) === 0
  }

  private versionsEqual(v1: SchemaVersion, v2: SchemaVersion): boolean {
    return this.isVersionEqual(v1, v2)
  }

  private initializeMigrations(): void {
    // Register all migrations
    for (const migration of this.versionHistory.migrations) {
      this.addMigration(migration)
    }
  }

  public static create(
    versionHistory: SchemaVersionHistory,
  ): SchemaVersionManager {
    return new SchemaVersionManager(versionHistory)
  }

  public static createWithDefaultHistory(): SchemaVersionManager {
    const defaultHistory: SchemaVersionHistory = {
      currentVersion: { major: 1, minor: 0, patch: 0 },
      supportedVersions: [
        { major: 1, minor: 0, patch: 0 },
        { major: 1, minor: 0, patch: 1 },
        { major: 1, minor: 0, patch: 2 },
      ],
      migrations: [],
    }

    return new SchemaVersionManager(defaultHistory)
  }
}

// Migration utilities
export class SchemaMigrationUtils {
  public static migrateToAddComponentProperty(
    componentType: string,
    propertyName: string,
    defaultValue: unknown,
  ): (data: unknown) => unknown {
    return (data: unknown) => {
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return data
      }

      const config = data as Record<string, unknown>
      const components = config.components

      if (!Array.isArray(components)) {
        return data
      }

      for (const component of components) {
        if (typeof component === 'object' && component !== null && !Array.isArray(component)) {
          const comp = component as Record<string, unknown>

          if (comp.type === componentType) {
            if (!comp.props) {
              comp.props = {}
            }

            if (typeof comp.props === 'object' && !Array.isArray(comp.props)) {
              const props = comp.props as Record<string, unknown>
              if (!(propertyName in props)) {
                props[propertyName] = defaultValue
              }
            }
          }
        }
      }

      return data
    }
  }

  public static migrateToRenameComponentProperty(
    componentType: string,
    oldProperty: string,
    newProperty: string,
  ): (data: unknown) => unknown {
    return (data: unknown) => {
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return data
      }

      const config = data as Record<string, unknown>
      const components = config.components

      if (!Array.isArray(components)) {
        return data
      }

      for (const component of components) {
        if (typeof component === 'object' && component !== null && !Array.isArray(component)) {
          const comp = component as Record<string, unknown>

          if (comp.type === componentType) {
            if (comp.props && typeof comp.props === 'object' && !Array.isArray(comp.props)) {
              const props = comp.props as Record<string, unknown>

              if (oldProperty in props && !(newProperty in props)) {
                props[newProperty] = props[oldProperty]
                delete props[oldProperty]
              }
            }
          }
        }
      }

      return data
    }
  }

  public static migrateToRemoveComponentProperty(
    componentType: string,
    propertyName: string,
  ): (data: unknown) => unknown {
    return (data: unknown) => {
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return data
      }

      const config = data as Record<string, unknown>
      const components = config.components

      if (!Array.isArray(components)) {
        return data
      }

      for (const component of components) {
        if (typeof component === 'object' && component !== null && !Array.isArray(component)) {
          const comp = component as Record<string, unknown>

          if (comp.type === componentType) {
            if (comp.props && typeof comp.props === 'object' && !Array.isArray(comp.props)) {
              const props = comp.props as Record<string, unknown>
              delete props[propertyName]
            }
          }
        }
      }

      return data
    }
  }

  public static migrateToChangeComponentType(
    oldType: string,
    newType: string,
    propertyMapping?: Record<string, string>,
  ): (data: unknown) => unknown {
    return (data: unknown) => {
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return data
      }

      const config = data as Record<string, unknown>
      const components = config.components

      if (!Array.isArray(components)) {
        return data
      }

      for (const component of components) {
        if (typeof component === 'object' && component !== null && !Array.isArray(component)) {
          const comp = component as Record<string, unknown>

          if (comp.type === oldType) {
            comp.type = newType

            // Map properties if specified
            if (propertyMapping && comp.props && typeof comp.props === 'object') {
              const props = comp.props as Record<string, unknown>

              for (const [oldProp, newProp] of Object.entries(propertyMapping)) {
                if (oldProp in props && !(newProp in props)) {
                  props[newProp] = props[oldProp]
                  delete props[oldProp]
                }
              }
            }
          }
        }
      }

      return data
    }
  }

  public static migrateToUpdateScenarioDataStructure(
    keyPath: string,
    transformation: (value: unknown) => unknown,
  ): (data: unknown) => unknown {
    return (data: unknown) => {
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return data
      }

      const config = data as Record<string, unknown>

      if (config.scenarioData && typeof config.scenarioData === 'object' && !Array.isArray(config.scenarioData)) {
        const scenarioData = config.scenarioData as Record<string, unknown>

        if (keyPath in scenarioData) {
          scenarioData[keyPath] = transformation(scenarioData[keyPath])
        }
      }

      return data
    }
  }
}

// Example version history for the validation system
export const createDefaultVersionHistory = (): SchemaVersionHistory => ({
  currentVersion: { major: 1, minor: 0, patch: 0 },
  supportedVersions: [
    { major: 1, minor: 0, patch: 0 },
  ],
  migrations: [
    {
      fromVersion: { major: 1, minor: 0, patch: 0 },
      toVersion: { major: 1, minor: 0, patch: 1 },
      description: 'Add support for new component properties',
      breaking: false,
      migrationFn: SchemaMigrationUtils.migrateToAddComponentProperty('Button', 'variant', 'primary'),
    },
    {
      fromVersion: { major: 1, minor: 0, patch: 1 },
      toVersion: { major: 1, minor: 0, patch: 2 },
      description: 'Rename component properties for consistency',
      breaking: false,
      migrationFn: SchemaMigrationUtils.migrateToRenameComponentProperty('Button', 'onClick', 'action'),
    },
  ],
})