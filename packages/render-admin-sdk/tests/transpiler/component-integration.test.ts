import { describe, it, expect } from 'vitest'
import { transpile } from '../../src/transpiler/transpiler'

describe('Component Registry Integration', () => {
  it('should transpile scenario with local components', async () => {
    const code = `
      import { View, Row, Text } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "test-scenario",
        name: "Test Scenario",
        description: "Test with local components",
        version: "1.0.0"
      }

      function Header() {
        return <Row><Text properties={{ text: "Header" }} /></Row>
      }

      function Footer() {
        return <Row><Text properties={{ text: "Footer" }} /></Row>
      }

      export default function Main() {
        return (
          <View>
            <Header />
            <Text properties={{ text: "Content" }} />
            <Footer />
          </View>
        )
      }
    `

    const result = await transpile(code)

    // Should successfully transpile
    expect(result).toBeDefined()
    expect(result.main.type).toBe('View')

    // Local components should be in the components map
    expect(result.components?.Header).toBeDefined()
    expect(result.components?.Footer).toBeDefined()

    // Main component should reference local components
    expect(result.main.children).toHaveLength(3)
    expect(result.main.children![0].type).toBe('Header')
    expect(result.main.children![1].type).toBe('Text')
    expect(result.main.children![2].type).toBe('Footer')
  })

  it('should handle nested local component usage', async () => {
    const code = `
      import { View, Row, Column, Text } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "nested-test",
        name: "Nested Test",
        description: "Test nested local components",
        version: "1.0.0"
      }

      function ProductImage({ src }) {
        return <View />
      }

      function ProductTitle({ title }) {
        return <Text properties={{ text: title }} />
      }

      function ProductCard({ title, image }) {
        return (
          <Column>
            <ProductImage src={image} />
            <ProductTitle title={title} />
          </Column>
        )
      }

      export default function Main() {
        return (
          <View>
            <ProductCard title="Product 1" image="img1.png" />
            <ProductCard title="Product 2" image="img2.png" />
          </View>
        )
      }
    `

    const result = await transpile(code)

    // All local components should be collected
    expect(result.components?.ProductImage).toBeDefined()
    expect(result.components?.ProductTitle).toBeDefined()
    expect(result.components?.ProductCard).toBeDefined()

    // ProductCard should reference other local components
    const productCard = result.components?.ProductCard
    expect(productCard?.children).toHaveLength(2)
    expect(productCard?.children![0].type).toBe('ProductImage')
    expect(productCard?.children![1].type).toBe('ProductTitle')

    // Main should use ProductCard
    expect(result.main.children![0].type).toBe('ProductCard')
    expect(result.main.children![1].type).toBe('ProductCard')
  })

  it('should pass props to local components', async () => {
    const code = `
      import { View, Text } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "props-test",
        name: "Props Test",
        description: "Test prop passing to local components",
        version: "1.0.0"
      }

      function Greeting({ name, age }) {
        return (
          <View>
            <Text properties={{ text: name }} />
            <Text properties={{ text: age }} />
          </View>
        )
      }

      export default function Main() {
        return (
          <View>
            <Greeting name="Alice" age={30} />
          </View>
        )
      }
    `

    const result = await transpile(code)

    // Greeting component should be collected
    expect(result.components?.Greeting).toBeDefined()

    // Main should reference Greeting with data props
    const greetingUsage = result.main.children![0]
    expect(greetingUsage.type).toBe('Greeting')
    expect(greetingUsage.data).toBeDefined()
    expect(greetingUsage.data!.name).toBe('Alice')
    expect(greetingUsage.data!.age).toBe(30)

    // Greeting component should use prop references
    const greetingDef = result.components?.Greeting
    const nameText = greetingDef?.children![0]
    const ageText = greetingDef?.children![1]

    expect(nameText?.properties!.text).toEqual({ type: 'prop', key: 'name' })
    expect(ageText?.properties!.text).toEqual({ type: 'prop', key: 'age' })
  })

  it('should throw error for unknown component', async () => {
    const code = `
      import { View, Text } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "error-test",
        name: "Error Test",
        description: "Test unknown component error",
        version: "1.0.0"
      }

      export default function Main() {
        return (
          <View>
            <UnknownComponent />
          </View>
        )
      }
    `

    await expect(transpile(code)).rejects.toThrow('Unknown component: <UnknownComponent>')
  })

  it('should include both base and local components in error message', async () => {
    const code = `
      import { View, Text } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "error-test-2",
        name: "Error Test 2",
        description: "Test error message includes local components",
        version: "1.0.0"
      }

      function CustomCard() {
        return <View />
      }

      export default function Main() {
        return (
          <View>
            <CustomCard />
            <InvalidComponent />
          </View>
        )
      }
    `

    try {
      await transpile(code)
      expect.fail('Should have thrown an error')
    } catch (error: any) {
      expect(error.message).toContain('Unknown component: <InvalidComponent>')
      expect(error.message).toContain('Base UI components:')
      expect(error.message).toContain('Local components: CustomCard')
    }
  })

  it('should handle arrow function components', async () => {
    const code = `
      import { View, Row, Text } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "arrow-test",
        name: "Arrow Function Test",
        description: "Test arrow function components",
        version: "1.0.0"
      }

      const Title = ({ text }) => <Text properties={{ text: text }} />

      const Card = ({ title, content }) => (
        <View>
          <Title text={title} />
          <Text properties={{ text: content }} />
        </View>
      )

      export default function Main() {
        return (
          <View>
            <Card title="Hello" content="World" />
          </View>
        )
      }
    `

    const result = await transpile(code)

    expect(result.components?.Title).toBeDefined()
    expect(result.components?.Card).toBeDefined()

    const cardUsage = result.main.children![0]
    expect(cardUsage.type).toBe('Card')
    expect(cardUsage.data!.title).toBe('Hello')
    expect(cardUsage.data!.content).toBe('World')
  })

  it('should handle complex cart scenario', async () => {
    const code = `
      import { View, Row, Column, Text, Image, Checkbox } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "cart",
        name: "Shopping Cart",
        description: "Shopping cart with local components",
        version: "1.0.0"
      }

      function ProductImage({ src }) {
        return <Image properties={{ source: src }} style={{ width: 100, height: 100 }} />
      }

      function ProductCheckbox({ checked }) {
        return <Checkbox properties={{ checked: checked, disabled: false }} />
      }

      function CartItem({ image, title, price, checked }) {
        return (
          <Row>
            <ProductCheckbox checked={checked} />
            <ProductImage src={image} />
            <Text properties={{ text: title }} />
            <Text properties={{ text: price }} />
          </Row>
        )
      }

      export default function CartScreen() {
        return (
          <Column>
            <CartItem
              image="img1.png"
              title="Product 1"
              price="$10"
              checked={true}
            />
            <CartItem
              image="img2.png"
              title="Product 2"
              price="$20"
              checked={false}
            />
          </Column>
        )
      }
    `

    const result = await transpile(code)

    // All local components should be collected
    expect(result.components?.ProductImage).toBeDefined()
    expect(result.components?.ProductCheckbox).toBeDefined()
    expect(result.components?.CartItem).toBeDefined()

    // Main screen should use CartItem
    expect(result.main.type).toBe('Column')
    expect(result.main.children).toHaveLength(2)
    expect(result.main.children![0].type).toBe('CartItem')
    expect(result.main.children![1].type).toBe('CartItem')

    // CartItem should reference local components
    const cartItemDef = result.components?.CartItem
    expect(cartItemDef.children![0].type).toBe('ProductCheckbox')
    expect(cartItemDef.children![1].type).toBe('ProductImage')

    // Props should be passed correctly
    const firstItem = result.main.children![0]
    expect(firstItem.data!.image).toBe('img1.png')
    expect(firstItem.data!.title).toBe('Product 1')
    expect(firstItem.data!.price).toBe('$10')
    expect(firstItem.data!.checked).toBe(true)
  })

  it('should handle components with no parameters', async () => {
    const code = `
      import { View, Text } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "no-params",
        name: "No Parameters",
        description: "Components without parameters",
        version: "1.0.0"
      }

      function StaticHeader() {
        return <Text properties={{ text: "Static Header" }} />
      }

      export default function Main() {
        return (
          <View>
            <StaticHeader />
          </View>
        )
      }
    `

    const result = await transpile(code)

    expect(result.components?.StaticHeader).toBeDefined()
    expect(result.main.children![0].type).toBe('StaticHeader')
  })

  it('should not include default export in components map', async () => {
    const code = `
      import { View } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "default-export",
        name: "Default Export",
        description: "Default export should be main, not in components",
        version: "1.0.0"
      }

      export default function MainScreen() {
        return <View />
      }
    `

    const result = await transpile(code)

    // Default export should be the main component
    expect(result.main.type).toBe('View')

    // Should not be in components map
    expect(result.components?.MainScreen).toBeUndefined()
  })
})
