import { describe, it, expect } from 'vitest'
import { transpile } from '../../src/transpiler/transpiler'

describe('Action Collector Plugin', () => {
  it('should collect set() action', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.set('userName', 'Alice')
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions).toBeDefined()
    expect(result.actions).toHaveLength(1)
    expect(result.actions![0].type).toBe('store.set')
    expect(result.actions![0].scope).toBe('app')
    expect(result.actions![0].storage).toBe('memory')
    expect(result.actions![0].keyPath).toBe('userName')
    expect(result.actions![0].value).toEqual({ type: 'string', value: 'Alice' })
  })

  it('should collect remove() action', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.remove('tempData')
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions![0].type).toBe('store.remove')
    expect(result.actions![0].keyPath).toBe('tempData')
    expect(result.actions![0].value).toBeUndefined()
  })

  it('should collect merge() action', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.merge('user', { age: 31, city: 'NYC' })
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions![0].type).toBe('store.merge')
    expect(result.actions![0].keyPath).toBe('user')
    expect(result.actions![0].value).toEqual({
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

      const appStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })
      const userStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.UserPrefs })

      export default function Main() {
        appStore.set('theme', 'dark')
        userStore.set('name', 'Bob')
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions).toHaveLength(2)
    expect(result.actions![0].scope).toBe('app')
    expect(result.actions![0].storage).toBe('memory')
    expect(result.actions![1].scope).toBe('scenario')
    expect(result.actions![1].storage).toBe('userprefs')
  })

  it('should generate unique action IDs', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.set('key1', 'value1')
        myStore.set('key2', 'value2')
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions![0].id).toBe('app.memory_set_key1')
    expect(result.actions![1].id).toBe('app.memory_set_key2')
    expect(result.actions![0].id).not.toBe(result.actions![1].id)
  })

  it('should handle nested keyPaths', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from '../ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.set('user.profile.name', 'Alice')
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions![0].keyPath).toBe('user.profile.name')
    expect(result.actions![0].id).toBe('app.memory_set_user_profile_name')
  })
})
