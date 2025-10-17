import { describe, it, expect } from 'vitest'
import type { StoreActionDescriptor } from '../../src/runtime/action-types'
import { transpile } from '../../src/transpiler/transpiler'

function getStoreActions(actions: any[] | undefined): StoreActionDescriptor[] {
  return (actions || []).filter((action): action is StoreActionDescriptor => action.kind === 'store')
}

describe('Action Collector Plugin', () => {
  it('should collect set() action', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = { key: "test-scenario", name: "Test Scenario", description: "Test scenario for action collector", version: "1.0.0" }

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.set('userName', 'Alice')
        return <View />
      }
    `

    const result = await transpile(code)

    const storeActions = getStoreActions(result.actions)
    expect(storeActions).toHaveLength(1)
    expect(storeActions[0].type).toBe('store.set')
    expect(storeActions[0].scope).toBe('app')
    expect(storeActions[0].storage).toBe('memory')
    expect(storeActions[0].keyPath).toBe('userName')
    expect(storeActions[0].value).toEqual({ type: 'string', value: 'Alice' })
  })

  it('should collect remove() action', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = { key: "test-scenario", name: "Test Scenario", description: "Test scenario for action collector", version: "1.0.0" }

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.remove('tempData')
        return <View />
      }
    `

    const result = await transpile(code)

    const storeActions = getStoreActions(result.actions)
    expect(storeActions[0].type).toBe('store.remove')
    expect(storeActions[0].keyPath).toBe('tempData')
    expect(storeActions[0].value).toBeUndefined()
  })

  it('should collect merge() action', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = { key: "test-scenario", name: "Test Scenario", description: "Test scenario for action collector", version: "1.0.0" }

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.merge('user', { age: 31, city: 'NYC' })
        return <View />
      }
    `

    const result = await transpile(code)

    const storeActions = getStoreActions(result.actions)
    expect(storeActions[0].type).toBe('store.merge')
    expect(storeActions[0].keyPath).toBe('user')
    expect(storeActions[0].value).toEqual({
      type: 'object',
      value: {
        age: { type: 'integer', value: 31 },
        city: { type: 'string', value: 'NYC' }
      }
    })
  })

  it('should collect actions from different stores', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = { key: "test-scenario", name: "Test Scenario", description: "Test scenario for action collector", version: "1.0.0" }

      const appStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })
      const userStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.UserPrefs })

      export default function Main() {
        appStore.set('theme', 'dark')
        userStore.set('name', 'Bob')
        return <View />
      }
    `

    const result = await transpile(code)

    const storeActions = getStoreActions(result.actions)
    expect(storeActions).toHaveLength(2)
    expect(storeActions[0].scope).toBe('app')
    expect(storeActions[0].storage).toBe('memory')
    expect(storeActions[1].scope).toBe('scenario')
    expect(storeActions[1].storage).toBe('userprefs')
  })

  it('should generate unique action IDs', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = { key: "test-scenario", name: "Test Scenario", description: "Test scenario for action collector", version: "1.0.0" }

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.set('key1', 'value1')
        myStore.set('key2', 'value2')
        return <View />
      }
    `

    const result = await transpile(code)

    const storeActions = getStoreActions(result.actions)
    expect(storeActions[0].id).toBe('app.memory_set_key1')
    expect(storeActions[1].id).toBe('app.memory_set_key2')
    expect(storeActions[0].id).not.toBe(storeActions[1].id)
  })

  it('should handle nested keyPaths', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      export const SCENARIO = { key: "test-scenario", name: "Test Scenario", description: "Test scenario for action collector", version: "1.0.0" }

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.set('user.profile.name', 'Alice')
        return <View />
      }
    `

    const result = await transpile(code)

    const storeActions = getStoreActions(result.actions)
    expect(storeActions[0].keyPath).toBe('user.profile.name')
    expect(storeActions[0].id).toBe('app.memory_set_user_profile_name')
})
})
