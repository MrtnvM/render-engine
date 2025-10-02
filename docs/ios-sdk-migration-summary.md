# iOS SDK Migration Summary

Quick reference guide for the iOS SDK migration from playground to package.

## 📊 Migration Overview

**Source**: `apps/render-ios-playground/render-ios-playground/SDK/`  
**Target**: `packages/render-ios-sdk/Sources/RenderEngine/`  
**Files to Migrate**: ~45 Swift files  
**External Dependencies**: FlexLayout, Supabase-swift  
**Timeline**: 6 weeks

---

## 🏗️ SDK Architecture

### Current Structure (Playground)

```
SDK/
├── Core/               # Infrastructure (DI, Network, Errors)
├── Debug/              # Logging and debug tools
├── Models/             # Domain models (Component, Config, Scenario)
├── Providers/          # Value resolution system
├── Repositories/       # Data layer (Supabase integration)
├── UI/                 # Rendering system
│   ├── Renderers/     # 12 component renderers
│   ├── Styles/        # Style parsing and application
│   ├── Utils/         # Color parsing, etc.
│   ├── ViewControllers/ # RenderViewController
│   └── Views/         # Base views
└── RenderSDK.swift    # Public SDK interface
```

### Key Components

| Component        | Files | Purpose                                            |
| ---------------- | ----- | -------------------------------------------------- |
| **Models**       | 4     | Core domain entities (Component, Config, Scenario) |
| **Renderers**    | 12    | Component-specific UI rendering                    |
| **Styles**       | 7     | Style parsing and flexbox layout                   |
| **Repositories** | 2     | Data fetching from Supabase                        |
| **Logging**      | 3     | Multi-target logging system                        |
| **Core**         | 3     | DI, networking, error handling                     |

---

## 📦 External Dependencies

| Package            | Version | Purpose                     |
| ------------------ | ------- | --------------------------- |
| **FlexLayout**     | 2.2.2+  | Flexbox-style layout system |
| **Supabase-swift** | 2.5.1+  | Backend data fetching       |
| **UIKit**          | iOS 13+ | Core UI framework           |

---

## 🔄 Migration Phases

### Phase 1: Foundation & Core Models (Week 1)

- ✅ Set up Package.swift with dependencies
- ✅ Migrate Config, Component, Scenario, JSONValue
- ✅ Migrate RenderSDKError
- ✅ Add basic unit tests

### Phase 2: Rendering Infrastructure (Week 2)

- ✅ Migrate style system (ViewStyle + 6 extensions)
- ✅ Migrate rendering protocols (Renderer, Renderable)
- ✅ Migrate ComponentRegistry
- ✅ Migrate ViewTreeBuilder

### Phase 3: Component Renderers (Week 3)

- ✅ Migrate all 12 component renderers
- ✅ Migrate ImageLoader
- ✅ Add renderer tests

### Phase 4: Integration & Networking (Week 4)

- ✅ Migrate Logger system
- ✅ Migrate Providers and Resolvers
- ✅ Migrate Repository layer
- ✅ Refactor DI Container
- ✅ Migrate RenderViewController
- ✅ Migrate main SDK interface (RenderSDK → RenderEngine)

### Phase 5: Testing & Documentation (Week 5)

- ✅ Write comprehensive unit tests (>80% coverage)
- ✅ Create API documentation (DocC)
- ✅ Write integration guide
- ✅ Create examples

### Phase 6: Playground Migration (Week 6)

- ✅ Update playground to use package
- ✅ Remove local SDK directory
- ✅ Final integration testing

---

## 🎯 Public API Design

### Main Entry Point

```swift
public class RenderEngine {
    public static let shared: RenderEngine

    // Configuration
    public func configure(
        supabaseURL: URL,
        supabaseKey: String,
        loggerConfiguration: LoggerConfiguration? = nil
    )

    // Rendering
    public func render(
        scenarioKey: String,
        in viewController: UIViewController,
        containerView: UIView? = nil
    ) async throws

    public func getViewController(scenarioKey: String) -> RenderViewController

    // Version
    public var version: String { get }
}
```

### Public Types

- `RenderEngine` - Main SDK interface
- `Component`, `Config`, `Scenario` - Domain models
- `RenderSDKError` - Error types
- `Logger`, `ConsoleLogger`, `FileLogger` - Logging
- `RenderViewController` - Main UI component
- `ScenarioRepository` protocol - For custom data sources
- `Renderer` protocol - For custom renderers

---

## ⚠️ Key Challenges & Solutions

### 1. Dependency Injection

**Challenge**: DIContainer with hardcoded Supabase config  
**Solution**: Make configuration injectable through RenderEngine.configure()

### 2. Public vs Internal APIs

**Challenge**: Deciding what to expose  
**Solution**: Start minimal, add public APIs as needed. Renderers internal by default.

### 3. Breaking Changes

**Challenge**: Maintaining playground during migration  
**Solution**: Keep local SDK until package complete, then switch atomically

### 4. Testing

**Challenge**: 45 files to test  
**Solution**: Test incrementally per phase, mock external dependencies

---

## ✅ Success Criteria

### Functional

- [ ] All SDK functionality works in package
- [ ] Playground runs with package SDK
- [ ] All components render correctly
- [ ] Scenario fetching works
- [ ] Logging works
- [ ] Error handling works

### Quality

- [ ] > 80% code coverage
- [ ] All public APIs documented
- [ ] Integration guide available
- [ ] No performance regression
- [ ] No memory leaks

### Developer Experience

- [ ] Easy to integrate
- [ ] Clear API design
- [ ] Comprehensive examples
- [ ] Good error messages

---

## 📝 File Migration Mapping

### Priority 1 - Foundation (Start Here)

```
Models/Config.swift           → Sources/RenderEngine/Models/Config.swift
Models/Component.swift        → Sources/RenderEngine/Models/Component.swift
Models/Scenario.swift         → Sources/RenderEngine/Models/Scenario.swift
Models/JSONValue.swift        → Sources/RenderEngine/Models/JSONValue.swift
Core/Errors/RenderSDKError.swift → Sources/RenderEngine/Core/Errors/RenderSDKError.swift
```

### Priority 2 - Rendering Core

```
UI/Renderer.swift             → Sources/RenderEngine/UI/Renderer.swift
UI/Renderable.swift           → Sources/RenderEngine/UI/Renderable.swift
UI/ComponentRegistry.swift    → Sources/RenderEngine/UI/ComponentRegistry.swift
UI/Styles/ViewStyle.swift     → Sources/RenderEngine/UI/Styles/ViewStyle.swift
UI/ViewTreeBuilder.swift      → Sources/RenderEngine/UI/ViewTreeBuilder.swift
```

### Priority 3 - Renderers

```
UI/Renderers/*.swift          → Sources/RenderEngine/UI/Renderers/*.swift
(12 files total)
```

### Priority 4 - Integration

```
Debug/Logger.swift            → Sources/RenderEngine/Debug/Logger.swift
Repositories/*.swift          → Sources/RenderEngine/Repositories/*.swift
Core/DependencyInjection/DIContainer.swift → Sources/RenderEngine/Core/DependencyInjection/DIContainer.swift
RenderSDK.swift               → Sources/RenderEngine/RenderEngine.swift
```

---

## 🚀 Quick Start Guide

### 1. Review Current Implementation

```bash
cd apps/render-ios-playground/render-ios-playground/SDK
find . -name "*.swift" | wc -l  # Count files
```

### 2. Set Up Package Structure

```bash
cd packages/render-ios-sdk
mkdir -p Sources/RenderEngine/{Models,Core,UI,Debug,Repositories,Providers}
```

### 3. Update Package.swift

Add FlexLayout and Supabase dependencies

### 4. Start Migration

Begin with Phase 1 (Models and Core)

### 5. Test Incrementally

Write tests for each migrated component

---

## 📚 Related Documents

- **Detailed Plan**: `ios-sdk-migration-plan.md` - Full migration plan with all details
- **Integration Guide**: `packages/render-ios-sdk/README.md` - How to use the SDK
- **Playground Integration**: `apps/render-ios-playground/SDK_INTEGRATION.md` - Current state

---

## 🔗 Useful Links

- [FlexLayout Documentation](https://github.com/layoutBox/FlexLayout)
- [Supabase Swift SDK](https://github.com/supabase/supabase-swift)
- [Swift Package Manager Guide](https://swift.org/package-manager/)
- [Swift API Design Guidelines](https://swift.org/documentation/api-design-guidelines/)

---

**Last Updated**: October 2, 2025  
**Status**: Planning Complete, Ready for Implementation
