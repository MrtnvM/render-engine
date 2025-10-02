/**
 * Abstract base class for all domain errors.
 * @abstract
 * @extends Error
 */
export abstract class DomainError extends Error {
  /** Error class name. @readonly */
  public readonly name: string

  /** Error code in UPPER_SNAKE_CASE format. @readonly */
  public readonly code: string

  /** Additional context data (frozen). @readonly */
  public readonly metadata: Record<string, unknown>

  /**
   * @protected
   * @param params - Error configuration
   * @param params.message - Error description
   * @param params.code - Error code (auto-generated if not provided)
   * @param params.metadata - Additional context data
   * @throws {Error} When message is empty
   */
  protected constructor(params: { message: string; code?: string; metadata?: Record<string, unknown> }) {
    // Validate required parameters
    if (!params.message || typeof params.message !== 'string' || params.message.trim().length === 0) {
      throw new Error('DomainError message must be a non-empty string')
    }

    super(params.message)

    // Set immutable properties
    this.name = this.constructor.name
    this.code = params.code || this.generateCodeFromClassName()

    // Freeze metadata to prevent mutations
    this.metadata = Object.freeze(params.metadata ? { ...params.metadata } : {})

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
  }

  private generateCodeFromClassName(): string {
    return this.name
      .replace(/([A-Z])/g, '_$1')
      .replace(/^_/, '')
      .toUpperCase()
  }

  /** Returns formatted error string: [CODE] message */
  toString(): string {
    return `[${this.code}] ${this.message}`
  }

  /** Returns JSON-serializable error object */
  toJSON(): {
    name: string
    message: string
    code: string
    metadata: Record<string, unknown>
  } {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      metadata: this.metadata,
    }
  }
}
