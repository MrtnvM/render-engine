import { describe, it, expect } from 'vitest'
import { transpile } from '../../src/transpiler/transpiler'
import type { ApiRequestAction } from '../../src/runtime/declarative-action-types'

describe('API Actions', () => {
  describe('Basic API Requests', () => {
    it('should transpile basic GET request', async () => {
      const code = `
        import { api } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Load Data"
              onPress={() => api.request({
                endpoint: '/api/users',
                method: 'GET'
              })}
            />
          )
        }
      `

      const result = await transpile(code)

      expect(result.actions).toBeDefined()
      expect(result.actions).toHaveLength(1)

      const action = result.actions![0] as ApiRequestAction
      expect(action.kind).toBe('api.request')
      expect(action.endpoint).toBe('/api/users')
      expect(action.method).toBe('GET')
      expect(action.headers).toBeUndefined()
      expect(action.body).toBeUndefined()
    })

    it('should transpile POST request with body', async () => {
      const code = `
        import { api } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Create User"
              onPress={() => api.request({
                endpoint: '/api/users',
                method: 'POST',
                body: { name: 'John Doe', email: 'john@example.com' }
              })}
            />
          )
        }
      `

      const result = await transpile(code)

      expect(result.actions).toBeDefined()
      const action = result.actions![0] as ApiRequestAction
      expect(action.kind).toBe('api.request')
      expect(action.endpoint).toBe('/api/users')
      expect(action.method).toBe('POST')
      expect(action.body).toBeDefined()
      expect(action.body).toEqual({
        kind: 'literal',
        type: 'object',
        value: {
          name: { kind: 'literal', type: 'string', value: 'John Doe' },
          email: { kind: 'literal', type: 'string', value: 'john@example.com' },
        },
      })
    })

    it('should transpile PUT request with headers', async () => {
      const code = `
        import { api } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Update User"
              onPress={() => api.request({
                endpoint: '/api/users/123',
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer token123'
                },
                body: { name: 'Jane Doe' }
              })}
            />
          )
        }
      `

      const result = await transpile(code)

      const action = result.actions![0] as ApiRequestAction
      expect(action.kind).toBe('api.request')
      expect(action.method).toBe('PUT')
      expect(action.headers).toBeDefined()
      expect(action.headers!['Content-Type']).toEqual({
        kind: 'literal',
        type: 'string',
        value: 'application/json',
      })
      expect(action.headers!['Authorization']).toEqual({
        kind: 'literal',
        type: 'string',
        value: 'Bearer token123',
      })
    })

    it('should transpile DELETE request', async () => {
      const code = `
        import { api } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Delete User"
              onPress={() => api.request({
                endpoint: '/api/users/123',
                method: 'DELETE'
              })}
            />
          )
        }
      `

      const result = await transpile(code)

      const action = result.actions![0] as ApiRequestAction
      expect(action.kind).toBe('api.request')
      expect(action.endpoint).toBe('/api/users/123')
      expect(action.method).toBe('DELETE')
    })
  })

  describe('API Requests with Callbacks', () => {
    it('should transpile request with onSuccess callback', async () => {
      const code = `
        import { api, store, StoreScope, StoreStorage, ui } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const dataStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Load User"
              onPress={() => api.request({
                endpoint: '/api/user',
                method: 'GET',
                onSuccess: (data) => {
                  dataStore.set('user', data)
                  ui.showToast('User loaded successfully')
                }
              })}
            />
          )
        }
      `

      const result = await transpile(code)

      expect(result.actions).toBeDefined()
      const action = result.actions![0] as ApiRequestAction
      expect(action.kind).toBe('api.request')
      expect(action.endpoint).toBe('/api/user')
      expect((action as any).onSuccess).toBeDefined()
      expect((action as any).onSuccess.kind).toBe('sequence')

      const successActions = (action as any).onSuccess.actions
      expect(successActions).toHaveLength(2)
      expect(successActions[0].kind).toBe('store.set')
      expect(successActions[1].kind).toBe('ui.showToast')
    })

    it('should transpile request with onError callback', async () => {
      const code = `
        import { api, ui } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Load Data"
              onPress={() => api.request({
                endpoint: '/api/data',
                method: 'GET',
                onError: (error) => {
                  ui.showToast('Failed to load data')
                }
              })}
            />
          )
        }
      `

      const result = await transpile(code)

      const action = result.actions![0] as ApiRequestAction
      expect(action.kind).toBe('api.request')
      expect((action as any).onError).toBeDefined()
      expect((action as any).onError.kind).toBe('ui.showToast')
    })

    it('should transpile request with both onSuccess and onError callbacks', async () => {
      const code = `
        import { api, store, StoreScope, StoreStorage, ui } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const dataStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Load Data"
              onPress={() => api.request({
                endpoint: '/api/products',
                method: 'GET',
                onSuccess: (data) => {
                  dataStore.set('products', data)
                  ui.showToast('Products loaded')
                },
                onError: (error) => {
                  ui.showToast('Failed to load products')
                }
              })}
            />
          )
        }
      `

      const result = await transpile(code)

      const action = result.actions![0] as ApiRequestAction
      expect(action.kind).toBe('api.request')
      expect((action as any).onSuccess).toBeDefined()
      expect((action as any).onError).toBeDefined()

      const successActions = (action as any).onSuccess.actions
      expect(successActions[0].kind).toBe('store.set')
      expect(successActions[1].kind).toBe('ui.showToast')

      const errorAction = (action as any).onError
      expect(errorAction.kind).toBe('ui.showToast')
    })
  })

  describe('API Requests with Dynamic Values', () => {
    it('should transpile request with store values in body', async () => {
      const code = `
        import { api, store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const cartStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Add to Cart"
              onPress={() => api.request({
                endpoint: '/api/cart/add',
                method: 'POST',
                body: {
                  productId: cartStore.get('selectedProductId'),
                  quantity: 1
                }
              })}
            />
          )
        }
      `

      const result = await transpile(code)

      const action = result.actions![0] as ApiRequestAction
      expect(action.kind).toBe('api.request')
      expect(action.body).toBeDefined()

      const bodyValue = action.body as any
      expect(bodyValue.kind).toBe('literal')
      expect(bodyValue.type).toBe('object')
      expect(bodyValue.value.productId.kind).toBe('storeValue')
      expect(bodyValue.value.productId.storeRef).toEqual({ scope: 'scenario', storage: 'memory' })
      expect(bodyValue.value.productId.keyPath).toBe('selectedProductId')
    })

    it('should transpile request with store values in headers', async () => {
      const code = `
        import { api, store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const authStore = store({ scope: StoreScope.App, storage: StoreStorage.UserPrefs })

        export default function Main() {
          return (
            <Button
              title="Fetch User"
              onPress={() => api.request({
                endpoint: '/api/user/profile',
                method: 'GET',
                headers: {
                  'Authorization': authStore.get('token')
                }
              })}
            />
          )
        }
      `

      const result = await transpile(code)

      const action = result.actions![0] as ApiRequestAction
      expect(action.kind).toBe('api.request')
      expect(action.headers).toBeDefined()
      expect(action.headers!['Authorization']).toEqual({
        kind: 'storeValue',
        storeRef: { scope: 'app', storage: 'userprefs' },
        keyPath: 'token',
      })
    })
  })

  describe('Direct apiRequest function', () => {
    it('should transpile direct apiRequest() call', async () => {
      const code = `
        import { apiRequest } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        export default function Main() {
          return (
            <Button
              title="Load Data"
              onPress={() => apiRequest({
                endpoint: '/api/data',
                method: 'GET'
              })}
            />
          )
        }
      `

      const result = await transpile(code)

      expect(result.actions).toBeDefined()
      const action = result.actions![0] as ApiRequestAction
      expect(action.kind).toBe('api.request')
      expect(action.endpoint).toBe('/api/data')
      expect(action.method).toBe('GET')
    })
  })

  describe('Complex Scenarios', () => {
    it('should transpile complex handler with API request and navigation', async () => {
      const code = `
        import { api, store, StoreScope, StoreStorage, navigate, ui } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const dataStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Login"
              onPress={() => {
                ui.showLoading()
                api.request({
                  endpoint: '/api/auth/login',
                  method: 'POST',
                  body: {
                    username: dataStore.get('username'),
                    password: dataStore.get('password')
                  },
                  onSuccess: (data) => {
                    dataStore.set('token', data)
                    ui.hideLoading()
                    navigate.replace('Home')
                    ui.showToast('Login successful')
                  },
                  onError: (error) => {
                    ui.hideLoading()
                    ui.showToast('Login failed')
                  }
                })
              }}
            />
          )
        }
      `

      const result = await transpile(code)

      expect(result.actions).toBeDefined()
      expect(result.actions).toHaveLength(1)

      const rootAction = result.actions![0]
      expect(rootAction.kind).toBe('sequence')

      const actions = (rootAction as any).actions
      expect(actions[0].kind).toBe('ui.showLoading')
      expect(actions[1].kind).toBe('api.request')

      const apiAction = actions[1]
      expect(apiAction.endpoint).toBe('/api/auth/login')
      expect(apiAction.method).toBe('POST')
      expect(apiAction.onSuccess).toBeDefined()
      expect(apiAction.onError).toBeDefined()

      const successActions = apiAction.onSuccess.actions
      expect(successActions).toHaveLength(4)
      expect(successActions[0].kind).toBe('store.set')
      expect(successActions[1].kind).toBe('ui.hideLoading')
      expect(successActions[2].kind).toBe('navigation.replace')
      expect(successActions[3].kind).toBe('ui.showToast')
    })

    it('should transpile conditional API request', async () => {
      const code = `
        import { api, store, StoreScope, StoreStorage, ui } from '@render-engine/admin-sdk'
        import { Button } from '@render-engine/admin-sdk/ui'

        export const SCENARIO = { key: "test", name: "Test", description: "Test", version: "1.0.0" }

        const cartStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.Memory })

        export default function Main() {
          return (
            <Button
              title="Checkout"
              onPress={() => {
                if (cartStore.get('itemCount') > 0) {
                  api.request({
                    endpoint: '/api/checkout',
                    method: 'POST',
                    body: { items: cartStore.get('items') },
                    onSuccess: () => {
                      ui.showToast('Order placed successfully')
                    }
                  })
                } else {
                  ui.showToast('Cart is empty')
                }
              }}
            />
          )
        }
      `

      const result = await transpile(code)

      const action = result.actions![0]
      expect(action.kind).toBe('conditional')

      const thenActions = (action as any).then
      expect(thenActions).toHaveLength(1)
      expect(thenActions[0].kind).toBe('api.request')

      const elseActions = (action as any).else
      expect(elseActions).toHaveLength(1)
      expect(elseActions[0].kind).toBe('ui.showToast')
    })
  })
})
