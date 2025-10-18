import { describe, it, expect } from 'vitest'
import { transpileV2 } from '../../src/transpiler/transpiler-v2'
import type {
  NavigationPushAction,
  NavigationPopAction,
  ShowToastAction,
  ShareAction,
  OpenUrlAction,
  HapticAction,
} from '../../src/runtime/declarative-action-types'

describe('Action APIs', () => {
  describe('Navigation Actions', () => {
    it('should transpile navigate.push() to NavigationPushAction', async () => {
      const code = `
        import { store, StoreScope, StoreStorage, navigate } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const store1 = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Go to Details"
              onPress={() => navigate.push('ProductDetails', { productId: store1.get('selectedId') })}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      expect(result.actions).toHaveLength(1)

      const action = result.actions![0] as NavigationPushAction
      expect(action.kind).toBe('navigation.push')
      expect(action.screenId).toBe('ProductDetails')
      expect(action.params).toBeDefined()
      expect(action.params!.productId).toEqual({
        kind: 'storeValue',
        storeRef: { scope: 'scenario', storage: 'memory' },
        keyPath: 'selectedId',
      })
    })

    it('should transpile navigate.pop() to NavigationPopAction', async () => {
      const code = `
        import { navigate } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Go Back"
              onPress={() => navigate.pop()}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0] as NavigationPopAction
      expect(action.kind).toBe('navigation.pop')
    })

    it('should transpile navigate.replace() to NavigationReplaceAction', async () => {
      const code = `
        import { navigate } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Replace with Login"
              onPress={() => navigate.replace('Login')}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0]
      expect(action.kind).toBe('navigation.replace')
      expect((action as any).screenId).toBe('Login')
    })

    it('should transpile navigate.modal() to NavigationModalAction', async () => {
      const code = `
        import { navigate } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Open Settings"
              onPress={() => navigate.modal('Settings', { theme: 'dark' })}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0]
      expect(action.kind).toBe('navigation.modal')
      expect((action as any).screenId).toBe('Settings')
      expect((action as any).params).toBeDefined()
    })

    it('should transpile navigate.dismissModal()', async () => {
      const code = `
        import { navigate } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Close"
              onPress={() => navigate.dismissModal()}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0]
      expect(action.kind).toBe('navigation.dismissModal')
    })
  })

  describe('UI Actions', () => {
    it('should transpile ui.showToast() to ShowToastAction', async () => {
      const code = `
        import { ui } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Show Toast"
              onPress={() => ui.showToast('Item added to cart')}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0] as ShowToastAction
      expect(action.kind).toBe('ui.showToast')
      expect(action.message).toEqual({
        kind: 'literal',
        type: 'string',
        value: 'Item added to cart',
      })
    })

    it('should transpile ui.showAlert() to ShowAlertAction', async () => {
      const code = `
        import { ui } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Show Alert"
              onPress={() => ui.showAlert('Delete Item?')}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0]
      expect(action.kind).toBe('ui.showAlert')
      expect((action as any).title).toEqual({
        kind: 'literal',
        type: 'string',
        value: 'Delete Item?',
      })
    })

    it('should transpile ui.showSheet() to ShowSheetAction', async () => {
      const code = `
        import { ui } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Show Options"
              onPress={() => ui.showSheet('FilterOptions')}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0]
      expect(action.kind).toBe('ui.showSheet')
    })

    it('should transpile ui.dismissSheet()', async () => {
      const code = `
        import { ui } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Close"
              onPress={() => ui.dismissSheet()}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0]
      expect(action.kind).toBe('ui.dismissSheet')
    })

    it('should transpile ui.showLoading() and ui.hideLoading()', async () => {
      const code = `
        import { store, StoreScope, StoreStorage, ui } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const store1 = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Save"
              onPress={() => {
                ui.showLoading()
                store1.set('status', 'saving')
                ui.hideLoading()
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
      const actions = (action as any).actions
      expect(actions[0].kind).toBe('ui.showLoading')
      expect(actions[1].kind).toBe('store.set')
      expect(actions[2].kind).toBe('ui.hideLoading')
    })
  })

  describe('System Actions', () => {
    it('should transpile system.share() to ShareAction', async () => {
      const code = `
        import { system } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Share"
              onPress={() => system.share({ text: 'Check this out!', url: 'https://example.com' })}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0] as ShareAction
      expect(action.kind).toBe('system.share')
      expect(action.content).toBeDefined()
    })

    it('should transpile system.openUrl() to OpenUrlAction', async () => {
      const code = `
        import { system } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Open Website"
              onPress={() => system.openUrl('https://example.com')}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0] as OpenUrlAction
      expect(action.kind).toBe('system.openUrl')
      expect(action.url).toEqual({
        kind: 'literal',
        type: 'string',
        value: 'https://example.com',
      })
    })

    it('should transpile system.haptic() to HapticAction', async () => {
      const code = `
        import { system } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Success"
              onPress={() => system.haptic('success')}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0] as HapticAction
      expect(action.kind).toBe('system.haptic')
      expect(action.style).toBe('success')
    })

    it('should transpile system.copyToClipboard()', async () => {
      const code = `
        import { system } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Copy Link"
              onPress={() => system.copyToClipboard('https://example.com/product/123')}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0]
      expect(action.kind).toBe('system.copyToClipboard')
      expect((action as any).text).toBe('https://example.com/product/123')
    })

    it('should transpile permission request actions', async () => {
      const code = `
        import { system } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Request Camera"
              onPress={() => system.requestCameraPermission()}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      const action = result.actions![0]
      expect(action.kind).toBe('system.requestPermission')
      expect((action as any).permission).toBe('camera')
    })
  })

  describe('Combined Actions', () => {
    it('should transpile complex handler with multiple action types', async () => {
      const code = `
        import { store, StoreScope, StoreStorage, navigate, ui, system } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const cartStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Checkout"
              onPress={() => {
                if (cartStore.get('itemCount') > 0) {
                  system.haptic('success')
                  ui.showLoading()
                  cartStore.set('status', 'processing')
                  navigate.push('Checkout', { total: cartStore.get('total') })
                  ui.hideLoading()
                  ui.showToast('Redirecting...')
                } else {
                  system.haptic('warning')
                  ui.showAlert('Cart is empty')
                }
              }}
            />
          )
        }
      `

      const result = await transpileV2(code, { useDeclarativeActions: true } as any)

      expect(result.actions).toBeDefined()
      expect(result.actions).toHaveLength(1)

      const action = result.actions![0]
      expect(action.kind).toBe('conditional')

      const thenActions = (action as any).then
      expect(thenActions).toHaveLength(1)
      expect(thenActions[0].kind).toBe('sequence')

      const sequenceActions = thenActions[0].actions
      expect(sequenceActions[0].kind).toBe('system.haptic')
      expect(sequenceActions[1].kind).toBe('ui.showLoading')
      expect(sequenceActions[2].kind).toBe('store.set')
      expect(sequenceActions[3].kind).toBe('navigation.push')
      expect(sequenceActions[4].kind).toBe('ui.hideLoading')
      expect(sequenceActions[5].kind).toBe('ui.showToast')

      const elseActions = (action as any).else
      expect(elseActions).toHaveLength(1)
      expect(elseActions[0].kind).toBe('sequence')
      expect(elseActions[0].actions[0].kind).toBe('system.haptic')
      expect(elseActions[0].actions[1].kind).toBe('ui.showAlert')
    })
  })
})
