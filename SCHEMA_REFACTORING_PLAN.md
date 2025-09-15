# Schema-Definition Module Refactoring Plan

## Executive Summary

This document outlines a comprehensive refactoring plan for the schema-definition module to address over-engineering, implementation gaps, and inconsistencies between specifications and code. The plan focuses on simplifying the architecture while maintaining core functionality.

## Current State Analysis

### Issues Identified

1. **Missing Core Implementation**: Component entity not implemented
2. **Over-Engineering**: 15+ domain events, complex validation system, excessive factory methods
3. **Inconsistencies**: Naming conflicts, different error handling patterns
4. **Implementation Gaps**: Missing domain events, async support, advanced features

### Current Architecture

```
schema-definition/
├── entities/
│   ├── schema.entity.ts ✅ (implemented)
│   └── component.entity.ts ❌ (missing)
├── value-objects/
│   ├── data-type.vo.ts ✅ (implemented)
│   ├── property.vo.ts ✅ (implemented)
│   ├── validation-rule.vo.ts ✅ (implemented)
│   ├── name.vo.ts ✅ (implemented)
│   └── description.vo.ts ✅ (implemented)
└── shared/
    ├── enums/ ✅ (implemented)
    └── types/ ✅ (implemented)
```

## Refactoring Strategy

### Phase 1: Foundation

**Goal**: Establish solid foundation with core entities and simplified architecture

#### 1.1 Implement Missing Component Entity

**Priority**: Critical

**Tasks**:

- [ ] Create `component.entity.ts` with basic functionality by spec

#### 1.2 Standardize Type Definitions

**Priority**: High

**Tasks**:

- [ ] Update specs to use `SchemaValidationRule` not `ValidationRule`
- [ ] Standardize interface naming conventions
- [ ] Align enum naming between specs and implementation (implementation here is truth)
- [ ] Create consistent error types

**Changes**:

```typescript
// Before
ValidationRule, ValidationResult, ValidationError

// After
SchemaValidationRule, SchemaValidationResult, SchemaValidationError
```

#### 1.3 Simplify Error Handling

**Priority**: High

**Tasks**:

- [ ] Create 5 core error types instead of 20+
- [ ] Implement consistent error message formatting
- [ ] Add error context information
- [ ] Remove over-specific error types

**Core Error Types**:

```typescript
export class SchemaError extends Error {
  constructor(message: string, public code: string, public context?: any) {
    super(message)
  }
}

export class ValidationError extends SchemaError {}
export class NotFoundError extends SchemaError {}
export class InvalidOperationError extends SchemaError {}
export class ConfigurationError extends SchemaError {}
```

### Phase 2: Simplification

**Goal**: Remove over-engineered features and simplify existing code

#### 2.1 Reduce Domain Events

**Priority**: Medium

**Tasks**:

- [ ] Keep only 4 core events: Created, Updated, Deleted, Published
- [ ] Remove granular property/child events
- [ ] Implement simple event emission
- [ ] Add basic event handling infrastructure

**Simplified Events**:

```typescript
export class SchemaCreatedEvent extends DomainEvent {}
export class SchemaUpdatedEvent extends DomainEvent {}
export class SchemaDeletedEvent extends DomainEvent {}
export class SchemaPublishedEvent extends DomainEvent {}
```

#### 2.2 Simplify Validation System

**Priority**: High

**Tasks**:

- [ ] Replace complex validation result types with simple boolean + messages
- [ ] Remove async validation (add back if needed later)
- [ ] Simplify validation context
- [ ] Keep only essential validation rules

**Simplified Validation**:

```typescript
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class ValidationRule {
  public validate(value: unknown): ValidationResult {
    // Simple validation logic
  }
}
```

#### 2.3 Streamline Factory Methods

**Priority**: Medium

**Tasks**:

- [ ] Keep only `create()` method
- [ ] Remove specialized factory methods
- [ ] Simplify cloning logic

**Simplified Factories**:

```typescript
export class Schema {
  public static create(props: SchemaProps): Schema
  // Remove: duplicate, fromJSON, clone, fromType, etc.
}
```

### Phase 3: Feature Completion (Weeks 5-6)

**Goal**: Complete missing features with simplified implementations

#### 3.1 Complete Serialization

**Priority**: Medium

**Tasks**:

- [ ] Standardize JSON serialization format
- [ ] Remove complex serialization rules
- [ ] Add basic circular reference handling
- [ ] Implement consistent deserialization

#### 3.2 Add Essential Validation Rules

**Priority**: High

**Tasks**:

- [ ] Implement core validation rules: required, type, min/max, pattern
- [ ] Add basic constraint validation
- [ ] Remove complex constraint system
- [ ] Add validation rule composition

### Phase 4: Testing & Documentation

**Goal**: Add comprehensive testing and update documentation

#### 4.1 Implement Core Tests

**Priority**: High

**Tasks**:

- [ ] Unit tests for all entities and value objects
- [ ] Basic performance tests
- [ ] Error handling tests

**Test Structure**:

```
tests/                             # packages/domain/src/schema-management/schema-definition/tests
├── unit/
│   ├── entities/
│   ├── value-objects/
│   └── shared/
├── integration/
│   ├── schema-operations.test.ts
│   └── validation.test.ts
└── performance/
    └── large-schema.test.ts
```

#### 4.2 Update Documentation

**Priority**: Medium

**Tasks**:

- [ ] Update specifications to match implementation
- [ ] Remove over-engineered sections

#### 5 Add Essential Advanced Features

**Priority**: Low
**Effort**: 3-4 days

**Tasks**:

- [ ] Add basic version management (simplified)
- [ ] Implement schema comparison
- [ ] Add basic migration support
- [ ] Create schema templates

## Detailed Implementation Plan

### 1: Component Entity Implementation

#### : Basic Component Structure

```typescript
// component.entity.ts
export class Component extends Entity<ID> {
  private readonly _name: string
  private readonly _type: ComponentType
  private readonly _displayName: string
  private readonly _properties: Property[]
  private readonly _children: Component[]
  private readonly _parentId: ID | null

  constructor(props: ComponentProps) {
    super(props.id || ID.generate())
    this._name = props.name
    this._type = props.type
    this._displayName = props.displayName
    this._properties = props.properties || []
    this._children = props.children || []
    this._parentId = props.parentId || null
  }

  // Core getters
  get name(): string {
    return this._name
  }
  get type(): ComponentType {
    return this._type
  }
  get displayName(): string {
    return this._displayName
  }
  get properties(): Property[] {
    return [...this._properties]
  }
  get children(): Component[] {
    return [...this._children]
  }
  get parentId(): ID | null {
    return this._parentId
  }

  // Basic methods
  public addProperty(property: Property): void
  public removeProperty(propertyName: string): void
  public addChild(child: Component): void
  public removeChild(childId: ID): void
  public validate(): boolean
  public toJSON(): ComponentJSON
}
```

#### Day 3-4: Component Validation & Operations

```typescript
// Validation logic
public validate(): boolean {
  // Check required properties
  if (!this._name || this._name.trim() === '') return false
  if (!this._displayName || this._displayName.trim() === '') return false

  // Validate properties
  for (const property of this._properties) {
    if (!property.validate()) return false
  }

  // Validate children recursively
  for (const child of this._children) {
    if (!child.validate()) return false
  }

  return true
}

// Property management
public addProperty(property: Property): void {
  if (this.hasProperty(property.name)) {
    throw new ValidationError(`Property '${property.name}' already exists`)
  }
  this._properties.push(property)
}

public removeProperty(propertyName: string): void {
  const index = this._properties.findIndex(p => p.name === propertyName)
  if (index === -1) {
    throw new NotFoundError(`Property '${propertyName}' not found`)
  }
  this._properties.splice(index, 1)
}
```

### Week 2: Type Standardization & Error Handling

#### Day 1-2: Standardize Types

```typescript
// shared/types/index.ts
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ValidationRule {
  name: string
  type: ValidationRuleType
  validate(value: unknown): ValidationResult
}

// Remove: SchemaValidationRule, SchemaValidationResult, etc.
```

#### Day 3-4: Implement Error System

```typescript
// shared/errors/index.ts
export class SchemaError extends Error {
  constructor(message: string, public code: string, public context?: any) {
    super(message)
    this.name = 'SchemaError'
  }
}

export class ValidationError extends SchemaError {
  constructor(message: string, context?: any) {
    super(message, 'VALIDATION_ERROR', context)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends SchemaError {
  constructor(message: string, context?: any) {
    super(message, 'NOT_FOUND', context)
    this.name = 'NotFoundError'
  }
}
```

### Week 3-4: Simplification Phase

#### Simplified Validation System

```typescript
// validation-rule.vo.ts (simplified)
export class ValidationRule extends ValueObject<ValidationRuleProps> {
  public validate(value: unknown): ValidationResult {
    const errors: string[] = []

    switch (this.type) {
      case ValidationRuleType.REQUIRED:
        if (value === null || value === undefined) {
          errors.push('This field is required')
        }
        break

      case ValidationRuleType.MIN_LENGTH:
        if (typeof value === 'string' && value.length < this.minLength) {
          errors.push(`Minimum length is ${this.minLength}`)
        }
        break

      // ... other basic rules
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
```

#### Simplified Domain Events

```typescript
// shared/events/index.ts
export abstract class DomainEvent {
  constructor(public readonly aggregateId: string, public readonly occurredOn: Date = new Date()) {}
}

export class SchemaCreatedEvent extends DomainEvent {
  constructor(aggregateId: string, public readonly schemaName: string) {
    super(aggregateId)
  }
}

export class SchemaUpdatedEvent extends DomainEvent {
  constructor(aggregateId: string, public readonly changes: string[]) {
    super(aggregateId)
  }
}
```

## Migration Strategy

### Backward Compatibility

1. **Deprecation Warnings**: Add warnings for removed methods
2. **Adapter Pattern**: Create adapters for complex features
3. **Gradual Migration**: Support both old and new APIs temporarily

### Data Migration

1. **Schema Migration**: Create migration scripts for existing schemas
2. **Validation Rules**: Convert complex rules to simplified format
3. **Event Migration**: Transform old events to new format

## Success Metrics

### Code Quality

- [ ] Reduce cyclomatic complexity by 40%
- [ ] Increase test coverage to 90%
- [ ] Reduce lines of code by 30%
- [ ] Eliminate all naming inconsistencies

### Performance

- [ ] Validation performance improved by 50%
- [ ] Serialization time reduced by 40%
- [ ] Memory usage reduced by 25%
- [ ] Bundle size reduced by 35%

### Maintainability

- [ ] All entities have complete implementations
- [ ] Consistent error handling across module
- [ ] Clear separation of concerns
- [ ] Comprehensive documentation

## Risk Mitigation

### Technical Risks

1. **Breaking Changes**: Implement gradual migration with deprecation warnings
2. **Performance Regression**: Add performance tests and monitoring
3. **Feature Loss**: Document removed features and provide alternatives

### Project Risks

1. **Timeline Delays**: Prioritize core features, defer nice-to-haves
2. **Resource Constraints**: Focus on critical path items first
3. **Stakeholder Concerns**: Regular demos and progress updates

## Conclusion

This refactoring plan addresses the over-engineering issues while maintaining the core functionality needed for a robust schema management system. The phased approach ensures minimal disruption while delivering significant improvements in maintainability and performance.

The key principle is **simplicity over complexity** - implementing only the features that provide real value and can be easily maintained and extended in the future.
