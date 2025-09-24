export class DefaultConfigurationResponseDto {
  constructor(
    public readonly schemaVersion: string,
    public readonly scenarioId: string,
    public readonly config: Record<string, unknown>,
  ) {}

  static fromUseCaseResponse(useCaseResponse: any): DefaultConfigurationResponseDto {
    return new DefaultConfigurationResponseDto(
      useCaseResponse.schemaVersion,
      useCaseResponse.scenarioId,
      useCaseResponse.config,
    )
  }

  toJSON(): Record<string, unknown> {
    return {
      schema_version: this.schemaVersion,
      scenario_id: this.scenarioId,
      config: this.config,
    }
  }
}