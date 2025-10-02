# render-ios-sdk Package Integration

This document explains how the `render-ios-sdk` Swift Package is connected to the `render-ios-playground` Xcode project.

## Overview

The `render-ios-playground` app now has access to the `render-ios-sdk` package, which is located at `../../packages/render-ios-sdk` relative to the project root.

## Integration Details

### Xcode Project Configuration

The integration was done by modifying the `project.pbxproj` file with the following additions:

1. **Local Package Reference**: Added `XCLocalSwiftPackageReference` pointing to the SDK package
2. **Package Dependency**: Added the package to the `render-ios-playground` target's dependencies
3. **Framework Linking**: Linked the `render-ios-sdk` library in the Frameworks build phase

### Current Architecture

The playground currently has two SDK implementations:

1. **Local SDK** (`render-ios-playground/SDK/`): The existing, complete SDK implementation used by the app
2. **Package SDK** (`../../packages/render-ios-sdk`): The new Swift Package that can be used for distribution

## Usage

### Importing the Package SDK

To use the package SDK in your Swift files:

```swift
import render_ios_sdk

// Initialize the SDK
render_ios_sdk.RenderSDK.shared.initialize(baseURL: "https://your-api-url.com")

// Get SDK version
print("SDK Version: \(render_ios_sdk.RenderSDK.shared.version)")
```

### Current Implementation

The app currently uses the local SDK implementation:

```swift
// This uses the local SDK from render-ios-playground/SDK/
RenderSDK.shared.render(
    scenarioKey: scenarioKey,
    vc: self,
    containerView: mainView
)
```

## Migration Path

To migrate from the local SDK to the package SDK:

1. Move SDK code from `render-ios-playground/SDK/` to `packages/render-ios-sdk/Sources/render-ios-sdk/`
2. Update imports in the playground app from local to package imports
3. Remove the local SDK directory once migration is complete

## Benefits of Package Architecture

- **Reusability**: The SDK can be easily integrated into other iOS projects
- **Versioning**: Better version control and distribution
- **Separation of Concerns**: Clear separation between SDK and playground app
- **Testing**: Independent testing of SDK functionality
- **Distribution**: Can be distributed via Swift Package Manager, CocoaPods, or Carthage

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
├── Package.swift              # Package manifest
├── README.md                  # Package documentation
├── Sources/
│   └── render-ios-sdk/
│       └── render_ios_sdk.swift  # Main SDK implementation
└── Tests/
    └── render-ios-sdkTests/
        └── render_ios_sdkTests.swift  # Unit tests
```

## Next Steps

1. **Populate the Package**: Move SDK functionality from local to package
2. **Add Tests**: Create comprehensive unit tests in the package
3. **Documentation**: Add detailed API documentation
4. **CI/CD**: Set up continuous integration for the package
5. **Versioning**: Implement semantic versioning for releases

## Troubleshooting

### Package Not Found

If Xcode can't find the package:

1. Close Xcode
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData/`
3. Reopen the project

### Build Errors

If you encounter build errors:

1. Ensure the package path is correct in the Xcode project
2. Clean build folder: Product → Clean Build Folder
3. Resolve package versions: File → Packages → Reset Package Caches

### Import Issues

If imports fail:

- Check that the package product name matches: `render-ios-sdk`
- Verify the package is listed in the target's dependencies
- Ensure the package builds successfully independently

## Resources

- [Swift Package Manager Documentation](https://swift.org/package-manager/)
- [Creating a Swift Package](https://developer.apple.com/documentation/xcode/creating-a-standalone-swift-package-with-xcode)
- [Local Package Development](https://developer.apple.com/documentation/xcode/organizing-your-code-with-local-packages)
