import { DomainError } from './domain.error.js'

export class InvalidDataError extends DomainError {
  readonly data: unknown
  readonly expectedFormat: string
  readonly parseContext: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.data = params.metadata?.data
    this.expectedFormat = params.metadata?.expectedFormat as string
    this.parseContext = params.metadata?.parseContext as string
  }

  static forData(data: unknown, expectedFormat: string, parseContext: string): InvalidDataError {
    return new InvalidDataError({
      message: `Invalid data in context '${parseContext}'. Expected format: ${expectedFormat}`,
      code: 'INVALID_DATA_ERROR',
      metadata: { data, expectedFormat, parseContext },
    })
  }

  static missingProperty(property: string, data: unknown): InvalidDataError {
    return new InvalidDataError({
      message: `Missing required property '${property}' in data object`,
      code: 'INVALID_DATA_ERROR',
      metadata: {
        data,
        expectedFormat: `object with property '${property}'`,
        parseContext: 'data validation',
        missingProperty: property,
      },
    })
  }

  static invalidStructure(expectedStructure: string, data: unknown): InvalidDataError {
    return new InvalidDataError({
      message: `Invalid data structure. Expected: ${expectedStructure}`,
      code: 'INVALID_DATA_ERROR',
      metadata: {
        data,
        expectedFormat: expectedStructure,
        parseContext: 'data structure validation',
      },
    })
  }
}
