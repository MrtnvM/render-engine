import { DomainError } from '../../../../kernel/errors/domain.error.js'

/**
 * Error thrown when conversion rate validation fails
 */
export class InvalidConversionRateError extends DomainError {
  constructor(conversions: number, totalUsers: number, reason: string) {
    super({
      message: `Invalid conversion rate: ${conversions}/${totalUsers} - ${reason}`,
      code: 'INVALID_CONVERSION_RATE',
      metadata: { conversions, totalUsers, reason },
    })
  }
}

/**
 * Error thrown when confidence level is invalid
 */
export class InvalidConfidenceLevelError extends DomainError {
  constructor(confidenceLevel: number) {
    super({
      message: `Invalid confidence level: ${confidenceLevel}. Must be between 0 and 1.`,
      code: 'INVALID_CONFIDENCE_LEVEL',
      metadata: { confidenceLevel },
    })
  }
}
