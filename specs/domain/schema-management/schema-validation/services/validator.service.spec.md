# Validator Service

## Overview

The **Validator** service is a domain service responsible for validating schemas, components, properties, and templates within the server-driven UI framework. It provides comprehensive validation capabilities, supports extensible validation rules, and ensures data integrity across all domain objects.

The Validator service orchestrates validation logic, applies validation rules, provides detailed feedback, and supports both synchronous and asynchronous validation operations. It is essential for maintaining the quality and consistency of UI definitions in the system.

## Service Type

**Domain Service**: Stateless business logic unit that operates on multiple domain objects and provides validation capabilities.

## Methods

### Core Validation Methods

#### `validateSchema(schema: Schema, options?: ValidationOptions): Promise<ValidationResult>`

Validates a complete schema against all validation rules and constraints.

**Parameters:**
- `schema`: Schema to validate
- `options`: Optional validation configuration

**Returns:** Promise resolving to ValidationResult with validation status and errors

**Business Rules:**
- Must validate all components in the schema
- Must validate component relationships and hierarchies
- Must validate schema-level constraints
- Must validate backward compatibility if requested
- Must check for circular dependencies
- Must validate schema structure and metadata

#### `validateComponent(component: Component, context?: ValidationContext): Promise<ValidationResult>`

Validates a single component against its type-specific and custom validation rules.

**Parameters:**
- `component`: Component to validate
- `context`: Optional validation context

**Returns:** Promise resolving to ValidationResult with validation status and errors

**Business Rules:**
- Must validate component properties and their values
- Must validate component children and relationships
- Must validate component-specific constraints
- Must validate component events and handlers
- Must validate component styling and appearance
- Must consider component type requirements

#### `validateProperty(property: Property, value: unknown): ValidationResult`

Validates a property value against the property definition and validation rules.

**Parameters:**
- `property`: Property definition to validate against
- `value`: Value to validate

**Returns:** ValidationResult with validation status and errors

**Business Rules:**
- Must validate value type matches property type
- Must apply all property validation rules
- Must check required property constraints
- Must validate default values if applicable
- Must provide detailed error messages
- Must handle complex data types properly

#### `validateTemplate(template: Template): Promise<ValidationResult>`

Validates a template definition and its content.

**Parameters:**
- `template`: Template to validate

**Returns:** Promise resolving to ValidationResult with validation status and errors

**Business Rules:**
- Must validate template parameters and their types
- Must validate template content structure
- Must validate parameter usage in content
- Must validate template inheritance relationships
- Must check for circular dependencies
- Must validate template compilation readiness

#### `validateTemplateInstantiation(template: Template, parameters: Record<string, unknown>): ValidationResult`

Validates template instantiation parameters.

**Parameters:**
- `template`: Template to instantiate
- `parameters`: Parameters for instantiation

**Returns:** ValidationResult with validation status and errors

**Business Rules:**
- Must validate all required parameters are provided
- Must validate parameter types match expectations
- Must apply parameter validation rules
- Must check parameter value constraints
- Must provide actionable error messages
- Must handle parameter inheritance properly

### Validation Rule Management Methods

#### `registerValidationRule(rule: ValidationRule): void`

Registers a new validation rule with the validator service.

**Parameters:**
- `rule`: Validation rule to register

**Business Rules:**
- Rule must have unique name within registry
- Rule must be properly structured and valid
- Rule must be applicable to supported data types
- Rule must provide meaningful error messages
- Cannot override built-in validation rules

#### `unregisterValidationRule(ruleName: string): boolean`

Unregisters a validation rule from the validator service.

**Parameters:**
- `ruleName`: Name of rule to unregister

**Returns:** True if rule was unregistered, false if not found

**Business Rules:**
- Cannot unregister built-in validation rules
- Rule must exist in registry
- Unregistration must be atomic
- Should handle dependent rules appropriately

#### `getValidationRule(ruleName: string): ValidationRule | null`

Gets a validation rule by name.

**Parameters:**
- `ruleName`: Name of rule to retrieve

**Returns:** ValidationRule if found, null otherwise

#### `getAllValidationRules(): ValidationRule[]`

Gets all registered validation rules.

**Returns:** Array of all registered ValidationRule instances

#### `getValidationRulesForType(dataType: DataType): ValidationRule[]`

Gets validation rules applicable to a specific data type.

**Parameters:**
- `dataType`: Data type to get rules for

**Returns:** Array of applicable ValidationRule instances

### Validation Rule Execution Methods

#### `executeValidationRule(rule: ValidationRule, value: unknown, context?: ValidationContext): Promise<ValidationResult>`

Executes a specific validation rule against a value.

**Parameters:**
- `rule`: Validation rule to execute
- `value`: Value to validate
- `context`: Optional validation context

**Returns:** Promise resolving to ValidationResult from rule execution

**Business Rules:**
- Must respect rule parameters and configuration
- Must handle rule-specific validation logic
- Must provide rule-specific error messages
- Must handle async validation when required
- Must consider validation context

#### `executeValidationRules(rules: ValidationRule[], value: unknown, context?: ValidationContext): Promise<ValidationResult>`

Executes multiple validation rules against a value.

**Parameters:**
- `rules`: Array of validation rules to execute
- `value`: Value to validate
- `context`: Optional validation context

**Returns:** Promise resolving to combined ValidationResult

**Business Rules:**
- Must execute all rules in sequence
- Must combine results from all rules
- Must handle rule dependencies
- Must optimize execution order when possible
- Must handle rule failures gracefully

### Validation Context Methods

#### `createValidationContext(type: ValidationContextType, target: any, options?: ValidationOptions): ValidationContext`

Creates a validation context for validation operations.

**Parameters:**
- `type`: Type of validation context
- `target`: Target object being validated
- `options`: Optional validation options

**Returns:** New ValidationContext instance

**Business Rules:**
- Context must be properly typed and structured
- Context must include relevant target information
- Context must include validation options
- Context must be serializable for debugging

#### `extendValidationContext(base: ValidationContext, additions: Partial<ValidationContext>): ValidationContext`

Extends an existing validation context with additional information.

**Parameters:**
- `base`: Base validation context to extend
- `additions`: Additional context information

**Returns:** Extended ValidationContext instance

### Validation Performance Methods

#### `validateOptimized(target: any, rules: ValidationRule[], options?: ValidationOptions): Promise<ValidationResult>`

Performs optimized validation using caching and other performance optimizations.

**Parameters:**
- `target`: Target object to validate
- `rules`: Array of validation rules to apply
- `options`: Optional validation options

**Returns:** Promise resolving to ValidationResult

**Business Rules:**
- Should use validation caching when appropriate
- Should parallelize independent validation rules
- Should optimize rule execution order
- Should handle performance thresholds
- Should provide performance metrics

#### `getValidationMetrics(): ValidationMetrics`

Gets validation performance metrics and statistics.

**Returns:** ValidationMetrics with performance data

**Business Rules:**
- Should track validation execution times
- Should track rule execution counts
- Should track cache hit/miss ratios
- Should track error rates by type
- Should provide actionable insights

### Built-in Validation Methods

#### `validateRequired(value: unknown, context?: ValidationContext): ValidationResult`

Validates that a value is provided (not null/undefined).

**Parameters:**
- `value`: Value to validate
- `context`: Optional validation context

**Returns:** ValidationResult with validation status

#### `validateType(value: unknown, expectedType: DataType, context?: ValidationContext): ValidationResult`

Validates that a value matches the expected data type.

**Parameters:**
- `value`: Value to validate
- `expectedType`: Expected data type
- `context`: Optional validation context

**Returns:** ValidationResult with validation status

#### `validateRange(value: number, min: number, max: number, context?: ValidationContext): ValidationResult`

Validates that a numeric value is within the specified range.

**Parameters:**
- `value`: Numeric value to validate
- `min`: Minimum allowed value
- `max`: Maximum allowed value
- `context`: Optional validation context

**Returns:** ValidationResult with validation status

#### `validateLength(value: string | any[], minLength: number, maxLength: number, context?: ValidationContext): ValidationResult`

Validates that a string or array length is within the specified range.

**Parameters:**
- `value`: String or array to validate
- `minLength`: Minimum allowed length
- `maxLength`: Maximum allowed length
- `context`: Optional validation context

**Returns:** ValidationResult with validation status

#### `validatePattern(value: string, pattern: RegExp, context?: ValidationContext): ValidationResult`

Validates that a string matches the specified pattern.

**Parameters:**
- `value`: String to validate
- `pattern`: Regular expression pattern to match
- `context`: Optional validation context

**Returns:** ValidationResult with validation status

#### `validateCustom(value: unknown, validator: (value: unknown) => boolean, message: string, context?: ValidationContext): ValidationResult`

Validates a value using a custom validator function.

**Parameters:**
- `value`: Value to validate
- `validator`: Custom validator function
- `message`: Error message for validation failures
- `context`: Optional validation context

**Returns:** ValidationResult with validation status

## Business Rules & Invariants

### Validation Quality Invariants

1. **Comprehensive Coverage**: Validation must cover all aspects of domain objects
   - Must validate structural integrity
   - Must validate business rules
   - Must validate type safety
   - Must validate relationships and dependencies

2. **Accurate Reporting**: Validation results must be accurate and actionable
   - Must provide clear error messages
   - Must include context information
   - Must suggest corrective actions
   - Must maintain consistency across validation types

3. **Performance Efficiency**: Validation must be performant and scalable
   - Must handle large schemas efficiently
   - Must support parallel validation when possible
   - Must provide caching mechanisms
   - Must respect performance thresholds

### Rule Management Invariants

1. **Rule Integrity**: Validation rules must be properly managed
   - Rules must have unique names
   - Rules must be properly structured
   - Rules must be applicable to target types
   - Rules must provide meaningful feedback

2. **Rule Execution**: Rule execution must be predictable and efficient
   - Rules must execute in appropriate order
   - Rules must handle edge cases
   - Rules must be composable
   - Rules must support dependencies

## Dependencies

### External Dependencies

- `uuid`: For generating unique identifiers
- `zod`: For type validation and schema definitions

### Internal Dependencies

- `Schema`: Entity for schema definitions
- `Component`: Entity for component definitions
- `Property`: Value object for property definitions
- `Template`: Entity for template definitions
- `ValidationRule`: Value object for validation rules
- `ValidationResult`: Value object for validation results
- `ValidationContext`: Value object for validation context
- `ValidationOptions`: Value object for validation options
- `ValidationMetrics`: Value object for performance metrics
- `DataType`: Value object for data type definitions

## Errors

### Domain Errors

- `ValidatorInitializationError`: Thrown when validator service fails to initialize
- `RuleRegistrationError`: Thrown when validation rule registration fails
- `RuleExecutionError`: Thrown when validation rule execution fails
- `ValidationError`: Thrown when validation encounters unexpected errors
- `ConfigurationError`: Thrown when validator configuration is invalid
- `PerformanceError`: Thrown when validation performance thresholds are exceeded

### Validation Errors

- `InvalidTargetError`: Thrown when validation target is invalid
- `MissingRuleError`: Thrown when required validation rule is missing
- `RuleDependencyError`: Thrown when validation rule dependencies are not met
- `ContextError`: Thrown when validation context is invalid
- `TimeoutError`: Thrown when validation execution times out

## Factory Methods

#### `Validator.create(options?: ValidatorOptions): Validator`

Creates a new Validator service instance.

**Parameters:**
- `options`: Optional validator configuration options

**Returns:** New Validator service instance

**Business Rules:**
- Must initialize with built-in validation rules
- Must set up validation caching if configured
- Must configure performance thresholds
- Must set up error handling and logging

#### `Validator.withCustomRules(customRules: ValidationRule[], options?: ValidatorOptions): Validator`

Creates a Validator service with custom validation rules.

**Parameters:**
- `customRules`: Array of custom validation rules
- `options`: Optional validator configuration options

**Returns:** New Validator service instance with custom rules

**Business Rules:**
- Must include built-in rules plus custom rules
- Must validate custom rule integrity
- Must handle rule conflicts appropriately
- Must maintain rule registry consistency

## Tests

### Unit Tests

1. **Service Initialization**
   - Should create validator with default configuration
   - Should create validator with custom options
   - Should initialize built-in validation rules
   - Should handle initialization errors
   - Should set up caching and performance

2. **Schema Validation**
   - Should validate valid schema successfully
   - Should detect invalid schema structure
   - Should validate component relationships
   - Should handle circular dependencies
   - Should provide comprehensive feedback

3. **Component Validation**
   - Should validate valid component successfully
   - Should detect invalid component properties
   - Should validate component children
   - Should handle component-specific rules
   - Should provide detailed error messages

4. **Property Validation**
   - Should validate property values correctly
   - Should apply validation rules properly
   - Should handle type checking
   - Should provide clear error feedback
   - Should handle complex data types

5. **Template Validation**
   - Should validate template structure
   - Should validate template parameters
   - Should validate template content
   - Should handle template inheritance
   - Should validate instantiation parameters

6. **Validation Rule Management**
   - Should register custom validation rules
   - Should unregister validation rules
   - Should handle rule conflicts
   - Should get rules by type
   - Should execute rules properly

### Integration Tests

1. **Domain Object Integration**
   - Should integrate with all domain objects
   - Should handle domain object relationships
   - Should maintain domain invariants
   - Should support domain events

2. **Performance Integration**
   - Should handle large validation scenarios
   - Should support parallel validation
   - Should provide performance metrics
   - Should handle performance thresholds

3. **Error Handling Integration**
   - Should handle validation errors gracefully
   - Should provide meaningful error feedback
   - Should support error recovery
   - Should log errors appropriately

## Service Characteristics

### Performance Characteristics

- **Scalability**: Must handle validation of large schemas and complex hierarchies
- **Speed**: Must provide fast validation for interactive scenarios
- **Memory Efficiency**: Must optimize memory usage for large validation tasks
- **Concurrency**: Must support parallel validation of independent components

### Availability Characteristics

- **Reliability**: Must provide consistent validation results
- **Fault Tolerance**: Must handle validation errors gracefully
- **Recovery**: Must recover from validation failures
- **Monitoring**: Must provide validation metrics and health checks

### Security Characteristics

- **Validation Safety**: Must prevent validation injection attacks
- **Data Privacy**: Must handle sensitive data appropriately
- **Access Control**: Must support validation authorization
- **Audit Trail**: Must maintain validation history

## Metadata

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Last Updated** | 2025-09-15 |
| **Author** | Schema Management Domain Team |
| **Status** | Draft |
| **Dependencies** | Schema, Component, Property, Template, ValidationRule, ValidationResult |
| **Complexity** | High |
| **Testing Priority** | Critical |
| **Review Required** | Yes |
| **Documentation** | Complete |
| **Breaking Changes** | None |