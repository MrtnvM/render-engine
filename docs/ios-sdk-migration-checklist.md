# iOS SDK Migration Checklist

Track your progress as you migrate the iOS SDK from playground to package.

**Status Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

---

## Phase 1: Foundation & Core Models

### Setup

- ⬜ Create migration branch
- ⬜ Update `Package.swift` with dependencies (FlexLayout, Supabase)
- ⬜ Set up directory structure in Sources/RenderEngine/
- ⬜ Configure Swift 6.2 and iOS 13+ support

### Core Models

- ⬜ Migrate `Models/JSONValue.swift`
  - ⬜ Add to package
  - ⬜ Mark as public
  - ⬜ Write unit tests
- ⬜ Migrate `Models/Config.swift`
  - ⬜ Add to package
  - ⬜ Mark public methods
  - ⬜ Test nested key resolution
  - ⬜ Test type conversions
  - ⬜ Test merge operations
- ⬜ Migrate `Models/Component.swift`
  - ⬜ Add to package
  - ⬜ Mark as public
  - ⬜ Test component creation
  - ⬜ Test circular dependency detection
  - ⬜ Test child management
- ⬜ Migrate `Models/Scenario.swift`
  - ⬜ Add to package
  - ⬜ Mark as public
  - ⬜ Test scenario parsing
  - ⬜ Test component resolution

### Core Infrastructure

- ⬜ Migrate `Core/Errors/RenderSDKError.swift`
  - ⬜ Add to package
  - ⬜ Mark as public
  - ⬜ Add comprehensive error descriptions
- ⬜ Migrate `UI/Utils/ColorParser.swift`
  - ⬜ Add to package
  - ⬜ Mark appropriate access level
  - ⬜ Test color parsing (hex, rgb, named colors)

### Phase 1 Review

- ⬜ All Phase 1 tests passing
- ⬜ Code review completed
- ⬜ Documentation added

---

## Phase 2: Rendering Infrastructure

### Style System

- ⬜ Migrate `UI/Styles/ViewStyle.swift`

  - ⬜ Add to package
  - ⬜ Mark as public
  - ⬜ Test style parsing

- ⬜ Migrate style extensions:
  - ⬜ `ViewStyle+Border.swift`
  - ⬜ `ViewStyle+Color.swift`
  - ⬜ `ViewStyle+Flex.swift`
  - ⬜ `ViewStyle+Shadow.swift`
  - ⬜ `ViewStyle+Text.swift`
  - ⬜ `ViewStyle+TextStyle.swift`
- ⬜ Test style system
  - ⬜ Border styles
  - ⬜ Color parsing
  - ⬜ Flexbox properties
  - ⬜ Shadow effects
  - ⬜ Text styling

### Rendering Protocols

- ⬜ Migrate `UI/Renderer.swift`
  - ⬜ Add to package
  - ⬜ Mark Renderer protocol as public
  - ⬜ Mark RendererContext as public
- ⬜ Migrate `UI/Renderable.swift`
  - ⬜ Add to package
  - ⬜ Mark Renderable protocol as public
- ⬜ Migrate `UI/ComponentRegistry.swift`
  - ⬜ Add to package
  - ⬜ Mark as public
  - ⬜ Test registration/retrieval
  - ⬜ Test unregister/reset

### Base Views

- ⬜ Migrate `UI/Views/RenderableView.swift`
  - ⬜ Add to package
  - ⬜ Mark as public
  - ⬜ Test visual style application
- ⬜ Migrate `UI/Views/RootFlexView.swift`
  - ⬜ Add to package
  - ⬜ Mark appropriate access level

### View Tree Builder

- ⬜ Migrate `UI/ViewTreeBuilder.swift`
  - ⬜ Add to package
  - ⬜ Keep as internal
  - ⬜ Test recursive view building
  - ⬜ Test custom component resolution

### Phase 2 Review

- ⬜ All Phase 2 tests passing
- ⬜ Style system works correctly
- ⬜ View tree builds correctly
- ⬜ Code review completed

---

## Phase 3: Component Renderers

### Simple Renderers

- ⬜ Migrate `UI/Renderers/ViewRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test basic view rendering
- ⬜ Migrate `UI/Renderers/TextRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test text display
  - ⬜ Test text styling
- ⬜ Migrate `UI/Renderers/SpacerRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test spacing

### Image Rendering

- ⬜ Migrate `UI/ImageLoader.swift`
  - ⬜ Add to package
  - ⬜ Mark appropriate access level
  - ⬜ Test async image loading
- ⬜ Migrate `UI/Renderers/ImageRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test image display
  - ⬜ Test image loading states

### Interactive Renderers

- ⬜ Migrate `UI/Renderers/ButtonRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test button display
  - ⬜ Test button actions
- ⬜ Migrate `UI/Renderers/CheckboxRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test checkbox state
  - ⬜ Test checkbox actions

### Layout Renderers

- ⬜ Migrate `UI/Renderers/RowRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test horizontal layout
- ⬜ Migrate `UI/Renderers/ColumnRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test vertical layout
- ⬜ Migrate `UI/Renderers/StackRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test stack layout

### Complex Renderers

- ⬜ Migrate `UI/Renderers/StepperRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test stepper functionality
- ⬜ Migrate `UI/Renderers/RatingRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test rating display
- ⬜ Migrate `UI/Renderers/NavbarRenderer.swift`
  - ⬜ Add to package
  - ⬜ Test navigation bar

### Phase 3 Review

- ⬜ All 12 renderers working
- ⬜ All renderer tests passing
- ⬜ Visual verification in playground
- ⬜ Code review completed

---

## Phase 4: Integration & Networking

### Logger System

- ⬜ Migrate `Debug/Logger.swift`
  - ⬜ Add to package
  - ⬜ Mark Logger protocol as public
  - ⬜ Mark concrete loggers as public
  - ⬜ Mark LogLevel as public
  - ⬜ Test console logging
  - ⬜ Test file logging
  - ⬜ Test composable logger
- ⬜ Migrate `Debug/LogViewTree.swift` (optional)
  - ⬜ Add to package
  - ⬜ Keep as internal
- ⬜ Migrate `Debug/ColorizeView.swift` (optional)
  - ⬜ Add to package
  - ⬜ Keep as internal

### Value Providers

- ⬜ Migrate `Providers/ValueProvider.swift`
  - ⬜ Add to package
  - ⬜ Mark appropriate access level
- ⬜ Migrate `Providers/Resolvers/ScalarResolver.swift`
  - ⬜ Add to package
- ⬜ Migrate `Providers/Resolvers/PropsResolver.swift`
  - ⬜ Add to package
- ⬜ Test value resolution system

### Repository Layer

- ⬜ Migrate `Repositories/ScenarioRepository.swift`
  - ⬜ Add to package
  - ⬜ Mark protocol as public
- ⬜ Migrate `Repositories/ScenarioRepositoryImpl.swift`
  - ⬜ Add to package
  - ⬜ Mark as public
  - ⬜ Test scenario fetching
  - ⬜ Test subscription system
  - ⬜ Add mock tests

### Network Layer

- ⬜ Migrate `Core/Network/NetworkClient.swift`
  - ⬜ Add to package
  - ⬜ Keep as internal
  - ⬜ Test network operations

### Dependency Injection

- ⬜ Refactor `Core/DependencyInjection/DIContainer.swift`
  - ⬜ Remove hardcoded Supabase config
  - ⬜ Make initialization flexible
  - ⬜ Add to package
  - ⬜ Keep as internal
  - ⬜ Test dependency resolution

### View Controllers

- ⬜ Migrate `UI/ViewControllers/RenderViewController.swift`
  - ⬜ Add to package
  - ⬜ Mark as public
  - ⬜ Update to use new DI pattern
  - ⬜ Test view controller lifecycle

### Main SDK Interface

- ⬜ Migrate `RenderSDK.swift` → `RenderEngine.swift`
  - ⬜ Rename class to RenderEngine
  - ⬜ Design public API
  - ⬜ Add configure() method
  - ⬜ Add render() method
  - ⬜ Add getViewController() method
  - ⬜ Add logger configuration
  - ⬜ Add version property
  - ⬜ Mark all public APIs
  - ⬜ Remove Supabase credentials

### Phase 4 Review

- ⬜ Integration tests passing
- ⬜ Scenario fetching works
- ⬜ Logging works
- ⬜ DI system works
- ⬜ Code review completed

---

## Phase 5: Testing & Documentation

### Unit Tests

- ⬜ Model tests

  - ⬜ ConfigTests.swift (>90% coverage)
  - ⬜ ComponentTests.swift (>90% coverage)
  - ⬜ ScenarioTests.swift (>90% coverage)
  - ⬜ JSONValueTests.swift (>90% coverage)

- ⬜ Utility tests
  - ⬜ ColorParserTests.swift
- ⬜ Style tests
  - ⬜ ViewStyleTests.swift
- ⬜ Registry tests
  - ⬜ ComponentRegistryTests.swift
- ⬜ Renderer tests (12 files)
  - ⬜ ViewRendererTests.swift
  - ⬜ TextRendererTests.swift
  - ⬜ ImageRendererTests.swift
  - ⬜ ButtonRendererTests.swift
  - ⬜ CheckboxRendererTests.swift
  - ⬜ RowRendererTests.swift
  - ⬜ ColumnRendererTests.swift
  - ⬜ StackRendererTests.swift
  - ⬜ SpacerRendererTests.swift
  - ⬜ StepperRendererTests.swift
  - ⬜ RatingRendererTests.swift
  - ⬜ NavbarRendererTests.swift
- ⬜ Integration tests
  - ⬜ ViewTreeBuilderTests.swift
  - ⬜ RenderEngineIntegrationTests.swift
- ⬜ Repository tests
  - ⬜ ScenarioRepositoryTests.swift

### Test Coverage

- ⬜ Achieve >80% overall code coverage
- ⬜ All public APIs have tests
- ⬜ All error paths tested
- ⬜ Performance tests added

### Documentation

- ⬜ API Documentation (DocC)

  - ⬜ RenderEngine class
  - ⬜ Component classes
  - ⬜ Public protocols
  - ⬜ Configuration types
  - ⬜ Error types
  - ⬜ Add code examples
  - ⬜ Add tutorials

- ⬜ Guides
  - ⬜ INTEGRATION.md - How to integrate SDK
  - ⬜ ARCHITECTURE.md - Architecture overview
  - ⬜ EXAMPLES.md - Usage examples
  - ⬜ MIGRATION.md - Migration guide
- ⬜ Update README.md
  - ⬜ Installation instructions
  - ⬜ Quick start guide
  - ⬜ API overview
  - ⬜ Examples
  - ⬜ Requirements
  - ⬜ License

### Phase 5 Review

- ⬜ All tests passing
- ⬜ Coverage goals met
- ⬜ Documentation complete
- ⬜ Examples work
- ⬜ Peer review completed

---

## Phase 6: Playground Migration & Cleanup

### Playground Updates

- ⬜ Find all local SDK imports in playground
- ⬜ Replace with `import RenderEngine`
- ⬜ Update RenderSDK.shared → RenderEngine.shared
- ⬜ Update initialization in AppDelegate
  - ⬜ Add configure() call with Supabase credentials
  - ⬜ Configure logger if needed
- ⬜ Remove direct DIContainer access
- ⬜ Update custom component usage if any

### Testing in Playground

- ⬜ Build playground with package
- ⬜ Test all scenarios/screens
  - ⬜ Main view
  - ⬜ Component showcase
  - ⬜ UIKit integration
  - ⬜ Design system examples
- ⬜ Test all interactions
  - ⬜ Button clicks
  - ⬜ Checkbox toggles
  - ⬜ Navigation
- ⬜ Verify logging works
- ⬜ Test error scenarios
- ⬜ Performance check

### Cleanup

- ⬜ Remove `apps/render-ios-playground/render-ios-playground/SDK/` directory
- ⬜ Update `.gitignore` if needed
- ⬜ Clean Xcode project references
- ⬜ Clean derived data
- ⬜ Remove unused files

### Documentation Updates

- ⬜ Update `SDK_INTEGRATION.md`
- ⬜ Update `CONNECTION_SUMMARY.md`
- ⬜ Create `MIGRATION_COMPLETE.md` with notes
- ⬜ Add changelog to package

### Phase 6 Review

- ⬜ Playground fully functional with package
- ⬜ No local SDK references remain
- ⬜ All documentation updated
- ⬜ Final code review

---

## Post-Migration Tasks

### Quality Assurance

- ⬜ Final code review
- ⬜ Security review
- ⬜ Performance benchmarking
  - ⬜ Compare before/after metrics
  - ⬜ No regression in render time
  - ⬜ No memory leaks
- ⬜ Accessibility check
- ⬜ Dark mode support verified

### Release Preparation

- ⬜ Update version to 1.0.0
- ⬜ Create CHANGELOG.md
- ⬜ Write release notes
- ⬜ Tag release in git
- ⬜ Generate documentation
- ⬜ Publish documentation site

### Distribution

- ⬜ Test SPM integration in fresh project
- ⬜ Verify minimum iOS version (13+)
- ⬜ Test on multiple iOS versions (13-17)
- ⬜ Test on multiple devices
- ⬜ Create sample integration project

### Communication

- ⬜ Update team on completion
- ⬜ Share migration experience/lessons
- ⬜ Update project README
- ⬜ Announce to stakeholders

---

## Blockers & Issues

### Current Blockers

_None yet - add any blockers here as they arise_

### Resolved Issues

_Track resolved issues here_

---

## Notes & Learnings

### Technical Notes

_Add technical insights, gotchas, or important decisions here_

### Process Improvements

_Track what worked well and what could be improved_

---

**Migration Start Date**: ****\_\_\_****  
**Migration Completion Date**: ****\_\_\_****  
**Total Duration**: ****\_\_\_****

**Lead Developer**: ****\_\_\_****  
**Reviewers**: ****\_\_\_****
