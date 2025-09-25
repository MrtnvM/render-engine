// Core validation engine and schema
export { ValidationEngine, ValidationSchema, CustomValidator } from './validation-engine.js'
export { default as masterSchema } from './master.schema.json'

// Value objects and result types
export type {
  SchemaValidationResult,
  SchemaValidationError,
  SchemaValidationWarning,
  SchemaValidationInfo,
  SchemaValidationContext,
  SchemaValidationResultMetadata,
  SchemaValidationResultJSON,
  SchemaValidationSummary,
  SchemaValidationReport,
} from './value-objects/validation-result.vo.js'
export { SchemaValidationResult as ValidationResult } from './value-objects/validation-result.vo.js'

// Main validation service
export { ValidationService, type ValidationRequest, type BatchValidationRequest, type BatchValidationResult } from './validation.service.js'

// Custom validators
export {
  SecurityValidator,
  ComponentTypeValidator,
  URLValidator,
  ColorValidator,
  BusinessLogicValidator,
  CrossFieldValidator,
  CustomValidatorsRegistry,
} from './custom-validators.js'

// Error formatting and reporting
export { ErrorFormatter, type FormattedError, type FormattedValidationReport, type ErrorFormattingOptions } from './error-formatter.js'

// Store API integration
export {
  StoreValidationAdapter,
  type StoreValidationRule,
  type StoreValidationOptions,
  type StoreValue,
  type StorePatch,
  type StoreChange,
} from './store-integration.js'

// Nightly validation job
export {
  NightlyValidationJob,
  type NightlyValidationConfig,
  type ValidationJob,
  type NightlyValidationReport,
  type ValidationJobEvent,
} from '../../application/src/jobs/nightly-validation.job.js'

// Debug inspector
export { DebugInspector, type DebugInspectionData, type InspectorConfig, type ValidationTestCase, type ValidationTestSuite, type ValidationDebugInfo } from './debug-inspector.js'

// Schema versioning and migration
export {
  SchemaVersionManager,
  SchemaMigrationUtils,
  createDefaultVersionHistory,
  type SchemaVersion,
  type SchemaMigration,
  type SchemaVersionHistory,
  type VersionedSchema,
} from './schema-versioning.js'

// Client-side validation
export { ClientValidator, type ClientValidationOptions, type ClientSchema, type ComponentValidation, type ValidationRule } from './client-validator.js'

// Security validation
export { SecurityValidator as SecurityValidation, type SecurityConfig, type SecurityViolation } from './security-validator.js'

// Enums and shared types
export {
  SchemaValidationSeverity,
  SchemaValidationRuleType,
  ComponentType,
  DataTypeCategory,
  PlatformSupport,
  SchemaStatus,
  TemplateStatus,
} from '../shared/enums/index.js'

// Re-export from schema-definition for convenience
export { SchemaValidationRule, type SchemaValidationRuleProps } from '../schema-definition/value-objects/validation-rule.value-object.js'
export { DataType, type DataTypeProps } from '../schema-definition/value-objects/data-type.value-object.js'