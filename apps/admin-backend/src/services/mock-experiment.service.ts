/**
 * Mock experiment service for MVP
 * In production, this would integrate with a real experiment/AB testing service
 */
export interface ExperimentService {
  resolveExperimentVariant(scenarioId: string, userId: string, experimentId?: string): Promise<string>
}

export class MockExperimentService implements ExperimentService {
  async resolveExperimentVariant(scenarioId: string, userId: string, experimentId?: string): Promise<string> {
    // If experiment_id is provided directly, use it
    if (experimentId) {
      return experimentId
    }

    // Simple mock logic based on user ID hash
    // In production, this would call a real experiment service
    const hash = this.simpleHash(userId)
    const variant = hash % 100

    // 90% get 'base' variant, 10% get 'experiment' variant
    return variant < 90 ? 'base' : 'experiment'
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
}