/**
 * Navigation Action APIs
 *
 * These functions provide a type-safe API for navigation actions.
 * At transpile time, they are analyzed and converted to declarative NavigationAction descriptors.
 *
 * Note: These functions are markers for the transpiler and should NOT be called at runtime.
 */

/**
 * Push a new screen onto the navigation stack
 *
 * @example
 * navigate.push('ProductDetail', { productId: store.get('selectedId') })
 */
export function push(screenKey: string, params?: Record<string, any>): void {
  throw new Error('navigate.push() is a transpiler marker and should not be called at runtime')
}

/**
 * Pop the current screen from the navigation stack
 *
 * @example
 * navigate.pop()
 */
export function pop(): void {
  throw new Error('navigate.pop() is a transpiler marker and should not be called at runtime')
}

/**
 * Replace the current screen with a new one
 *
 * @example
 * navigate.replace('Login')
 */
export function replace(screenKey: string, params?: Record<string, any>): void {
  throw new Error('navigate.replace() is a transpiler marker and should not be called at runtime')
}

/**
 * Present a screen modally
 *
 * @example
 * navigate.modal('Settings', { theme: 'dark' })
 */
export function modal(screenKey: string, params?: Record<string, any>): void {
  throw new Error('navigate.modal() is a transpiler marker and should not be called at runtime')
}

/**
 * Dismiss the current modal
 *
 * @example
 * navigate.dismissModal()
 */
export function dismissModal(): void {
  throw new Error('navigate.dismissModal() is a transpiler marker and should not be called at runtime')
}

/**
 * Navigate back to a specific screen in the stack
 *
 * @example
 * navigate.popTo('Home')
 */
export function popTo(screenKey: string): void {
  throw new Error('navigate.popTo() is a transpiler marker and should not be called at runtime')
}

/**
 * Reset navigation stack to a new root
 *
 * @example
 * navigate.reset('Home')
 */
export function reset(screenKey: string, params?: Record<string, any>): void {
  throw new Error('navigate.reset() is a transpiler marker and should not be called at runtime')
}

// Export as namespace
export const navigate = {
  push,
  pop,
  replace,
  modal,
  dismissModal,
  popTo,
  reset,
}
