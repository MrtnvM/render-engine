import { SemanticVersion } from '../kernel/value-objects/semantic-version.value-object.js'
import { Platform } from '../schema-management/shared/enums/platform-support.enum.js'
import { ConfigurationService, ConfigurationRequest } from '../schema-management/configuration/index.js'

export interface GetConfigurationRequest {
  scenarioId: string
  platform: Platform
  renderEngineVersion: string // Will be parsed to SemanticVersion
  userId: string
  experimentId?: string
}

export interface GetConfigurationResponse {
  schemaVersion: string
  renderEngine: {
    minVersion: string
    maxVersion: string
  }
  scenarioId: string
  platform: string
  lastModified: string
  etag: string
  config: Record<string, unknown>
}

export class GetConfigurationUseCase {
  constructor(private readonly configurationService: ConfigurationService) {}

  async execute(request: GetConfigurationRequest): Promise<GetConfigurationResponse> {
    // Parse and validate render engine version
    const renderEngineVersion = this.parseSemanticVersion(request.renderEngineVersion)

    // Validate inputs
    this.validateRequest(request)

    // Create domain request
    const domainRequest: ConfigurationRequest = {
      scenarioId: request.scenarioId,
      platform: request.platform,
      renderEngineVersion,
      userId: request.userId,
      experimentId: request.experimentId,
    }

    // Execute service call
    const response = await this.configurationService.getConfiguration(domainRequest)

    return this.mapToResponse(response)
  }

  private parseSemanticVersion(versionString: string): SemanticVersion {
    try {
      return SemanticVersion.fromString(versionString)
    } catch (error) {
      throw new Error(`Invalid semantic version format: ${versionString}`)
    }
  }

  private validateRequest(request: GetConfigurationRequest): void {
    if (!request.scenarioId || request.scenarioId.trim().length === 0) {
      throw new Error('scenarioId is required')
    }

    if (!request.platform || !Object.values(Platform).includes(request.platform)) {
      throw new Error('Invalid platform')
    }

    if (!request.renderEngineVersion || request.renderEngineVersion.trim().length === 0) {
      throw new Error('renderEngineVersion is required')
    }

    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('userId is required')
    }
  }

  private mapToResponse(domainResponse: any): GetConfigurationResponse {
    return {
      schemaVersion: domainResponse.schemaVersion,
      renderEngine: domainResponse.renderEngine,
      scenarioId: domainResponse.scenarioId,
      platform: domainResponse.platform,
      lastModified: domainResponse.lastModified,
      etag: domainResponse.etag,
      config: domainResponse.config,
    }
  }
}