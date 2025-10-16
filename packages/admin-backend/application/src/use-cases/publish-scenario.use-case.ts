import { injectable, inject } from 'tsyringe'
import type { PublishScenarioDto } from '../dtos/publish-scenario.dto.js'
import type { ScenarioResponseDto } from '../dtos/scenario-response.dto.js'
import type { IScenarioRepository } from '@render-engine/admin-backend-domain'

/**
 * Use Case для публикации скомпилированного сценария в базу данных
 *
 * Ответственности:
 * - Валидация данных сценария
 * - Проверка версий и управление buildNumber
 * - Сохранение сценария через репозиторий
 * - Возврат опубликованного сценария
 */
@injectable()
export class PublishScenarioUseCase {
  constructor(
    @inject('IScenarioRepository')
    private readonly scenarioRepository: IScenarioRepository,
  ) {}

  /**
   * Публикует скомпилированный сценарий
   *
   * @param dto - DTO со скомпилированным сценарием
   * @returns Опубликованный сценарий с ID и метаданными
   * @throws PublishError если публикация не удалась
   */
  async execute(dto: PublishScenarioDto): Promise<ScenarioResponseDto> {
    try {
      // Валидация входных данных
      this.validatePublishData(dto)

      // Создание сценария через репозиторий
      // Репозиторий автоматически инкрементирует buildNumber
      const createdScenario = await this.scenarioRepository.create({
        key: dto.key,
        version: dto.version,
        mainComponent: dto.mainComponent,
        components: dto.components,
        metadata: {
          ...dto.metadata,
          stores: dto.stores,
          actions: dto.actions,
          publishedAt: new Date().toISOString(),
        },
      })

      // Формирование ответа
      return {
        id: createdScenario.id,
        key: createdScenario.key,
        version: createdScenario.version,
        buildNumber: createdScenario.buildNumber,
        mainComponent: createdScenario.mainComponent,
        components: createdScenario.components,
        metadata: createdScenario.metadata,
        createdAt: createdScenario.createdAt,
        updatedAt: createdScenario.updatedAt,
      }
    } catch (error: any) {
      if (error instanceof PublishError) {
        throw error
      }

      throw new PublishError(`Failed to publish scenario: ${error.message}`)
    }
  }

  /**
   * Валидация данных для публикации
   */
  private validatePublishData(dto: PublishScenarioDto): void {
    if (!dto.key || dto.key.trim().length === 0) {
      throw new PublishError('Scenario key is required')
    }

    if (!dto.mainComponent || Object.keys(dto.mainComponent).length === 0) {
      throw new PublishError('Main component is required')
    }

    if (!dto.version || dto.version.trim().length === 0) {
      throw new PublishError('Version is required')
    }

    // Валидация формата версии (semver)
    const semverRegex = /^\d+\.\d+\.\d+$/
    if (!semverRegex.test(dto.version)) {
      throw new PublishError('Version must follow semantic versioning format (x.y.z)')
    }
  }
}

/**
 * Ошибка публикации сценария
 */
export class PublishError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PublishError'
  }
}
