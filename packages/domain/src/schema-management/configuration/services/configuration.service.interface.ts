import { SemanticVersion } from '../../../kernel/value-objects/semantic-version.value-object.js'
import { Platform } from '../../shared/enums/platform-support.enum.js'

export interface ConfigurationRequest {
  scenarioId: string
  platform: Platform
  renderEngineVersion: SemanticVersion
  userId: string
  experimentId?: string
}

export interface ConfigurationResponse {
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

export interface ConfigurationService {
  /**
   * Get configuration for a scenario with experiment resolution
   */
  getConfiguration(request: ConfigurationRequest): Promise<ConfigurationResponse>

  /**
   * Get default configuration for a platform
   */
  getDefaultConfiguration(scenarioId?: string, platform?: Platform): Promise<ConfigurationResponse>

  /**
   * Check if configuration exists for scenario and platform
   */
  hasConfiguration(scenarioId: string, platform: Platform): Promise<boolean>

  /**
   * Get all available scenarios for a platform
   */
  getAvailableScenarios(platform: Platform): Promise<string[]>

  /**
   * Validate if render engine version is compatible with scenario
   */
  isCompatible(scenarioId: string, platform: Platform, renderEngineVersion: SemanticVersion): Promise<boolean>
}