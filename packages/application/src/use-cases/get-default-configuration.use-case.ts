import { Platform } from '../schema-management/shared/enums/platform-support.enum.js'
import { ConfigurationService } from '../schema-management/configuration/index.js'

export interface GetDefaultConfigurationRequest {
  scenarioId?: string
  platform?: Platform
}

export interface GetDefaultConfigurationResponse {
  schemaVersion: string
  scenarioId: string
  config: Record<string, unknown>
}

export class GetDefaultConfigurationUseCase {
  constructor(private readonly configurationService: ConfigurationService) {}

  async execute(request: GetDefaultConfigurationRequest = {}): Promise<GetDefaultConfigurationResponse> {
    // Validate inputs
    this.validateRequest(request)

    // Execute service call
    const response = await this.configurationService.getDefaultConfiguration(
      request.scenarioId,
      request.platform,
    )

    return this.mapToResponse(response)
  }

  private validateRequest(request: GetDefaultConfigurationRequest): void {
    if (request.scenarioId && request.scenarioId.trim().length === 0) {
      throw new Error('scenarioId cannot be empty string')
    }

    if (request.platform && !Object.values(Platform).includes(request.platform)) {
      throw new Error('Invalid platform')
    }
  }

  private mapToResponse(domainResponse: any): GetDefaultConfigurationResponse {
    return {
      schemaVersion: domainResponse.schemaVersion,
      scenarioId: domainResponse.scenarioId,
      config: domainResponse.config,
    }
  }
}