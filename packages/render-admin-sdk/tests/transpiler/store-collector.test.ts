import { describe, it, expect } from 'vitest'
import { transpile } from '../../src/transpiler/transpiler'

describe('Store Collector Plugin', () => {
  it('should detect store declaration with app scope', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = {
        key: "test-scenario",
        name: "Test Scenario",
        description: "Test scenario for store collector",
        version: "1.0.0"
      }

      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      export default function Main() {
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.stores).toBeDefined()
    expect(result.stores).toHaveLength(1)
    expect(result.stores![0].scope).toBe('app')
    expect(result.stores![0].storage).toBe('memory')
  })

  it('should detect store declaration with scenario scope', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = {
        key: "test-scenario",
        name: "Test Scenario",
        description: "Test scenario for store collector",
        version: "1.0.0"
      }

      const sessionStore = store({
        scope: StoreScope.Scenario,
        storage: StoreStorage.UserPrefs
      })

      export default function Main() {
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.stores![0].scope).toBe('scenario')
    expect(result.stores![0].storage).toBe('userprefs')
  })

  it('should parse initialValue object', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = {
        key: "test-scenario",
        name: "Test Scenario",
        description: "Test scenario for store collector",
        version: "1.0.0"
      }

      const cartStore = store({
        scope: StoreScope.Scenario,
        storage: StoreStorage.Memory,
        initialValue: {
          items: [],
          total: 0,
          userName: "Guest"
        }
      })

      export default function Main() {
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.stores![0].initialValue).toBeDefined()
    expect(result.stores![0].initialValue!.items).toEqual({ type: 'array', value: [] })
    expect(result.stores![0].initialValue!.total).toEqual({ type: 'integer', value: 0 })
    expect(result.stores![0].initialValue!.userName).toEqual({ type: 'string', value: 'Guest' })
  })

  it('should handle multiple store declarations', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = {
        key: "test-scenario",
        name: "Test Scenario",
        description: "Test scenario for store collector",
        version: "1.0.0"
      }

      const appStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })
      const userStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.UserPrefs })

      export default function Main() {
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.stores).toHaveLength(2)
  })

  it('should deduplicate stores with same scope+storage', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = {
        key: "test-scenario",
        name: "Test Scenario",
        description: "Test scenario for store collector",
        version: "1.0.0"
      }

      const store1 = store({ scope: StoreScope.App, storage: StoreStorage.Memory })
      const store2 = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        return <View />
      }
    `

    const result = await transpile(code)

    // Should only have one store (deduplicated by scope+storage key)
    expect(result.stores).toHaveLength(1)
  })
})
