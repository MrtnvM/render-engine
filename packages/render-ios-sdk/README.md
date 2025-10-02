# Render iOS SDK

The Render iOS SDK provides a Swift Package for building dynamic UI components in iOS applications.

## Integration

### Local Package Integration

The SDK is integrated into the `render-ios-playground` project as a local Swift Package. The package is located at `../../packages/render-ios-sdk` relative to the Xcode project.

### Usage in render-ios-playground

To use the SDK in your iOS playground app, simply import it:

```swift
import RenderEngine

// Initialize the SDK
RenderEngine.shared.initialize(baseURL: "https://your-api-url.com")

// Access SDK version
print("SDK Version: \(RenderEngine.shared.version)")
```

## Development

### Package Structure

```
render-ios-sdk/
├── Package.swift
├── Sources/
│   └── RenderEngine/
│       └── render_ios_sdk.swift
└── Tests/
    └── RenderEngineTests/
        └── render_ios_sdkTests.swift
```

### Adding to Other Projects

To add this SDK to other Xcode projects:

1. Open your Xcode project
2. Go to File → Add Package Dependencies...
3. Click "Add Local..." and select the `packages/render-ios-sdk` directory
4. Select the package and add it to your target

### Building

The package uses Swift 6.2 and can be built using:

```bash
swift build
```

### Testing

Run tests using:

```bash
swift test
```

## Features

- Dynamic UI rendering
- Component-based architecture
- Type-safe configuration
- iOS 13+ support

## License

See LICENSE file for details.
