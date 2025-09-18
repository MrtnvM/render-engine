# iOS Playground - Clean Architecture with DDD

This iOS playground app has been refactored to follow Domain-Driven Design (DDD) principles and Clean Architecture patterns.

## Architecture Overview

The application is structured in four main layers:

### 1. Domain Layer (`Domain/`)

Contains the core business logic and rules, independent of any external concerns.

#### Entities

- `Component`: Represents a UI component with validation and business rules
- `Schema`: Represents a complete UI schema with validation

#### Value Objects

- `ComponentId`: Unique identifier for components
- `ComponentType`: Type-safe component types (container, button, text, etc.)
- `ComponentProperties`: Type-safe property handling with validation
- `Frame`: Immutable frame representation with validation

#### Services

- `ComponentRenderingService`: Domain service for rendering components to UIViews

#### Repositories (Interfaces)

- `SchemaRepository`: Interface for schema data access

#### Errors

- `DomainError`: Domain-specific errors
- `ApplicationError`: Application-layer errors

### 2. Application Layer (`Application/`)

Orchestrates domain objects and implements use cases.

#### Use Cases

- `FetchSchemaUseCase`: Handles schema fetching business logic
- `RenderComponentUseCase`: Handles component rendering logic

#### Services

- `SchemaService`: Application service that coordinates use cases

### 3. Infrastructure Layer (`Infrastructure/`)

Implements external concerns like networking and data persistence.

#### Network

- `NetworkClient`: HTTP client for API communication
- `HttpSchemaRepository`: HTTP implementation of SchemaRepository

#### Dependency Injection

- `DIContainer`: Manages dependency injection and object composition

### 4. Presentation Layer (`Presentation/`)

Handles UI concerns and user interactions.

#### View Controllers

- `MainViewController`: Clean architecture implementation
- `ViewController`: Legacy adapter that delegates to MainViewController

## Key Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Dependencies are injected, making unit testing easier
3. **Maintainability**: Business logic is isolated from UI and infrastructure
4. **Flexibility**: Easy to swap implementations (e.g., mock repository for testing)
5. **Domain Focus**: Core business rules are protected and clearly defined

## Usage

The app fetches a JSON schema from `http://localhost:3050/json-schema` and renders it as native iOS UI components.

### Supported Component Types

- `container`: Container view that can hold other components
- `button`: Button with title and styling
- `text`: Label with text and styling
- `image`: Image view
- `input`: Text field with placeholder

### Component Properties

Components support various properties like:

- Layout: `x`, `y`, `width`, `height`
- Styling: `bgColor`, `cornerRadius`, `borderWidth`, `borderColor`
- Content: `title`, `text`, `placeholder`, `imageName`
- Text: `textColor`, `titleColor`, `fontSize`

## Error Handling

The application includes comprehensive error handling:

- Network errors (connection issues, invalid responses)
- Domain errors (invalid component types, validation failures)
- Application errors (schema parsing, rendering failures)

All errors are properly propagated and displayed to the user through alerts.

## Testing

The architecture supports easy unit testing:

- Domain entities can be tested in isolation
- Use cases can be tested with mock repositories
- Services can be tested with mock dependencies
- UI can be tested with mock services

## Future Enhancements

- Add more component types (image, list, grid, etc.)
- Implement caching for schemas
- Add animation support
- Implement component styling system
- Add support for component events and interactions
