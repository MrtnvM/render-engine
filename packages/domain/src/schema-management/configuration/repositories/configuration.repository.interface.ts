import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { SemanticVersion } from '../../../kernel/value-objects/semantic-version.value-object.js'
import { Platform } from '../../shared/enums/platform-support.enum.js'
import { Configuration } from '../entities/configuration.entity.js'

export interface ConfigurationRepository {
  /**
   * Find configuration by scenario ID and platform
   */
  findByScenarioAndPlatform(scenarioId: string, platform: Platform): Promise<Configuration | null>

  /**
   * Find all configurations for a scenario
   */
  findByScenario(scenarioId: string): Promise<Configuration[]>

  /**
   * Find configurations compatible with a specific render engine version
   */
  findCompatibleConfigurations(
    scenarioId: string,
    platform: Platform,
    renderEngineVersion: SemanticVersion,
  ): Promise<Configuration[]>

  /**
   * Find active configuration by scenario and platform
   */
  findActiveConfiguration(scenarioId: string, platform: Platform): Promise<Configuration | null>

  /**
   * Find configuration by ID
   */
  findById(id: ID): Promise<Configuration | null>

  /**
   * Save configuration
   */
  save(configuration: Configuration): Promise<void>

  /**
   * Delete configuration
   */
  delete(id: ID): Promise<void>

  /**
   * Find all configurations for a platform
   */
  findByPlatform(platform: Platform): Promise<Configuration[]>

  /**
   * Find default configuration for a platform
   */
  findDefaultForPlatform(platform: Platform): Promise<Configuration | null>
}