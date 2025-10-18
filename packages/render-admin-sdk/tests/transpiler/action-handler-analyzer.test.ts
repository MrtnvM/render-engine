import { describe, it, expect } from 'vitest'
import { transpileV2 } from '../../src/transpiler/transpiler-v2'
import type { TranspiledScenario, StoreSetAction, ConditionalAction } from '../../src/runtime/declarative-action-types'

describe('ActionHandlerAnalyzer', () => {
  describe('Store Operations', () => {
    it('should transpile simple store.set() to StoreSetAction', async () => {
      const code = `
        import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const counterStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Increment"
              onPress={() => counterStore.set('count', 5)}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      expect(result.actions).toHaveLength(1)

      const action = result.actions![0] as StoreSetAction
      expect(action.kind).toBe('store.set')
      expect(action.keyPath).toBe('count')
      expect(action.value).toEqual({
        kind: 'literal',
        type: 'integer',
        value: 5,
      })
      expect(action.storeRef).toEqual({
        scope: 'scenario',
        storage: 'memory',
      })

      // Check that button references the action
      expect(result.main.data.onPress).toBe(action.id)
    })

    it('should transpile store.set() with store.get() value', async () => {
      const code = `
        import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const counterStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Copy"
              onPress={() => counterStore.set('backup', counterStore.get('count'))}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      expect(result.actions).toHaveLength(1)

      const action = result.actions![0] as StoreSetAction
      expect(action.kind).toBe('store.set')
      expect(action.keyPath).toBe('backup')
      expect(action.value).toEqual({
        kind: 'storeValue',
        storeRef: {
          scope: 'scenario',
          storage: 'memory',
        },
        keyPath: 'count',
      })
    })

    it('should transpile computed values (arithmetic)', async () => {
      const code = `
        import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const cartStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Calculate"
              onPress={() => cartStore.set('total', cartStore.get('price') * cartStore.get('quantity'))}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0] as StoreSetAction
      expect(action.kind).toBe('store.set')
      expect(action.value).toEqual({
        kind: 'computed',
        operation: 'multiply',
        operands: [
          {
            kind: 'storeValue',
            storeRef: { scope: 'scenario', storage: 'memory' },
            keyPath: 'price',
          },
          {
            kind: 'storeValue',
            storeRef: { scope: 'scenario', storage: 'memory' },
            keyPath: 'quantity',
          },
        ],
      })
    })
  })

  describe('Conditional Actions', () => {
    it('should transpile if-else to ConditionalAction', async () => {
      const code = `
        import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const store1 = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Check"
              onPress={() => {
                if (store1.get('count') > 10) {
                  store1.set('status', 'high')
                } else {
                  store1.set('status', 'low')
                }
              }}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      expect(result.actions).toHaveLength(1)

      const action = result.actions![0] as ConditionalAction
      expect(action.kind).toBe('conditional')
      expect(action.condition).toEqual({
        type: 'greaterThan',
        left: {
          kind: 'storeValue',
          storeRef: { scope: 'scenario', storage: 'memory' },
          keyPath: 'count',
        },
        right: {
          kind: 'literal',
          type: 'integer',
          value: 10,
        },
      })

      expect(action.then).toHaveLength(1)
      expect(action.then[0].kind).toBe('store.set')
      expect((action.then[0] as StoreSetAction).keyPath).toBe('status')

      expect(action.else).toHaveLength(1)
      expect(action.else![0].kind).toBe('store.set')
      expect((action.else![0] as StoreSetAction).keyPath).toBe('status')
    })

    it('should transpile complex condition with AND', async () => {
      const code = `
        import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const store1 = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Check"
              onPress={() => {
                if (store1.get('age') >= 18 && store1.get('hasLicense') === true) {
                  store1.set('canDrive', true)
                }
              }}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      const action = result.actions![0] as ConditionalAction
      expect(action.condition.type).toBe('and')
      expect(action.condition.conditions).toHaveLength(2)
      expect(action.condition.conditions![0].type).toBe('greaterThanOrEqual')
      expect(action.condition.conditions![1].type).toBe('equals')
    })
  })

  describe('Sequence Actions', () => {
    it('should transpile multiple statements to SequenceAction', async () => {
      const code = `
        import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const store1 = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Reset"
              onPress={() => {
                store1.set('count', 0)
                store1.set('status', 'reset')
                store1.set('timestamp', 123456)
              }}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      expect(result.actions).toHaveLength(1)

      const action = result.actions![0]
      expect(action.kind).toBe('sequence')
      expect((action as any).actions).toHaveLength(3)
      expect((action as any).strategy).toBe('serial')
    })
  })

  describe('Transaction Actions', () => {
    it('should transpile store.transaction() to StoreTransactionAction', async () => {
      const code = `
        import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const store1 = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Reset All"
              onPress={() => {
                store1.transaction(s => {
                  s.set('items', [])
                  s.set('total', 0)
                  s.set('count', 0)
                })
              }}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0]
      expect(action.kind).toBe('store.transaction')
      expect((action as any).actions).toHaveLength(3)
    })
  })

  describe('Error Cases', () => {
    it('should throw error for external variable reference', async () => {
      const code = `
        import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const store1 = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })
        const externalVar = 'hello'

        export default function Main() {
          return (
            <Button
              title="Test"
              onPress={() => store1.set('message', externalVar)}
            />
          )
        }
      `

      await expect(transpileV2(code, { useDeclarativeActions: true } as any)).rejects.toThrow(
        /Cannot reference external variable/,
      )
    })

    it('should throw error for async handler', async () => {
      const code = `
        import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const store1 = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Test"
              onPress={async () => {
                store1.set('loading', true)
              }}
            />
          )
        }
      `

      await expect(transpileV2(code, { useDeclarativeActions: true } as any)).rejects.toThrow(
        /Async handlers are not supported/,
      )
    })
  })

  describe('Event Data', () => {
    it('should transpile handler with parameter to eventData reference', async () => {
      const code = `
        import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { TextField } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const store1 = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <TextField
              onChange={(value) => store1.set('text', value)}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0] as StoreSetAction
      expect(action.value).toEqual({
        kind: 'eventData',
        path: 'value',
      })
    })
  })
})
