import { describe, it, expect } from 'vitest'
import { transpile } from '../../src/transpiler/transpiler'

describe('List Component Transpilation', () => {
  it('should transpile List with inline array data', async () => {
    const code = `
      import { List, View, Text } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "test-list",
        name: "Test List",
        description: "Test list component",
        version: "1.0.0"
      }

      export default function Main() {
        return (
          <List
            data={['Apple', 'Banana', 'Orange']}
            renderItem={(item) => (
              <View>
                <Text properties={{ text: item }} />
              </View>
            )}
          />
        )
      }
    `

    const result = await transpile(code)

    expect(result.main).toBeDefined()
    expect(result.main?.type).toBe('List')
    expect(result.main?.data?.data).toEqual(['Apple', 'Banana', 'Orange'])
    expect(result.main?.data?.itemComponent).toBeDefined()
    expect(result.main?.data?.itemComponent?.type).toBe('View')
    expect(result.main?.data?.itemComponent?.children).toHaveLength(1)
    expect(result.main?.data?.itemComponent?.children?.[0]?.type).toBe('Text')
  })

  it('should transpile List with store data binding', async () => {
    const code = `
      import { List, View, Text, store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'

      export const SCENARIO = {
        key: "test-list-store",
        name: "Test List with Store",
        description: "Test list with store binding",
        version: "1.0.0"
      }

      const cartStore = store({
        scope: StoreScope.Scenario,
        storage: StoreStorage.Memory,
        initialValue: {
          itemIds: ['1', '2', '3'],
          items: {
            '1': { name: 'Item 1', price: 100 },
            '2': { name: 'Item 2', price: 200 },
            '3': { name: 'Item 3', price: 300 }
          }
        }
      })

      export default function Main() {
        return (
          <List
            data={cartStore.get('itemIds')}
            renderItem={(itemId) => (
              <View>
                <Text properties={{ text: itemId }} />
              </View>
            )}
          />
        )
      }
    `

    const result = await transpile(code)

    expect(result.main).toBeDefined()
    expect(result.main?.type).toBe('List')

    // data should be a store reference placeholder
    expect(result.main?.data?.data).toBeDefined()
    expect(result.main?.data?.data.__storeRef).toBe('cartStore')
    expect(result.main?.data?.data.__keyPath).toBe('itemIds')

    // itemComponent should be defined
    expect(result.main?.data?.itemComponent).toBeDefined()
    expect(result.main?.data?.itemComponent?.type).toBe('View')
  })

  it('should handle renderItem with item parameter reference', async () => {
    const code = `
      import { List, Row, Text } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "test-list-props",
        name: "Test List Props",
        description: "Test list with item props",
        version: "1.0.0"
      }

      export default function Main() {
        return (
          <List
            data={['Apple', 'Banana', 'Orange']}
            renderItem={(item) => (
              <Row>
                <Text properties={{ text: item }} />
              </Row>
            )}
          />
        )
      }
    `

    const result = await transpile(code)

    expect(result.main).toBeDefined()
    expect(result.main?.type).toBe('List')
    expect(result.main?.data?.itemComponent).toBeDefined()
    expect(result.main?.data?.itemComponent?.type).toBe('Row')
    expect(result.main?.data?.itemComponent?.children).toHaveLength(1)

    // Text should have item prop reference
    const firstText = result.main?.data?.itemComponent?.children?.[0]
    expect(firstText?.properties?.text).toEqual({ type: 'prop', key: 'item' })
  })

  it('should handle renderItem with block body', async () => {
    const code = `
      import { List, View, Text } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "test-list-block",
        name: "Test List Block",
        description: "Test list with block body",
        version: "1.0.0"
      }

      export default function Main() {
        const items = ['A', 'B', 'C']

        return (
          <List
            data={items}
            renderItem={(item, index) => {
              return (
                <View>
                  <Text properties={{ text: item }} />
                </View>
              )
            }}
          />
        )
      }
    `

    const result = await transpile(code)

    expect(result.main).toBeDefined()
    expect(result.main?.type).toBe('List')
    expect(result.main?.data?.itemComponent).toBeDefined()
    expect(result.main?.data?.itemComponent?.type).toBe('View')
  })

  it('should handle List with custom component in renderItem', async () => {
    const code = `
      import { List, Row, Text, Image } from '@render-engine/admin-sdk/ui'

      export const SCENARIO = {
        key: "test-list-custom",
        name: "Test List Custom",
        description: "Test list with custom component",
        version: "1.0.0"
      }

      function CartItem({ image, title, price }: any) {
        return (
          <Row>
            <Image properties={{ source: image }} />
            <Text properties={{ text: title }} />
            <Text properties={{ text: price }} />
          </Row>
        )
      }

      export default function Main() {
        const items = [
          { image: 'img1.png', title: 'Product 1', price: '100' },
          { image: 'img2.png', title: 'Product 2', price: '200' }
        ]

        return (
          <List
            data={items}
            renderItem={(item) => <CartItem {...item} />}
          />
        )
      }
    `

    const result = await transpile(code)

    expect(result.main).toBeDefined()
    expect(result.main?.type).toBe('List')
    expect(result.main?.data?.itemComponent).toBeDefined()
    expect(result.main?.data?.itemComponent?.type).toBe('CartItem')
    expect(result.components?.CartItem).toBeDefined()
  })
})
