# NavbarRenderer Documentation

## Overview
The `NavbarRenderer` creates a navigation bar component that automatically sets up a `UINavigationController` and provides programmatic access to navigation functionality.

## Features
- **Automatic Navigation Controller Setup**: Creates and manages `UINavigationController` if none exists
- **Customizable Appearance**: Supports background color, title colors, shadow settings
- **Button Actions**: Left and right navigation bar buttons with configurable actions
- **Large Title Support**: Optional large title display
- **Programmatic API**: Access to current view controller and navigation controller
- **Action Handling**: Built-in support for back, dismiss, push, and present actions

## Component Properties

### Basic Properties
- `title` (String): Navigation bar title
- `leftButtonTitle` (String): Left button text
- `rightButtonTitle` (String): Right button text
- `leftButtonAction` (String): Action for left button ("back", "dismiss", "push", "present")
- `rightButtonAction` (String): Action for right button
- `prefersLargeTitles` (Boolean): Enable large title display
- `isHidden` (Boolean): Hide/show navigation bar

### Style Properties
- `backgroundColor` (UIColor): Navigation bar background color
- `titleColor` (UIColor): Title text color
- `largeTitleColor` (UIColor): Large title text color
- `hideShadow` (Boolean): Hide navigation bar shadow

## Usage Example

```json
{
  "type": "Navbar",
  "properties": {
    "title": "My Screen",
    "leftButtonTitle": "← Back",
    "rightButtonTitle": "Settings",
    "leftButtonAction": "back",
    "rightButtonAction": "present",
    "prefersLargeTitles": true
  },
  "style": {
    "backgroundColor": "#FFFFFF",
    "titleColor": "#000000",
    "largeTitleColor": "#000000",
    "hideShadow": false
  }
}
```

## Programmatic API

The `RenderableNavbar` class provides the following methods for programmatic access:

### Navigation Access
- `getCurrentViewController()`: Get the current view controller
- `getNavigationController()`: Get the navigation controller

### Navigation Actions
- `setTitle(_:)`: Set navigation bar title
- `setNavigationBarHidden(_:animated:)`: Show/hide navigation bar
- `pushViewController(_:animated:)`: Push a new view controller
- `presentViewController(_:animated:completion:)`: Present a view controller modally
- `popViewController(animated:)`: Pop current view controller
- `popToRootViewController(animated:)`: Pop to root view controller

## Implementation Details

### Navigation Controller Setup
The renderer automatically:
1. Finds the current view controller in the view hierarchy
2. Creates a `UINavigationController` if none exists
3. Presents the navigation controller modally if needed
4. Configures navigation bar appearance

### Action Handling
Built-in actions include:
- `back`: Pop current view controller
- `dismiss`: Dismiss modal presentation
- `push`: Ready for custom push actions
- `present`: Ready for custom present actions

### View Controller Access
The component provides access to both the current view controller and navigation controller, allowing for:
- Programmatic navigation
- Custom button actions
- Dynamic title updates
- Navigation state management

## Integration with Render Engine
The NavbarRenderer is registered in the `ComponentRegistry` and can be used in any scenario JSON configuration. It integrates seamlessly with the existing render engine architecture and follows the same patterns as other renderers.
