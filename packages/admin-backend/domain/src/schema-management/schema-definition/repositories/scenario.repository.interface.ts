import { IBaseRepository } from '../../../kernel/repositories/base.repository.js'

/**
 * Интерфейс сценария для работы с репозиторием
 * Представляет скомпилированный сценарий, готовый к публикации и использованию
 */
export interface IScenario {
  id: string
  key: string
  version: string
  buildNumber: number
  mainComponent: Record<string, any>
  components: Record<string, any>
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

/**
 * Данные для создания нового сценария
 */
export interface ICreateScenarioData {
  key: string
  version?: string
  mainComponent: Record<string, any>
  components: Record<string, any>
  metadata?: Record<string, any>
}

/**
 * Репозиторий для работы со сценариями
 * Обеспечивает персистентность скомпилированных сценариев
 */
export interface IScenarioRepository extends IBaseRepository<IScenario> {
  /**
   * Найти сценарий по ключу (возвращает последнюю версию)
   */
  findByKey(key: string): Promise<IScenario | null>

  /**
   * Найти сценарий по ключу и версии
   */
  findByKeyAndVersion(key: string, version: string): Promise<IScenario | null>

  /**
   * Получить все версии сценария по ключу
   */
  findVersionsByKey(key: string): Promise<IScenario[]>

  /**
   * Создать новую версию сценария
   * Автоматически инкрементирует buildNumber если версия совпадает
   */
  create(data: ICreateScenarioData): Promise<IScenario>

  /**
   * Проверить существование сценария по ключу
   */
  existsByKey(key: string): Promise<boolean>

  /**
   * Получить последний buildNumber для заданного ключа и версии
   */
  getLatestBuildNumber(key: string, version: string): Promise<number>
}
