# Specification Writing Guide

## Overview

Guide for writing component specifications in the project. Follow the templates below for consistent, concise documentation.

## Component Types

### Domain Layer

**Entity**: Domain objects with identity

- **Template**: [Entity Guide](specs/domain/entity.spec.md)
- **Base Class**: `Entity<Data>`
- **Sections**: Overview, Data Structure, Methods, Business Rules, Events, Dependencies, Tests

**Value Object**: Immutable domain values

- **Template**: [Value Object Guide](specs/domain/value-object.spec.md)
- **Base Class**: `ValueObject<T>`
- **Sections**: Overview, Properties, Methods, Business Rules, Dependencies, Tests
- **Naming Convention**: `*.value-object.spec.md` (e.g., `validation-rule.value-object.spec.md`)

**Domain Service**: Stateless business logic

- **Template**: [Domain Service Guide](specs/domain/domain-service.spec.md)
- **Base Class**: None
- **Sections**: Overview, Methods, Business Rules, Dependencies, Tests

**Domain Error**: Domain-specific errors

- **Template**: [Domain Error Guide](specs/domain/domain-error.spec.md)
- **Base Class**: `DomainError`
- **Sections**: Overview, Error Properties, Business Rules, Dependencies, Tests

**Domain Event**: Domain events for event-driven architecture

- **Template**: [Domain Event Guide](specs/domain/domain-event.spec.md)
- **Base Class**: `DomainEvent`
- **Sections**: Overview, Payload, Business Rules, Dependencies, Tests

## Template Structure

All specifications follow this basic structure:

```markdown
# [ComponentName] [ComponentType]

## Overview

[Brief description of purpose and responsibilities]

## [Data Structure/Properties/Payload]

[Component state - varies by type]

## Methods

### Factory Methods

- `static create()` - Creation methods
- **Returns:** New instance
- **Throws:** ValidationError
- **Emits:** CreatedEvent (if applicable)

### Business Methods

- `methodName()` - Business operations
- **Throws:** Specific errors
- **Emits:** Domain events (if applicable)

## Business Rules

1. **Rule Name**: Description
2. **Another Rule**: Description

## Dependencies

### Base Classes

- BaseClass

### Value Objects

- Type1
- Type2

### Domain Events

- EventName

### Domain Errors

- **ErrorName**

## Tests

### Essential Tests

- Factory method with valid/invalid parameters
- Business method behavior and events
- Serialization and equality

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/domain/src/user-management/entities/user.entity.ts`
```

## Writing Guidelines

1. **Keep it concise** - Focus on essential information
2. **Use factory methods** - Always provide static creation methods
3. **Document events** - List all emitted domain events
4. **Validate early** - Validate in factory methods
5. **Test thoroughly** - Cover all methods and business rules
6. **Use domain language** - Business terminology, not technical jargon

## Quality Checklist

- [ ] All required sections are present
- [ ] Examples are realistic and complete
- [ ] Business rules are clearly documented
- [ ] Dependencies are properly documented
- [ ] Tests are comprehensive and specific
- [ ] Metadata is current and accurate
- [ ] Added location to metadata (`packages/<package>/src/<module>/<component-name-group>/<name>.<type>.ts`, e.g. `packages/domain/src/user-management/entities/user.entity.ts`)

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
