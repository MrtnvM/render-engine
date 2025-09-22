# Image Renderer Example

The Image renderer has been successfully integrated into the iOS render engine. Here's how to use it:

## Basic Usage

The Image renderer supports the following configuration options:

### Required Properties

- `type`: Must be set to "image"
- `src`: Image source (URL, asset name, or base64 data)

### Optional Properties

- `contentMode`: How the image should be displayed (default: "scaleAspectFit")
- `placeholder`: Placeholder image source while loading
- `tintColor`: Color to tint the image
- `clipsToBounds`: Whether to clip content to bounds (boolean)
- All standard view properties (width, height, backgroundColor, cornerRadius, etc.)

## Example JSON Configuration

```json
{
  "type": "image",
  "id": "example-image",
  "style": {
    "src": "https://picsum.photos/300/200",
    "width": 300,
    "height": 200,
    "contentMode": "scaleAspectFit",
    "cornerRadius": 10,
    "backgroundColor": "#f0f0f0",
    "margin": 16,
    "placeholder": "placeholder-image"
  }
}
```

## Supported Content Modes

- `scaleToFill`
- `scaleAspectFit` (default)
- `scaleAspectFill`
- `redraw`
- `center`
- `top`
- `bottom`
- `left`
- `right`
- `topLeft`
- `topRight`
- `bottomLeft`
- `bottomRight`

## Image Sources

### 1. URL Images

```json
{
  "style": {
    "src": "https://example.com/image.jpg"
  }
}
```

### 2. Asset Images

```json
{
  "style": {
    "src": "my-image-asset"
  }
}
```

### 3. Base64 Images

```json
{
  "style": {
    "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
  }
}
```

## Complete Example with Layout

```json
{
  "type": "column",
  "id": "image-container",
  "style": {
    "padding": 20,
    "alignItems": "center"
  },
  "children": [
    {
      "type": "image",
      "id": "main-image",
      "style": {
        "src": "https://picsum.photos/400/300",
        "width": 400,
        "height": 300,
        "contentMode": "scaleAspectFit",
        "cornerRadius": 15,
        "marginBottom": 16
      }
    },
    {
      "type": "text",
      "id": "image-caption",
      "style": {
        "text": "Beautiful random image",
        "fontSize": 16,
        "textAlignment": "center"
      }
    }
  ]
}
```

## Features

✅ **URL Image Loading**: Asynchronously loads images from URLs  
✅ **Asset Image Support**: Loads images from app bundle  
✅ **Base64 Image Support**: Renders base64 encoded images  
✅ **Placeholder Support**: Shows placeholder while loading  
✅ **Content Mode Control**: Full control over image scaling and positioning  
✅ **Flexible Layout**: Integrates with the flex layout system  
✅ **Style Properties**: Supports all standard view styling (borders, shadows, etc.)  
✅ **Error Handling**: Graceful handling of failed image loads

The Image renderer is now fully integrated and ready to use in your iOS render engine scenarios!
