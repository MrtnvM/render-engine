# Render Engine Package Integration

This document explains how the `RenderEngine` Swift Package is integrated into the `render-ios-playground` Xcode project.

## Overview

The `render-ios-playground` app uses the `RenderEngine` package from `../../packages/render-ios-sdk` for all rendering functionality. The local SDK implementation has been completely replaced with the package SDK.

## Integration Details

### Xcode Project Configuration

The integration is configured via the `project.pbxproj` file with:

1. **Local Package Reference**: `XCLocalSwiftPackageReference` pointing to `../../packages/render-ios-sdk`
2. **Package Dependency**: The package is added to the `render-ios-playground` target's dependencies
3. **Framework Linking**: The `RenderEngine` library is linked in the Frameworks build phase

### Current Architecture

The playground now exclusively uses the **Package SDK** (`../../packages/render-ios-sdk`):

- ✅ All SDK code is in the package
- ✅ Playground imports `RenderEngine` module
- ✅ Single source of truth for SDK implementation

## Usage

### Import the Package SDK

```swift
import RenderEngine
```

### Configure the SDK

In `SceneDelegate.swift`:

```swift
import RenderEngine

RenderEngine.shared.configure(
    supabaseURL: URL(string: "https://your-project.supabase.co")!,
    supabaseKey: "your-anon-key"
)

RenderEngine.shared.configureLogger(
    consoleEnabled: true,
    fileEnabled: true,
    consoleLogLevel: .info,
    fileLogLevel: .debug
)

let renderViewController = RenderViewController(scenarioKey: "avito-cart")`
```

### Render a Scenario

In your view controller:

```swift
import UIKit
import RenderEngine

class MainViewController: UIViewController {
    private func renderScenario() async {
        do {
            try await RenderEngine.shared.render(
                scenarioKey: "main_screen",
                in: self,
                containerView: nil // Optional container view
            )
        } catch {
            print("Failed to render: \(error)")
        }
    }
}
```

## Benefits of Package Architecture

- **Reusability**: The SDK can be easily integrated into any iOS project
- **Versioning**: Better version control and distribution
- **Separation of Concerns**: Clear boundary between SDK and app
- **Testing**: Independent testing of SDK functionality
- **Distribution**: Can be distributed via Swift Package Manager, CocoaPods, or Carthage
- **Maintainability**: Single implementation to maintain

## Building and Testing

### Build the Package

From the package directory:

```bash
cd packages/render-ios-sdk
swift build
```

### Run Package Tests

```bash
cd packages/render-ios-sdk
swift test
```

### Build the Playground with Package

Open the Xcode project and build normally. Xcode will automatically resolve and build the local package dependency.

## Package Structure

```
packages/render-ios-sdk/
├── Package.swift                      # Package manifest
├── README.md                          # Package documentation
├── Sources/
│   └── RenderEngine/
│       ├── RenderEngine.swift         # Main SDK entry point
│       ├── Core/                      # Core functionality
│       ├── Debug/                     # Logging and debugging
│       ├── Models/                    # Data models
│       ├── Providers/                 # Value providers
│       ├── Repositories/              # Data repositories
│       └── UI/                        # UI components and rendering
└── Tests/
    └── RenderEngineTests/
        └── RenderEngineTests.swift    # Unit tests
```

## Troubleshooting

### Package Not Found

If Xcode can't find the package:

1. Close Xcode
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData/`
3. Reopen the project

### Build Errors

If you encounter build errors:

1. Clean build folder: Product → Clean Build Folder
2. Resolve package versions: File → Packages → Reset Package Caches
3. Update packages: File → Packages → Update to Latest Package Versions

### Import Issues

If imports fail:

- Check that the package product name is `RenderEngine`
- Verify the package is listed in the target's dependencies
- Ensure you're using `import RenderEngine`
