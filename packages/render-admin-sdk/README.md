# @render-engine/admin-sdk

SDK for transpiling React JSX DSL to Render JSON schema.

## Installation

```bash
pnpm add @render-engine/admin-sdk
```

## Usage

### Basic Transpilation

```typescript
import { transpile } from '@render-engine/admin-sdk'

const jsxCode = `
  export const SCENARIO_KEY = 'my-scenario'
  
  export default function App() {
    return (
      <View style={{ padding: 16 }}>
        <Text>Hello World</Text>
      </View>
    )
  }
`

const schema = await transpile(jsxCode)
console.log(schema)
```

### Using UI Types

```typescript
import type { StyleSheet } from '@render-engine/admin-sdk/ui'

const styles: StyleSheet = {
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
}
```

## API

### `transpile(jsxString: string): Promise<TranspiledScenario>`

Transpiles a React JSX string into a server-driven UI JSON schema.

**Parameters:**

- `jsxString` - The JSX code to transpile

**Returns:**

- `TranspiledScenario` - The compiled JSON schema

**Example:**

```typescript
const scenario = await transpile(jsxCode)
// {
//   key: 'my-scenario',
//   version: '1.0.0',
//   main: { ... },
//   components: { ... }
// }
```

## Types

- `TranspiledScenario` - The output schema structure
- `JsonNode` - Individual component node structure
- `ComponentMetadata` - Component metadata structure
- `StyleSheet` - Style definitions
- `ImageResizeMode` - Image resize modes

## License

MIT
