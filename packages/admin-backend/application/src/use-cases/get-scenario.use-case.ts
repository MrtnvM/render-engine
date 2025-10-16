import { injectable, inject } from 'tsyringe'
import type { ScenarioResponseDto } from '../dtos/scenario-response.dto.js'
import type { IScenarioRepository, IScenario } from '@render-engine/admin-backend-domain'

/**
 * Use Case для получения сценария из базы данных
 *
 * Ответственности:
 * - Получение сценария по ключу
 * - Получение сценария по ключу и версии
 * - Получение истории версий сценария
 */
@injectable()
export class GetScenarioUseCase {
  constructor(
    @inject('IScenarioRepository')
    private readonly scenarioRepository: IScenarioRepository,
  ) {}

  /**
   * Получает последнюю версию сценария по ключу
   *
   * @param key - Ключ сценария
   * @returns Сценарий или null если не найден
   */
  async getByKey(key: string): Promise<ScenarioResponseDto | null> {
    const scenario = await this.scenarioRepository.findByKey(key)

    if (!scenario) {
      return null
    }

    return this.mapToDto(scenario)
  }

  /**
   * Получает сценарий по ключу и версии
   *
   * @param key - Ключ сценария
   * @param version - Версия сценария
   * @returns Сценарий или null если не найден
   */
  async getByKeyAndVersion(key: string, version: string): Promise<ScenarioResponseDto | null> {
    const scenario = await this.scenarioRepository.findByKeyAndVersion(key, version)

    if (!scenario) {
      return null
    }

    return this.mapToDto(scenario)
  }

  /**
   * Получает все версии сценария по ключу
   *
   * @param key - Ключ сценария
   * @returns Массив всех версий сценария
   */
  async getVersions(key: string): Promise<ScenarioResponseDto[]> {
    const scenarios = await this.scenarioRepository.findVersionsByKey(key)

    return scenarios.map((scenario) => this.mapToDto(scenario))
  }

  /**
   * Преобразует сущность сценария в DTO
   */
  private mapToDto(scenario: IScenario): ScenarioResponseDto {
    return {
      id: scenario.id,
      key: scenario.key,
      version: scenario.version,
      buildNumber: scenario.buildNumber,
      mainComponent: scenario.mainComponent,
      components: scenario.components,
      metadata: scenario.metadata,
      createdAt: scenario.createdAt,
      updatedAt: scenario.updatedAt,
    }
  }
}
