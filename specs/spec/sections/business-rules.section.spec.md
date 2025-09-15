# Business Rules & Invariants Section Writing Specification

## Overview

Defines the standard format for writing business rules and invariants sections. Documents business logic, constraints, and invariants that govern component behavior and ensure data integrity.

## Section Structure

### Standard Format

```markdown
## Business Rules & Invariants

1. **Rule Name**: Description of the rule
2. **Another Rule**: Description of another rule
3. **Cross-Entity Rule**: Description of rules involving multiple entities
4. **Validation Rule**: Description of validation requirements
5. **State Rule**: Description of state transition rules
```

### Component-Specific Formats

**Value Objects:**

```markdown
## Business Rules & Invariants

1. **Validation Rule**: Description of the validation rule
2. **Format Rule**: Description of the format requirement
3. **Range Rule**: Description of value range constraints
```

**Domain Services:**

```markdown
## Business Rules & Invariants

1. **Rule Name**: Description of the rule
2. **Cross-Entity Rule**: Description of rules involving multiple entities
3. **Calculation Rule**: Description of calculation requirements
```

**Domain Errors:**

```markdown
## Business Rules

1. **Rule Name**: Description of the rule
2. **Validation Rule**: Description of validation requirements
3. **Context Rule**: Description of context requirements
```

## Writing Guidelines

### Rule Documentation

- Use descriptive, business-focused names
- Clear explanations with business context
- Sequential numbering for reference
- Consistent formatting and terminology
- Complete coverage of relevant rules

### Rule Types

- **Validation Rules**: Input validation and data integrity
- **State Rules**: State transition and lifecycle rules
- **Business Rules**: Domain-specific business logic
- **Constraint Rules**: Data and relationship constraints
- **Invariant Rules**: Properties that must always be true

### Description Guidelines

- Be specific with concrete language
- Use domain terminology
- Explain business reasons
- Include examples when helpful
- Make rules actionable

## Examples

### Entity Business Rules

```markdown
## Business Rules & Invariants

1. **Task Title Required**: Every task must have a non-empty title
2. **Status Transition Rule**: Tasks can only transition from 'pending' to 'in-progress' to 'completed'
3. **Assignment Rule**: Only active users can be assigned to tasks
4. **Due Date Rule**: Due date must be in the future when set
5. **Completion Rule**: Tasks can only be completed by assigned users
6. **Priority Rule**: High priority tasks must be assigned within 24 hours
```

### Value Object Business Rules

```markdown
## Business Rules & Invariants

1. **Validation Rule**: Task title must be between 1 and 100 characters
2. **Format Rule**: Task title must not contain special characters except spaces and hyphens
3. **Range Rule**: Task title must start and end with alphanumeric characters
4. **Immutability Rule**: Task title cannot be changed after creation
```

### Domain Service Business Rules

```markdown
## Business Rules & Invariants

1. **Assignment Rule**: Tasks can only be assigned to users with required skills
2. **Workload Rule**: Users cannot exceed 80% of their maximum capacity
3. **Priority Rule**: High priority tasks must be assigned before low priority tasks
4. **Cross-Entity Rule**: Task assignment affects both task and user entities
```

### Domain Error Business Rules

```markdown
## Business Rules

1. **Error Code Rule**: Each error type must have a unique error code
2. **Message Rule**: Error messages must be clear and user-friendly
3. **Context Rule**: Error metadata must include relevant context information
4. **Serialization Rule**: All error data must be JSON serializable
```

## Rule Naming Conventions

### Naming Patterns

- **Action + Object**: "Task Title Required", "User Assignment Rule"
- **Constraint + Object**: "Maximum Length Rule", "Minimum Value Rule"
- **State + Transition**: "Status Transition Rule", "State Change Rule"
- **Business + Concept**: "Priority Assignment Rule", "Workload Balance Rule"

### Best Practices

- Use domain terminology and business language
- Be descriptive and consistent in naming patterns
- Keep names concise but explanatory
- Use title case capitalization

## Quality Checklist

Before finalizing a business rules section, ensure:

- [ ] All relevant rules are documented with descriptive names
- [ ] Descriptions are clear, specific, and include business context
- [ ] Rules are numbered sequentially and use domain terminology
- [ ] Rules are actionable and implementable
- [ ] Information is accurate and formatting is consistent

## Common Mistakes to Avoid

1. **Vague Rules**: Be specific about requirements
2. **Missing Context**: Explain why the rule exists
3. **Technical Language**: Use business language, not technical terms
4. **Incomplete Coverage**: Document all relevant rules
5. **Unclear Descriptions**: Make rules clear and actionable

## Special Considerations

### Cross-Entity Rules

- Document rules spanning multiple entities
- Explain entity interactions and relationship constraints

### State Transition Rules

- Document valid state transitions and conditions
- Mention invalid transitions

### Validation Rules

- Document input validation requirements and criteria
- Mention error conditions

### Performance & Security Rules

- Document performance constraints and optimization requirements
- Explain security constraints and access control requirements

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
Maintainer: Specification Writing Team
