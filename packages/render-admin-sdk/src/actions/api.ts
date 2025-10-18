/**
 * API Action APIs
 *
 * These functions provide a type-safe API for HTTP/API requests.
 * At transpile time, they are analyzed and converted to declarative API action descriptors.
 *
 * Note: These functions are markers for the transpiler and should NOT be called at runtime.
 */

import type { ActionDescriptor } from '../runtime/declarative-action-types.js'

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Configuration for an API request
 */
export interface ApiRequestConfig {
  /** API endpoint URL (can be relative or absolute) */
  endpoint: string

  /** HTTP method */
  method: HttpMethod

  /** Request headers (optional) */
  headers?: Record<string, string>

  /** Request body (optional, will be JSON-stringified) */
  body?: any

  /** Callback to execute on successful response */
  onSuccess?: (data: any) => void

  /** Callback to execute on error */
  onError?: (error: any) => void

  /** Map response data to a store automatically */
  responseMapping?: {
    /** Target store to write response data to */
    storeKey: string

    /** Key path within the store to write to */
    keyPath: string

    /** Optional transform to apply to response before storing */
    transform?: {
      type: 'jsonPath' | 'template'
      expression: string
    }
  }
}

/**
 * Make an HTTP/API request
 *
 * @example
 * // Simple GET request with success callback
 * api.request({
 *   endpoint: '/api/user/profile',
 *   method: 'GET',
 *   onSuccess: (data) => {
 *     userStore.set('profile', data)
 *     ui.showToast('Profile loaded')
 *   }
 * })
 *
 * @example
 * // POST request with body and headers
 * api.request({
 *   endpoint: '/api/cart/add',
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': 'Bearer token123'
 *   },
 *   body: {
 *     productId: store.get('selectedProductId'),
 *     quantity: 1
 *   },
 *   onSuccess: () => {
 *     ui.showToast('Added to cart')
 *     navigate.push('Cart')
 *   },
 *   onError: () => {
 *     ui.showToast('Failed to add to cart')
 *   }
 * })
 *
 * @example
 * // Request with automatic response mapping to store
 * api.request({
 *   endpoint: '/api/products',
 *   method: 'GET',
 *   responseMapping: {
 *     storeKey: 'productStore',
 *     keyPath: 'products'
 *   },
 *   onSuccess: () => {
 *     ui.showToast('Products loaded')
 *   }
 * })
 */
export function apiRequest(config: ApiRequestConfig): void {
  throw new Error('apiRequest() is a transpiler marker and should not be called at runtime')
}

/**
 * Namespace export for API actions
 */
export const api = {
  request: apiRequest,
}
