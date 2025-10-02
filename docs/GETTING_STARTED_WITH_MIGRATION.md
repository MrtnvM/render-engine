# Getting Started with iOS SDK Migration

This guide will help you start migrating the iOS SDK from the playground to the package today.

## Prerequisites

✅ **Review Complete**

- Read `ios-sdk-migration-plan.md`
- Understand the 6-phase approach
- Review public API design

✅ **Environment Ready**

- Xcode 16.0+ installed
- Swift 6.2+ available
- Git branch created for migration

## Step 1: Set Up Your Workspace (5 minutes)

### 1.1 Create Migration Branch

```bash
cd /Users/maxmrtnv/Projects/render-engine
git checkout -b feature/ios-sdk-migration
```

### 1.2 Verify Package Structure

The package structure is already set up:

```bash
cd packages/render-ios-sdk
ls -la Sources/RenderEngine/
```

You should see:

```
Sources/RenderEngine/
├── Models/
├── Core/
│   ├── Errors/
│   ├── Network/
│   └── DependencyInjection/
├── UI/
│   ├── Renderers/
│   ├── Styles/
│   │   └── Extensions/
│   ├── Views/
│   ├── Utils/
│   └── ViewControllers/
├── Debug/
├── Providers/
│   └── Resolvers/
└── Repositories/
```

### 1.3 Verify Dependencies

The `Package.swift` is already configured with:

- ✅ iOS 13+ platform support
- ✅ FlexLayout dependency
- ✅ Supabase dependency

Build the package to verify:

```bash
cd packages/render-ios-sdk
swift build
```

## Step 2: Start Phase 1 - Foundation (Week 1)

### 2.1 Migrate JSONValue.swift

**Priority**: HIGH - Foundation model

```bash
# Copy the file
cp apps/render-ios-playground/render-ios-playground/SDK/Models/JSONValue.swift \
   packages/render-ios-sdk/Sources/RenderEngine/Models/JSONValue.swift

# Open in Xcode
open packages/render-ios-sdk/Sources/RenderEngine/Models/JSONValue.swift
```

**Changes needed**:

1. Mark `JSONValue` enum as `public`
2. Mark all cases as `public`
3. Verify Foundation import only

**Test**:

```bash
swift build
```

### 2.2 Migrate Config.swift

```bash
cp apps/render-ios-playground/render-ios-playground/SDK/Models/Config.swift \
   packages/render-ios-sdk/Sources/RenderEngine/Models/Config.swift
```

**Changes needed**:

1. Mark `Config` class as `public`
2. Mark `init` as `public`
3. Mark getter methods as `public`
4. Keep internal helpers as `private` or `internal`

**Test**:

```bash
swift build
```

### 2.3 Migrate Component.swift

```bash
cp apps/render-ios-playground/render-ios-playground/SDK/Models/Component.swift \
   packages/render-ios-sdk/Sources/RenderEngine/Models/Component.swift
```

**Changes needed**:

1. Mark `Component` class as `public`
2. Mark `init` as `public`
3. Mark `create(from:)` as `public static`
4. Mark `addChild()` and `getChildren()` as `public`
5. Update imports (remove UIKit, use Foundation)

**Issues to resolve**:

- UIKit dependency → Move UI-specific logic to renderer layer
- ViewStyle dependency → Will be migrated in Phase 2

**Test**:

```bash
swift build
```

### 2.4 Migrate Scenario.swift

```bash
cp apps/render-ios-playground/render-ios-playground/SDK/Models/Scenario.swift \
   packages/render-ios-sdk/Sources/RenderEngine/Models/Scenario.swift
```

**Changes needed**:

1. Mark `Scenario` class as `public`
2. Mark `create(from:)` as `public static`
3. Mark properties as `public`

**Test**:

```bash
swift build
```

### 2.5 Migrate RenderSDKError.swift

```bash
cp apps/render-ios-playground/render-ios-playground/SDK/Core/Errors/RenderSDKError.swift \
   packages/render-ios-sdk/Sources/RenderEngine/Core/Errors/RenderSDKError.swift
```

**Changes needed**:

1. Mark `RenderSDKError` enum as `public`
2. Mark all cases as `public`
3. Mark `errorDescription` as `public`

**Test**:

```bash
swift build
```

### 2.6 Migrate ColorParser.swift

```bash
cp apps/render-ios-playground/render-ios-playground/SDK/UI/Utils/ColorParser.swift \
   packages/render-ios-sdk/Sources/RenderEngine/UI/Utils/ColorParser.swift
```

**Changes needed**:

1. Keep as `internal` (implementation detail)
2. Ensure UIKit import

**Test**:

```bash
swift build
```

## Step 3: Write Your First Tests (1-2 hours)

### 3.1 Create Test Directory Structure

```bash
cd packages/render-ios-sdk/Tests/RenderEngineTests
mkdir -p Models Core/Errors UI/Utils
```

### 3.2 Write ConfigTests.swift

```swift
import XCTest
@testable import RenderEngine

final class ConfigTests: XCTestCase {

    func testInitWithDictionary() {
        let config = Config(["key": "value"])
        XCTAssertEqual(config.getString(forKey: "key"), "value")
    }

    func testNestedKeyResolution() {
        let config = Config([
            "parent": [
                "child": "value"
            ]
        ])
        XCTAssertEqual(config.getString(forKey: "parent.child"), "value")
    }

    func testTypeConversions() {
        let config = Config([
            "int": 42,
            "float": 3.14,
            "bool": true
        ])

        XCTAssertEqual(config.getInt(forKey: "int"), 42)
        XCTAssertEqual(config.getDouble(forKey: "float"), 3.14, accuracy: 0.001)
        XCTAssertEqual(config.getBool(forKey: "bool"), true)
    }

    func testMerge() {
        let config1 = Config(["a": 1, "b": 2])
        let config2 = Config(["b": 3, "c": 4])

        let merged = config1.merge(config2)

        XCTAssertEqual(merged.getInt(forKey: "a"), 1)
        XCTAssertEqual(merged.getInt(forKey: "b"), 3) // config2 wins
        XCTAssertEqual(merged.getInt(forKey: "c"), 4)
    }
}
```

### 3.3 Run Tests

```bash
cd packages/render-ios-sdk
swift test
```

Or in Xcode:

1. Open the playground project
2. The package tests should be visible
3. Cmd + U to run tests

## Step 4: Verify in Playground (30 minutes)

### 4.1 Test Package Build from Playground

```bash
cd apps/render-ios-playground
open render-ios-playground.xcodeproj
```

In Xcode:

1. Build the project (Cmd + B)
2. The RenderEngine package should compile
3. Check for any errors

### 4.2 Create Test Import (Optional)

Create a temporary test file to verify package imports:

```swift
// In playground app, create TestPackageImport.swift
import RenderEngine

class TestPackageImport {
    func test() {
        let config = Config(["test": "value"])
        print("Config created: \(config.getString(forKey: "test") ?? "nil")")
    }
}
```

Build to verify imports work correctly.

## Step 5: Track Your Progress

### 5.1 Update Checklist

Open `docs/ios-sdk-migration-checklist.md` and mark completed items:

```markdown
### Core Models

- ✅ Migrate `Models/JSONValue.swift`
  - ✅ Add to package
  - ✅ Mark as public
  - ✅ Write unit tests
```

### 5.2 Commit Your Work

```bash
git add packages/render-ios-sdk/
git add docs/ios-sdk-migration-checklist.md
git commit -m "Phase 1: Migrate core models (JSONValue, Config, Component, Scenario)"
```

## Common Issues & Solutions

### Issue: Build Errors with UIKit

**Problem**: Component.swift depends on UIKit for ViewStyle

**Solution**:

1. Temporarily comment out ViewStyle dependencies
2. Add a TODO comment
3. Will be resolved in Phase 2 when ViewStyle is migrated

```swift
// TODO: Migrate ViewStyle in Phase 2
// let style = ViewStyle(config.getConfig(forKey: "style"))
let style: Any? = nil // Temporary placeholder
```

### Issue: Missing DIContainer References

**Problem**: Files reference `DIContainer.shared.logger`

**Solution**:

1. For Phase 1, comment out logger calls
2. Add TODO comments
3. Will be resolved in Phase 4 when DI is migrated

```swift
// TODO: Add proper logging in Phase 4
// logger.info("Component created")
```

### Issue: Supabase Import in Models

**Problem**: Some models import Supabase unnecessarily

**Solution**:

1. Remove Supabase imports from model files
2. Keep Supabase only in repository layer
3. Models should only depend on Foundation

## Next Steps

### After Phase 1 Complete:

1. **Review**: All Phase 1 tests passing ✅
2. **Document**: Note any issues or decisions
3. **Commit**: Push Phase 1 changes
4. **Begin Phase 2**: Start with ViewStyle.swift

### Phase 2 Preview:

```bash
# Next files to migrate:
- UI/Styles/ViewStyle.swift
- UI/Styles/Extensions/*.swift (6 files)
- UI/Renderer.swift
- UI/Renderable.swift
- UI/ComponentRegistry.swift
```

## Quick Reference Commands

### Build Package

```bash
cd packages/render-ios-sdk && swift build
```

### Run Tests

```bash
cd packages/render-ios-sdk && swift test
```

### Copy File

```bash
cp apps/render-ios-playground/render-ios-playground/SDK/[SOURCE] \
   packages/render-ios-sdk/Sources/RenderEngine/[TARGET]
```

### Check for DIContainer References

```bash
cd apps/render-ios-playground/render-ios-playground/SDK
grep -r "DIContainer" [FILENAME]
```

### Count Remaining Files

```bash
cd apps/render-ios-playground/render-ios-playground/SDK
find . -name "*.swift" | wc -l
```

## Daily Checklist

Use this daily checklist to stay on track:

- [ ] Pull latest changes
- [ ] Review today's migration targets
- [ ] Migrate 2-3 files
- [ ] Write tests for migrated files
- [ ] Build and test
- [ ] Update migration checklist
- [ ] Commit progress
- [ ] Document any issues

## Getting Help

If you encounter issues:

1. Check `ios-sdk-migration-plan.md` for detailed guidance
2. Review `ios-sdk-file-mapping.md` for file locations
3. Look at existing migrated files for patterns
4. Document blockers in the checklist

## Success Metrics

Track these metrics daily:

- Files migrated: \_\_\_/43
- Tests written: \_\_\_/29
- Tests passing: \_\_\_/29
- Code coverage: \_\_\_%

## Timeline Reference

- **Week 1**: Phase 1 - Models & Core (6 files)
- **Week 2**: Phase 2 - Rendering Infrastructure (13 files)
- **Week 3**: Phase 3 - Renderers (13 files)
- **Week 4**: Phase 4 - Integration (11 files)
- **Week 5**: Phase 5 - Testing & Docs
- **Week 6**: Phase 6 - Playground Migration

---

**Ready to Start?** Follow Step 1 above and begin your migration journey! 🚀

**Questions?** Refer to the comprehensive guides in the `docs/` directory.

**Good luck!** 🎉
