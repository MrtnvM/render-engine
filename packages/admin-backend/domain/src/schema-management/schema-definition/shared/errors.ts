export class SchemaError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: unknown,
  ) {
    super(message)
    this.name = 'SchemaError'
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
    }
  }
}

export class ValidationError extends SchemaError {
  constructor(message: string, context?: unknown) {
    super(message, 'VALIDATION_ERROR', context)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends SchemaError {
  constructor(message: string, context?: unknown) {
    super(message, 'NOT_FOUND_ERROR', context)
    this.name = 'NotFoundError'
  }
}

export class InvalidOperationError extends SchemaError {
  constructor(message: string, context?: unknown) {
    super(message, 'INVALID_OPERATION_ERROR', context)
    this.name = 'InvalidOperationError'
  }
}

export class ConfigurationError extends SchemaError {
  constructor(message: string, context?: unknown) {
    super(message, 'CONFIGURATION_ERROR', context)
    this.name = 'ConfigurationError'
  }
}
