# iOS SDK File Mapping Reference

Quick reference for file locations during SDK migration.

## Directory Mapping

| Source (Playground)                                     | Target (Package)                                |
| ------------------------------------------------------- | ----------------------------------------------- |
| `apps/render-ios-playground/render-ios-playground/SDK/` | `packages/render-ios-sdk/Sources/RenderEngine/` |

---

## Complete File Mapping

### Core Models (Priority 1)

| Source File              | Target File              | Access | Tests                |
| ------------------------ | ------------------------ | ------ | -------------------- |
| `Models/JSONValue.swift` | `Models/JSONValue.swift` | public | JSONValueTests.swift |
| `Models/Config.swift`    | `Models/Config.swift`    | public | ConfigTests.swift    |
| `Models/Component.swift` | `Models/Component.swift` | public | ComponentTests.swift |
| `Models/Scenario.swift`  | `Models/Scenario.swift`  | public | ScenarioTests.swift  |

### Core Infrastructure (Priority 1)

| Source File                                  | Target File                                  | Access   | Tests                    |
| -------------------------------------------- | -------------------------------------------- | -------- | ------------------------ |
| `Core/Errors/RenderSDKError.swift`           | `Core/Errors/RenderSDKError.swift`           | public   | ErrorTests.swift         |
| `Core/Network/NetworkClient.swift`           | `Core/Network/NetworkClient.swift`           | internal | NetworkClientTests.swift |
| `Core/DependencyInjection/DIContainer.swift` | `Core/DependencyInjection/DIContainer.swift` | internal | DIContainerTests.swift   |

### UI Utilities (Priority 1)

| Source File                  | Target File                  | Access   | Tests                  |
| ---------------------------- | ---------------------------- | -------- | ---------------------- |
| `UI/Utils/ColorParser.swift` | `UI/Utils/ColorParser.swift` | internal | ColorParserTests.swift |

### Style System (Priority 2)

| Source File                                      | Target File                                      | Access   | Tests                    |
| ------------------------------------------------ | ------------------------------------------------ | -------- | ------------------------ |
| `UI/Styles/ViewStyle.swift`                      | `UI/Styles/ViewStyle.swift`                      | public   | ViewStyleTests.swift     |
| `UI/Styles/Extensions/ViewStyle+Border.swift`    | `UI/Styles/Extensions/ViewStyle+Border.swift`    | internal | (part of ViewStyleTests) |
| `UI/Styles/Extensions/ViewStyle+Color.swift`     | `UI/Styles/Extensions/ViewStyle+Color.swift`     | internal | (part of ViewStyleTests) |
| `UI/Styles/Extensions/ViewStyle+Flex.swift`      | `UI/Styles/Extensions/ViewStyle+Flex.swift`      | internal | (part of ViewStyleTests) |
| `UI/Styles/Extensions/ViewStyle+Shadow.swift`    | `UI/Styles/Extensions/ViewStyle+Shadow.swift`    | internal | (part of ViewStyleTests) |
| `UI/Styles/Extensions/ViewStyle+Text.swift`      | `UI/Styles/Extensions/ViewStyle+Text.swift`      | internal | (part of ViewStyleTests) |
| `UI/Styles/Extensions/ViewStyle+TextStyle.swift` | `UI/Styles/Extensions/ViewStyle+TextStyle.swift` | internal | (part of ViewStyleTests) |

### Rendering Core (Priority 2)

| Source File                  | Target File                  | Access   | Tests                         |
| ---------------------------- | ---------------------------- | -------- | ----------------------------- |
| `UI/Renderer.swift`          | `UI/Renderer.swift`          | public   | (protocol tests in renderers) |
| `UI/Renderable.swift`        | `UI/Renderable.swift`        | public   | (protocol tests in renderers) |
| `UI/ComponentRegistry.swift` | `UI/ComponentRegistry.swift` | public   | ComponentRegistryTests.swift  |
| `UI/ViewTreeBuilder.swift`   | `UI/ViewTreeBuilder.swift`   | internal | ViewTreeBuilderTests.swift    |

### Base Views (Priority 2)

| Source File                     | Target File                     | Access   | Tests                     |
| ------------------------------- | ------------------------------- | -------- | ------------------------- |
| `UI/Views/RenderableView.swift` | `UI/Views/RenderableView.swift` | public   | RenderableViewTests.swift |
| `UI/Views/RootFlexView.swift`   | `UI/Views/RootFlexView.swift`   | internal | (integration tests)       |

### Component Renderers (Priority 3)

| Source File                           | Target File                           | Access   | Tests                       |
| ------------------------------------- | ------------------------------------- | -------- | --------------------------- |
| `UI/Renderers/ViewRenderer.swift`     | `UI/Renderers/ViewRenderer.swift`     | internal | ViewRendererTests.swift     |
| `UI/Renderers/TextRenderer.swift`     | `UI/Renderers/TextRenderer.swift`     | internal | TextRendererTests.swift     |
| `UI/Renderers/SpacerRenderer.swift`   | `UI/Renderers/SpacerRenderer.swift`   | internal | SpacerRendererTests.swift   |
| `UI/Renderers/ImageRenderer.swift`    | `UI/Renderers/ImageRenderer.swift`    | internal | ImageRendererTests.swift    |
| `UI/Renderers/ButtonRenderer.swift`   | `UI/Renderers/ButtonRenderer.swift`   | internal | ButtonRendererTests.swift   |
| `UI/Renderers/CheckboxRenderer.swift` | `UI/Renderers/CheckboxRenderer.swift` | internal | CheckboxRendererTests.swift |
| `UI/Renderers/RowRenderer.swift`      | `UI/Renderers/RowRenderer.swift`      | internal | RowRendererTests.swift      |
| `UI/Renderers/ColumnRenderer.swift`   | `UI/Renderers/ColumnRenderer.swift`   | internal | ColumnRendererTests.swift   |
| `UI/Renderers/StackRenderer.swift`    | `UI/Renderers/StackRenderer.swift`    | internal | StackRendererTests.swift    |
| `UI/Renderers/StepperRenderer.swift`  | `UI/Renderers/StepperRenderer.swift`  | internal | StepperRendererTests.swift  |
| `UI/Renderers/RatingRenderer.swift`   | `UI/Renderers/RatingRenderer.swift`   | internal | RatingRendererTests.swift   |
| `UI/Renderers/NavbarRenderer.swift`   | `UI/Renderers/NavbarRenderer.swift`   | internal | NavbarRendererTests.swift   |

### Image Loading (Priority 3)

| Source File            | Target File            | Access   | Tests                  |
| ---------------------- | ---------------------- | -------- | ---------------------- |
| `UI/ImageLoader.swift` | `UI/ImageLoader.swift` | internal | ImageLoaderTests.swift |

### Logging System (Priority 4)

| Source File                | Target File                | Access   | Tests             |
| -------------------------- | -------------------------- | -------- | ----------------- |
| `Debug/Logger.swift`       | `Debug/Logger.swift`       | public   | LoggerTests.swift |
| `Debug/LogViewTree.swift`  | `Debug/LogViewTree.swift`  | internal | (optional)        |
| `Debug/ColorizeView.swift` | `Debug/ColorizeView.swift` | internal | (optional)        |

### Value Providers (Priority 4)

| Source File                                | Target File                                | Access   | Tests                        |
| ------------------------------------------ | ------------------------------------------ | -------- | ---------------------------- |
| `Providers/ValueProvider.swift`            | `Providers/ValueProvider.swift`            | internal | ValueProviderTests.swift     |
| `Providers/Resolvers/ScalarResolver.swift` | `Providers/Resolvers/ScalarResolver.swift` | internal | (part of ValueProviderTests) |
| `Providers/Resolvers/PropsResolver.swift`  | `Providers/Resolvers/PropsResolver.swift`  | internal | (part of ValueProviderTests) |

### Repository Layer (Priority 4)

| Source File                                 | Target File                                 | Access | Tests                             |
| ------------------------------------------- | ------------------------------------------- | ------ | --------------------------------- |
| `Repositories/ScenarioRepository.swift`     | `Repositories/ScenarioRepository.swift`     | public | ScenarioRepositoryTests.swift     |
| `Repositories/ScenarioRepositoryImpl.swift` | `Repositories/ScenarioRepositoryImpl.swift` | public | (part of ScenarioRepositoryTests) |

### View Controllers (Priority 4)

| Source File                                     | Target File                                     | Access | Tests                           |
| ----------------------------------------------- | ----------------------------------------------- | ------ | ------------------------------- |
| `UI/ViewControllers/RenderViewController.swift` | `UI/ViewControllers/RenderViewController.swift` | public | RenderViewControllerTests.swift |

### Main SDK Interface (Priority 4)

| Source File       | Target File          | Access | Tests                   |
| ----------------- | -------------------- | ------ | ----------------------- |
| `RenderSDK.swift` | `RenderEngine.swift` | public | RenderEngineTests.swift |

---

## Summary Statistics

| Category            | Files  | Public | Internal | Tests Needed |
| ------------------- | ------ | ------ | -------- | ------------ |
| Models              | 4      | 4      | 0        | 4            |
| Core Infrastructure | 3      | 1      | 2        | 3            |
| Style System        | 7      | 1      | 6        | 1            |
| Rendering Core      | 4      | 3      | 1        | 2            |
| Base Views          | 2      | 1      | 1        | 1            |
| Component Renderers | 12     | 0      | 12       | 12           |
| Image Loading       | 1      | 0      | 1        | 1            |
| Logging             | 3      | 1      | 2        | 1            |
| Value Providers     | 3      | 0      | 3        | 1            |
| Repository Layer    | 2      | 2      | 0        | 1            |
| View Controllers    | 1      | 1      | 0        | 1            |
| Main Interface      | 1      | 1      | 0        | 1            |
| **TOTAL**           | **43** | **15** | **28**   | **29**       |

---

## Access Level Guidelines

### Public Types

- Main SDK interface (RenderEngine)
- Core models (Component, Config, Scenario, JSONValue)
- Error types (RenderSDKError)
- Logging system (Logger protocol and implementations)
- View controllers (RenderViewController)
- Protocols for extensibility (Renderer, Renderable, ScenarioRepository)
- Public view classes (RenderableView)

### Internal Types

- Implementation details (DIContainer, NetworkClient)
- Utilities (ColorParser)
- Concrete renderers (unless extensibility needed)
- View tree builder
- Value providers
- Style extensions (implementation details)

---

## Dependencies Per File

### Files Using FlexLayout

- `UI/Views/RenderableView.swift`
- `UI/Views/RootFlexView.swift`
- `UI/ViewTreeBuilder.swift`
- `UI/Renderers/RowRenderer.swift`
- `UI/Renderers/ColumnRenderer.swift`
- `UI/Renderers/StackRenderer.swift`
- `UI/Renderers/StepperRenderer.swift`
- `UI/Renderable.swift`

### Files Using Supabase

- `Core/DependencyInjection/DIContainer.swift`
- `Repositories/ScenarioRepositoryImpl.swift`
- `RenderSDK.swift` (to be removed)

### Files Using UIKit

- Most UI-related files

---

## Migration Order

### Week 1: Foundation

1. Models/JSONValue.swift
2. Models/Config.swift
3. Models/Component.swift
4. Models/Scenario.swift
5. Core/Errors/RenderSDKError.swift
6. UI/Utils/ColorParser.swift

### Week 2: Rendering Infrastructure

7. UI/Styles/ViewStyle.swift + all extensions (7 files)
8. UI/Renderer.swift
9. UI/Renderable.swift
10. UI/ComponentRegistry.swift
11. UI/Views/RenderableView.swift
12. UI/Views/RootFlexView.swift
13. UI/ViewTreeBuilder.swift

### Week 3: Renderers

14-25. All 12 renderer files 26. UI/ImageLoader.swift

### Week 4: Integration

27. Debug/Logger.swift (+ optional debug files)
28. Providers/ValueProvider.swift + resolvers (3 files)
29. Repositories/ScenarioRepository.swift
30. Repositories/ScenarioRepositoryImpl.swift
31. Core/Network/NetworkClient.swift
32. Core/DependencyInjection/DIContainer.swift
33. UI/ViewControllers/RenderViewController.swift
34. RenderSDK.swift → RenderEngine.swift

---

## Quick Commands

### Count files to migrate

```bash
cd apps/render-ios-playground/render-ios-playground/SDK
find . -name "*.swift" | wc -l
```

### Create directory structure

```bash
cd packages/render-ios-sdk/Sources/RenderEngine
mkdir -p Models Core/Errors Core/Network Core/DependencyInjection
mkdir -p UI/Renderers UI/Styles/Extensions UI/Views UI/Utils UI/ViewControllers
mkdir -p Debug Providers/Resolvers Repositories
```

### Copy a file (example)

```bash
cp apps/render-ios-playground/render-ios-playground/SDK/Models/Config.swift \
   packages/render-ios-sdk/Sources/RenderEngine/Models/Config.swift
```

### Search for imports

```bash
cd apps/render-ios-playground/render-ios-playground/SDK
grep -r "import " . --include="*.swift" | sort | uniq
```

### Find DIContainer references

```bash
cd apps/render-ios-playground/render-ios-playground/SDK
grep -r "DIContainer" . --include="*.swift"
```

---

## Test File Naming Convention

| Source File                                | Test File Location                                 |
| ------------------------------------------ | -------------------------------------------------- |
| `Sources/RenderEngine/Models/Config.swift` | `Tests/RenderEngineTests/Models/ConfigTests.swift` |
| `Sources/RenderEngine/UI/Renderer.swift`   | `Tests/RenderEngineTests/UI/RendererTests.swift`   |

**Pattern**: `{SourceFileName}Tests.swift` in mirrored directory structure under Tests/

---

**Last Updated**: October 2, 2025  
**Purpose**: Quick reference for file migration  
**Status**: Complete mapping of all 43 source files
