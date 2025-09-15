# SpecService

The SpecService is a codegen service that analyzes specification files to extract component dependencies and organize them into build groups for parallel processing.

## Overview

The SpecService provides functionality to:

- **Load spec files** from a directory structure
- **Extract component dependencies** using LLM analysis
- **Sort components** into dependency groups for parallel building
- **Detect circular dependencies** and handle errors gracefully

## Architecture

### Domain Layer (`@render-engine/domain`)

- **`SpecServiceInterface`** - Service contract definition
- **`SpecComponent`** - Component with name and dependencies
- **`SpecDependency`** - Individual dependency information
- **`DependencyGroup`** - Group of components that can be built in parallel
- **`SpecFileInfo`** - Spec file metadata and content

### Application Layer (`@render-engine/application`)

- **`SpecService`** - Main service implementation
- Handles file system operations
- Orchestrates LLM calls
- Implements dependency sorting algorithm

### Infrastructure Layer (`@render-engine/infrastructure`)

- **`SpecComponentAnalysisLLMCall`** - LLM call for extracting dependencies
- Uses structured output with Zod validation
- Follows existing LLM call patterns

## Usage

### Basic Usage

```typescript
import { SpecService } from '@render-engine/application'

const specService = new SpecService()

// Get build groups for a directory
const buildGroups = await specService.getBuildGroups('/path/to/spec/files')

// Process each group in parallel
for (const group of buildGroups) {
  console.log(`Building group ${group.level}:`)
  group.components.forEach((component) => {
    console.log(`  - ${component.name}`)
  })
  // Build components in this group in parallel
}
```

### Advanced Usage

```typescript
import { SpecService } from '@render-engine/application'

const specService = new SpecService()

// Step 1: Load spec files
const specFiles = await specService.loadSpecFiles('/path/to/spec/files')

// Step 2: Extract components
const components = await specService.extractComponents(specFiles)

// Step 3: Sort by dependencies
const groups = specService.sortComponentsByDependencies(components)

// Process groups sequentially, components within groups in parallel
for (const group of groups) {
  await Promise.all(group.components.map((component) => buildComponent(component)))
}
```

## Spec File Format

The service analyzes markdown specification files (`.spec.md`) with the following structure:

```markdown
# ComponentName Entity/ValueObject/Aggregate

## Overview

Description of the component...

## Dependencies

### Value Objects

- ID
- TaskTitle
- DateTime

### Entities

- Subtask
- User

### Domain Errors

- ValidationError
- TaskTitleRequiredError

### Domain Events

- TaskCreated
- TaskUpdated
```

## Component Types

The service recognizes the following component types:

### Domain Layer

- `entity` - Domain entities with identity
- `value_object` - Immutable domain concepts
- `domain_service` - Domain operations
- `domain_event` - Domain events
- `domain_error` - Domain error types

### Application Layer

- `use_case` - Application use cases
- `dto` - Data transfer objects
- `app_service` - Application services
- `job` - Background jobs

### Interface Adapters Layer

- `controller` - API controllers
- `presenter` - Data presentation
- `view_model` - View models
- `gateway` - External integrations
- `repository` - Data access
- `event_handler` - Event processing

### Infrastructure Layer

- `infrastructure` - Technical concerns

## Dependency Sorting Algorithm

The service uses a topological sort algorithm (Kahn's algorithm) to organize components:

1. **Build dependency graph** from component dependencies
2. **Calculate in-degrees** for each component
3. **Group components** by dependency level:
   - Group 0: Components with no dependencies
   - Group 1: Components that only depend on Group 0
   - Group 2: Components that depend on Groups 0-1
   - And so on...

### Example

Given components:

- `TaskTitle` (no dependencies)
- `ID` (no dependencies)
- `Task` (depends on `TaskTitle`, `ID`)
- `TaskService` (depends on `Task`)

Result:

- **Group 0**: `TaskTitle`, `ID` (build in parallel)
- **Group 1**: `Task` (build after Group 0)
- **Group 2**: `TaskService` (build after Group 1)

## Error Handling

The service handles various error scenarios:

- **File system errors** - Graceful handling of missing directories/files
- **LLM call failures** - Continues processing other files
- **Circular dependencies** - Detection and error reporting
- **Invalid spec files** - Skips problematic files

## Testing

The service includes comprehensive tests:

```bash
# Run tests
npm test spec.service.test.ts

# Run with coverage
npm test -- --coverage spec.service.test.ts
```

## Configuration

### Environment Variables

- `OPENAI_API_KEY` - Required for LLM calls
- `OPENROUTER_API_KEY` - Alternative LLM provider

### LLM Model

The service uses `openai/gpt-5-mini` by default, configurable in the LLM call implementation.

## Examples

See `packages/application/examples/spec-service.example.ts` for a complete working example.

## Integration

The SpecService integrates with the existing codegen architecture:

- Uses established service patterns
- Follows dependency injection principles
- Integrates with existing component types
- Maintains consistency with LLM call patterns

## Performance Considerations

- **Parallel processing** - Components within the same group can be built in parallel
- **LLM call optimization** - Batched processing where possible
- **Memory efficiency** - Streams large files when possible
- **Error resilience** - Continues processing despite individual failures

## Future Enhancements

- **Caching** - Cache LLM analysis results
- **Incremental updates** - Only process changed files
- **Custom spec formats** - Support for different spec file formats
- **Dependency validation** - Validate dependency references
- **Build optimization** - Suggest optimal build strategies
