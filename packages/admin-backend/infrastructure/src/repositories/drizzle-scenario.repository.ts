import { injectable } from 'tsyringe'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { eq, and, desc } from 'drizzle-orm'
import type {
  IScenarioRepository,
  IScenario,
  ICreateScenarioData,
  IPaginated,
} from '@render-engine/admin-backend-domain'
import { scenarioTable } from '../database/schema.js'

/**
 * Реализация репозитория сценариев с использованием Drizzle ORM
 */
@injectable()
export class DrizzleScenarioRepository implements IScenarioRepository {
  constructor(private readonly db: PostgresJsDatabase<any>) {}

  /**
   * Найти сценарий по ID
   */
  async findById(id: string): Promise<IScenario | null> {
    const results = await this.db.select().from(scenarioTable).where(eq(scenarioTable.id, id)).limit(1)

    return results.length > 0 ? this.mapToEntity(results[0]) : null
  }

  /**
   * Проверить существование сценария по ID
   */
  async exists(id: string): Promise<boolean> {
    const results = await this.db
      .select({ id: scenarioTable.id })
      .from(scenarioTable)
      .where(eq(scenarioTable.id, id))
      .limit(1)

    return results.length > 0
  }

  /**
   * Получить все сценарии с пагинацией
   */
  async findAll(options?: { page?: number; limit?: number }): Promise<IPaginated<IScenario>> {
    const page = options?.page || 1
    const limit = options?.limit || 10
    const offset = (page - 1) * limit

    const [items, totalResult] = await Promise.all([
      this.db.select().from(scenarioTable).orderBy(desc(scenarioTable.updatedAt)).limit(limit).offset(offset),
      this.db.select({ count: scenarioTable.id }).from(scenarioTable),
    ])

    return {
      items: items.map((item) => this.mapToEntity(item)),
      total: totalResult.length,
      page,
      limit,
    }
  }

  /**
   * Сохранить сценарий (обновить существующий)
   */
  async save(entity: IScenario): Promise<IScenario> {
    const results = await this.db
      .update(scenarioTable)
      .set({
        key: entity.key,
        version: entity.version,
        buildNumber: entity.buildNumber,
        mainComponent: entity.mainComponent,
        components: entity.components,
        metadata: entity.metadata,
        updatedAt: new Date(),
      })
      .where(eq(scenarioTable.id, entity.id))
      .returning()

    if (results.length === 0) {
      throw new Error(`Scenario with ID '${entity.id}' not found`)
    }

    return this.mapToEntity(results[0])
  }

  /**
   * Удалить сценарий
   */
  async delete(id: string): Promise<void> {
    await this.db.delete(scenarioTable).where(eq(scenarioTable.id, id))
  }

  /**
   * Найти сценарий по ключу (возвращает последнюю версию)
   */
  async findByKey(key: string): Promise<IScenario | null> {
    const results = await this.db
      .select()
      .from(scenarioTable)
      .where(eq(scenarioTable.key, key))
      .orderBy(desc(scenarioTable.version), desc(scenarioTable.buildNumber))
      .limit(1)

    return results.length > 0 ? this.mapToEntity(results[0]) : null
  }

  /**
   * Найти сценарий по ключу и версии
   */
  async findByKeyAndVersion(key: string, version: string): Promise<IScenario | null> {
    const results = await this.db
      .select()
      .from(scenarioTable)
      .where(and(eq(scenarioTable.key, key), eq(scenarioTable.version, version)))
      .orderBy(desc(scenarioTable.buildNumber))
      .limit(1)

    return results.length > 0 ? this.mapToEntity(results[0]) : null
  }

  /**
   * Получить все версии сценария по ключу
   */
  async findVersionsByKey(key: string): Promise<IScenario[]> {
    const results = await this.db
      .select()
      .from(scenarioTable)
      .where(eq(scenarioTable.key, key))
      .orderBy(desc(scenarioTable.version), desc(scenarioTable.buildNumber))

    return results.map((result) => this.mapToEntity(result))
  }

  /**
   * Создать новую версию сценария
   * Автоматически инкрементирует buildNumber если версия совпадает
   */
  async create(data: ICreateScenarioData): Promise<IScenario> {
    // Получить последний buildNumber для данной версии
    const latestBuildNumber = await this.getLatestBuildNumber(data.key, data.version || '1.0.0')

    const results = await this.db
      .insert(scenarioTable)
      .values({
        key: data.key,
        version: data.version || '1.0.0',
        buildNumber: latestBuildNumber + 1,
        mainComponent: data.mainComponent,
        components: data.components,
        metadata: data.metadata || {},
      })
      .returning()

    return this.mapToEntity(results[0])
  }

  /**
   * Проверить существование сценария по ключу
   */
  async existsByKey(key: string): Promise<boolean> {
    const results = await this.db
      .select({ key: scenarioTable.key })
      .from(scenarioTable)
      .where(eq(scenarioTable.key, key))
      .limit(1)

    return results.length > 0
  }

  /**
   * Получить последний buildNumber для заданного ключа и версии
   */
  async getLatestBuildNumber(key: string, version: string): Promise<number> {
    const results = await this.db
      .select({ buildNumber: scenarioTable.buildNumber })
      .from(scenarioTable)
      .where(and(eq(scenarioTable.key, key), eq(scenarioTable.version, version)))
      .orderBy(desc(scenarioTable.buildNumber))
      .limit(1)

    return results.length > 0 ? results[0].buildNumber : 0
  }

  /**
   * Преобразовать запись из БД в сущность
   */
  private mapToEntity(record: any): IScenario {
    return {
      id: record.id,
      key: record.key,
      version: record.version,
      buildNumber: record.buildNumber,
      mainComponent: record.mainComponent,
      components: record.components,
      metadata: record.metadata,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  }
}
