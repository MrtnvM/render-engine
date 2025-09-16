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

ValidationResultItem - interface (message: string, type: 'debug' | 'info' | 'warning', 'error')

ValidationResult - Value Object

static create(items: ValidationResultItem[]) - factory method

isValid - boolean property (has any errors)
errors: ValidationResultItem[]
warnings: ValidationResultItem[]
info: ValidationResultItem[]

```typescript
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
- [ ] Remove cloning logic

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
tests/ # packages/domain/src/schema-management/schema-definition/tests
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

## Conclusion

This refactoring plan addresses the over-engineering issues while maintaining the core functionality needed for a robust schema management system. The phased approach ensures minimal disruption while delivering significant improvements in maintainability and performance.

The key principle is **simplicity over complexity** - implementing only the features that provide real value and can be easily maintained and extended in the future.
