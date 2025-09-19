# Android Playground - Clean Architecture with DDD

This Android playground app has been implemented to follow Domain-Driven Design (DDD) principles and Clean Architecture patterns, mirroring the functionality of the iOS playground app.

## Architecture Overview

The application is structured in four main layers:

### 1. Domain Layer (`domain/`)

Contains the core business logic and rules, independent of any external concerns.

#### Entities

- `Component`: Represents a UI component with validation and business rules
- `Scenario`: Represents a complete UI scenario with validation
- `ViewStyle`: Handles component styling properties with type safety
- `Config`: Configuration wrapper for JSON data handling

#### Services

- `ComponentRenderingService`: Domain service for rendering components to Composables
- `Renderer`: Interface for component renderers

#### Repositories (Interfaces)

- `ScenarioRepository`: Interface for scenario data access

#### Errors

- `DomainError`: Domain-specific errors

### 2. Application Layer (`application/`)

Orchestrates domain objects and implements use cases.

#### Use Cases

- `FetchScenarioUseCase`: Handles scenario fetching business logic
- `RenderComponentUseCase`: Handles component rendering logic

#### Services

- `ScenarioService`: Application service that coordinates use cases

#### Errors

- `ApplicationError`: Application-layer errors

### 3. Infrastructure Layer (`infrastructure/`)

Implements external concerns like networking and data persistence.

#### Network

- `NetworkClient`: HTTP client for API communication using OkHttp
- `HttpScenarioRepository`: HTTP implementation of ScenarioRepository

#### Dependency Injection

- `DIContainer`: Manages dependency injection and object composition

### 4. Presentation Layer (`presentation/`)

Handles UI concerns and user interactions using Jetpack Compose.

#### Screens

- `MainScreen`: Main UI screen with clean architecture implementation

#### ViewModels

- `MainViewModel`: ViewModel following MVVM pattern with clean architecture

#### Renderers

- `ContainerRenderer`: Renders container components
- `ButtonRenderer`: Renders button components
- `TextRenderer`: Renders text components
- `InputRenderer`: Renders input field components

## Key Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Dependencies are injected, making unit testing easier
3. **Maintainability**: Business logic is isolated from UI and infrastructure
4. **Flexibility**: Easy to swap implementations (e.g., mock repository for testing)
5. **Domain Focus**: Core business rules are protected and clearly defined
6. **Platform Consistency**: Mirrors the iOS implementation's architecture

## Usage

The app fetches a JSON schema from `http://10.0.2.2:3050/json-schema` (Android emulator localhost) and renders it as native Android UI components using Jetpack Compose.

### Network Configuration

The app includes a network security configuration (`network_security_config.xml`) that allows HTTP traffic to localhost addresses for development purposes. This is necessary because Android blocks cleartext HTTP traffic by default for security reasons.

### Supported Component Types

- `container`: Container view that can hold other components
- `button`: Button with title and styling
- `text`: Text label with styling
- `input`: Text input field with placeholder

### Component Properties

Components support various properties like:

- Layout: `x`, `y`, `width`, `height`
- Styling: `bgColor`, `cornerRadius`, `borderWidth`, `borderColor`
- Content: `title`, `text`, `placeholder`
- Text: `textColor`, `titleColor`, `fontSize`

## Error Handling

The application includes comprehensive error handling:

- Network errors (connection issues, invalid responses)
- Domain errors (invalid component types, validation failures)
- Application errors (schema parsing, rendering failures)

All errors are properly propagated and displayed to the user through snackbars.

## Dependencies

- **Jetpack Compose**: Modern UI toolkit for Android
- **OkHttp**: HTTP client for networking
- **Retrofit**: Type-safe HTTP client
- **Gson**: JSON parsing
- **Coroutines**: Asynchronous programming
- **ViewModel**: UI-related data handling

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
- Add proper error recovery mechanisms
- Implement offline support
