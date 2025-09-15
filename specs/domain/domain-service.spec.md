# Domain Service Specification Writing Guide

## Overview

This guide provides a comprehensive template and guidelines for writing domain service specifications in Domain-Driven Design (DDD) projects. Domain service specifications serve as the single source of truth for stateless business logic units that operate on one or more domain entities and encapsulate complex or cross-entity domain rules.

## Specification Structure

### 1. Header Section

```markdown
# [ServiceName] Domain Service

## Overview

[Brief description of what the service represents and its primary responsibilities]
```

**Guidelines:**

- Use clear, descriptive service names that reflect business logic
- Provide a concise overview of the service's purpose
- Explain the service's role in the domain and why it exists as a service
- Mention key responsibilities and stateless nature
- Clarify which entities/value objects it operates on

### 2. Service Type Section

```markdown
## Service Type

- **Type:** [Interface | Implementation | Interface + Implementation]
- **Stateless:** Yes (domain services must be stateless)
- **Business Logic:** [Description of the business logic encapsulated]
```

**Guidelines:**

- Specify whether it's an interface, implementation, or both
- Emphasize the stateless nature (required for domain services)
- Describe the specific business logic encapsulated
- Explain why this logic belongs in a service rather than an entity

### 3. Methods Section

Organize methods into logical groups:

#### 3.1 Core Business Logic Methods

```markdown
### Core Business Logic Methods

- `methodName(params: {param: Type}): ReturnType`
  - **Description:** What this method does
  - **Parameters:** Description of each parameter
  - **Returns:** Description of return value
  - **Throws:** ErrorName, AnotherError
  - **Business rules:**
    - Rule description
    - Another rule description
```

#### 3.2 Calculation Methods

```markdown
### Calculation Methods

- `calculateSomething(params: {param: Type}): ReturnType`
  - **Description:** Pure calculation logic
  - **Returns:** Description of calculated result
  - **Business rules:**
    - Calculation rule description
```

#### 3.3 Validation Methods

```markdown
### Validation Methods

- `validateSomething(params: {param: Type}): boolean`
  - **Description:** Business rule validation
  - **Returns:** true if validation passes
  - **Business rules:**
    - Validation rule description
```

**Method Documentation Guidelines:**

- Use clear, descriptive method names with imperative verbs
- Include parameter types and return types
- Document all possible exceptions
- Explain business rules clearly
- Use consistent formatting
- Group related methods together
- Focus on business logic, not implementation details

### 4. Business Rules & Invariants Section

```markdown
## Business Rules & Invariants

1. **Rule Name**: Description of the rule
2. **Another Rule**: Description of another rule
3. **Cross-Entity Rule**: Description of rules involving multiple entities
```

**Guidelines:**

- Number rules for easy reference
- Use descriptive rule names
- Explain the business logic clearly
- Include cross-entity rules (key differentiator for domain services)
- Document validation rules
- Mention stateless constraints
- Include any domain policies or strategies

### 5. Dependencies Section

```markdown
## Dependencies

### Entities

- EntityName -> Entity (operates on)
- AnotherEntity -> Entity (operates on)

### Value Objects

- ValueObjectName -> ValueObject (uses)
- AnotherValueObject -> ValueObject (uses)

### Domain Errors

- **ErrorName** - Description of when this error is thrown
- **AnotherError** - Description of when this error is thrown

### Policies/Strategies (if any)

- PolicyName -> Domain Policy (injected dependency)
- StrategyName -> Domain Strategy (injected dependency)
```

**Guidelines:**

- Categorize dependencies by type
- Use clear references to other components
- Document all domain errors with descriptions
- Include all entities the service operates on
- List all value objects used
- Document any injected policies or strategies
- Avoid infrastructure dependencies

### 6. Service Characteristics Section

```markdown
## Service Characteristics

### Stateless Nature

- No instance state between method calls
- All data passed as method parameters
- Results depend only on input parameters

### Pure Logic

- No I/O operations
- No database access
- No external service calls
- No side effects (except domain events if applicable)

### Testability

- Fully unit testable
- No mocking of infrastructure required
- Fast execution
- Deterministic results
```

### 7. Domain Events Section (if applicable)

```markdown
## Domain Events

The [ServiceName] service can emit the following domain events:

- EventName
- AnotherEvent
- ThirdEvent

**Note:** Events should only be emitted from command-style methods, not from pure calculations.
```

**Guidelines:**

- List all events the service can emit
- Use clear, descriptive event names
- Specify that events should only be emitted from command-style methods
- Reference events mentioned in methods

### 8. Tests Section

#### 8.1 Unit Tests Structure

```markdown
## Tests

### Unit Tests

#### [Method Group] Methods

- **[Method Name]:**
  - Valid input test case
  - Invalid input test case (should throw ErrorName)
  - Edge case testing
  - Boundary condition testing
  - Verify business rules are enforced
```

#### 8.2 Business Logic Tests

```markdown
### Business Logic Tests

#### Cross-Entity Rules

- Test scenarios involving multiple entities
- Verify complex business rules
- Test rule interactions

#### Calculation Accuracy

- Test calculation methods with known inputs
- Verify mathematical correctness
- Test edge cases and boundary conditions
```

#### 8.3 Integration Tests

```markdown
### Integration Tests

#### Domain Integration

- Test service with real domain entities
- Verify entity interactions
- Test complex business workflows
```

**Testing Guidelines:**

- Cover all methods and scenarios
- Include positive and negative test cases
- Test error conditions explicitly
- Verify business rules are enforced
- Test cross-entity interactions
- Include integration scenarios
- Test edge cases and boundary conditions
- Ensure tests are fast and deterministic

### 9. Usage Examples Section

````markdown
## Usage Examples

### Basic Usage

```typescript
// Example of how to use the service
const service = new ServiceName()
const result = service.methodName({ param: value })
```
````

### With Domain Entities

```typescript
// Example with domain entities
const service = new ServiceName()
const result = service.operateOnEntities(entity1, entity2, valueObject)
```

````

### 10. Metadata Section

```markdown
## Metadata

Version: 1.0.0
Last Updated: [Date or reference to analysis]
````

## Writing Guidelines

### General Principles

1. **Clarity**: Write clear, unambiguous descriptions
2. **Completeness**: Cover all aspects of the service
3. **Consistency**: Use consistent formatting and terminology
4. **Accuracy**: Ensure all information is correct and up-to-date
5. **Maintainability**: Structure for easy updates and modifications

### Content Guidelines

1. **Business Logic Focus**: Emphasize domain logic, not implementation details
2. **Stateless Nature**: Always emphasize the stateless requirement
3. **Cross-Entity Rules**: Highlight why logic belongs in a service vs. entity
4. **Errors**: Include all possible exceptions with clear descriptions
5. **Dependencies**: List all domain dependencies clearly
6. **Tests**: Provide comprehensive test coverage requirements

### Formatting Guidelines

1. **Headers**: Use consistent header hierarchy
2. **Lists**: Use bullet points for better readability
3. **Code**: Use backticks for method signatures and types
4. **Emphasis**: Use bold for important terms and error names
5. **Structure**: Maintain consistent indentation and spacing

### Review Checklist

Before finalizing a domain service specification, ensure:

- [ ] Service type and stateless nature are clearly documented
- [ ] All methods include parameters, return types, and errors
- [ ] Business rules are clearly stated and numbered
- [ ] Cross-entity rules are identified and explained
- [ ] All dependencies are documented (entities, value objects, errors)
- [ ] Service characteristics are clearly described
- [ ] Domain events are listed (if applicable)
- [ ] Test coverage is comprehensive
- [ ] Formatting is consistent throughout
- [ ] Content is accurate and up-to-date
- [ ] Language is clear and unambiguous
- [ ] Pure logic nature is emphasized

## Example Template

````markdown
# TransferService Domain Service

## Overview

The TransferService encapsulates the complex business logic for transferring funds between accounts, including validation of transfer rules, calculation of fees, and enforcement of business constraints that span multiple entities.

## Service Type

- **Type:** Implementation
- **Stateless:** Yes (domain services must be stateless)
- **Business Logic:** Fund transfer validation, fee calculation, and cross-account business rules

## Methods

### Core Business Logic Methods

- `transferFunds(params: {from: Account, to: Account, amount: Money}): void`
  - **Description:** Transfers funds from source to destination account
  - **Parameters:**
    - from: Source account entity
    - to: Destination account entity
    - amount: Amount to transfer as money value object
  - **Returns:** void
  - **Throws:** InsufficientFundsError, InvalidTransferError
  - **Business rules:**
    - Source account must have sufficient funds
    - Transfer amount must be positive
    - Accounts cannot be the same

### Calculation Methods

- `calculateTransferFee(params: {amount: Money, accountType: AccountType}): Money`
  - **Description:** Calculates transfer fee based on amount and account type
  - **Returns:** Fee amount as money value object
  - **Business rules:**
    - Premium accounts have no fees for amounts under $1000
    - Standard accounts pay 1% fee with $5 minimum

## Business Rules & Invariants

1. **Sufficient Funds Rule**: Source account must have available balance >= transfer amount
2. **Positive Amount Rule**: Transfer amount must be greater than zero
3. **Different Accounts Rule**: Source and destination accounts must be different
4. **Account Status Rule**: Both accounts must be active and not frozen
5. **Fee Calculation Rule**: Fees calculated based on account type and amount

## Dependencies

### Entities

- Account -> Entity (operates on)

### Value Objects

- Money -> ValueObject (uses)
- AccountType -> ValueObject (uses)

### Domain Errors

- **InsufficientFundsError** - Thrown when source account lacks sufficient funds
- **InvalidTransferError** - Thrown when transfer violates business rules

## Service Characteristics

### Stateless Nature

- No instance state between method calls
- All data passed as method parameters
- Results depend only on input parameters

### Pure Logic

- No I/O operations
- No database access
- No external service calls
- No side effects

### Testability

- Fully unit testable
- No mocking of infrastructure required
- Fast execution
- Deterministic results

## Tests

### Unit Tests

#### Core Business Logic Methods

- **Transfer Funds:**
  - Transfer with valid parameters
  - Transfer with insufficient funds (should throw InsufficientFundsError)
  - Transfer to same account (should throw InvalidTransferError)
  - Transfer with zero amount (should throw InvalidTransferError)

#### Calculation Methods

- **Calculate Transfer Fee:**
  - Premium account under $1000 (no fee)
  - Standard account $100 fee calculation
  - Standard account minimum fee enforcement

### Business Logic Tests

#### Cross-Entity Rules

- Test transfer between different account types
- Verify account status validation
- Test complex fee calculation scenarios

## Usage Examples

### Basic Usage

```typescript
const transferService = new TransferService()
const fee = transferService.calculateTransferFee({
  amount: Money.fromDollars(500),
  accountType: AccountType.STANDARD,
})
```
````

### With Domain Entities

```typescript
const transferService = new TransferService()
transferService.transferFunds({
  from: sourceAccount,
  to: destinationAccount,
  amount: Money.fromDollars(250),
})
```

## Metadata

Version: 1.0.0
Last Updated: [Date]

```

## Best Practices

1. **Start with the domain**: Focus on business logic, not technical implementation
2. **Be specific**: Use concrete examples and clear descriptions
3. **Think about testing**: Consider how each method and rule will be tested
4. **Consider cross-entity logic**: Document why logic belongs in a service vs. entity
5. **Plan for evolution**: Structure the spec to accommodate future changes
6. **Validate completeness**: Ensure all aspects of the service are covered
7. **Use domain language**: Use terminology that matches the business domain
8. **Document assumptions**: Make implicit business rules explicit
9. **Emphasize statelessness**: Always highlight the stateless nature
10. **Focus on pure logic**: Emphasize the absence of side effects

This guide ensures that domain service specifications are comprehensive, consistent, and maintainable, serving as effective documentation for domain modeling and implementation.
```
