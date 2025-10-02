# iOS SDK Migration Plan: Playground to Package

## Executive Summary

This document outlines the implementation plan for migrating the Render iOS SDK from the `render-ios-playground/SDK/` directory to the standalone `render-ios-sdk` Swift Package located at `packages/render-ios-sdk/`.

**Status**: 🟡 In Planning  
**Created**: October 2, 2025  
**Target Completion**: TBD

---

## 1. Current State Analysis

### 1.1 Playground SDK Structure

The SDK currently resides in `apps/render-ios-playground/render-ios-playground/SDK/` with the following architecture:

```
SDK/
├── Core/
│   ├── DependencyInjection/
│   │   └── DIContainer.swift          # Dependency injection container
│   ├── Errors/
│   │   └── RenderSDKError.swift       # SDK-specific error types
│   └── Network/
│       └── NetworkClient.swift        # Network abstraction layer
├── Debug/
│   ├── ColorizeView.swift             # Debug visualization
│   ├── Logger.swift                   # Logging infrastructure
│   └── LogViewTree.swift              # View hierarchy logging
├── Models/
│   ├── Component.swift                # Core component model
│   ├── Config.swift                   # Configuration wrapper
│   ├── JSONValue.swift                # JSON value handling
│   └── Scenario.swift                 # Scenario/screen model
├── Providers/
│   ├── ValueProvider.swift            # Value resolution system
│   └── Resolvers/
│       ├── PropsResolver.swift        # Props resolution
│       └── ScalarResolver.swift       # Scalar value resolution
├── Repositories/
│   ├── ScenarioRepository.swift       # Repository protocol
│   └── ScenarioRepositoryImpl.swift   # Supabase implementation
├── UI/
│   ├── ComponentRegistry.swift        # Component renderer registry
│   ├── ImageLoader.swift              # Async image loading
│   ├── Renderable.swift               # Renderable protocol
│   ├── Renderer.swift                 # Renderer protocol
│   ├── ViewTreeBuilder.swift          # View tree construction
│   ├── Renderers/                     # 12 component renderers
│   │   ├── ButtonRenderer.swift
│   │   ├── CheckboxRenderer.swift
│   │   ├── ColumnRenderer.swift
│   │   ├── ImageRenderer.swift
│   │   ├── NavbarRenderer.swift
│   │   ├── RatingRenderer.swift
│   │   ├── RowRenderer.swift
│   │   ├── SpacerRenderer.swift
│   │   ├── StackRenderer.swift
│   │   ├── StepperRenderer.swift
│   │   ├── TextRenderer.swift
│   │   └── ViewRenderer.swift
│   ├── Styles/
│   │   ├── ViewStyle.swift            # Style parsing and application
│   │   └── Extensions/                # 6 style extensions
│   │       ├── ViewStyle+Border.swift
│   │       ├── ViewStyle+Color.swift
│   │       ├── ViewStyle+Flex.swift
│   │       ├── ViewStyle+Shadow.swift
│   │       ├── ViewStyle+Text.swift
│   │       └── ViewStyle+TextStyle.swift
│   ├── Utils/
│   │   └── ColorParser.swift          # Color string parsing
│   ├── ViewControllers/
│   │   └── RenderViewController.swift # Main rendering VC
│   └── Views/
│       ├── RenderableView.swift       # Base renderable view
│       └── RootFlexView.swift         # Root flex container
└── RenderSDK.swift                    # Public SDK interface

**Total Files**: ~45 Swift files
```

### 1.2 External Dependencies

The SDK depends on the following external packages:

1. **FlexLayout** (v2.2.2+)

   - Purpose: Flexbox-style layout system
   - Repository: https://github.com/layoutBox/FlexLayout.git
   - Used in: ViewTreeBuilder, RootFlexView, Renderable, and various renderers

2. **Supabase-swift** (v2.5.1+)

   - Purpose: Backend data fetching (scenarios/components)
   - Repository: https://github.com/supabase/supabase-swift.git
   - Products used: Supabase, Auth, Functions, PostgREST, Realtime, Storage
   - Used in: DIContainer, ScenarioRepositoryImpl, RenderSDK

3. **UIKit** (iOS SDK)
   - Purpose: Core UI framework
   - Used throughout the SDK

### 1.3 Target Package Structure

Current state of `packages/render-ios-sdk/`:

```
render-ios-sdk/
├── Package.swift                      # Package manifest (basic stub)
├── README.md                          # Package documentation
├── Sources/
│   └── RenderEngine/
│       └── render_ios_sdk.swift       # Stub implementation
└── Tests/
    └── RenderEngineTests/
        └── render_ios_sdkTests.swift  # Stub tests
```

The package is already integrated into the playground project as a local dependency but contains only placeholder code.

---

## 2. Migration Strategy

### 2.1 Principles

1. **Incremental Migration**: Migrate in logical groups to maintain testability
2. **Public API Design**: Carefully design public vs internal APIs
3. **Dependency Management**: Properly declare all external dependencies
4. **Backward Compatibility**: Maintain playground functionality during migration
5. **Testing**: Add comprehensive tests for each migrated component
6. **Documentation**: Document all public APIs using Swift DocC

### 2.2 Migration Phases

#### Phase 1: Foundation & Core Models (Week 1)

- Set up package dependencies
- Migrate core models and utilities
- Establish public API boundaries

#### Phase 2: Rendering Infrastructure (Week 2)

- Migrate rendering protocols and base classes
- Migrate style system
- Migrate view tree builder

#### Phase 3: Component Renderers (Week 3)

- Migrate all 12 component renderers
- Migrate Renderable protocol and implementations
- Test individual renderers

#### Phase 4: Integration & Networking (Week 4)

- Migrate repositories and networking
- Migrate DI container
- Migrate main SDK interface

#### Phase 5: Testing & Documentation (Week 5)

- Write comprehensive unit tests
- Create API documentation
- Migration guide for consumers

#### Phase 6: Playground Migration & Cleanup (Week 6)

- Update playground to use package
- Remove local SDK directory
- Final integration testing

---

## 3. Detailed Implementation Plan

### Phase 1: Foundation & Core Models

#### Step 1.1: Update Package.swift

**Location**: `packages/render-ios-sdk/Package.swift`

**Tasks**:

1. Add platform support (iOS 13+)
2. Add FlexLayout dependency
3. Add Supabase dependency
4. Configure build settings

**Implementation**:

```swift
// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "render-ios-sdk",
    platforms: [
        .iOS(.v13)
    ],
    products: [
        .library(
            name: "RenderEngine",
            targets: ["RenderEngine"]
        ),
    ],
    dependencies: [
        .package(
            url: "https://github.com/layoutBox/FlexLayout.git",
            from: "2.2.2"
        ),
        .package(
            url: "https://github.com/supabase/supabase-swift.git",
            from: "2.5.1"
        ),
    ],
    targets: [
        .target(
            name: "RenderEngine",
            dependencies: [
                .product(name: "FlexLayout", package: "FlexLayout"),
                .product(name: "Supabase", package: "supabase-swift"),
            ]
        ),
        .testTarget(
            name: "RenderEngineTests",
            dependencies: ["RenderEngine"]
        ),
    ]
)
```

**Files to create/modify**:

- `Package.swift` (modify)

#### Step 1.2: Migrate Core Models

**Priority**: HIGH - These are foundational

**Files to migrate**:

1. `Models/JSONValue.swift` → `Sources/RenderEngine/Models/JSONValue.swift`
2. `Models/Config.swift` → `Sources/RenderEngine/Models/Config.swift`
3. `Models/Component.swift` → `Sources/RenderEngine/Models/Component.swift`
4. `Models/Scenario.swift` → `Sources/RenderEngine/Models/Scenario.swift`

**Public API Considerations**:

- Mark `Config` as `public` - used by consumers
- Mark `Component` as `public` - used by consumers
- Mark `Scenario` as `public` - used by consumers
- Mark `JSONValue` as `public` - used in Scenario

**Changes required**:

- Add `public` access modifiers to classes and key methods
- Update imports to remove Supabase from models (move to repository layer)
- Ensure all types are marked correctly (public/internal)

#### Step 1.3: Migrate Core Errors

**Priority**: HIGH

**Files to migrate**:

1. `Core/Errors/RenderSDKError.swift` → `Sources/RenderEngine/Core/Errors/RenderSDKError.swift`

**Public API**:

- Mark `RenderSDKError` as `public`
- Mark all cases as `public`
- Add comprehensive error descriptions

#### Step 1.4: Migrate Utilities

**Priority**: MEDIUM

**Files to migrate**:

1. `UI/Utils/ColorParser.swift` → `Sources/RenderEngine/UI/Utils/ColorParser.swift`

**Public API**:

- Keep utilities as `internal` unless needed by consumers
- Document complex parsing logic

**Tests to add**:

- `ConfigTests.swift` - test nested key resolution, type conversions
- `ComponentTests.swift` - test component creation, circular dependency detection
- `ColorParserTests.swift` - test color string parsing

---

### Phase 2: Rendering Infrastructure

#### Step 2.1: Migrate Style System

**Priority**: HIGH - Required by renderers

**Files to migrate**:

1. `UI/Styles/ViewStyle.swift` → `Sources/RenderEngine/UI/Styles/ViewStyle.swift`
2. All style extensions:
   - `ViewStyle+Border.swift`
   - `ViewStyle+Color.swift`
   - `ViewStyle+Flex.swift`
   - `ViewStyle+Shadow.swift`
   - `ViewStyle+Text.swift`
   - `ViewStyle+TextStyle.swift`

**Public API**:

- Mark `ViewStyle` as `public`
- Keep extension methods internal or public based on usage
- Ensure proper type safety with enums

**Dependencies**:

- Requires: Config, ColorParser
- FlexLayout for flex properties

#### Step 2.2: Migrate Rendering Protocols

**Priority**: HIGH

**Files to migrate**:

1. `UI/Renderer.swift` → `Sources/RenderEngine/UI/Renderer.swift`
2. `UI/Renderable.swift` → `Sources/RenderEngine/UI/Renderable.swift`
3. `UI/ComponentRegistry.swift` → `Sources/RenderEngine/UI/ComponentRegistry.swift`

**Public API**:

- Mark `Renderer` protocol as `public` - custom renderers
- Mark `Renderable` protocol as `public` - custom components
- Mark `ComponentRegistry` as `public` - registration
- Mark `RendererContext` as `public`

**Dependencies**:

- Requires: Component, Config, Scenario, ViewStyle

#### Step 2.3: Migrate View Base Classes

**Priority**: HIGH

**Files to migrate**:

1. `UI/Views/RenderableView.swift` → `Sources/RenderEngine/UI/Views/RenderableView.swift`
2. `UI/Views/RootFlexView.swift` → `Sources/RenderEngine/UI/Views/RootFlexView.swift`

**Public API**:

- Mark base view classes as `public`
- Document usage patterns

#### Step 2.4: Migrate ViewTreeBuilder

**Priority**: HIGH - Core rendering logic

**Files to migrate**:

1. `UI/ViewTreeBuilder.swift` → `Sources/RenderEngine/UI/ViewTreeBuilder.swift`

**Public API**:

- Mark `ViewTreeBuilder` as `internal` (used by RenderViewController)
- Focus on internal API correctness

**Tests to add**:

- `ViewStyleTests.swift` - test style parsing
- `ComponentRegistryTests.swift` - test registration/retrieval

---

### Phase 3: Component Renderers

#### Step 3.1: Migrate All Renderers

**Priority**: MEDIUM - Required for complete functionality

**Files to migrate** (in dependency order):

1. `UI/Renderers/ViewRenderer.swift` - Base/container
2. `UI/Renderers/TextRenderer.swift` - Simple component
3. `UI/Renderers/SpacerRenderer.swift` - Simple component
4. `UI/Renderers/ImageRenderer.swift` - Async loading
5. `UI/Renderers/ButtonRenderer.swift` - Interactive
6. `UI/Renderers/CheckboxRenderer.swift` - Interactive
7. `UI/Renderers/RowRenderer.swift` - Layout
8. `UI/Renderers/ColumnRenderer.swift` - Layout
9. `UI/Renderers/StackRenderer.swift` - Layout
10. `UI/Renderers/StepperRenderer.swift` - Complex
11. `UI/Renderers/RatingRenderer.swift` - Complex
12. `UI/Renderers/NavbarRenderer.swift` - Complex

**Public API**:

- All renderers should be `internal` by default
- Make them `public` if custom renderer extension is desired
- Document renderer behavior in comments

**Dependencies**:

- Requires: Renderer protocol, Renderable protocol, ViewStyle
- Each renderer needs Component, Config, RendererContext

**Note**: Renderers reference DIContainer for logger and other dependencies. Need to handle DI migration first or make renderers accept dependencies via initializer.

#### Step 3.2: Migrate ImageLoader

**Priority**: MEDIUM

**Files to migrate**:

1. `UI/ImageLoader.swift` → `Sources/RenderEngine/UI/ImageLoader.swift`

**Public API**:

- Mark as `public` if consumers can use it
- Otherwise keep `internal`

---

### Phase 4: Integration & Networking

#### Step 4.1: Migrate Logger System

**Priority**: HIGH - Used throughout SDK

**Files to migrate**:

1. `Debug/Logger.swift` → `Sources/RenderEngine/Debug/Logger.swift`
2. `Debug/LogViewTree.swift` → `Sources/RenderEngine/Debug/LogViewTree.swift` (optional)
3. `Debug/ColorizeView.swift` → `Sources/RenderEngine/Debug/ColorizeView.swift` (optional)

**Public API**:

- Mark `Logger` protocol as `public`
- Mark concrete logger implementations as `public`
- Mark `LogLevel` as `public`
- Debug utilities can be `internal`

**Considerations**:

- Consumers should be able to inject custom loggers
- Default logger should be sensible (console in debug, file in production)

#### Step 4.2: Migrate Providers

**Priority**: MEDIUM

**Files to migrate**:

1. `Providers/ValueProvider.swift` → `Sources/RenderEngine/Providers/ValueProvider.swift`
2. `Providers/Resolvers/ScalarResolver.swift` → `Sources/RenderEngine/Providers/Resolvers/ScalarResolver.swift`
3. `Providers/Resolvers/PropsResolver.swift` → `Sources/RenderEngine/Providers/Resolvers/PropsResolver.swift`

**Public API**:

- Keep as `internal` unless custom resolvers needed
- Document resolver behavior

#### Step 4.3: Migrate Repository Layer

**Priority**: HIGH

**Files to migrate**:

1. `Repositories/ScenarioRepository.swift` → `Sources/RenderEngine/Repositories/ScenarioRepository.swift`
2. `Repositories/ScenarioRepositoryImpl.swift` → `Sources/RenderEngine/Repositories/ScenarioRepositoryImpl.swift`

**Public API**:

- Mark `ScenarioRepository` protocol as `public` - allow custom implementations
- Mark `ScenarioRepositoryImpl` as `public` - default implementation
- Document protocol methods

**Dependencies**:

- Requires: Supabase
- Requires: Scenario, Component models

#### Step 4.4: Migrate Network Layer

**Priority**: MEDIUM

**Files to migrate**:

1. `Core/Network/NetworkClient.swift` → `Sources/RenderEngine/Core/Network/NetworkClient.swift`

**Public API**:

- Keep as `internal` (implementation detail)
- Consider abstracting if needed for testing

#### Step 4.5: Migrate DI Container

**Priority**: HIGH - Central to SDK architecture

**Files to migrate**:

1. `Core/DependencyInjection/DIContainer.swift` → `Sources/RenderEngine/Core/DependencyInjection/DIContainer.swift`

**Changes required**:

- Refactor to make initialization more flexible
- Allow dependency injection from consumers
- Consider making it protocol-based for testing
- Remove hardcoded Supabase credentials (move to initialization)

**Public API**:

- Keep `DIContainer` as `internal`
- Provide configuration through public SDK interface

#### Step 4.6: Migrate View Controllers

**Priority**: HIGH

**Files to migrate**:

1. `UI/ViewControllers/RenderViewController.swift` → `Sources/RenderEngine/UI/ViewControllers/RenderViewController.swift`

**Public API**:

- Mark `RenderViewController` as `public` - main consumer API

**Dependencies**:

- Requires: Scenario, ViewTreeBuilder, ComponentRegistry

#### Step 4.7: Migrate Main SDK Interface

**Priority**: HIGH - Public API

**Files to migrate**:

1. `RenderSDK.swift` → `Sources/RenderEngine/RenderSDK.swift`

**Changes required**:

- Rename from `RenderSDK` to `RenderEngine` (align with package name)
- Add initialization configuration
- Add SDK version management
- Add public configuration methods
- Make Supabase configuration injectable

**Public API Design**:

```swift
public class RenderEngine {
    public static let shared: RenderEngine

    // Configuration
    public func configure(
        supabaseURL: URL,
        supabaseKey: String,
        loggerConfiguration: LoggerConfiguration? = nil
    )

    // Rendering methods
    public func render(
        scenarioKey: String,
        in viewController: UIViewController,
        containerView: UIView? = nil
    ) async throws

    public func getViewController(scenarioKey: String) -> RenderViewController

    // Logger configuration
    public func configureLogger(_ configuration: LoggerConfiguration)
    public func getLogFileURL() -> URL?

    // Version
    public var version: String { get }
}
```

---

### Phase 5: Testing & Documentation

#### Step 5.1: Unit Tests

**Priority**: HIGH

**Tests to create**:

1. **Model Tests**

   - `ConfigTests.swift` - Config parsing, merging, nested keys
   - `ComponentTests.swift` - Component creation, circular dependencies
   - `ScenarioTests.swift` - Scenario parsing
   - `JSONValueTests.swift` - JSON value conversions

2. **Utility Tests**

   - `ColorParserTests.swift` - Color string parsing

3. **Style Tests**

   - `ViewStyleTests.swift` - Style parsing and application

4. **Renderer Tests**

   - `ComponentRegistryTests.swift` - Registration and lookup
   - Individual renderer tests (12 files)

5. **Integration Tests**

   - `ViewTreeBuilderTests.swift` - View tree construction
   - `RenderEngineIntegrationTests.swift` - End-to-end scenarios

6. **Repository Tests**
   - `ScenarioRepositoryTests.swift` - Mock network tests

**Testing Strategy**:

- Use XCTest framework
- Mock external dependencies (Supabase, network)
- Test both success and failure paths
- Aim for >80% code coverage

#### Step 5.2: Documentation

**Priority**: HIGH

**Documentation to create**:

1. **API Documentation** (Swift DocC)

   - Document all public classes, methods, properties
   - Add code examples
   - Create tutorials

2. **Integration Guide**

   - How to add package to Xcode project
   - SPM integration
   - CocoaPods integration (optional)
   - Carthage integration (optional)

3. **Migration Guide**

   - For playground app
   - For external consumers

4. **Architecture Documentation**

   - SDK architecture overview
   - Component system explanation
   - Rendering pipeline
   - Custom renderer creation

5. **Examples**
   - Basic usage examples
   - Custom renderer examples
   - Custom repository examples
   - Logger configuration examples

**Files to create**:

- `Documentation.docc/` - DocC documentation bundle
- `INTEGRATION.md` - Integration guide
- `ARCHITECTURE.md` - Architecture documentation
- `EXAMPLES.md` - Usage examples
- Update `README.md` with comprehensive information

---

### Phase 6: Playground Migration & Cleanup

#### Step 6.1: Update Playground to Use Package

**Priority**: HIGH

**Tasks**:

1. **Remove local imports**

   - Find all `import` statements in playground app
   - Replace local SDK references with `import RenderEngine`

2. **Update RenderSDK references**

   - Replace `RenderSDK.shared` with `RenderEngine.shared`
   - Update initialization code in AppDelegate

3. **Update DIContainer usage**

   - Remove direct DIContainer access
   - Use RenderEngine public API

4. **Test all scenarios**
   - Verify all screens render correctly
   - Test all interactions
   - Verify logging works
   - Test error handling

#### Step 6.2: Remove Local SDK Directory

**Priority**: MEDIUM

**Tasks**:

1. Remove `apps/render-ios-playground/render-ios-playground/SDK/` directory
2. Update `.gitignore` if needed
3. Update project file references
4. Clean Xcode derived data

#### Step 6.3: Update Documentation

**Priority**: MEDIUM

**Files to update**:

- `apps/render-ios-playground/SDK_INTEGRATION.md` - Update with final state
- `apps/render-ios-playground/CONNECTION_SUMMARY.md` - Mark migration complete
- Create `apps/render-ios-playground/MIGRATION_COMPLETE.md` with notes

---

## 4. Public API Design

### 4.1 Core Public Types

```swift
// Main SDK entry point
public class RenderEngine

// Configuration
public struct RenderEngineConfiguration
public struct LoggerConfiguration

// Models
public class Component
public class Config
public class Scenario
public enum JSONValue

// Errors
public enum RenderSDKError: Error

// Logging
public protocol Logger
public class ConsoleLogger: Logger
public class FileLogger: Logger
public class ComposableLogger: Logger
public class SilentLogger: Logger
public enum LogLevel

// Rendering
public protocol Renderer
public protocol Renderable
public class ComponentRegistry
public struct RendererContext
public class RenderViewController

// Repository (for custom implementations)
public protocol ScenarioRepository
public class ScenarioRepositoryImpl: ScenarioRepository

// Styles (if custom renderers needed)
public class ViewStyle
```

### 4.2 Internal Types

Most implementation details should remain internal:

- ViewTreeBuilder
- ValueProvider and resolvers
- DIContainer
- NetworkClient
- Individual renderer implementations (unless extensibility needed)

---

## 5. Risk Assessment & Mitigation

### 5.1 High Risk Items

1. **Breaking Changes During Migration**

   - **Risk**: Playground app breaks during incremental migration
   - **Mitigation**: Keep local SDK until package is feature-complete; use feature flags

2. **Dependency Conflicts**

   - **Risk**: FlexLayout or Supabase version conflicts
   - **Mitigation**: Pin versions; test thoroughly; document requirements

3. **Public API Design Mistakes**

   - **Risk**: Need breaking changes after release
   - **Mitigation**: Careful API review; follow Swift API design guidelines; get team review

4. **Performance Regression**
   - **Risk**: Package overhead or initialization issues
   - **Mitigation**: Performance benchmarks; profiling; optimization

### 5.2 Medium Risk Items

1. **Test Coverage**

   - **Risk**: Bugs slip through due to insufficient testing
   - **Mitigation**: Comprehensive test suite; integration tests; manual QA

2. **Documentation Quality**

   - **Risk**: Poor adoption due to unclear docs
   - **Mitigation**: Peer review; examples; tutorials

3. **Platform Compatibility**
   - **Risk**: Issues on different iOS versions
   - **Mitigation**: Test on iOS 13-17; CI/CD pipeline

---

## 6. Migration Checklist

### Pre-Migration

- [ ] Review current SDK architecture
- [ ] Identify all external dependencies
- [ ] Document current public API usage in playground
- [ ] Set up package skeleton with dependencies
- [ ] Create migration branch

### Phase 1: Foundation

- [ ] Update Package.swift with dependencies
- [ ] Migrate JSONValue
- [ ] Migrate Config with tests
- [ ] Migrate Component with tests
- [ ] Migrate Scenario with tests
- [ ] Migrate RenderSDKError
- [ ] Migrate ColorParser with tests

### Phase 2: Rendering Infrastructure

- [ ] Migrate ViewStyle and extensions
- [ ] Migrate Renderer protocol
- [ ] Migrate Renderable protocol
- [ ] Migrate ComponentRegistry
- [ ] Migrate RenderableView
- [ ] Migrate RootFlexView
- [ ] Migrate ViewTreeBuilder
- [ ] Add style system tests

### Phase 3: Component Renderers

- [ ] Migrate ViewRenderer
- [ ] Migrate TextRenderer
- [ ] Migrate SpacerRenderer
- [ ] Migrate ImageRenderer and ImageLoader
- [ ] Migrate ButtonRenderer
- [ ] Migrate CheckboxRenderer
- [ ] Migrate RowRenderer
- [ ] Migrate ColumnRenderer
- [ ] Migrate StackRenderer
- [ ] Migrate StepperRenderer
- [ ] Migrate RatingRenderer
- [ ] Migrate NavbarRenderer
- [ ] Add renderer tests

### Phase 4: Integration

- [ ] Migrate Logger system
- [ ] Migrate ValueProvider and resolvers
- [ ] Migrate ScenarioRepository protocol
- [ ] Migrate ScenarioRepositoryImpl
- [ ] Migrate NetworkClient
- [ ] Refactor DIContainer for package
- [ ] Migrate RenderViewController
- [ ] Migrate and refactor RenderSDK → RenderEngine
- [ ] Add integration tests
- [ ] Add repository tests

### Phase 5: Documentation

- [ ] Create API documentation (DocC)
- [ ] Write integration guide
- [ ] Write architecture documentation
- [ ] Create usage examples
- [ ] Update package README
- [ ] Create migration guide

### Phase 6: Playground Migration

- [ ] Update playground imports
- [ ] Update RenderSDK → RenderEngine references
- [ ] Update initialization code
- [ ] Test all playground scenarios
- [ ] Remove local SDK directory
- [ ] Update playground documentation
- [ ] Final integration testing

### Post-Migration

- [ ] Code review
- [ ] Performance benchmarking
- [ ] Security review
- [ ] Create release notes
- [ ] Tag v1.0.0 release
- [ ] Publish documentation

---

## 7. Success Criteria

### Functional Requirements

✅ All SDK functionality works in package form  
✅ Playground app runs with package SDK  
✅ All component types render correctly  
✅ Scenario fetching works  
✅ Logging system functional  
✅ Error handling works

### Quality Requirements

✅ >80% code coverage with unit tests  
✅ All public APIs documented  
✅ Integration guide available  
✅ No performance regression  
✅ No memory leaks

### Developer Experience

✅ Easy to integrate into new projects  
✅ Clear API design  
✅ Comprehensive examples  
✅ Good error messages  
✅ Debuggable with clear logs

---

## 8. Timeline Estimate

**Total Duration**: 6 weeks (1 developer, full-time)

- **Week 1**: Foundation & Core Models (Phase 1)
- **Week 2**: Rendering Infrastructure (Phase 2)
- **Week 3**: Component Renderers (Phase 3)
- **Week 4**: Integration & Networking (Phase 4)
- **Week 5**: Testing & Documentation (Phase 5)
- **Week 6**: Playground Migration & Final QA (Phase 6)

**Contingency**: Add 1-2 weeks buffer for unexpected issues

---

## 9. Next Steps

1. **Review this plan** with the team
2. **Get approval** for the migration approach
3. **Create a migration branch** from main
4. **Set up project tracking** (issues, milestones)
5. **Begin Phase 1** implementation

---

## 10. Notes & Considerations

### Supabase Configuration

Currently hardcoded in DIContainer:

```swift
supabaseURL: URL(string: "https://yhfeoztyhuiccuyeghiw.supabase.co")!,
supabaseKey: "sb_publishable_8fDYhB0k7n_wuAywpua6vQ_JthMjgzA"
```

**Action**: Move to RenderEngine configuration API

### Platform Support

- **Minimum**: iOS 13
- **Recommended**: iOS 14+
- Consider watchOS, tvOS, macOS support in future

### Versioning Strategy

- Start at v1.0.0 after migration complete
- Follow semantic versioning
- Document breaking changes clearly

### Distribution Options

- **Primary**: Swift Package Manager (SPM)
- **Future**: CocoaPods, Carthage, XCFramework

---

## 11. References

- [Swift Package Manager Documentation](https://swift.org/package-manager/)
- [Swift API Design Guidelines](https://swift.org/documentation/api-design-guidelines/)
- [FlexLayout GitHub](https://github.com/layoutBox/FlexLayout)
- [Supabase Swift SDK](https://github.com/supabase/supabase-swift)
- [Swift DocC Documentation](https://www.swift.org/documentation/docc/)

---

**Document Version**: 1.0  
**Last Updated**: October 2, 2025  
**Owner**: Render Engine Team
