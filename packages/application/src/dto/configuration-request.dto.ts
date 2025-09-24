import { Platform } from '../schema-management/shared/enums/platform-support.enum.js'

export class ConfigurationRequestDto {
  constructor(
    public readonly scenarioId: string,
    public readonly platform: Platform,
    public readonly renderEngineVersion: string,
    public readonly userId: string,
    public readonly experimentId?: string,
  ) {}

  static fromQuery(query: Record<string, string | undefined>): ConfigurationRequestDto {
    const scenarioId = query.scenario_id
    const platform = query.platform as Platform
    const renderEngineVersion = query.render_engine_version
    const userId = query.user_id
    const experimentId = query.experiment_id

    if (!scenarioId) {
      throw new Error('scenario_id is required')
    }

    if (!platform || !Object.values(Platform).includes(platform)) {
      throw new Error('Invalid platform')
    }

    if (!renderEngineVersion) {
      throw new Error('render_engine_version is required')
    }

    if (!userId) {
      throw new Error('user_id is required')
    }

    return new ConfigurationRequestDto(scenarioId, platform, renderEngineVersion, userId, experimentId)
  }

  toUseCaseRequest(): any {
    return {
      scenarioId: this.scenarioId,
      platform: this.platform,
      renderEngineVersion: this.renderEngineVersion,
      userId: this.userId,
      experimentId: this.experimentId,
    }
  }
}