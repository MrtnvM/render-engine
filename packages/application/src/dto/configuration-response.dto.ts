export class ConfigurationResponseDto {
  constructor(
    public readonly schemaVersion: string,
    public readonly renderEngine: {
      minVersion: string
      maxVersion: string
    },
    public readonly scenarioId: string,
    public readonly platform: string,
    public readonly lastModified: string,
    public readonly etag: string,
    public readonly config: Record<string, unknown>,
  ) {}

  static fromUseCaseResponse(useCaseResponse: any): ConfigurationResponseDto {
    return new ConfigurationResponseDto(
      useCaseResponse.schemaVersion,
      useCaseResponse.renderEngine,
      useCaseResponse.scenarioId,
      useCaseResponse.platform,
      useCaseResponse.lastModified,
      useCaseResponse.etag,
      useCaseResponse.config,
    )
  }

  toJSON(): Record<string, unknown> {
    return {
      schema_version: this.schemaVersion,
      render_engine: this.renderEngine,
      scenario_id: this.scenarioId,
      platform: this.platform,
      last_modified: this.lastModified,
      etag: this.etag,
      config: this.config,
    }
  }
}