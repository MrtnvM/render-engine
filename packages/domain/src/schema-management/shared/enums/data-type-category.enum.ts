export enum DataTypeCategory {
  // Primitive Types
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  INTEGER = 'integer',
  FLOAT = 'float',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',

  // Complex Types
  ARRAY = 'array',
  OBJECT = 'object',
  MAP = 'map',
  SET = 'set',

  // Special Types
  ANY = 'any',
  UNKNOWN = 'unknown',
  VOID = 'void',
  NULL = 'null',
  UNDEFINED = 'undefined',

  // Union Types
  UNION = 'union',
  INTERSECTION = 'intersection',

  // Function Types
  FUNCTION = 'function',
  ASYNC_FUNCTION = 'asyncFunction',

  // Custom Types
  ENUM = 'enum',
  CUSTOM = 'custom',

  // Platform-specific Types
  COLOR = 'color',
  DIMENSION = 'dimension',
  FONT = 'font',
  IMAGE_URL = 'imageUrl',
  COMPONENT_REF = 'componentRef',
  TEMPLATE_REF = 'templateRef'
}