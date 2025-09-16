# Spec to Code LLM Call

This module provides an LLM call that converts specification files (`.spec.md`) into complete TypeScript code following Clean Architecture principles.

## Overview

The `SpecToCodeLLMCall` class takes a `SpecFileInfo` object and generates production-ready TypeScript code that implements the specified component according to Domain-Driven Design (DDD) and Clean Architecture patterns using the `qwen/qwen3-coder` model.

## Features

- **Complete Code Generation**: Generates full TypeScript implementations from spec files
- **Clean Architecture Compliance**: Follows Clean Architecture principles and layer separation
- **Domain-Driven Design**: Implements DDD patterns (Entities, Value Objects, Domain Services, etc.)
- **Type Safety**: Uses Zod schemas for output validation
- **Comprehensive Documentation**: Generates JSDoc comments and proper documentation
- **Error Handling**: Includes proper error handling and validation
- **Multiple File Support**: Can generate multiple related files (entity + tests, etc.)

## Usage

### Basic Usage

```typescript
import { SpecToCodeLLMCall } from '@render-engine/infrastructure'
import { SpecFileInfo } from '@render-engine/domain'

// Create spec file info object
const specFile: SpecFileInfo = {
  content: await fs.readFile('task.spec.md', 'utf-8'),
  filePath: 'domain/entities/task.spec.md',
  specType: 'entity',
}

// Create LLM call
const llmCall = new SpecToCodeLLMCall({
  specFile,
  projectPath: 'packages',
})

// Generate code
const result = await llmCall.invoke()

// Process generated files
for (const file of result.files) {
  console.log(`Generated: ${file.path}`)
  console.log(`Language: ${file.language}`)
  console.log(`Code: ${file.code}`)
}
```

### Advanced Usage

```typescript
import { SpecToCodeLLMCall } from '@render-engine/infrastructure'
import { SpecFileInfo } from '@render-engine/domain'

// Convert multiple spec files
const specFilePaths = [
  'domain/entities/task.spec.md',
  'domain/value-objects/task-title.spec.md',
  'domain/events/task-created.spec.md',
]

for (const specFilePath of specFilePaths) {
  const content = await fs.readFile(specFilePath, 'utf-8')
  const specType = determineSpecType(specFilePath)

  const specFile: SpecFileInfo = {
    content,
    filePath: specFilePath,
    specType,
  }

  const llmCall = new SpecToCodeLLMCall({
    specFile,
    projectPath: 'packages',
  })

  const result = await llmCall.invoke()

  // Write generated files
  for (const file of result.files) {
    await fs.writeFile(file.path, file.code, 'utf-8')
  }
}
```

## Configuration

### Required Parameters

- `specFile`: A `SpecFileInfo` object containing:
  - `content`: The content of the specification file
  - `filePath`: The path to the specification file (for context)
  - `specType`: The type of specification (entity, value_object, domain_service, etc.)
- `projectPath`: The project root path

### Interface

```typescript
interface SpecToCodeLLMCallProps {
  specFile: SpecFileInfo
  projectPath: string
}
```

## Supported Spec Types

- **entity**: Domain entities with identity and business logic
- **value_object**: Immutable value objects
- **domain_service**: Domain services for business operations
- **domain_event**: Domain events for event-driven architecture
- **domain_error**: Domain-specific error classes
- **use_case**: Application use cases
- **dto**: Data transfer objects
- **repository**: Data access repositories
- **controller**: HTTP controllers
- **gateway**: External service gateways

## Model Information

- **Model**: `qwen/qwen3-coder`
- **Purpose**: Specialized for code generation tasks
- **Capabilities**: TypeScript, Clean Architecture, DDD patterns

## Generated Code Structure

The LLM call generates code following the Clean Architecture file structure:

```
packages/
├── domain/src/
│   ├── entities/
│   ├── value-objects/
│   ├── services/
│   ├── events/
│   └── errors/
├── application/src/
│   ├── use-cases/
│   ├── dto/
│   └── services/
└── infrastructure/src/
    ├── repositories/
    ├── controllers/
    └── gateways/
```

## Output Schema

The LLM call returns a structured output with the following schema:

```typescript
{
  files: Array<{
    path: string // File path relative to project root
    code: string // Generated code content
    language: string // Programming language (e.g., 'typescript')
  }>
}
```

The output uses the `GeneratedCode.Schema` from the domain package for validation.

## Examples

### Entity Specification

```markdown
# Task Entity

## Overview

The Task entity represents a single task in the todo application.

## Fields

- id: ID - Unique identifier
- title: TaskTitle - Task title
- status: TaskStatus - Current status

## Methods

- create(params): void
- update(params): void
- complete(): void
```

### Generated Code

The LLM call will generate:

1. **Entity file**: `packages/domain/src/entities/task.entity.ts`
2. **Index file**: `packages/domain/src/entities/index.ts`
3. **Tests file**: `packages/domain/src/entities/task.entity.test.ts` (if applicable)

## Error Handling

The LLM call includes comprehensive error handling:

- **Validation Errors**: Input validation with clear error messages
- **Business Rule Violations**: Domain-specific error handling
- **Type Safety**: TypeScript strict typing throughout
- **Edge Cases**: Proper handling of edge cases and boundary conditions

## Testing

The generated code includes:

- **Unit Tests**: Comprehensive test coverage
- **Integration Tests**: Cross-component testing
- **Edge Cases**: Boundary condition testing
- **Error Scenarios**: Error handling validation

## Best Practices

1. **Specification Quality**: Write detailed, comprehensive specifications
2. **Business Rules**: Clearly document all business rules and invariants
3. **Dependencies**: Specify all component dependencies
4. **Error Handling**: Document expected errors and their conditions
5. **Testing**: Include test scenarios in specifications

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/infrastructure/src/core/llm/spec-to-code.llm-call.ts`
