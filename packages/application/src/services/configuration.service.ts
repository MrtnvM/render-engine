import { SemanticVersion } from '../kernel/value-objects/semantic-version.value-object.js'
import { Platform } from '../schema-management/shared/enums/platform-support.enum.js'
import {
  Configuration,
  ConfigurationRepository,
  ConfigurationRequest,
  ConfigurationResponse,
  ConfigurationService,
} from '../schema-management/configuration/index.js'

// TODO: This would integrate with an actual experiment service
interface ExperimentService {
  resolveExperimentVariant(scenarioId: string, userId: string, experimentId?: string): Promise<string>
}

export class ConfigurationServiceImpl implements ConfigurationService {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
    private readonly experimentService: ExperimentService,
  ) {}

  async getConfiguration(request: ConfigurationRequest): Promise<ConfigurationResponse> {
    const { scenarioId, platform, renderEngineVersion, userId, experimentId } = request

    // Resolve experiment variant
    const variant = await this.experimentService.resolveExperimentVariant(scenarioId, userId, experimentId)

    // Find compatible configurations
    const configurations = await this.configurationRepository.findCompatibleConfigurations(
      scenarioId,
      platform,
      renderEngineVersion,
    )

    if (configurations.length === 0) {
      // Fallback to default configuration
      return this.getDefaultConfiguration(scenarioId, platform)
    }

    // Find the configuration for the resolved variant
    const configuration = configurations.find(config => config.scenarioId === `${scenarioId}_${variant}`) ||
                         configurations.find(config => config.scenarioId === scenarioId)

    if (!configuration) {
      // Fallback to default configuration
      return this.getDefaultConfiguration(scenarioId, platform)
    }

    return this.mapConfigurationToResponse(configuration)
  }

  async getDefaultConfiguration(scenarioId?: string, platform?: Platform): Promise<ConfigurationResponse> {
    // If scenario is specified, try to find default for that scenario
    if (scenarioId) {
      const configuration = await this.configurationRepository.findByScenarioAndPlatform(
        `default_${scenarioId}`,
        platform || Platform.WEB,
      )

      if (configuration) {
        return this.mapConfigurationToResponse(configuration)
      }
    }

    // Fallback to global default for platform
    const defaultConfig = await this.configurationRepository.findDefaultForPlatform(
      platform || Platform.WEB,
    )

    if (defaultConfig) {
      return this.mapConfigurationToResponse(defaultConfig)
    }

    // Ultimate fallback - create a basic default response
    return this.createFallbackDefaultResponse(scenarioId || 'default', platform || Platform.WEB)
  }

  async hasConfiguration(scenarioId: string, platform: Platform): Promise<boolean> {
    const configuration = await this.configurationRepository.findByScenarioAndPlatform(scenarioId, platform)
    return configuration !== null && configuration.isActive
  }

  async getAvailableScenarios(platform: Platform): Promise<string[]> {
    const configurations = await this.configurationRepository.findByPlatform(platform)
    const scenarioIds = configurations
      .filter(config => config.isActive)
      .map(config => config.scenarioId)
      .filter((scenarioId, index, array) => array.indexOf(scenarioId) === index) // Remove duplicates

    return scenarioIds
  }

  async isCompatible(scenarioId: string, platform: Platform, renderEngineVersion: SemanticVersion): Promise<boolean> {
    const configuration = await this.configurationRepository.findByScenarioAndPlatform(scenarioId, platform)
    if (!configuration) {
      return false
    }

    return configuration.isCompatibleWith(renderEngineVersion)
  }

  private mapConfigurationToResponse(configuration: Configuration): ConfigurationResponse {
    return {
      schemaVersion: configuration.schema.version.toString(),
      renderEngine: {
        minVersion: configuration.minRenderEngineVersion.toString(),
        maxVersion: configuration.maxRenderEngineVersion.toString(),
      },
      scenarioId: configuration.scenarioId,
      platform: configuration.platform,
      lastModified: configuration.updatedAt.toISOString(),
      etag: this.generateETag(configuration),
      config: configuration.toJSON().config as Record<string, unknown>,
    }
  }

  private createFallbackDefaultResponse(scenarioId: string, platform: Platform): ConfigurationResponse {
    return {
      schemaVersion: '1.0.0',
      renderEngine: {
        minVersion: '1.0.0',
        maxVersion: '99.99.99',
      },
      scenarioId: 'default',
      platform: platform,
      lastModified: new Date().toISOString(),
      etag: this.generateETagForDefault(scenarioId, platform),
      config: {
        type: 'Screen',
        id: 'default_screen',
        children: [
          {
            type: 'Text',
            props: { text: 'Something went wrong. Please try again.' },
          },
        ],
      },
    }
  }

  private generateETag(configuration: Configuration): string {
    return `"${configuration.id.toPrimitive()}-${configuration.schema.version.toString()}"`
  }

  private generateETagForDefault(scenarioId: string, platform: Platform): string {
    return `"default-${scenarioId}-${platform}"`
  }
}