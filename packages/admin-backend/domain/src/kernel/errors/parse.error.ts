import { DomainError } from './domain.error.js'

export class ParseError extends DomainError {
  readonly data: unknown
  readonly expectedFormat: string
  readonly parseContext: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.data = params.metadata?.data
    this.expectedFormat = params.metadata?.expectedFormat as string
    this.parseContext = params.metadata?.parseContext as string
  }

  static forData(data: unknown, expectedFormat: string, parseContext: string): ParseError {
    return new ParseError({
      message: `Failed to parse data in context '${parseContext}'. Expected format: ${expectedFormat}`,
      code: 'PARSE_ERROR',
      metadata: { data, expectedFormat, parseContext },
    })
  }

  static invalidUUID(input: string): ParseError {
    return new ParseError({
      message: `Failed to parse UUID from string: ${input}. Expected UUID v4 format (8-4-4-4-12 hexadecimal digits with hyphens)`,
      code: 'PARSE_ERROR',
      metadata: {
        data: input,
        expectedFormat: 'UUID v4',
        parseContext: 'UUID parsing',
      },
    })
  }

  static emptyString(field: string): ParseError {
    return new ParseError({
      message: `Cannot parse ${field} from empty string`,
      code: 'PARSE_ERROR',
      metadata: {
        data: '',
        expectedFormat: field,
        parseContext: `${field} parsing`,
      },
    })
  }
}
