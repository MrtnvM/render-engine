# Specification Writing Master Guide

## Overview

This master specification defines the comprehensive guidelines for writing all types of specifications in the CleanArch CLI project. It serves as the single source of truth for specification writing standards, referencing individual section specifications and providing component-specific templates.

## Specification Types

### Domain Layer Specifications

#### Entity Specifications

- **Purpose**: Document domain entities with identity and business logic
- **Base Class**: Extends `Entity<Id>`
- **Sections**: Header, Overview, Fields, Methods, Business Rules, Dependencies, Events, Tests, Serialization, Metadata
- **Reference**: [Entity Specification Writing Guide](./domain/entity.spec.md)

#### Value Object Specifications

- **Purpose**: Document immutable domain concepts without identity
- **Base Class**: Extends `ValueObject<T>`
- **Sections**: Header, Overview, Properties, Methods, Business Rules, Dependencies, Tests, Serialization, Metadata
- **Reference**: [Value Object Specification Writing Guide](./domain/value-object.spec.md)

#### Domain Service Specifications

- **Purpose**: Document stateless business logic units
- **Base Class**: None (pure business logic)
- **Sections**: Header, Overview, Service Type, Methods, Business Rules, Dependencies, Service Characteristics, Tests, Usage Examples, Metadata
- **Reference**: [Domain Service Specification Writing Guide](./domain/domain-service.spec.md)

#### Domain Error Specifications

- **Purpose**: Document domain-specific error types
- **Base Class**: Extends `DomainError`
- **Sections**: Header, Overview, Error Details, Error Properties, Business Rules, Error Context, Dependencies, Factory Methods, Tests, Serialization, Metadata
- **Reference**: [Domain Error Specification Writing Guide](./domain/domain-error.spec.md)

#### Domain Event Specifications

- **Purpose**: Document domain events for event-driven architecture
- **Base Class**: Extends `BaseDomainEvent`
- **Sections**: Header, Overview, Event Details, Payload, Business Rules, Event Lifecycle, Dependencies, Event Handlers, Tests, Serialization, Metadata
- **Reference**: [Domain Event Specification Writing Guide](./domain/domain-event.spec.md)

### Application Layer Specifications

#### Use Case Specifications

- **Purpose**: Document application use cases and business workflows
- **Sections**: Header, Overview, Methods, Business Rules, Dependencies, Tests, Usage Examples, Metadata
- **Reference**: [Use Case Specification Writing Guide](./application/use-case.spec.md)

#### DTO Specifications

- **Purpose**: Document data transfer objects
- **Sections**: Header, Overview, Properties, Serialization, Tests, Metadata
- **Reference**: [DTO Specification Writing Guide](./application/dto.spec.md)

### Infrastructure Layer Specifications

#### Repository Specifications

- **Purpose**: Document data access repositories
- **Sections**: Header, Overview, Methods, Dependencies, Tests, Metadata
- **Reference**: [Repository Specification Writing Guide](./infrastructure/repository.spec.md)

#### Controller Specifications

- **Purpose**: Document HTTP controllers
- **Sections**: Header, Overview, Methods, Dependencies, Tests, Metadata
- **Reference**: [Controller Specification Writing Guide](./infrastructure/controller.spec.md)

#### Gateway Specifications

- **Purpose**: Document external service integrations
- **Sections**: Header, Overview, Methods, Dependencies, Tests, Metadata
- **Reference**: [Gateway Specification Writing Guide](./infrastructure/gateway.spec.md)

#### LLM Call Specifications

- **Purpose**: Document LLM integration calls
- **Sections**: Header, Overview, Methods, Dependencies, Tests, Metadata
- **Reference**: [LLM Call Specification Writing Guide](./infrastructure/llm-call.spec.md)

## Section Specifications

### Core Sections

#### Header Section

- **Purpose**: Document title and overview
- **Required**: All specifications
- **Reference**: [Header Section Writing Specification](./sections/header.section.spec.md)

#### Overview Section

- **Purpose**: Provide comprehensive introduction
- **Required**: All specifications
- **Reference**: [Overview Section Writing Specification](./sections/overview.section.spec.md)

#### Fields/Properties Section

- **Purpose**: Document component state and data structure
- **Required**: All specifications with state
- **Reference**: [Fields/Properties Section Writing Specification](./sections/fields-properties.section.spec.md)

#### Methods Section

- **Purpose**: Document behavior and capabilities
- **Required**: All specifications with behavior
- **Reference**: [Methods Section Writing Specification](./sections/methods.section.spec.md)

#### Business Rules & Invariants Section

- **Purpose**: Document business logic and constraints
- **Required**: All specifications with business logic
- **Reference**: [Business Rules Section Writing Specification](./sections/business-rules.section.spec.md)

#### Dependencies Section

- **Purpose**: Document external dependencies and relationships
- **Required**: All specifications
- **Reference**: [Dependencies Section Writing Specification](./sections/dependencies.section.spec.md)

#### Tests Section

- **Purpose**: Document comprehensive testing requirements
- **Required**: All specifications
- **Reference**: [Tests Section Writing Specification](./sections/tests.section.spec.md)

#### Serialization Section

- **Purpose**: Document JSON serialization format and rules
- **Required**: All specifications with serialization
- **Reference**: [Serialization Section Writing Specification](./sections/serialization.section.spec.md)

#### Metadata Section

- **Purpose**: Provide version and maintenance information
- **Required**: All specifications
- **Reference**: [Metadata Section Writing Specification](./sections/metadata.section.spec.md)

## Writing Process

### 1. Planning Phase

1. **Identify Component Type**: Determine the type of specification needed
2. **Review Base Class**: Understand the base class requirements
3. **Identify Sections**: Determine which sections are required
4. **Gather Requirements**: Collect business requirements and constraints
5. **Plan Structure**: Outline the specification structure

### 2. Writing Phase

1. **Start with Header**: Write the title and overview
2. **Document State**: Document fields/properties if applicable
3. **Document Behavior**: Document methods and capabilities
4. **Document Rules**: Document business rules and invariants
5. **Document Dependencies**: Document all external dependencies
6. **Document Events**: Document domain events if applicable
7. **Document Tests**: Document comprehensive testing requirements
8. **Document Serialization**: Document JSON format if applicable
9. **Add Metadata**: Add version and maintenance information

### 3. Review Phase

1. **Check Completeness**: Ensure all required sections are present
2. **Validate Content**: Verify content accuracy and consistency
3. **Check Formatting**: Ensure consistent formatting throughout
4. **Review Language**: Use domain language consistently
5. **Validate References**: Check all references are correct
6. **Test Examples**: Ensure examples are accurate and complete

### 4. Maintenance Phase

1. **Update Version**: Increment version when making changes
2. **Update Date**: Update last updated date
3. **Track Changes**: Document significant changes
4. **Keep Current**: Ensure information remains accurate

## Quality Standards

### Content Quality

1. **Accuracy**: All information must be accurate and up-to-date
2. **Completeness**: All required sections must be present
3. **Consistency**: Use consistent terminology and formatting
4. **Clarity**: Write clear, unambiguous descriptions
5. **Domain Focus**: Use business language, not technical jargon

### Formatting Quality

1. **Consistent Headers**: Use consistent header hierarchy
2. **Proper Lists**: Use bullet points and numbered lists appropriately
3. **Code Formatting**: Use backticks for code and types
4. **Emphasis**: Use bold for important terms and error names
5. **Structure**: Maintain consistent indentation and spacing

### Language Quality

1. **Domain Language**: Use business terminology consistently
2. **Active Voice**: Write in active voice for clarity
3. **Specific Terms**: Use specific, concrete language
4. **Professional Tone**: Maintain professional tone throughout
5. **Clear Descriptions**: Provide clear, actionable descriptions

## Common Patterns

### Specification Structure Pattern

```markdown
# [ComponentName] [ComponentType]

## Overview

[Comprehensive introduction]

## [State Section]

[Fields/Properties if applicable]

## Methods

[Behavior documentation]

## Business Rules & Invariants

[Business logic documentation]

## Dependencies

[External dependencies]

## [Component-Specific Sections]

[Events, Factory Methods, etc.]

## Tests

[Testing requirements]

## Serialization

[JSON format if applicable]

## Metadata

[Version and maintenance information]
```

## Quality Checklist

Before finalizing any specification, ensure:

- [ ] All required sections are present
- [ ] Content is accurate and up-to-date
- [ ] Language uses domain terminology consistently
- [ ] Formatting is consistent throughout
- [ ] All references are correct and valid
- [ ] Examples are realistic and complete
- [ ] Business rules are clearly documented
- [ ] Dependencies are properly documented
- [ ] Tests are comprehensive and specific
- [ ] Serialization format is complete (if applicable)
- [ ] Metadata is current and accurate
- [ ] Specification follows component-specific guidelines

## References

### Section Specifications

- [Header Section Writing Specification](./sections/header.section.spec.md)
- [Overview Section Writing Specification](./sections/overview.section.spec.md)
- [Fields/Properties Section Writing Specification](./sections/fields-properties.section.spec.md)
- [Methods Section Writing Specification](./sections/methods.section.spec.md)
- [Business Rules Section Writing Specification](./sections/business-rules.section.spec.md)
- [Dependencies Section Writing Specification](./sections/dependencies.section.spec.md)
- [Tests Section Writing Specification](./sections/tests.section.spec.md)
- [Serialization Section Writing Specification](./sections/serialization.section.spec.md)
- [Metadata Section Writing Specification](./sections/metadata.section.spec.md)

### Component Specifications

- [Entity Specification Writing Guide](./domain/entity.spec.md)
- [Value Object Specification Writing Guide](./domain/value-object.spec.md)
- [Domain Service Specification Writing Guide](./domain/domain-service.spec.md)
- [Domain Error Specification Writing Guide](./domain/domain-error.spec.md)
- [Domain Event Specification Writing Guide](./domain/domain-event.spec.md)

### Supporting Specifications

- [Error Reference Guide](./references/error.reference.md)

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
