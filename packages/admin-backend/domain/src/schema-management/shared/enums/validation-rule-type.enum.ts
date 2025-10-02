export enum SchemaValidationRuleType {
  // Basic Validation
  REQUIRED = 'required',
  TYPE = 'type',
  MIN = 'min',
  MAX = 'max',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  PATTERN = 'pattern',
  ENUM = 'enum',

  // String Validation
  EMAIL = 'email',
  URL = 'url',
  UUID = 'uuid',
  PHONE = 'phone',
  ZIP_CODE = 'zipCode',

  // Number Validation
  RANGE = 'range',
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  INTEGER = 'integer',
  NUMBER = 'number',
  FLOAT = 'float',
  MULTIPLE_OF = 'multipleOf',

  // Date/Time Validation
  MIN_DATE = 'minDate',
  MAX_DATE = 'maxDate',
  FUTURE_DATE = 'futureDate',
  PAST_DATE = 'pastDate',

  // Array Validation
  MIN_ITEMS = 'minItems',
  MAX_ITEMS = 'maxItems',
  UNIQUE_ITEMS = 'uniqueItems',
  CONTAINS = 'contains',

  // Object Validation
  MIN_PROPERTIES = 'minProperties',
  MAX_PROPERTIES = 'maxProperties',
  REQUIRED_PROPERTIES = 'requiredProperties',
  DEPENDENT_PROPERTIES = 'dependentProperties',

  // Format Validation
  FORMAT = 'format',
  CUSTOM_FORMAT = 'customFormat',

  // Business Logic Validation
  BUSINESS_RULE = 'businessRule',
  CUSTOM = 'custom',
  ASYNC = 'async',

  // Reference Validation
  REFERENCE = 'reference',
  EXISTS = 'exists',
  UNIQUE = 'unique',

  // Conditional Validation
  CONDITIONAL = 'conditional',
  IF_THEN_ELSE = 'ifThenElse',

  // Composite Validation
  ALL_OF = 'allOf',
  ANY_OF = 'anyOf',
  ONE_OF = 'oneOf',
  NOT = 'not',
}
