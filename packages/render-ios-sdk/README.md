# RenderEngine - iOS SDK

A powerful, flexible SDK for building dynamic UI components in iOS applications using declarative schemas. RenderEngine allows you to render complete user interfaces from JSON configurations, enabling server-driven UI and rapid iteration without app updates.

[![Swift](https://img.shields.io/badge/Swift-6.2-orange.svg)](https://swift.org)
[![Platform](https://img.shields.io/badge/Platform-iOS%2013+-lightgrey.svg)](https://developer.apple.com/ios/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

✨ **Dynamic UI Rendering** - Render complete UIs from JSON schemas  
🎨 **Flexbox Layout** - Powered by FlexLayout for flexible, responsive layouts  
🧩 **12+ Built-in Components** - Text, Button, Image, Checkbox, Rating, Navbar, and more  
🎯 **Type-Safe Configuration** - Strongly-typed component properties and styles  
📦 **Backend Integration** - Built-in Supabase integration for fetching scenarios  
🪵 **Comprehensive Logging** - Multi-target logging (console, file) with configurable levels  
🔧 **Extensible** - Create custom renderers and components  
🚀 **Production Ready** - Thoroughly tested with comprehensive error handling

## Requirements

- iOS 13.0+
- Swift 6.2+
- Xcode 16.0+

## Installation

### Swift Package Manager

Add RenderEngine to your project using Xcode:

1. File → Add Package Dependencies...
2. Enter the package URL: `https://github.com/your-org/render-ios-sdk` (or use local path)
3. Select the version or branch
4. Add to your target

Or add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/your-org/render-ios-sdk", from: "1.0.0")
]
```

### Local Package (Development)

If using as a local package in a monorepo:

1. File → Add Package Dependencies...
2. Click "Add Local..."
3. Select the `packages/render-ios-sdk` directory
4. Add to your target

## Quick Start

### 1. Import the SDK

```swift
import RenderEngine
```

### 2. Configure the SDK

In your `AppDelegate` or `SceneDelegate`:

```swift
import UIKit
import RenderEngine

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {

        // Configure RenderEngine with your Supabase credentials
        RenderEngine.shared.configure(
            supabaseURL: URL(string: "https://your-project.supabase.co")!,
            supabaseKey: "your-anon-key"
        )

        // Optional: Configure logging
        RenderEngine.shared.configureLogger(
            consoleEnabled: true,
            fileEnabled: true,
            consoleLogLevel: .info,
            fileLogLevel: .debug
        )

        return true
    }
}
```

### 3. Render a Scenario

**Option A: Render directly into a view controller**

```swift
import UIKit
import RenderEngine

class MyViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        Task {
            do {
                try await RenderEngine.shared.render(
                    scenarioKey: "main_screen",
                    in: self
                )
            } catch {
                print("Failed to render scenario: \(error)")
            }
        }
    }
}
```

**Option B: Get a pre-configured view controller**

```swift
let renderVC = RenderEngine.shared.getViewController(scenarioKey: "profile_screen")
navigationController?.pushViewController(renderVC, animated: true)
```

## Architecture

### Component-Based System

RenderEngine uses a component-based architecture where UIs are built from composable components:

```
Scenario
  └─ mainComponent (Component tree)
      ├─ Column
      │   ├─ Text (title)
      │   ├─ Image (banner)
      │   └─ Button (CTA)
      └─ Row
          ├─ Checkbox
          └─ Text
```

### Built-in Components

| Component    | Description                     |
| ------------ | ------------------------------- |
| **View**     | Generic container with styling  |
| **Text**     | Text display with styling       |
| **Button**   | Interactive button              |
| **Image**    | Async image loading and display |
| **Checkbox** | Toggle checkbox                 |
| **Stepper**  | Numeric stepper                 |
| **Rating**   | Star rating display             |
| **Row**      | Horizontal flex layout          |
| **Column**   | Vertical flex layout            |
| **Stack**    | Auto-layout stack               |
| **Spacer**   | Flexible spacing                |
| **Navbar**   | Navigation bar                  |

### Style System

Components support comprehensive styling:

- **Layout**: Flexbox (padding, margin, width, height, flex-grow, flex-shrink)
- **Alignment**: justifyContent, alignItems, alignSelf
- **Visual**: backgroundColor, borderColor, borderWidth, borderRadius
- **Text**: fontFamily, fontSize, fontWeight, color, textAlign
- **Effects**: shadow, opacity

## JSON Schema Example

```json
{
  "id": "main_screen",
  "key": "main_screen",
  "version": "1.0.0",
  "mainComponent": {
    "type": "Column",
    "style": {
      "padding": { "top": 20, "left": 16, "right": 16, "bottom": 20 },
      "gap": 16,
      "backgroundColor": "#FFFFFF"
    },
    "children": [
      {
        "type": "Text",
        "properties": {
          "text": "Welcome to RenderEngine",
          "fontSize": 24,
          "fontWeight": "bold",
          "color": "#000000"
        }
      },
      {
        "type": "Button",
        "properties": {
          "text": "Get Started",
          "backgroundColor": "#007AFF",
          "textColor": "#FFFFFF"
        },
        "style": {
          "padding": { "top": 12, "left": 24, "right": 24, "bottom": 12 },
          "borderRadius": 8
        }
      }
    ]
  }
}
```

## Advanced Usage

### Custom Scenario Repository

Implement your own data source:

```swift
import RenderEngine

class MyCustomRepository: ScenarioRepository {
    func fetchScenario(key: String) async throws -> Scenario {
        // Your custom implementation
        // Fetch from API, local storage, etc.
    }

    func subscribeToScenario(_ observer: ScenarioObserver) async throws {
        // Optional: Real-time updates
    }

    func unsubscribeFromScenario(_ observer: ScenarioObserver) async {
        // Cleanup
    }
}
```

### Custom Renderers

Create custom component renderers:

```swift
import RenderEngine
import UIKit

class MyCustomRenderer: Renderer {
    let type = "MyCustomComponent"

    func render(component: Component, context: RendererContext) -> UIView? {
        let view = UIView()
        // Your custom rendering logic
        return view
    }
}

// Register your custom renderer
let registry = ComponentRegistry()
registry.register(renderer: MyCustomRenderer())
```

### Logger Configuration

```swift
// Console only
RenderEngine.shared.configureLogger(
    consoleEnabled: true,
    fileEnabled: false,
    consoleLogLevel: .warning
)

// File only for production
RenderEngine.shared.configureLogger(
    consoleEnabled: false,
    fileEnabled: true,
    fileLogLevel: .error
)

// Get log file URL for sharing/debugging
if let logURL = RenderEngine.shared.getLogFileURL() {
    print("Logs: \(logURL.path)")
}
```

## Error Handling

RenderEngine provides comprehensive error types:

```swift
do {
    try await RenderEngine.shared.render(scenarioKey: "my_screen", in: self)
} catch RenderSDKError.noScenarioWithKey(let key) {
    print("Scenario not found: \(key)")
} catch RenderSDKError.networkError(let message) {
    print("Network error: \(message)")
} catch RenderSDKError.renderingError(let message) {
    print("Rendering failed: \(message)")
} catch {
    print("Unknown error: \(error)")
}
```

## Testing

Run tests using Swift Package Manager:

```bash
cd packages/render-ios-sdk
swift test
```

Or run tests in Xcode: Cmd + U

## Documentation

Full API documentation is available:

- [API Reference](Documentation.docc) (DocC)
- [Integration Guide](../../docs/ios-sdk-migration-plan.md)
- [Architecture Overview](../../docs/ios-sdk-migration-plan.md#architecture)
- [Migration Guide](../../docs/ios-sdk-migration-summary.md)

## Examples

Check out the example app:

```bash
cd apps/render-ios-playground
open render-ios-playground.xcodeproj
```

## Performance

RenderEngine is optimized for performance:

- ✅ Async/await for non-blocking UI
- ✅ Efficient view tree construction
- ✅ Image caching
- ✅ Lazy component rendering
- ✅ Memory-efficient logging

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Troubleshooting

### Package Not Found

If Xcode can't find the package:

1. Close Xcode
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData/`
3. Reopen the project

### Build Errors

1. Clean build folder: Product → Clean Build Folder
2. Reset package caches: File → Packages → Reset Package Caches
3. Update packages: File → Packages → Update to Latest Package Versions

### Import Issues

Verify:

- Package is added to target dependencies
- Package builds independently: `swift build` in package directory
- Correct import: `import RenderEngine` (not `import render-ios-sdk`)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@your-domain.com
- 💬 Issues: [GitHub Issues](https://github.com/your-org/render-ios-sdk/issues)
- 📖 Documentation: [Full Docs](https://docs.your-domain.com)

## Acknowledgments

- [FlexLayout](https://github.com/layoutBox/FlexLayout) - Flexbox layout system
- [Supabase](https://github.com/supabase/supabase-swift) - Backend integration

---

**Version**: 1.0.0  
**Status**: 🟡 In Development (Migration in Progress)  
**Last Updated**: October 2, 2025
