import { describe, it, expect, beforeEach } from 'vitest'
import { parse } from '@babel/parser'
import { ComponentRegistry } from '../../src/transpiler/plugins/component-registry'
import { LocalComponentsPlugin } from '../../src/transpiler/plugins/local-components-plugin'

describe('LocalComponentsPlugin', () => {
  let registry: ComponentRegistry

  beforeEach(() => {
    registry = new ComponentRegistry()
  })

  it('should detect function declaration components', async () => {
    const code = `
      import { View, Text } from '@render-engine/admin-sdk/ui'

      function TopRow() {
        return <View><Text properties={{ text: "Hello" }} /></View>
      }

      export default function Main() {
        return <View />
      }
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    expect(result.localComponents).toContain('TopRow')
    expect(result.localComponents).not.toContain('Main')
    expect(registry.isLocal('TopRow')).toBe(true)
  })

  it('should detect arrow function components', async () => {
    const code = `
      import { View, Text } from '@render-engine/admin-sdk/ui'

      const CartItem = () => <View><Text properties={{ text: "Item" }} /></View>

      export default function Main() {
        return <View />
      }
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    expect(result.localComponents).toContain('CartItem')
    expect(registry.isLocal('CartItem')).toBe(true)
  })

  it('should detect arrow functions with block body', async () => {
    const code = `
      import { View, Row } from '@render-engine/admin-sdk/ui'

      const Header = () => {
        return <Row><View /></Row>
      }

      export default function Main() {
        return <View />
      }
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    expect(result.localComponents).toContain('Header')
  })

  it('should skip default export function', async () => {
    const code = `
      import { View } from '@render-engine/admin-sdk/ui'

      export default function MainScreen() {
        return <View />
      }
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    expect(result.localComponents).not.toContain('MainScreen')
    expect(registry.isLocal('MainScreen')).toBe(false)
  })

  it('should skip default export arrow function', async () => {
    const code = `
      import { View } from '@render-engine/admin-sdk/ui'

      export default () => <View />
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    expect(result.localComponents).toHaveLength(0)
  })

  it('should detect multiple local components', async () => {
    const code = `
      import { View, Row, Column, Text } from '@render-engine/admin-sdk/ui'

      function TopRow() {
        return <Row />
      }

      const BottomBar = () => <Row />

      function Sidebar() {
        return <Column />
      }

      const Header = () => {
        return <View />
      }

      export default function Main() {
        return <View />
      }
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    expect(result.localComponents).toHaveLength(4)
    expect(result.localComponents).toContain('TopRow')
    expect(result.localComponents).toContain('BottomBar')
    expect(result.localComponents).toContain('Sidebar')
    expect(result.localComponents).toContain('Header')
  })

  it('should include named exports as local components', async () => {
    const code = `
      import { View } from '@render-engine/admin-sdk/ui'

      export const ReusableCard = () => <View />
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    // Named exports ARE considered local components
    expect(result.localComponents).toHaveLength(1)
    expect(result.localComponents).toContain('ReusableCard')
  })

  it('should ignore non-JSX functions', async () => {
    const code = `
      import { View } from '@render-engine/admin-sdk/ui'

      function calculateTotal(items) {
        return items.reduce((sum, item) => sum + item.price, 0)
      }

      const formatPrice = (price) => {
        return "$" + price.toFixed(2)
      }

      export default function Main() {
        return <View />
      }
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    expect(result.localComponents).toHaveLength(0)
    expect(registry.isLocal('calculateTotal')).toBe(false)
    expect(registry.isLocal('formatPrice')).toBe(false)
  })

  it('should handle components with parameters', async () => {
    const code = `
      import { View, Text } from '@render-engine/admin-sdk/ui'

      function ProductCard({ title, price }) {
        return (
          <View>
            <Text properties={{ text: title }} />
            <Text properties={{ text: price }} />
          </View>
        )
      }

      export default function Main() {
        return <View />
      }
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    expect(result.localComponents).toContain('ProductCard')
  })

  it('should handle TypeScript type annotations', async () => {
    const code = `
      import { View, Text } from '@render-engine/admin-sdk/ui'

      interface CardProps {
        title: string
        price: number
      }

      const Card = ({ title, price }: CardProps) => {
        return <View><Text properties={{ text: title }} /></View>
      }

      export default function Main() {
        return <View />
      }
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    expect(result.localComponents).toContain('Card')
  })

  it('should handle nested JSX returns', async () => {
    const code = `
      import { View, Row, Text } from '@render-engine/admin-sdk/ui'

      function ComplexComponent() {
        if (true) {
          return <Row><Text properties={{ text: "True" }} /></Row>
        }
        return <View />
      }

      export default function Main() {
        return <View />
      }
    `

    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })

    const plugin = new LocalComponentsPlugin(registry)
    const result = await plugin.execute(ast)

    // Should detect the component even with conditional returns
    expect(result.localComponents).toContain('ComplexComponent')
  })
})
