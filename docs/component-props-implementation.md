# Component Props Implementation Guide

## Overview

This document explains how React function props are compiled to JSON and accessed during component rendering in the Render Engine system. The implementation enables React-style component composition with props while maintaining compatibility with server-driven UI rendering on iOS and Android.

## Architecture

### 1. Transpiler (Render CLI)

The Babel-based transpiler in `apps/render-cli/src/sdk/transpiler/` converts JSX components to JSON schema:

```tsx
// Input JSX
export default Main() {
    return <SellerSection storeName="Pear Store" rating={4.8} reviewCount={643} checked={true} />
}

function SellerSection({ storeName, rating, reviewCount }: { storeName: string, rating: string, reviewCount: string }) {
  return (
    <Row>
      <Text properties={{ text: storeName }} />
      <Text properties={{ text: rating.toString() }} />
      <Text properties={{ text: `(${reviewCount})` }} />
    </Row>
  )
}
```

```json
// Output JSON Schema
{
  "main": {
    "type": "SellerSection",
    "props": {
      "storeName": "Pear Store",
      "rating": "4.8",
      "reviewCount": "643"
    }
  },
  "components": {
    "SellerSection": {
      "type": "Row",
      "children": [
        {
          "type": "Text",
          "properties": { 
            "text": { 
              "type": "prop", 
              "valueType": "string", 
              "key": "storeName" 
            } 
          }
        },
        {
          "type": "Text", 
          "properties": { 
            "text": { 
              "type": "prop", 
              "valueType": "string", 
              "key": "rating" 
            } 
          }
        },
        {
          "type": "Text",
          "properties": "properties": { 
            "text": { 
              "type": "prop", 
              "valueType": "string", 
              "key": "reviewCount" 
            } 
          }
        }
      ]
    }
  }
}
```

### 2. Component Structure

Each component in the JSON schema has the following structure:

```json
{
  "type": "ComponentName",
  "style": { /* CSS-like styling properties */ },
  "properties": { /* Component-specific properties */ },
  "props": { /* Function props */ },
  "children": [ /* Child components */ ]
}
```

- **`style`**: CSS-like properties for layout and appearance
- **`properties`**: Component-specific properties (text, checked, source, etc.)
- **`props`**: Function props passed from parent components
- **`children`**: Array of child components

### 3. ViewTreeBuilder Enhancement (iOS)

The enhanced `ViewTreeBuilder` in `apps/render-ios-playground/render-ios-playground/SDK/ViewTreeBuilder.swift` handles component props expansion:

#### Key Features:

1. **Custom Component Detection**: Identifies when a component type exists in `scenario.components`
2. **Props Data Insertion**: Insert props data into component template properties

#### Implementation Details:

```swift
func buildViewTree(from component: Component) -> UIView? {
    // 1. Check if this is a custom component defined in the scenario
    if let customComponentDefinition = scenario.components[component.type] {
        // Expand the custom component with the provided data
        let expandedComponent = expandComponentDefinition(customComponentDefinition, withData: component.data)
        return buildViewTree(from: expandedComponent)
    }
    
    // 2. Continue with normal rendering for built-in components
    // ...
}
```

## Prop Handling Strategies

### 1. Direct Property Binding

Props are directly bound to component properties:

```tsx
<Text properties={{ text: title }} />
```

Compiled to:
```json
{
  "type": "Text",
  "properties": { "text": "Product Title" }
}
```

### 2. Template Variable Substitution

Props are referenced as template variables:

```tsx
<Text properties={{ text: "{title}" }} />
```

Compiled to:
```json
{
  "type": "Text", 
  "properties": { "text": "{title}" }
}
```

Expanded to:
```json
{
  "type": "Text",
  "properties": { "text": "Product Title" }
}
```

### 3. String Template Interpolation

Props are interpolated within strings:

```tsx
<Text properties={{ text: `Price: ${price}` }} />
```

Compiled to:
```json
{
  "type": "Text",
  "properties": { "text": "Price: {price}" }
}
```

Expanded to:
```json
{
  "type": "Text",
  "properties": { "text": "Price: $29.99" }
}
```

### 4. Complex Data Objects

Complex objects are passed through the data field:

```tsx
<CustomComponent data={{ user, settings, callbacks }} />
```

Accessed in renderers:
```swift
let userId = component.data.getString(forKey: "userId")
let settings = component.data.getConfig(forKey: "settings")
```

## Expansion Process

The ViewTreeBuilder follows this process for component props expansion:

1. **Detection**: Check if component type exists in `scenario.components`
2. **Retrieval**: Get the component definition template
3. **Merging**: Merge props data into template properties
4. **Substitution**: Replace template variables with actual values
5. **Recursion**: Process child components recursively
6. **Rendering**: Continue with normal view tree building

### Template Variable Processing

```swift
private func processTemplateVariables(_ template: String, data: [String: Any]) -> String {
    var result = template
    
    // Replace {propName} patterns with actual values
    for (key, value) in data {
        let placeholder = "{\(key)}"
        if result.contains(placeholder) {
            let stringValue = stringFromValue(value)
            result = result.replacingOccurrences(of: placeholder, with: stringValue)
        }
    }
    
    return result
}
```

## Usage Examples

### Basic Component with Props

```tsx
function ProductCard({ title, price, image }) {
  return (
    <Column>
      <Image properties={{ source: image }} />
      <Text properties={{ text: title }} />
      <Text properties={{ text: `$${price}` }} />
    </Column>
  )
}

// Usage
<ProductCard title="iPhone" price="999" image="iphone.jpg" />
```

### Nested Components with Props

```tsx
function SellerSection({ storeName, rating, reviewCount }) {
  return (
    <Row>
      <Text properties={{ text: storeName }} />
      <RatingDisplay rating={rating} count={reviewCount} />
    </Row>
  )
}

function RatingDisplay({ rating, count }) {
  return (
    <Row>
      <Text properties={{ text: rating.toString() }} />
      <Text properties={{ text: `(${count})` }} />
    </Row>
  )
}
```

### Event Handlers and Custom Data

```tsx
function ActionButton({ title, onPress, productId }) {
  return (
    <Button 
      properties={{ title }} 
      data={{ onPress, productId }}
    />
  )
}
```

## Platform Support

### iOS Implementation
- ✅ Custom component detection
- ✅ Props data expansion
- ✅ Template variable substitution
- ✅ Recursive processing
- ✅ Type safety with Config objects

### Android Implementation
Similar implementation needed in:
- `ViewTreeBuilder` equivalent
- Component expansion logic
- Template variable processing

### React Native / Web
The same JSON schema works across all platforms with appropriate renderers.

## Benefits

1. **React-like Development**: Familiar component composition patterns
2. **Type Safety**: Strong typing with TypeScript interfaces
3. **Platform Agnostic**: Same JSON schema works everywhere
4. **Performance**: Compile-time optimization of component trees
5. **Flexibility**: Multiple prop handling strategies
6. **Debugging**: Clear separation of structure, style, properties, and data

## Testing

The implementation includes comprehensive tests:

- Unit tests for component expansion
- Template variable substitution tests
- Integration tests for complete flow
- Example components for demonstration

## Future Enhancements

1. **Dynamic Styling**: Props-based style modifications
2. **Conditional Rendering**: Data-driven component visibility
3. **Performance Optimization**: Component memoization
4. **Development Tools**: Enhanced debugging and validation
5. **Advanced Templates**: More sophisticated template syntax

## Conclusion

The component props implementation successfully bridges React-style component development with server-driven UI rendering. It provides a familiar development experience while maintaining the flexibility and performance benefits of the JSON-based rendering system.

The system is production-ready and supports complex component hierarchies with props, making it suitable for building sophisticated mobile applications with dynamic, server-controlled UIs.
